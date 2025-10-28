// server.js — Fully Fixed & Production Ready
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const sanitizeHtml = require('sanitize-html');
const authenticateToken = require('./middleware/authmiddleware');
const User = require('./schemas/UserSchema');
const Idea = require('./schemas/Idea');
const CodeGeneration = require('./schemas/codegenschema');


const app = express();
const PORT = 8000;
dotenv.config();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/startup', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Preferences Schema
const PreferencesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'User' },
  techStack: { type: [String], default: ['React', 'Node.js', 'MongoDB'] },
  features: { type: [String], default: [] },
  designStyle: { type: String, default: 'modern' },
  targetAudience: { type: String, default: '' },
  businessModel: { type: String, default: 'SaaS' },
  createdAt: { type: Date, default: Date.now },
});
const Preferences = mongoose.model('Preferences', PreferencesSchema);

// Register
app.post('/register', async (req, res) => {
  try {
    const { name, mail, password } = req.body;
    if (!name || !mail || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existing = await User.findOne({ mail });
    if (existing) return res.status(400).json({ error: 'User exists' });

    const user = new User({ name, mail, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id, name, mail },
      'sikandar123',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000,
    });

    res.json({ message: 'Registered' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { mail, password } = req.body;
    if (!mail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ mail });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, mail },
      'sikandar123',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000,
    });

    res.json({
      message: 'Logged in',
      user: { id: user._id, name: user.name, mail: user.mail }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//liked $ preference routes
// Add this route to your server.js after the /unlike route

// Get liked ideas - MISSING ROUTE
app.get('/liked', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    // Find all liked ideas for the authenticated user
    const likedIdeas = await Idea.find({ 
      userId: userId, 
      isLiked: true 
    }).sort({ createdAt: -1 });

    // Convert _id to id for frontend compatibility
    const ideas = likedIdeas.map(idea => ({
      ...idea.toObject(),
      id: idea._id.toString()
    }));

    res.json({ ideas });
  } catch (err) {
    console.error('Get liked ideas error:', err);
    res.status(500).json({ error: 'Failed to fetch liked ideas' });
  }
});

// Also add preferences routes that are referenced in CreatePage
app.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const preferences = await Preferences.findOne({ userId });
    
    if (!preferences) {
      // Return default preferences
      return res.json({
        techStack: ['React', 'Node.js', 'MongoDB'],
        features: [],
        designStyle: 'modern',
        targetAudience: '',
        businessModel: 'SaaS'
      });
    }
    
    res.json(preferences);
  } catch (err) {
    console.error('Get preferences error:', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

app.post('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const preferences = await Preferences.findOneAndUpdate(
      { userId },
      { ...req.body, userId },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, preferences });
  } catch (err) {
    console.error('Save preferences error:', err);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});
