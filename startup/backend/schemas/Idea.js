// server/schemas/Idea.js
const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  techStack: { type: [String], required: true },
  market: { type: String, required: true },
  revenueModel: { type: String, required: true },
  uniqueValue: { type: String, required: true },
  marketSize: { type: String, required: true },
  keyFeatures: { type: [String], required: true },
  input: { type: String, required: true },
  userId: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
  isLiked: { type: Boolean, default: false }, // New field for liking
  createdAt: { type: Date, default: Date.now },
  generatedBy: { type: String, default: 'gemini-1.5-flash' },
  status: { type: String, enum: ['generated', 'processed', 'archived'], default: 'generated' },
});

module.exports = mongoose.model('Idea', IdeaSchema);