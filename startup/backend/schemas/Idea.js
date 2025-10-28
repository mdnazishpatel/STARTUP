// schemas/Idea.js - Make sure your Idea schema looks like this:
const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String },
  description: { type: String, required: true },
  techStack: { type: [String], default: [] },
  keyFeatures: { type: [String], default: [] },
  businessModel: { type: String },
  market: { type: String },
  revenueModel: { type: mongoose.Schema.Types.Mixed }, // Can be string or array
  problemSolved: { type: mongoose.Schema.Types.Mixed },
  solution: { type: mongoose.Schema.Types.Mixed },
  competitiveAdvantage: { type: mongoose.Schema.Types.Mixed },
  uniqueValue: { type: mongoose.Schema.Types.Mixed },
  marketSize: { type: String },
  targetAudience: { type: String },
  scalability: { type: String },
  marketingStrategy: { type: mongoose.Schema.Types.Mixed },
  fundingNeeds: { type: mongoose.Schema.Types.Mixed },
  timeline: { type: mongoose.Schema.Types.Mixed },
  riskMitigation: { type: mongoose.Schema.Types.Mixed },
  
  // User association and status
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isLiked: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Add index for better query performance
IdeaSchema.index({ userId: 1, isLiked: 1 });
IdeaSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Idea', IdeaSchema);