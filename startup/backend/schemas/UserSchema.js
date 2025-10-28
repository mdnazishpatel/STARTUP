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
    required: function() {
      // Only required if provider = local
      return this.provider === "local";
    },
    select: false // don’t return password by default
  },

  provider: {
    type: String,
    enum: ["local", "google", "github", "facebook"],
    default: "local"
  },

  providerId: {
    type: String, // OAuth provider’s unique ID for the user
  },

  avatar: {
    type: String,
    default: null
  },

  premium: {
    type: Boolean,
    default: false
  },

  // IDEA LIMIT TRACKING
  ideaCount: {
    type: Number,
    default: 0
  },
  maxIdeas: {
    type: Number,
    default: 6 // Free users get 6 ideas
  }
}, {
  timestamps: true 
});

// INSTANCE METHODS
UserSchema.methods.canCreateIdea = function() {
  if (this.premium) return true; // Premium = unlimited ideas
  return this.ideaCount < this.maxIdeas;
};

UserSchema.methods.getRemainingIdeas = function() {
  if (this.premium) return -1; // -1 means unlimited
  return Math.max(0, this.maxIdeas - this.ideaCount);
};

UserSchema.methods.incrementIdeaCount = async function() {
  this.ideaCount += 1;
  return await this.save();
};

UserSchema.methods.decrementIdeaCount = async function() {
  this.ideaCount = Math.max(0, this.ideaCount - 1);
  return await this.save();
};

module.exports = mongoose.model('User', UserSchema);
