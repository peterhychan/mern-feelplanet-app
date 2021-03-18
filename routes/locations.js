const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Location = require("../models/location");
const { locationSchema, reviewSchema } = require("../validateSchemaJoi.js");

const validateLocation = (req, res, next) => {
  // Server-Side Validation Attempt #2 with Joi
  const result = locationSchema.validate(req.body);
  if (result.error) {
    const message = result.error.details
      .map((element) => element.message)
      .join(" ,");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  catchAsync(async (req, res) => {
    const locations = await Location.find({});
    res.render("locations/index", { locations });
  })
);

router.get("/new", (req, res) => {
  res.render("locations/create");
});

router.post(
  "/",
  validateLocation,
  catchAsync(async (req, res, next) => {
    // Server-Side Validation Attempt #1
    // if (!req.body.location) {
    //   throw new ExpressError("Invalid Location Info Provided.", 400);
    // }
    const location = new Location(req.body.location);
    await location.save();
    req.flash("success", "New Location Added.");
    res.redirect(`/locations/${location._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const location = await Location.findById(req.params.id).populate("reviews");
    if (!location) {
      req.flash("error", "Target Not Found.");
      res.redirect("/locations");
    }
    res.render("locations/show", { location });
  })
);

router.get(
  "/:id/update",
  catchAsync(async (req, res) => {
    const location = await Location.findById(req.params.id);
    if (!location) {
      req.flash("error", "Target Not Found.");
      res.redirect("/locations");
    }
    res.render("locations/update", { location });
  })
);

router.put(
  "/:id",
  validateLocation,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const location = await Location.findByIdAndUpdate(id, {
      ...req.body.location,
    });
    req.flash("success", "Location Updated Successfully.");
    res.redirect(`/locations/${location._id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    req.flash("success", "Location Deleted.");
    res.redirect("/locations");
  })
);

module.exports = router;
