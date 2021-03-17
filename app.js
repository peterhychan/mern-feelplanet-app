const express = require("express");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res, next) => {
  res.render("homepage");
});

app.listen(3000, () => {
  console.log("Serving on localhost:3000");
});
