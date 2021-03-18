const ExpressError = require("./utils/ExpressError");
const Location = require("./models/location");
const Review = require("./models/review");
const { locationSchema, reviewSchema } = require("./validateSchemaJoi");

module.exports.isLoggedIn = (req, res, next) => {
  // isAuthenticated is from Passport Library
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Please Login To Continue");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateLocation = (req, res, next) => {
  const { error } = locationSchema.validate(req.body);
  if (error) {
    const message = error.details.map((element) => element.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

module.exports.isPoster = async (req, res, next) => {
  const { id } = req.params;
  const location = await Location.findById(id);
  if (!location.poster.equals(req.user._id)) {
    req.flash("error", "No Permissions for this operation.");
    return res.redirect(`/locations/${id}`);
  }
  next();
};

module.exports.isReviewPoster = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.poster.equals(req.user._id)) {
    req.flash("error", "No Permissions for this operation.");
    return res.redirect(`/locations/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const message = error.details.map((element) => element.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};
