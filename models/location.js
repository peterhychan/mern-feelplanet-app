const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  title: String,
  image: String,
  budget: Number,
  description: String,
  address: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// Mongoose Middleware
LocationSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Location", LocationSchema);
