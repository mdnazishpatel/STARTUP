const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const sanitizeHtml = require('sanitize-html');
const authenticateToken = require('./middleware/authmiddleware')
const User = require('./schemas/UserSchema');
const Idea = require('./schemas/Idea');

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
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

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

    // FIX: Return user data that the frontend expects
    res.json({ 
      message: 'Logged in',
      user: {
        id: user._id,
        name: user.name,
        mail: user.mail
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



// const PreferencesSchema = new mongoose.Schema({
//   userId: { type: String, required: true, unique: true },
//   techStack: [String],
//   features: [String],
//   designStyle: String,
//   targetAudience: String,
//   businessModel: String,
//   createdAt: { type: Date, default: Date.now },
// });

// const Idea = mongoose.model('Idea', IdeaSchema);
// const Preferences = mongoose.model('Preferences', PreferencesSchema);


// Routes
app.post('/create', authenticateToken, async (req, res) => {
  const { input, preferences } = req.body;
  if (!input) {
    console.error('Create error: Input required');
    return res.status(400).json({ error: 'Input required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Generate EXACTLY 6 unique startup ideas for the keyword "${input}" based on the following user preferences:
      - Tech Stack: ${JSON.stringify(preferences.techStack || ['React', 'Node.js', 'MongoDB'])}
      - Desired Features: ${JSON.stringify(preferences.features || [])}
      - Design Style: ${preferences.designStyle || 'modern'}
      - Target Audience: ${preferences.targetAudience || 'General'}
      - Business Model: ${preferences.businessModel || 'SaaS'}

      Return a JSON object with this structure:
      {
        "ideas": [
          {
            "id": "unique-id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}",
            "name": "Specific company name",
            "tagline": "6-10 word tagline",
            "description": "120-150 word description",
            "techStack": ["list of tech aligned with preferences"],
            "market": "Specific market segment with size estimates",
            "revenueModel": "Detailed revenue strategy",
            "uniqueValue": "Clear differentiation",
            "marketSize": "TAM/SAM numbers",
            "keyFeatures": ["Detailed feature descriptions aligned with preferences"],
            "targetAudience": "Specific demographics aligned with preferences",
            "businessModel": "Aligned with preferences",
            "scalability": "Scaling strategy",
            "problemSolved": "Clear problem statement",
            "solution": "How it solves the problem",
            "competitiveAdvantage": "Defensible moats",
            "marketingStrategy": "Go-to-market approach",
            "fundingNeeds": "Capital requirements",
            "timeline": "Development timeline",
            "riskMitigation": "Risk strategies"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    let ideas;
    try {
      ideas = JSON.parse(text).ideas.map((idea) => ({
        ...idea,
        userId: req.user.id,
        isSelected: false,
        isLiked: false,
      }));
    } catch (parseErr) {
      console.error('JSON parse error in /create:', parseErr.message, 'Raw response:', text);
      return res.status(500).json({ error: 'Failed to parse idea response' });
    }

    await Idea.insertMany(ideas);
    res.json({ ideas });
  } catch (err) {
    console.error('Create ideas error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to generate ideas' });
  }
});



app.post('/code', authenticateToken, async (req, res) => {
  const { ideaIds } = req.body;
  if (!ideaIds || !Array.isArray(ideaIds) || ideaIds.length === 0) {
    return res.status(400).json({ error: 'Valid ideaIds array required' });
  }

  try {
    const ideas = await Idea.find({ id: { $in: ideaIds }, userId: req.user.id });
    if (ideas.length !== ideaIds.length) {
      return res.status(404).json({ error: 'One or more ideas not found' });
    }

    const codebases = await Promise.all(
      ideas.map(async (idea) => {
      const prompt = `
You are a senior full-stack SaaS developer. Generate a production-ready, well-documented, and modular application.

**Idea Details:**
- Name: ${idea.name}
- Description: ${idea.description}
- Tech Stack: ${JSON.stringify(idea.techStack)}
- Features: ${JSON.stringify(idea.keyFeatures)}
- Business Model: ${idea.businessModel}
- Target Audience: ${idea.targetAudience}

**Instructions:**
1. Return valid JSON only.
2. Use modern React (functional components, hooks), TailwindCSS, and modular file structure.
3. Add inline comments in code for clarity.
4. Explanation should be in clear, technical prose (3-5 sentences).
5. Include error boundaries, responsive design, and accessibility.
6. Setup: npm install, env vars, DB setup.
7. Deployment: Vercel + Railway or Netlify + Render.

**Response Format:**
{
  "name": "...",
  "description": "...",
  "techStack": [...],
  "files": [
    {
      "path": "src/App.jsx",
      "language": "jsx",
      "content": "// Full code with comments...",
      "explanation": "This component handles routing and global state..."
    }
  ],
  "setupInstructions": "1. npm install 2. Create .env with API keys...",
  "deploymentGuide": "Deploy frontend to Vercel, backend to Railway..."
}
`;

        try {
          // 🔄 Call OpenRouter API
          const response = await fetch.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'meta-llama/llama-3.1-70b-instruct',
              messages: [{ role: 'user', content: prompt }],
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );

          let text = response.data.choices[0].message.content.trim()
            .replace(/```json/g, '')
            .replace(/```/g, '');

          let parsed;
          try {
            parsed = JSON.parse(text);
          } catch (parseErr) {
            console.error('JSON parse error for idea', idea.id, ':', parseErr.message, 'Raw:', text);
            return {
              id: idea.id,
              name: idea.name,
              description: 'Failed to generate code',
              techStack: idea.techStack,
              files: [],
              setupInstructions: 'N/A',
              deploymentGuide: 'N/A',
              error: 'Failed to parse AI response',
            };
          }

          return {
            id: idea.id,
            name: idea.name,
            description: parsed.description || 'No description provided',
            techStack: idea.techStack,
            files: (parsed.files || []).map((file) => ({
              ...file,
              content: sanitizeHtml(file.content, { allowedTags: [], allowedAttributes: {} }) || '// No content generated',
              explanation: file.explanation || 'No explanation provided',
            })),
            setupInstructions: parsed.setupInstructions || 'Run npm install, set up .env, start MongoDB, then npm run dev',
            deploymentGuide: parsed.deploymentGuide || 'Deploy frontend to Vercel, backend to Railway',
          };
        } catch (err) {
          console.error('Code generation error for idea', idea.id, ':', err.message);
          return {
            id: idea.id,
            name: idea.name,
            description: 'Failed to generate code',
            techStack: idea.techStack,
            files: [],
            setupInstructions: 'N/A',
            deploymentGuide: 'N/A',
            error: err.message,
          };
        }
      })
    );

    res.json({ codebases });
  } catch (err) {
    console.error('Code endpoint error:', err.message);
    res.status(500).json({ error: 'Code generation failed', details: err.message });
  }
});


app.post('/preferences', authenticateToken, async (req, res) => {
  const preferences = { ...req.body, userId: req.user.id };
  try {
    await Preferences.findOneAndUpdate({ userId: req.user.id }, preferences, { upsert: true });
    res.json({ message: 'Preferences saved' });
  } catch (err) {
    console.error('Save preferences error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

app.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const preferences = await Preferences.findOne({ userId: req.user.id });
    res.json(preferences || {});
  } catch (err) {
    console.error('Fetch preferences error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});
//likes
// Add Like
app.post("/like", authenticateToken, async (req, res) => {
  const { codeId } = req.body;
  if (!codeId) return res.status(400).json({ error: "codeId required" });

  try {
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent duplicates
    if (!user.likedCodes.includes(codeId)) {
      user.likedCodes.push(codeId);
      await user.save();
    }

    res.json({ success: true, likedCodes: user.likedCodes });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get Liked Codes
app.get("/liked", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("likedCodes"); 
    res.json({ liked: user.likedCodes }); // Make sure it's JSON
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});