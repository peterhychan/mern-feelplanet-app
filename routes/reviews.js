const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Review = require("../models/review");
const Location = require("../models/location");
const { validateReview, isLoggedIn, isReviewPoster } = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const location = await Location.findById(req.params.id);
    const review = new Review(req.body.review);
    review.poster = req.user._id;
    location.reviews.push(review);
    await review.save();
    await location.save();
    req.flash("success", "New Review Added.");
    res.redirect(`/locations/${location._id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewPoster,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Location.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted.");
    res.redirect(`/locations/${id}`);
  })
);

module.exports = router;
