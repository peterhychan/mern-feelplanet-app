const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review");
const Location = require("../models/location");
const { locationSchema, reviewSchema } = require("../validateSchemaJoi.js");

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

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const location = await Location.findById(req.params.id);
    const review = new Review(req.body.review);
    location.reviews.push(review);
    await review.save();
    await location.save();
    req.flash("success", "New Review Added.");
    res.redirect(`/locations/${location._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Location.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted.");
    res.redirect(`/locations/${id}`);
  })
);

module.exports = router;
