const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
        content: { type: [String], required: true },
        students: [
          {
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            progress: { type: Number, default: 0 },
          },
        ],
            price: String,
    duration: String,
    enrolledStudents: { type: Number, default: 0 },
    image: String,
    ratings: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true },
        review: String,
      },
    ],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: String,
        rating: Number,
      },
    ],
    progress: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        percentage: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Calculate the average rating
courseSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) return 0;
  const totalRating = this.ratings.reduce((sum, r) => sum + r.rating, 0);
  return totalRating / this.ratings.length;
};

// Add a new rating
courseSchema.methods.addRating = function (studentId, rating, review) {
  this.ratings.push({ studentId, rating, review });
  return this.save();
};

// Update course progress
courseSchema.methods.updateProgress = function (studentId, percentage) {
  const progressIndex = this.progress.findIndex(
    (p) => p.studentId.toString() === studentId.toString()
  );

  if (progressIndex >= 0) {
    this.progress[progressIndex].percentage = percentage;
  } else {
    this.progress.push({ studentId, percentage });
  }

  return this.save();
};

module.exports = mongoose.model('Course', courseSchema);