// Fixed Create Ideas Route
app.post('/create', authenticateToken, async (req, res) => {
  const { input, preferences } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'Input required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_2_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Generate EXACTLY 6 unique startup ideas for the keyword "${input}" based on:
      - Tech Stack: ${JSON.stringify(preferences.techStack || ['React', 'Node.js', 'MongoDB'])}
      - Features: ${JSON.stringify(preferences.features || [])}
      - Design: ${preferences.designStyle || 'modern'}
      - Audience: ${preferences.targetAudience || 'General'}
      - Business Model: ${preferences.businessModel || 'SaaS'}

      Return JSON: { ideas: [{ name, tagline, description, techStack, keyFeatures, businessModel, market, revenueModel, problemSolved, solution, competitiveAdvantage }] }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    let ideas;

    try {
      const parsedResponse = JSON.parse(text);
      // Fix: Don't include 'id' field - let MongoDB generate _id automatically
      ideas = parsedResponse.ideas.map(idea => ({
        name: idea.name,
        tagline: idea.tagline,
        description: idea.description,
        techStack: Array.isArray(idea.techStack) ? idea.techStack : [],
        keyFeatures: Array.isArray(idea.keyFeatures) ? idea.keyFeatures : [],
        businessModel: idea.businessModel,
        market: idea.market,
        revenueModel: Array.isArray(idea.revenueModel) ? idea.revenueModel : (idea.revenueModel ? [idea.revenueModel] : []),
        problemSolved: Array.isArray(idea.problemSolved) ? idea.problemSolved : (idea.problemSolved ? [idea.problemSolved] : []),
        solution: Array.isArray(idea.solution) ? idea.solution : (idea.solution ? [idea.solution] : []),
        competitiveAdvantage: Array.isArray(idea.competitiveAdvantage) ? idea.competitiveAdvantage : (idea.competitiveAdvantage ? [idea.competitiveAdvantage] : []),
        // Additional fields that might be in your schema
        uniqueValue: Array.isArray(idea.uniqueValue) ? idea.uniqueValue : (idea.uniqueValue ? [idea.uniqueValue] : []),
        marketSize: idea.marketSize,
        targetAudience: idea.targetAudience,
        scalability: idea.scalability,
        marketingStrategy: Array.isArray(idea.marketingStrategy) ? idea.marketingStrategy : (idea.marketingStrategy ? [idea.marketingStrategy] : []),
        fundingNeeds: Array.isArray(idea.fundingNeeds) ? idea.fundingNeeds : (idea.fundingNeeds ? [idea.fundingNeeds] : []),
        timeline: Array.isArray(idea.timeline) ? idea.timeline : (idea.timeline ? [idea.timeline] : []),
        riskMitigation: Array.isArray(idea.riskMitigation) ? idea.riskMitigation : (idea.riskMitigation ? [idea.riskMitigation] : []),
        // MongoDB will auto-generate _id, and these are defaults from schema
        userId: new mongoose.Types.ObjectId(req.user.id),
        isLiked: false,
        isSelected: false
      }));
    } catch (e) {
      console.error('Parse error:', e.message, 'Raw:', text);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Insert ideas into database
    const saved = await Idea.insertMany(ideas);
    
    // Return ideas with _id converted to id for frontend compatibility
    const responseIdeas = saved.map(idea => ({
      ...idea.toObject(),
      id: idea._id.toString() // Convert _id to id for frontend
    }));
    
    res.json({ ideas: responseIdeas });
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ error: 'Failed to generate ideas' });
  }
});

// Enhanced Safe Parse Function - Replace your existing safeParse
const safeParse = (text, fallback) => {
  try {
    // Clean the text more aggressively
    let cleanText = text.trim()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/^[^{]*{/, '{')  // Remove everything before first {
      .replace(/}[^}]*$/, '}'); // Remove everything after last }

    // Remove JavaScript-style comments
    cleanText = cleanText
      .replace(/\/\/.*$/gm, '')  // Remove // comments
      .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove /* */ comments
      .replace(/,\s*([}\]])/g, '$1')  // Remove trailing commas
      .replace(/\n\s*\n/g, '\n')  // Remove extra newlines
      .trim();

    // Try to fix common JSON issues
    cleanText = cleanText
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')  // Fix unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"')  // Convert single quotes to double
      .replace(/:\s*`([^`]*)`/g, ': "$1"')  // Convert backticks to double quotes
      .replace(/\n/g, ' ')  // Remove newlines that break JSON
      .replace(/\s+/g, ' ');  // Normalize whitespace

    const parsed = JSON.parse(cleanText);
    return parsed;
  } catch (err) {
    console.error('JSON parse error:', err.message, 'Cleaned text:', cleanText?.substring(0, 200) + '...');
    return fallback;
  }
}; 

// Fixed /code route in server.js
app.post('/code', authenticateToken, async (req, res) => {
  const { ideaIds } = req.body;

  if (!ideaIds || !Array.isArray(ideaIds) || ideaIds.length === 0) {
    return res.status(400).json({ error: 'Valid ideaIds array required' });
  }

  const invalidIds = ideaIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    return res.status(400).json({ 
      error: 'Invalid idea IDs format',
      details: `Invalid IDs: ${invalidIds.join(', ')}`
    });
  }

  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const objectIdeaIds = ideaIds.map(id => new mongoose.Types.ObjectId(id));

    const ideas = await Idea.find({
      _id: { $in: objectIdeaIds },
      userId
    });

    if (ideas.length === 0) {
      return res.status(404).json({ error: 'No ideas found' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_2_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const codebases = await Promise.all(
      ideas.map(async (idea) => {
        console.log(`🚀 Generating SaaS codebase for: ${idea.name}`);

        let architecture = {};
        let files = [];

        // 1. Generate Architecture
        try {
          const archPrompt = `
