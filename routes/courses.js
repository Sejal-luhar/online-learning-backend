const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose=require('mongoose')

// Create a new course (only for instructors)
router.post('/create', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { title, description, content, price, duration, image } = req.body;

  const newCourse = new Course({
    title,
    description,
    content,
    price,
    duration,
    image,
    instructor: req.user._id, // Set instructor to the logged-in user
  });

  newCourse
    .save()
    .then((course) => res.status(201).json({ message: 'Course created successfully', course }))
    .catch((err) => res.status(500).json({ message: 'Course creation failed', error: err.message }));
});



// Get all courses
// Get all courses
router.get('/', (req, res) => {
  Course.find()
    .populate('instructor', 'username email') // Populate instructor information
    .then((courses) => {
      if (courses.length === 0) {
        return res.status(404).json({ message: 'No courses found' });
      }
      res.json(courses); // Send the list of courses
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Get a single course by ID
// router.get('/:courseId', (req, res) => {
//   const { courseId } = req.params;
//   Course.findById(courseId)
//     .populate('instructor', 'username email') // Populate instructor details
//     .then((course) => {
//       if (!course) {
//         return res.status(404).json({ message: 'Course not found' });
//       }
//       res.json(course); // Send course details
//     })
//     .catch((err) => res.status(500).json({ error: err.message }));
// });


router.get('/:courseId', (req, res) => {
  const { courseId } = req.params;

  Course.findById(courseId)
    .populate('instructor', 'username email') // Populate instructor details (username, email)
    .then((course) => {
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if the user is authenticated and enrolled in the course
      let isEnrolled = false;
      if (req.isAuthenticated()) {
        isEnrolled = course.students.some((studentId) => studentId.equals(req.user._id)); // Check if the current user is enrolled
      }

      // Respond with the course details along with enrollment status
      res.json({
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          content: course.content, // Course content
          duration: course.duration,
          price: course.price,
          enrolledStudents: course.enrolledStudents,
          ratings: course.ratings,
          reviews: course.reviews,
          instructor: course.instructor, // Populated instructor details
        },
        isEnrolled, // Add the enrollment status to the response
      });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Failed to fetch course details', error: err.message });
    });
});



// Get courses the user is enrolled in (My Courses)
// Assuming you're using Express.js

router.get('/my-courses', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  console.log('Authenticated user ID:', req.user._id); // Log to confirm

  const userId = req.user._id;
  Course.find({ students: userId })
    .populate('instructor', 'username email')
    .then((courses) => {
      res.json(courses);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch courses', error: err.message });
    });
});



// Enroll in a course
router.post('/:courseId/enroll', (req, res) => {
  // Check if the user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { courseId } = req.params;

  Course.findById(courseId)
    .then((course) => {
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if the user is already enrolled in the course
      if (course.students.includes(req.user._id)) {
        return res.status(400).json({ message: 'You are already enrolled in this course' });
      }

      // Add the user to the students array
      course.students.push(req.user._id);

      // Increment the enrolled students count
      course.enrolledStudents += 1;

      return course.save();
    })
    .then((updatedCourse) => {
      res.json({ message: 'Enrolled successfully', course: updatedCourse });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Enrollment failed', error: err.message });
    });
});



// Add a rating to a course
router.post('/:courseId/rate', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, review } = req.body;

    console.log('Incoming request:', { courseId, rating, review }); // Log input

    // Validate input
    if (!rating || !review) {
      console.error('Validation failed: Missing rating or review');
      return res.status(400).json({ message: 'Rating and review are required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.error('Course not found:', courseId);
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Simulate adding a review
    course.reviews.push({ rating, review });
    await course.save();

    console.log('Rating added successfully');
    res.status(200).json({ message: 'Rating submitted successfully.' });
  } catch (error) {
    console.error('Error processing rating:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// Update progress for a student
router.get('/:courseId/progress', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { courseId } = req.params;

  Course.findById(courseId)
    .then((course) => {
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const studentProgress = course.students.find(
        (student) => student.studentId.toString() === req.user._id.toString()
      );

      if (!studentProgress) {
        return res.status(400).json({ message: 'You are not enrolled in this course' });
      }

      res.json({ progress: studentProgress.progress });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Failed to fetch progress', error: err.message });
    });
});


module.exports = router;
