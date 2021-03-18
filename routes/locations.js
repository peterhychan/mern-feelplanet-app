const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isPoster, validateLocation } = require("../middleware");
const locations = require("../controllers/locations");

router
  .route("/")
  .get(catchAsync(locations.index))
  .post(isLoggedIn, validateLocation, catchAsync(locations.createLocation));

router.get("/new", isLoggedIn, locations.renderCreate);

router
  .route("/:id")
  .get(catchAsync(locations.showLocation))
  .put(
    isLoggedIn,
    isPoster,
    validateLocation,
    catchAsync(locations.updateLocation)
  )
  .delete(isLoggedIn, isPoster, catchAsync(locations.deleteLocation));

router.get(
  "/:id/update",
  isLoggedIn,
  isPoster,
  catchAsync(locations.renderUpdate)
);

module.exports = router;
