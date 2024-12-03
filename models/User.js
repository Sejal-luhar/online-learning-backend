const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true, required: true }, // Only keep the email field, as passport-local-mongoose will handle password and username
  role: {
    type: String,
    enum: ['instructor', 'student'], // You can restrict roles to either 'instructor' or 'student'
    default: 'student', // Default to 'student'
  },
});

// Apply the passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });  // Set the email as the username field

module.exports = mongoose.model('User', userSchema);
