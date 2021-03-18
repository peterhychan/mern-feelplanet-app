const Location = require("../models/location");

module.exports.index = async (req, res) => {
  const locations = await Location.find({});
  res.render("locations/index", { locations });
};

module.exports.renderCreate = (req, res) => {
  res.render("locations/create");
};

module.exports.createLocation = async (req, res, next) => {
  // Server-Side Validation Attempt #1
  // if (!req.body.location) {
  //   throw new ExpressError("Invalid Location Info Provided.", 400);
  // }
  const location = new Location(req.body.location);
  location.poster = req.user._id;
  await location.save();
  req.flash("success", "New Location Added.");
  res.redirect(`/locations/${location._id}`);
};

module.exports.showLocation = async (req, res, next) => {
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
};

module.exports.renderUpdate = async (req, res) => {
  const { id } = req.params;
  const location = await Location.findById(id);
  if (!location) {
    req.flash("error", "Target Not Found.");
    res.redirect("/locations");
  }
  res.render("locations/update", { location });
};

module.exports.updateLocation = async (req, res) => {
  const { id } = req.params;
  const location = await Location.findByIdAndUpdate(id, {
    ...req.body.location,
  });
  req.flash("success", "Location Updated Successfully.");
  res.redirect(`/locations/${location._id}`);
};

module.exports.deleteLocation = async (req, res) => {
  const { id } = req.params;
  await Location.findByIdAndDelete(id);
  req.flash("success", "Location Deleted.");
  res.redirect("/locations");
};
