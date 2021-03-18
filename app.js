const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const { locationSchema, reviewSchema } = require("./validateSchemaJoi.js");
const ejs_mate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const path = require("path");
const app = express();

// enable body-parser
app.use(express.urlencoded({ extended: true }));
// helper library for enhancing development experience
app.use(methodOverride("_method"));

// models
const Location = require("./models/location");
const Review = require("./models/review");

// database connection settings
mongoose.connect("mongodb://localhost:27017/feelplanet", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const database = mongoose.connection;
database.on("error", console.error.bind(console, "::ERROR::"));
database.once("open", () => console.log("Database Successfully Connected."));

// setup view engine
app.engine("ejs", ejs_mate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const validateLocation = (req, res, next) => {
  // Server-Side Validation Attempt #2 with Joi
  const result = locationSchema.validate(req.body);
  if (result.error) {
    const message = result.error.details
      .map((element) => element.message)
      .join(" ,");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const result = reviewSchema.validate(req.body);
  if (result.error) {
    const message = result.error.details
      .map((element) => element.message)
      .join(" ,");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

// controllers
app.get("/", (req, res) => {
  res.render("homepage");
});

app.get(
  "/locations",
  catchAsync(async (req, res) => {
    const locations = await Location.find({});
    res.render("locations/index", { locations });
  })
);

app.get("/locations/new", (req, res) => {
  res.render("locations/create");
});

app.post(
  "/locations",
  validateLocation,
  catchAsync(async (req, res, next) => {
    // Server-Side Validation Attempt #1
    // if (!req.body.location) {
    //   throw new ExpressError("Invalid Location Info Provided.", 400);
    // }
    const location = new Location(req.body.location);
    await location.save();
    res.redirect(`/locations/${location._id}`);
  })
);

app.get(
  "/locations/:id",
  catchAsync(async (req, res, next) => {
    const location = await Location.findById(req.params.id).populate("reviews");
    res.render("locations/show", { location });
  })
);

app.get(
  "/locations/:id/update",
  catchAsync(async (req, res) => {
    const location = await Location.findById(req.params.id);
    res.render("locations/update", { location });
  })
);

app.put(
  "/locations/:id",
  validateLocation,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const location = await Location.findByIdAndUpdate(id, {
      ...req.body.location,
    });
    res.redirect(`/locations/${location._id}`);
  })
);

app.delete(
  "/locations/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    res.redirect("/locations");
  })
);

app.post(
  "/locations/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const location = await Location.findById(req.params.id);
    const review = new Review(req.body.review);
    location.reviews.push(review);
    await review.save();
    await location.save();
    res.redirect(`/locations/${location._id}`);
  })
);

app.delete(
  "/locations/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Location.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/locations/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found.", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Something Went Wrong. Please Try Again.";
  }
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on localhost:3000");
});
