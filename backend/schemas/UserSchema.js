// Update your User schema to include createdAt timestamp
// Add this to your UserSchema.js file or update the existing one

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  // Add avatar field for future use
  avatar: {
    type: String,
    default: null
  },
  // This will automatically add createdAt and updatedAt
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('User', UserSchema);