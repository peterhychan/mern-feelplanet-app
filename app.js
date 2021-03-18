const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejs_mate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const path = require("path");
const app = express();

// enable body-parser
app.use(express.urlencoded({ extended: true }));
// helper library for enhancing development experience
app.use(methodOverride("_method"));
// serve static public folder settings
app.use(express.static(path.join(__dirname, "public")));
// configure express-session
const sessionConfig = {
  secret: "random123@#!@#!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// models
const Location = require("./models/location");
const Review = require("./models/review");

const locations = require("./routes/locations");
const reviews = require("./routes/reviews");

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

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/locations", locations);
app.use("/locations/:id/reviews", reviews);

// controllers
app.get("/", (req, res) => {
  res.render("homepage");
});

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
