const express = require('express');
const passport = require('passport');
const User = require('../models/User'); // Ensure the User model is correctly implemented
const router = express.Router();

// Signup Route
router.post('/signup', (req, res) => {
  const { email, password, username, role } = req.body; // Get the role from the request

  // Validate that role is either 'instructor' or 'student'
  if (!role || !['instructor', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Role must be either "instructor" or "student".' });
  }

  // Create a new user with the specified role
  const newUser = new User({
    email,
    username,
    role, // Set the role to 'instructor' or 'student' from the request
  });

  // Register the user with Passport
  User.register(newUser, password, (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    // Successful registration
    res.status(201).json({ message: 'User registered successfully', user });
  });
});

// Login Route
router.post('/login', (req, res, next) => {
  console.log('Received login data:', req.body); // Log to check the payload

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Passport error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    
    if (!user) {
      console.error('Authentication failed:', info);
      return res.status(400).json({ message: info?.message || 'Invalid email or password' });
    }
    
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return res.status(500).json({ message: 'Error logging in', error: loginErr.message });
      }

      console.log('Login successful:', user);
      res.status(200).json({
        message: 'Login successful',
        user: {
          username: user.username,
          email: user.email,
        },
        // No token needed for session-based auth, session data will be handled automatically
      });
    });
  })(req, res, next);
});



// Logout Route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error logging out', error: err.message });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Google OAuth Login Route
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

// Google OAuth Callback Route
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res) => {
    // Redirect to profile after successful login
    res.redirect('/profile');
  }
);

module.exports = router;