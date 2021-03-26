if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejs_mate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const path = require("path");
const app = express();

//passport and authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// security third-party packages
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

// enable body-parser
app.use(express.urlencoded({ extended: true }));
// helper library for enhancing development experience
app.use(methodOverride("_method"));
// serve static public folder settings
app.use(express.static(path.join(__dirname, "public")));
// use mongo-sanitizer
app.use(mongoSanitize({ replaceWith: "_" }));

const MongoStore = require("connect-mongo");
const store = MongoStore.create({
  mongoUrl: process.env.DB_URL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

// configure express-session
const sessionConfig = {
  store,
  name: "session",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//   })
// );
app.use(helmet());
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/peterhychan/",
        "https://images.unsplash.com/",
        "https://source.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// apply passport for authentication, thanks `passportLocalMongoose` at user model
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes
const locations = require("./routes/locations");
const reviews = require("./routes/reviews");
const users = require("./routes/users");

// database connection settings
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const database = mongoose.connection;
database.on("error", console.error.bind(console, "::ERROR::"));
database.once("open", () => console.log("Database Successfully Connected."));

// setup view engine
app.engine("ejs", ejs_mate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", users);
app.use("/locations", locations);
app.use("/locations/:id/reviews", reviews);

// controllers
app.get("/", (req, res) => {
  res.render("homepage");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found.", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Something Went Wrong. Please Try Again.";
  }
  res.status(statusCode).render("error", { err });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Serving on localhost:" + process.env.PORT || 3000);
});