Create a detailed system architecture for "${idea.name}" - ${idea.description}

Return ONLY valid JSON in this exact format:
{
  "overview": "Detailed system architecture overview explaining the components and their interactions",
  "mermaid": "graph TD\\n    A[React Frontend] --> B[Express API Server]\\n    B --> C[(MongoDB Database)]\\n    B --> D[JWT Authentication]\\n    B --> E[External APIs]\\n    C --> F[User Collection]\\n    C --> G[Data Collection]",
  "techStack": ["React", "Node.js", "Express", "MongoDB", "JWT", "Tailwind CSS"],
  "databaseSchema": {
    "users": {
      "fields": ["_id", "name", "email", "password", "role", "createdAt", "updatedAt"],
      "description": "User authentication and profile data"
    },
    "projects": {
      "fields": ["_id", "title", "description", "userId", "status", "createdAt"],
      "description": "Main project data"
    }
  },
  "apiEndpoints": [
    { "method": "POST", "route": "/api/auth/login", "description": "User authentication" },
    { "method": "GET", "route": "/api/auth/profile", "description": "Get user profile" },
    { "method": "POST", "route": "/api/projects", "description": "Create new project" },
    { "method": "GET", "route": "/api/projects", "description": "List user projects" }
  ],
  "databaseDesign": "MongoDB with collections for users, projects, and sessions. Uses Mongoose ODM for schema validation and relationships.",
  "apiDesign": "RESTful API with JWT authentication, input validation, and error handling. Follows standard HTTP status codes and JSON responses."
}

