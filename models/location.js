const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  title: String,
  budget: String,
  description: String,
  address: String,
});

module.exports = mongoose.model("Location", LocationSchema);
