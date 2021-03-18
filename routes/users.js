const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

const passport = require("passport");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);
      // use `login` fn in passport ensure the user is still login after successful registration
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Where-To-Visit");
        res.redirect("/locations");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Glad to See You Again!");
    const redirectUrl = req.session.returnTo || "/locations";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Bye for now!");
  res.redirect("/locations");
});

module.exports = router;
