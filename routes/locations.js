const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Location = require("../models/location");
const { isLoggedIn, isPoster, validateLocation } = require("../middleware");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const locations = await Location.find({});
    res.render("locations/index", { locations });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("locations/create");
});

router.post(
  "/",
  isLoggedIn,
  validateLocation,
  catchAsync(async (req, res, next) => {
    // Server-Side Validation Attempt #1
    // if (!req.body.location) {
    //   throw new ExpressError("Invalid Location Info Provided.", 400);
    // }
    const location = new Location(req.body.location);
    location.poster = req.user._id;
    await location.save();
    req.flash("success", "New Location Added.");
    res.redirect(`/locations/${location._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const location = await Location.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "poster",
        },
      })
      .populate("poster");
    console.log(location);
    if (!location) {
      req.flash("error", "Target Not Found.");
      res.redirect("/locations");
    }
    res.render("locations/show", { location });
  })
);

router.get(
  "/:id/update",
  isLoggedIn,
  isPoster,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const location = await Location.findById(id);
    if (!location) {
      req.flash("error", "Target Not Found.");
      res.redirect("/locations");
    }
    res.render("locations/update", { location });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  isPoster,
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
  isLoggedIn,
  isPoster,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    req.flash("success", "Location Deleted.");
    res.redirect("/locations");
  })
);

module.exports = router;
