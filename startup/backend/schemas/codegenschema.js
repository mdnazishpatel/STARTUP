const mongoose = require('mongoose');

const CodeGenerationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true  // ← Improves query performance
  },
  ideaIds: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Idea'  // ← Now you can populate if needed
  }],
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  filesGenerated: {
    type: Number,
    required: true,
    min: 0
  },
  techStack: [{
    type: String,
    trim: true
  }],
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true  // ← Good for time-based queries (e.g., recent generations)
  }
});

// Optional: Add compound index if querying by user + date
CodeGenerationSchema.index({ userId: 1, generatedAt: -1 });

// Create the model
const CodeGeneration = mongoose.model('CodeGeneration', CodeGenerationSchema);

module.exports = CodeGeneration;