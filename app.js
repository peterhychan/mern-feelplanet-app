const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();

const Location = require("./models/location");

mongoose.connect("mongodb://localhost:27017/feelplanet", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const database = mongoose.connection;
database.on("error", console.error.bind(console, "::ERROR::"));
database.once("open", () => console.log("Database Successfully Connected."));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res, next) => {
  res.render("homepage");
});

app.get("/addlocation", async (req, res) => {
  const location = new Location({
    title: "Bolboa Park",
    description: "Nice Place to rest in San Francisco",
  });
  await location.save();
  res.send(location);
});

app.listen(3000, () => {
  console.log("Serving on localhost:3000");
});