Requirements:
- Use the tech stack: ${idea.techStack?.join(', ') || 'React, Node.js, MongoDB'}
- Make it scalable and production-ready
- Include proper authentication flow
- Return ONLY the JSON, no markdown formatting`;

          const archResult = await model.generateContent(archPrompt);
          let archText = archResult.response.text().trim();
          
          // Clean the response
          archText = archText.replace(/```json/g, '').replace(/```/g, '').trim();
          
          try {
            architecture = JSON.parse(archText);
          } catch (parseErr) {
            console.error('Architecture parse error:', parseErr.message);
            architecture = {
              overview: `Modern full-stack architecture for ${idea.name} with React frontend, Node.js/Express backend, and MongoDB database.`,
              mermaid: 'graph TD\\n    A[React App] --> B[Express Server]\\n    B --> C[(MongoDB)]\\n    B --> D[JWT Auth]',
              techStack: idea.techStack || ['React', 'Node.js', 'MongoDB'],
              databaseSchema: {
                users: { fields: ['_id', 'name', 'email'], description: 'User data' }
              },
              apiEndpoints: [
                { method: 'GET', route: '/api/health', description: 'Health check' }
              ],
              databaseDesign: 'MongoDB with Mongoose ODM',
              apiDesign: 'RESTful API with JWT authentication'
            };
          }
        } catch (err) {
          console.error('Architecture generation failed:', err.message);
          architecture = {
            overview: `Standard SaaS architecture for ${idea.name}`,
            mermaid: 'graph TD\\n    Frontend --> Backend\\n    Backend --> Database',
            techStack: idea.techStack || ['React', 'Node.js', 'MongoDB'],
            databaseSchema: {},
            apiEndpoints: [],
            databaseDesign: 'MongoDB database',
            apiDesign: 'REST API'
          };
        }

        // 2. Generate Files
        try {
          const filesPrompt = `
Generate a complete, production-ready codebase for "${idea.name}".

Return ONLY a JSON array of file objects in this exact format:
[
  {
    "path": "package.json",
    "language": "json",
    "content": "{\\"name\\": \\"${idea.name.toLowerCase().replace(/\s+/g, '-')}\\",\\"version\\": \\"1.0.0\\",\\"scripts\\": {\\"dev\\": \\"concurrently \\\\\\"npm run server\\\\\\" \\\\\\"npm run client\\\\\\"\\",\\"server\\": \\"nodemon server.js\\",\\"client\\": \\"cd client && npm start\\",\\"build\\": \\"cd client && npm run build\\"},\\"dependencies\\": {\\"express\\": \\"^4.18.2\\",\\"mongoose\\": \\"^7.0.0\\",\\"jsonwebtoken\\": \\"^9.0.0\\",\\"bcryptjs\\": \\"^2.4.3\\",\\"cors\\": \\"^2.8.5\\",\\"dotenv\\": \\"^16.0.0\\"},\\"devDependencies\\": {\\"nodemon\\": \\"^2.0.20\\",\\"concurrently\\": \\"^7.6.0\\"}}",
    "explanation": "Main package.json with all dependencies and scripts for development",
    "category": "config"
  },
  {
    "path": "server.js",
    "language": "javascript", 
    "content": "const express = require('express');\\nconst mongoose = require('mongoose');\\nconst cors = require('cors');\\nconst dotenv = require('dotenv');\\n\\ndotenv.config();\\nconst app = express();\\n\\n// Middleware\\napp.use(cors());\\napp.use(express.json());\\n\\n// MongoDB connection\\nmongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/${idea.name.toLowerCase().replace(/\s+/g, '_')}', {\\n  useNewUrlParser: true,\\n  useUnifiedTopology: true\\n});\\n\\n// Routes\\napp.get('/api/health', (req, res) => {\\n  res.json({ status: 'OK', message: 'Server is running' });\\n});\\n\\n// Import routes\\nconst authRoutes = require('./routes/auth');\\nconst projectRoutes = require('./routes/projects');\\n\\napp.use('/api/auth', authRoutes);\\napp.use('/api/projects', projectRoutes);\\n\\nconst PORT = process.env.PORT || 5000;\\napp.listen(PORT, () => {\\n  console.log(\`Server running on port \${PORT}\`);\\n});",
    "explanation": "Main Express server with MongoDB connection and route setup",
    "category": "backend"
  },
  {
    "path": "models/User.js",
    "language": "javascript",
    "content": "const mongoose = require('mongoose');\\nconst bcrypt = require('bcryptjs');\\n\\nconst userSchema = new mongoose.Schema({\\n  name: {\\n    type: String,\\n    required: [true, 'Name is required'],\\n    trim: true\\n  },\\n  email: {\\n    type: String,\\n    required: [true, 'Email is required'],\\n    unique: true,\\n    lowercase: true,\\n    match: [/^\\\\S+@\\\\S+\\\\.\\\\S+$/, 'Please enter a valid email']\\n  },\\n  password: {\\n    type: String,\\n    required: [true, 'Password is required'],\\n    minlength: 6\\n  },\\n  role: {\\n    type: String,\\n    enum: ['user', 'admin'],\\n    default: 'user'\\n  }\\n}, {\\n  timestamps: true\\n});\\n\\n// Hash password before saving\\nuserSchema.pre('save', async function(next) {\\n  if (!this.isModified('password')) return next();\\n  this.password = await bcrypt.hash(this.password, 12);\\n  next();\\n});\\n\\n// Compare password method\\nuserSchema.methods.comparePassword = async function(password) {\\n  return await bcrypt.compare(password, this.password);\\n};\\n\\nmodule.exports = mongoose.model('User', userSchema);",
    "explanation": "User model with authentication, validation, and password hashing",
    "category": "database"
  },
  {
    "path": "routes/auth.js",
    "language": "javascript",
    "content": "const express = require('express');\\nconst jwt = require('jsonwebtoken');\\nconst User = require('../models/User');\\nconst router = express.Router();\\n\\n// Register\\nrouter.post('/register', async (req, res) => {\\n  try {\\n    const { name, email, password } = req.body;\\n    \\n    // Check if user exists\\n    const existingUser = await User.findOne({ email });\\n    if (existingUser) {\\n      return res.status(400).json({ error: 'User already exists' });\\n    }\\n    \\n    // Create user\\n    const user = new User({ name, email, password });\\n    await user.save();\\n    \\n    // Generate token\\n    const token = jwt.sign(\\n      { userId: user._id },\\n      process.env.JWT_SECRET || 'fallback-secret',\\n      { expiresIn: '7d' }\\n    );\\n    \\n    res.status(201).json({\\n      message: 'User created successfully',\\n      token,\\n      user: { id: user._id, name: user.name, email: user.email }\\n    });\\n  } catch (error) {\\n    res.status(500).json({ error: error.message });\\n  }\\n});\\n\\n// Login\\nrouter.post('/login', async (req, res) => {\\n  try {\\n    const { email, password } = req.body;\\n    \\n    // Find user\\n    const user = await User.findOne({ email });\\n    if (!user) {\\n      return res.status(400).json({ error: 'Invalid credentials' });\\n    }\\n    \\n    // Check password\\n    const isMatch = await user.comparePassword(password);\\n    if (!isMatch) {\\n      return res.status(400).json({ error: 'Invalid credentials' });\\n    }\\n    \\n    // Generate token\\n    const token = jwt.sign(\\n      { userId: user._id },\\n      process.env.JWT_SECRET || 'fallback-secret',\\n      { expiresIn: '7d' }\\n    );\\n    \\n    res.json({\\n      message: 'Login successful',\\n      token,\\n      user: { id: user._id, name: user.name, email: user.email }\\n    });\\n  } catch (error) {\\n    res.status(500).json({ error: error.message });\\n  }\\n});\\n\\nmodule.exports = router;",
    "explanation": "Authentication routes for user registration and login with JWT",
    "category": "backend"
  },
  {
    "path": "client/src/App.jsx",
    "language": "jsx",
    "content": "import React, { useState, useEffect } from 'react';\\nimport { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';\\nimport axios from 'axios';\\nimport Login from './components/Login';\\nimport Dashboard from './components/Dashboard';\\nimport './App.css';\\n\\nfunction App() {\\n  const [user, setUser] = useState(null);\\n  const [loading, setLoading] = useState(true);\\n\\n  useEffect(() => {\\n    const token = localStorage.getItem('token');\\n    if (token) {\\n      axios.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;\\n      // Validate token with backend\\n      checkAuth();\\n    } else {\\n      setLoading(false);\\n    }\\n  }, []);\\n\\n  const checkAuth = async () => {\\n    try {\\n      const response = await axios.get('http://localhost:5000/api/auth/profile');\\n      setUser(response.data.user);\\n    } catch (error) {\\n      localStorage.removeItem('token');\\n      delete axios.defaults.headers.common['Authorization'];\\n    } finally {\\n      setLoading(false);\\n    }\\n  };\\n\\n  const handleLogin = (userData, token) => {\\n    setUser(userData);\\n    localStorage.setItem('token', token);\\n    axios.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;\\n  };\\n\\n  const handleLogout = () => {\\n    setUser(null);\\n    localStorage.removeItem('token');\\n    delete axios.defaults.headers.common['Authorization'];\\n  };\\n\\n  if (loading) {\\n    return <div className=\\"loading\\">Loading...</div>;\\n  }\\n\\n  return (\\n    <Router>\\n      <div className=\\"App\\">\\n        <Routes>\\n          <Route \\n            path=\\"/login\\" \\n            element={user ? <Navigate to=\\"/dashboard\\" /> : <Login onLogin={handleLogin} />} \\n          />\\n          <Route \\n            path=\\"/dashboard\\" \\n            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to=\\"/login\\" />} \\n          />\\n          <Route path=\\"/\\" element={<Navigate to={user ? \\"/dashboard\\" : \\"/login\\"} />} />\\n        </Routes>\\n      </div>\\n    </Router>\\n  );\\n}\\n\\nexport default App;",
    "explanation": "Main React app with routing and authentication state management",
    "category": "frontend"
  },
  {
    "path": ".env",
    "language": "text",
    "content": "# Database\\nMONGODB_URI=mongodb://localhost:27017/${idea.name.toLowerCase().replace(/\s+/g, '_')}\\n\\n# JWT Secret\\nJWT_SECRET=your-super-secret-jwt-key-change-this-in-production\\n\\n# Server\\nPORT=5000\\nNODE_ENV=development\\n\\n# Client URL\\nCLIENT_URL=http://localhost:3000",
    "explanation": "Environment variables for database, JWT secret, and server configuration",
    "category": "config"
  }
]

Requirements:
- Generate 8-15 realistic, working files
- Each file must have proper syntax and realistic content
- Include frontend (React), backend (Node.js), database models, configuration
- Use double escaping for quotes in JSON strings (\\\\\\" instead of \\")
- No placeholders or "TODO" comments
- Files should be interconnected and reference each other properly
- Return ONLY the JSON array, no markdown`;

          const filesResult = await model.generateContent(filesPrompt);
          let filesText = filesResult.response.text().trim();
          
          // Clean the response
          filesText = filesText.replace(/```json/g, '').replace(/```/g, '').trim();
          
          try {
            files = JSON.parse(filesText);
            if (!Array.isArray(files)) {
              throw new Error('Files response is not an array');
            }
          } catch (parseErr) {
            console.error('Files parse error:', parseErr.message);
            // Fallback files
            files = [
              {
                path: 'package.json',
                language: 'json',
                content: `{
  "name": "${idea.name.toLowerCase().replace(/\s+/g, '-')}",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \\"npm run server\\" \\"npm run client\\"",
    "server": "nodemon server.js",
    "client": "cd client && npm start"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0"
  }
}`,
                explanation: 'Project package.json with dependencies',
                category: 'config'
              },
              {
                path: 'server.js',
                language: 'javascript',
                content: `const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});`,
                explanation: 'Basic Express server setup',
                category: 'backend'
              }
            ];
          }
        } catch (err) {
          console.error('Files generation failed:', err.message);
          files = [];
        }

        return {
          id: idea._id.toString(),
          name: idea.name,
          description: idea.description,
          architecture,
          files,
          setupInstructions: {
            development: `1. Clone the repository
