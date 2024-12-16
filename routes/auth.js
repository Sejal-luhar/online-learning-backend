const express = require('express');
const passport = require('passport');
const User = require('../models/User'); // Ensure the User model is correctly implemented
const router = express.Router();

// Allowed roles
const ALLOWED_ROLES = ['instructor', 'student'];

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    // Validate role
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Role must be either "instructor" or "student".' });
    }

    // Create a new user object
    const newUser = new User({
      email,
      username,
      role, // Set the role from the request
    });

    // Register the user with Passport
    const registeredUser = await User.register(newUser, password);
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        username: registeredUser.username,
        email: registeredUser.email,
        role: registeredUser.role,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login Route
router.post('/login', (req, res, next) => {
  console.log('Received login data:', req.body);

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
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

// Logout Route
router.post('/logout', (req, res) => {
  try {
    // Manually clear session if req.logout is not working
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ message: 'Error logging out', error: err.message });
      }

      res.clearCookie('connect.sid', { path: '/' }); // Clear the session cookie
      res.status(200).json({ message: 'Logout successful' });
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
});
// Google OAuth Login Route
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

// Google OAuth Callback Route
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res) => {
    // Redirect to profile after successful login
    console.log('Google OAuth login successful:', req.user);
    res.redirect('/profile');
  }
);

module.exports = router;
