// server/schemas/Idea.js
const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  name: String,
  tagline: String,
  description: String,
  techStack: [String],
  market: String,
  revenueModel: String,
  uniqueValue: String,
  marketSize: String,
  keyFeatures: [String],
  targetAudience: String,
  businessModel: String,
  scalability: String,
  problemSolved: String,
  solution: String,
  competitiveAdvantage: String,
  marketingStrategy: String,
  fundingNeeds: String,
  timeline: String,
  riskMitigation: String,
  isSelected: { type: Boolean, default: false },
  isLiked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Idea', IdeaSchema);