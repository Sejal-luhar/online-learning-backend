require('dotenv').config({ path: './.env' }); // Load environment variables
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./config/db')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const cors = require('cors');

// Initialize the app
var app = express();

// Middleware to enable CORS
app.use(
  cors({
    origin: true, // Frontend URL (React app running on port 3000)
    credentials: true, // Allow cookies from the frontend
  })
);

// Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const coursesRouter = require('./routes/courses');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');

// View engine setup (optional if you need server-side rendering)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware for logging, parsing, and serving static files
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express session setup for persisting login sessions
app.use(
  session({
    secret: 'bahut secret', // Use a strong secret here
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60 * 60 * 1000 }, // Session expiration time (1 hour)
  })
);



// Passport initialization for authentication handling
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy for username/email and password authentication
passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy()); // Ensure this is set up to use email
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Passport Google OAuth Strategy for third-party authentication via Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // If user doesn't exist, create new user
          user = new User({
            username: profile.emails[0].value,
            googleId: profile.id,
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Use routes for various functionalities
app.use('/', indexRouter);        // Home page route
app.use('/users', usersRouter);   // User-related routes (profile, etc.)
app.use('/courses', coursesRouter); // Course-related routes
app.use('/auth', authRouter);      // Authentication routes (login, signup)
app.use('/profile', profileRouter); // Protected profile route

// Catch 404 errors and forward them to the error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// General error handler
app.use(function (err, req, res, next) {
  // Set locals, providing error details in development mode
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Export the app to be used in server.js
module.exports = app;
