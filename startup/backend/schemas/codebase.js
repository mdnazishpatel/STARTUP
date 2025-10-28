// server/models/Codebase.js
const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  path: { type: String, required: true },
  language: { type: String, required: true },
  content: { type: String, required: true },
  description: { type: String },
  isEntryPoint: { type: Boolean, default: false },
  previewable: { type: Boolean, default: false },
  size: { type: Number }, // File size in bytes
  lastModified: { type: Date, default: Date.now }
});

const SaaSFeaturesSchema = new mongoose.Schema({
  pricingTiers: [{ type: String }],
  coreFeatures: [{ type: String }],
  integrations: [{ type: String }],
  scalability: { type: String }
});

const DemoCredentialsSchema = new mongoose.Schema({
  admin: {
    email: { type: String },
    password: { type: String },
    role: { type: String, default: 'admin' }
  },
  user: {
    email: { type: String },
    password: { type: String },
    role: { type: String, default: 'user' }
  }
});

const CodebaseSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  ideaId: { 
    type: String, 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  files: [FileSchema],
  techStack: [{ type: String }],
  saasFeatures: SaaSFeaturesSchema,
  
  // Preview and deployment
  previewId: { 
    type: String, 
    unique: true, 
    sparse: true,
    index: true
  },
  previewUrl: { type: String },
  deploymentUrl: { type: String },
  
  // Documentation and setup
  setupInstructions: { type: String },
  deploymentGuide: { type: String },
  apiDocumentation: { type: String },
  demoCredentials: DemoCredentialsSchema,
  
  // Status and metadata
  status: { 
    type: String, 
    enum: ['generating', 'ready', 'deployed', 'archived'], 
    default: 'generating',
    index: true
  },
  generatedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  lastAccessed: { 
    type: Date, 
    default: Date.now 
  },
  accessCount: { 
    type: Number, 
    default: 0 
  },
  
  // Analytics
  previewViews: { 
    type: Number, 
    default: 0 
  },
  downloads: { 
    type: Number, 
    default: 0 
  },
  shares: { 
    type: Number, 
    default: 0 
  },
  
  // Tags and categorization
  tags: [{ type: String }],
  category: { type: String },
  featured: { 
    type: Boolean, 
    default: false,
    index: true
  },
  
  // Version control
  version: { 
    type: String, 
    default: '1.0.0' 
  },
  changelog: [{
    version: String,
    changes: String,
    date: { type: Date, default: Date.now }
  }],
  
  // Collaboration
  isPublic: { 
    type: Boolean, 
    default: false,
    index: true
  },
  collaborators: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' },
    invitedAt: { type: Date, default: Date.now }
  }],
  
  // Performance metrics
  buildTime: { type: Number }, // Time to generate in seconds
  complexity: { 
    type: String, 
    enum: ['simple', 'medium', 'complex', 'enterprise'],
    default: 'medium'
  },
  linesOfCode: { type: Number },
  
  // Expiration for temporary previews
  expiresAt: { type: Date },
  
  // Backup and recovery
  backupUrl: { type: String },
  lastBackup: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
CodebaseSchema.index({ userId: 1, createdAt: -1 });
CodebaseSchema.index({ status: 1, featured: 1 });
CodebaseSchema.index({ previewId: 1 }, { sparse: true });
CodebaseSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for total file count
CodebaseSchema.virtual('fileCount').get(function() {
  return this.files ? this.files.length : 0;
});

// Virtual for total lines of code
CodebaseSchema.virtual('totalLinesOfCode').get(function() {
  if (!this.files) return 0;
  return this.files.reduce((total, file) => {
    return total + (file.content ? file.content.split('\n').length : 0);
  }, 0);
});

// Virtual for age in days
CodebaseSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
CodebaseSchema.pre('save', function(next) {
  // Update lines of code count
  if (this.files && this.files.length > 0) {
    this.linesOfCode = this.totalLinesOfCode;
  }
  
  // Set complexity based on file count and lines of code
  if (this.linesOfCode > 5000 || this.fileCount > 20) {
    this.complexity = 'enterprise';
  } else if (this.linesOfCode > 2000 || this.fileCount > 10) {
    this.complexity = 'complex';
  } else if (this.linesOfCode > 500 || this.fileCount > 5) {
    this.complexity = 'medium';
  } else {
    this.complexity = 'simple';
  }
  
  next();
});

// Static methods
CodebaseSchema.statics.findByUserId = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.featured) {
    query.where('featured', true);
  }
  
  return query.sort({ createdAt: -1 }).limit(options.limit || 50);
};

CodebaseSchema.statics.findPublic = function(options = {}) {
  const query = this.find({ isPublic: true });
  
  if (options.category) {
    query.where('category', options.category);
  }
  
  if (options.featured) {
    query.where('featured', true);
  }
  
  return query
    .populate('userId', 'name email')
    .sort({ featured: -1, createdAt: -1 })
    .limit(options.limit || 20);
};

CodebaseSchema.statics.getStats = function(userId) {
  return this.aggregate`([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        totalViews: { $sum: '$previewViews' },
        totalDownloads: { $sum: '$downloads' },
        totalShares: { $sum: '$shares' },
        totalLinesOfCode: { $sum: '$linesOfCode' },
        avgComplexity: { $avg: { $cond: [
          { $eq: ['$complexity', 'simple'] }, 1,
          { $cond: [{ $eq: ['$complexity', 'medium'] }, 2,
            { $cond: [{ $eq: ['$complexity', 'complex'] }, 3, 4] }
          ]}
        ]}]
      }
    }
  ])`;
};

// Instance methods
CodebaseSchema.methods.incrementView = function() {
  this.previewViews += 1;
  this.lastAccessed = new Date();
  return this.save();
};

CodebaseSchema.methods.incrementDownload = function() {
  this.downloads += 1;
  return this.save();
};

CodebaseSchema.methods.incrementShare = function() {
  this.shares += 1;
  return this.save();
};

CodebaseSchema.methods.addCollaborator = function(userId, role = 'viewer') {
  if (!this.collaborators.some(c => c.userId.equals(userId))) {
    this.collaborators.push({ userId, role });
    return this.save();
  }
  return Promise.resolve(this);
};

CodebaseSchema.methods.canAccess = function(userId, requiredRole = 'viewer') {
  // Owner has full access
  if (this.userId.equals(userId)) return true;
  
  // Public codebases can be viewed
  if (this.isPublic && requiredRole === 'viewer') return true;
  
  // Check collaborators
  const collaborator = this.collaborators.find(c => c.userId.equals(userId));
  if (!collaborator) return false;
  
  const roles = ['viewer', 'editor', 'admin'];
  const userRoleIndex = roles.indexOf(collaborator.role);
  const requiredRoleIndex = roles.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
};

const Codebase = mongoose.model('Codebase', CodebaseSchema);

module.exports = Codebase;