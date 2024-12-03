const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');

// Get current user's profile
router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json(req.user); // Return logged-in user data
});

// Update user profile (like changing email or password)
router.put('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { email, username } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, username }, { new: true })
    .then((updatedUser) => res.json(updatedUser))
    .catch((err) => res.status(500).json({ error: err.message }));
});

module.exports = router;
