const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course'); // Assuming you have a Course model

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Not authenticated' });
};

// Get logged-in user's profile
router.get('/', isAuthenticated, (req, res) => {
  res.json(req.user);
});

// Update user profile (e.g., change username or profile image)
router.put('/', isAuthenticated, (req, res) => {
  const { username, profileImage } = req.body;

  User.findByIdAndUpdate(req.user._id, { username, profileImage }, { new: true })
    .then((updatedUser) => res.json(updatedUser))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Dashboard route: Fetch user's courses and other details
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Fetch courses from the database (customize based on your schema)
    const userCourses = await Course.find({ enrolledUsers: req.user._id });
    const recommendedCourses = await Course.find({}).limit(5); // Sample recommendation logic

    res.json({
      message: 'Dashboard data fetched successfully',
      user: req.user, // User details
      courses: userCourses, // Enrolled courses
      recommended: recommendedCourses, // Recommended courses
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

module.exports = router;
