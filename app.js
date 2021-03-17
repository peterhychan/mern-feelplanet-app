const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejs_mate = require("ejs-mate");
const path = require("path");
const app = express();

// enable body-parser
app.use(express.urlencoded({ extended: true }));
// helper library for enhancing development experience
app.use(methodOverride("_method"));

// location model
const Location = require("./models/location");

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

// controllers
app.get("/", (req, res, next) => {
  res.render("homepage");
});

app.get("/locations", async (req, res) => {
  const locations = await Location.find({});
  res.render("locations/index", { locations });
});

app.get("/locations/new", (req, res) => {
  res.render("locations/create");
});

app.post("/locations", async (req, res) => {
  const location = new Location(req.body.location);
  await location.save();
  res.redirect(`/locations/${location._id}`);
});

app.get("/locations/:id", async (req, res) => {
  const location = await Location.findById(req.params.id);
  res.render("locations/show", { location });
});

app.get("/locations/:id/update", async (req, res) => {
  const location = await Location.findById(req.params.id);
  res.render("locations/update", { location });
});

app.put("/locations/:id", async (req, res) => {
  const { id } = req.params;
  const location = await Location.findByIdAndUpdate(id, {
    ...req.body.location,
  });
  res.redirect(`/locations/${location._id}`);
});

app.delete("/locations/:id", async (req, res) => {
  const { id } = req.params;
  await Location.findByIdAndDelete(id);
  res.redirect("/locations");
});

// app.get("/addlocation", async (req, res) => {
//   const location = new Location({
//     title: "Bolboa Park",
//     description: "Nice Place to rest in San Francisco",
//   });
//   await location.save();
//   res.send(location);
// });

app.listen(3000, () => {
  console.log("Serving on localhost:3000");
});
