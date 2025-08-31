// server/schemas/Idea.js
const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: { type: String, required: true },
  tagline: String,
  description: String,
  techStack: [String],
  market: String,
  revenueModel: [String],           // ← Array
  uniqueValue: [String],            // ← Array
  marketSize: String,
  keyFeatures: [String],            // ← Already array, good
  targetAudience: String,
  businessModel: String,
  scalability: String,
  problemSolved: [String],          // ← Array
  solution: [String],               // ← Array
  competitiveAdvantage: [String],   // ← Array
  marketingStrategy: [String],      // ← Array
  fundingNeeds: [String],           // ← Array
  timeline: [String],               // ← Array
  riskMitigation: [String],         // ← Array
  isLiked: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Idea', IdeaSchema);