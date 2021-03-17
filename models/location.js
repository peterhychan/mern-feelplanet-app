const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  title: String,
  image: String,
  budget: Number,
  description: String,
  address: String,
});

module.exports = mongoose.model("Location", LocationSchema);
