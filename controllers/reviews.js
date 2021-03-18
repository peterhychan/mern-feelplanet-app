const Location = require("../models/location");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const location = await Location.findById(req.params.id);
  const review = new Review(req.body.review);
  review.poster = req.user._id;
  location.reviews.push(review);
  await review.save();
  await location.save();
  req.flash("success", "New Review Added.");
  res.redirect(`/locations/${location._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Location.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted.");
  res.redirect(`/locations/${id}`);
};