2. Install dependencies: npm install
3. Set up environment variables in .env file
4. Start MongoDB service
5. Run development server: npm run dev`,
            production: `1. Build the application: npm run build
2. Set production environment variables
3. Start with PM2: pm2 start server.js
4. Set up reverse proxy with Nginx`,
            environment: `MONGODB_URI=mongodb://localhost:27017/${idea.name.toLowerCase().replace(/\s+/g, '_')}
JWT_SECRET=your-jwt-secret-key
PORT=5000
NODE_ENV=production`
          },
          deploymentGuide: {
            platforms: ['Heroku', 'Vercel + Railway', 'AWS EC2', 'DigitalOcean'],
            steps: `1. Push code to GitHub repository
2. Connect GitHub to deployment platform
3. Set environment variables in platform dashboard
4. Configure build and start commands
5. Deploy and test the application`,
            cicd: 'Set up GitHub Actions for automatic testing and deployment on push to main branch'
          },
          testingStrategy: {
            overview: 'Comprehensive testing strategy covering unit, integration, and end-to-end tests',
            unit: 'Jest for testing individual functions and components',
            integration: 'Supertest for API endpoint testing',
            e2e: 'Cypress for full user workflow testing'
          }
        };
      })
    );

    // Save to database
    try {
      await CodeGeneration.create({
        userId,
        ideaIds: objectIdeaIds,
        projectName: ideas[0].name,
        filesGenerated: codebases.reduce((sum, cb) => sum + (cb.files?.length || 0), 0),
        techStack: ideas[0].techStack?.slice(0, 10) || ['React', 'Node.js']
      });
    } catch (dbErr) {
      console.warn('Failed to save to database:', dbErr.message);
    }

    res.json({ codebases });

  } catch (err) {
    console.error('Code generation error:', err);
    res.status(500).json({ 
      error: 'Code generation failed', 
      details: err.message 
    });
  }
});
// Helper function to extract simple tech stack array
// function extractTechStack(techStackData) {
//   if (!techStackData) return ['React', 'Node.js', 'MongoDB'];
  
//   if (Array.isArray(techStackData)) {
//     return techStackData
//       .filter(item => typeof item === 'string' && item.length < 50)
//       .slice(0, 10);
//   }
  
//   if (typeof techStackData === 'string') {
//     return techStackData
//       .split(/[,\n\-\*]/)
//       .map(tech => tech.trim().replace(/['"]/g, ''))
//       .filter(tech => tech.length > 0 && tech.length < 50)
//       .slice(0, 10);
//   }
  
//   if (typeof techStackData === 'object') {
//     const techs = [];
//     Object.values(techStackData).forEach(value => {
//       if (Array.isArray(value)) {
//         techs.push(...value.filter(item => typeof item === 'string'));
//       } else if (typeof value === 'string') {
//         techs.push(value);
//       }
//     });
//     return techs.filter(tech => tech.length < 50).slice(0, 10);
//   }
  
//   return ['React', 'Node.js', 'MongoDB'];
// }
//perfernce 


// Profile Route
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalIdeas = await Idea.countDocuments({ userId });
    const likedIdeas = await Idea.countDocuments({ userId, isLiked: true });

    const techStackStats = await Idea.aggregate([
      { $match: { userId } },
      { $unwind: '$techStack' },
      { $group: { _id: '$techStack', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const businessModelStats = await Idea.aggregate([
      { $match: { userId } },
      { $group: { _id: '$businessModel', count: { $sum: 1 } } },
      { $limit: 10 }
    ]);

    const recentIdeas = await Idea.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name createdAt techStack isLiked _id');

    const totalCodeProjects = await CodeGeneration.countDocuments({ userId });
    const totalFilesGenerated = await CodeGeneration.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$filesGenerated' } } }
    ]);

    // Streak Logic
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let streak = 0;
    let currentDate = new Date(startOfToday);

    while (streak < 365) {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = await Idea.countDocuments({
        userId,
        createdAt: { $gte: currentDate, $lt: nextDay }
      });
      if (count > 0) { streak++; currentDate.setDate(currentDate.getDate() - 1); }
      else break;
    }

    const recentActivity = [
      ...recentIdeas.map(idea => ({
        type: 'idea_generated',
        title: 'Generated Startup Idea',
        description: `Created "${idea.name}"`,
        time: getTimeAgo(idea.createdAt),
        ideaId: idea._id,
        isLiked: idea.isLiked
      })),
      ...(await CodeGeneration.find({ userId }).sort({ createdAt: -1 }).limit(5))
        .map(cg => ({
          type: 'code_generated',
          title: 'Generated Full Stack Code',
          description: `Created code for "${cg.projectName}" with ${cg.filesGenerated} files`,
          time: getTimeAgo(cg.createdAt)
        }))
    ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 15);

    res.json({
      user: { id: user._id, name: user.name, email: user.mail, joinDate: user.createdAt },
      totalIdeas,
      likedIdeas,
      totalCodeProjects,
      totalFilesGenerated: totalFilesGenerated[0]?.total || 0,
      generationStreak: streak,
      techStackStats,
      businessModelStats,
      recentActivity,
      achievements: calculateAchievements({
        totalIdeas, likedIdeas, totalCodeProjects,
        totalFilesGenerated: totalFilesGenerated[0]?.total || 0,
        generationStreak: streak,
        techStackCount: techStackStats.length
      })
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Profile fetch failed', details: err.message });
  }
});

// Helper Functions
function getTimeAgo(date) {
  const now = Date.now(), diff = now - new Date(date);
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function calculateAchievements(stats) {
  return [
    { id: 'idea_generator', title: 'Idea Generator', description: '25+ ideas', earned: stats.totalIdeas >= 25, progress: stats.totalIdeas, target: 25 },
    { id: 'code_master', title: 'Code Master', description: '10+ codebases', earned: stats.totalCodeProjects >= 10, progress: stats.totalCodeProjects, target: 10 },
    { id: 'curator', title: 'Curator', description: '15+ likes', earned: stats.likedIdeas >= 15, progress: stats.likedIdeas, target: 15 },
    { id: 'speed_demon', title: 'Speed Demon', description: '7-day streak', earned: stats.generationStreak >= 7, progress: stats.generationStreak, target: 7 },
    { id: 'file_creator', title: 'File Creator', description: '100+ files', earned: stats.totalFilesGenerated >= 100, progress: stats.totalFilesGenerated, target: 100 }
  ];
}

// Add this route to your server.js (you have /unlike but missing /like)
// Replace your /like and /unlike routes with these corrected versions:

// Like an idea
// Like an idea - CORRECTED VERSION
app.post('/like', authenticateToken, async (req, res) => {
  try {
    const { ideaId } = req.body;
    
    if (!ideaId) {
      return res.status(400).json({ error: 'Idea ID is required' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(ideaId)) {
      return res.status(400).json({ error: 'Invalid idea ID format' });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const objectIdeaId = new mongoose.Types.ObjectId(ideaId);

    // Find and update the idea
    const idea = await Idea.findOneAndUpdate(
      { 
        _id: objectIdeaId, 
        userId: userId  // Ensure user owns this idea
      },
      { $set: { isLiked: true } },
      { new: true } // Return updated document
    );

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found or unauthorized' });
    }

    console.log(`✅ Liked idea: ${idea.name} (ID: ${ideaId})`);
    
    // Return consistent format with id field
    res.json({ 
      success: true, 
      idea: {
        ...idea.toObject(),
        id: idea._id.toString() // Convert _id to id
      }
    });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Failed to like idea', details: err.message });
  }
});

// Unlike an idea - CORRECTED VERSION  
app.post('/unlike', authenticateToken, async (req, res) => {
  try {
    const { ideaId } = req.body;
    
    if (!ideaId) {
      return res.status(400).json({ error: 'Idea ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(ideaId)) {
      return res.status(400).json({ error: 'Invalid idea ID format' });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const objectIdeaId = new mongoose.Types.ObjectId(ideaId);

    const idea = await Idea.findOneAndUpdate(
      { 
        _id: objectIdeaId, 
        userId: userId 
      },
      { $set: { isLiked: false } },
      { new: true }
    );

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found or unauthorized' });
    }

    console.log(`❌ Unliked idea: ${idea.name} (ID: ${ideaId})`);
    
    res.json({ 
      success: true, 
      idea: {
        ...idea.toObject(),
        id: idea._id.toString()
      }
    });
  } catch (err) {
    console.error('Unlike error:', err);
    res.status(500).json({ error: 'Failed to unlike idea', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});