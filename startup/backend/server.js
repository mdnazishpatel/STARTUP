// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

// Import schemas
const User = require('./schemas/UserSchema');
const Idea = require('./schemas/Idea');

// Initialize Express
const app = express();
const PORT = 8000;

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/create', apiLimiter);
app.use('/code', apiLimiter);
app.use('/select-idea', apiLimiter);
app.use('/ideas/liked', apiLimiter);

// MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/startup', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, 'sikandar123');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

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

// Create ideas (using Gemini 1.5 Flash)

app.post('/create', authenticateToken, async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'Input required' });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You MUST generate EXACTLY 6 highly detailed and elaborate startup ideas for the keyword "${input}". 
      Each idea must be comprehensive with specific features, clear value propositions, and detailed business models.
      
      CRITICAL: Return ONLY valid JSON in this EXACT format with NO additional text, markdown, or explanations:
      {
        "ideas": [
          {
            "name": "Specific, memorable company name (not generic like '${input} App')",
            "tagline": "Compelling 6-10 word tagline that captures the essence",
            "description": "Detailed 120-150 word description explaining EXACTLY what the product does, how it works, and why it's needed. Be specific about features and user experience. No generic descriptions.",
            "techStack": ["React", "Node.js", "MongoDB", "Express", "Socket.io", "Stripe", "AWS", "Redis", "specific modern frameworks"],
            "market": "Specific market segment with size estimates (e.g., '$2.5B fitness tech market growing at 15% CAGR')",
            "revenueModel": "Detailed revenue strategy with specific pricing tiers and monetization methods",
            "uniqueValue": "Clear differentiation from competitors - what makes this special and hard to copy",
            "marketSize": "Specific TAM/SAM numbers and realistic growth projections with timeframes",
            "keyFeatures": [
              "Feature 1: Detailed explanation of what it does and specific user benefit with technical detail",
              "Feature 2: Specific functionality with clear technical implementation and user impact", 
              "Feature 3: Advanced capability that sets it apart from competitors with measurable outcomes",
              "Feature 4: Integration or automation feature that saves time/money with specific metrics",
              "Feature 5: Analytics or AI feature that provides unique insights with concrete examples"
            ],
            "targetAudience": "Very specific demographics, psychographics, income levels, and detailed use cases",
            "businessModel": "Detailed model (B2B SaaS, B2C subscription, marketplace) with customer acquisition strategy",
            "scalability": "Specific scaling strategy with growth milestones and expansion plans with timelines",
            "problemSolved": "Clear, relatable problem statement that resonates with target users",
            "solution": "How exactly the product solves the problem better than existing alternatives",
            "competitiveAdvantage": "Specific moats and barriers to entry that are defensible",
            "marketingStrategy": "Go-to-market approach with specific channels, tactics, and expected costs",
            "fundingNeeds": "Estimated capital requirements with detailed use of funds breakdown",
            "timeline": "Development and launch timeline with specific milestones and dates",
            "riskMitigation": "Key risks and specific strategies to address them"
          },
          ... (repeat for exactly 6 ideas)
        ]
      }
      
      Requirements for ALL 6 ideas:
      1. Each idea must be completely different and unique
      2. Be EXTREMELY specific - no generic descriptions or features
      3. Include realistic market research insights and numbers
      4. Mention specific competitors or market gaps that exist
      5. Provide concrete metrics, prices, and timelines
      6. Explain the technical approach and architecture
      7. Detail the exact user journey and value delivered
      8. Include realistic financial projections and funding needs
      9. Make each sound like a real, fundable startup concept
      10. Focus on ${input} but be creative with different applications
      11. Each idea should target different market segments or use cases
      12. Vary the business models (B2B, B2C, marketplace, etc.)
      
      Generate 6 distinct concepts that could each raise venture capital. Make them feel researched and validated.
      Remember: ONLY return the JSON object, no other text or formatting.
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let ideas = [];
    try {
      const parsed = JSON.parse(text);
      ideas = parsed.ideas || [];
    } catch (e) {
      console.warn('Fallback: AI response not valid JSON, generating 5 detailed ideas');
      // Enhanced fallback with 5 detailed ideas
      ideas = [
        {
          name: `${input.charAt(0).toUpperCase() + input.slice(1)}AI Pro`,
          tagline: `Revolutionary AI-powered ${input} platform for modern professionals`,
          description: `${input.charAt(0).toUpperCase() + input.slice(1)}AI Pro is an intelligent platform that transforms how professionals interact with ${input}. Using advanced machine learning algorithms, it provides personalized recommendations, automates routine tasks, and delivers actionable insights. The platform features a intuitive dashboard, real-time analytics, smart notifications, and seamless integrations with popular tools. Users can track their progress, collaborate with team members, and access premium features through a subscription model. Built with modern web technologies, it offers both web and mobile applications with offline capabilities.`,
          techStack: ['React', 'Node.js', 'MongoDB', 'Express', 'Redux Toolkit', 'Socket.io', 'Stripe', 'AWS S3', 'Redis', 'JWT'],
          market: `$5.2B ${input} technology market growing at 23% CAGR`,
          revenueModel: 'Freemium model: Free tier (basic features), Pro ($29/month), Enterprise ($99/month) with custom solutions',
          uniqueValue: 'First AI-native platform combining predictive analytics with intuitive UX, reducing user effort by 70%',
          marketSize: '$5.2B TAM, $800M SAM, targeting 2% market share ($16M) within 3 years',
          keyFeatures: [
            'AI-powered recommendations: Machine learning algorithms analyze user behavior to suggest optimal actions',
            'Real-time collaboration: Live editing, commenting, and team workspaces with role-based permissions',
            'Advanced analytics dashboard: Comprehensive metrics, trends, and predictive insights with custom reports',
            'Smart automation: Workflow automation that learns from user patterns and reduces manual tasks',
            'Mobile-first design: Native iOS and Android apps with offline sync and push notifications'
          ],
          targetAudience: `Professional ${input} enthusiasts aged 25-45, earning $60K+, tech-savvy, values productivity and efficiency`,
          businessModel: 'B2B SaaS with viral B2C components, focusing on team adoption and enterprise sales',
          scalability: 'Start with SMBs, expand to enterprise, international markets by Year 2, API platform by Year 3',
          problemSolved: `Current ${input} solutions are fragmented, lack intelligence, and require manual effort`,
          solution: 'Unified AI-powered platform that automates, predicts, and optimizes user workflows',
          competitiveAdvantage: 'Proprietary AI models, network effects, and deep industry expertise',
          marketingStrategy: 'Content marketing, influencer partnerships, freemium acquisition, enterprise sales team',
          fundingNeeds: '$2M seed round: 60% product development, 25% marketing, 15% team expansion',
          timeline: '6 months MVP, 12 months public launch, 18 months mobile apps, 24 months enterprise features',
          riskMitigation: 'Diversified revenue streams, strong IP protection, experienced advisory board'
        },
        {
          name: `${input} Connect Hub`,
          tagline: `Community-driven ${input} marketplace connecting enthusiasts worldwide`,
          description: `${input} Connect Hub is a comprehensive marketplace and community platform that brings together ${input} enthusiasts, professionals, and businesses. The platform facilitates peer-to-peer interactions, expert consultations, and product/service exchanges within the ${input} ecosystem. Features include verified expert profiles, community forums, live streaming events, skill-based matching, and integrated payment systems. Users can book sessions, purchase products, join groups, and participate in challenges. The platform also offers white-label solutions for ${input} businesses to create their own community spaces.`,
          techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Socket.io', 'Stripe', 'AWS', 'Redis', 'Tailwind CSS'],
          market: `$3.8B community and marketplace platforms in ${input} sector`,
          revenueModel: 'Commission-based: 8% on transactions, Premium memberships ($19/month), Enterprise white-label ($299/month)',
          uniqueValue: 'First integrated community-marketplace hybrid with AI-powered matching and verification systems',
          marketSize: '$3.8B TAM, $600M SAM, aiming for 3% market penetration ($18M revenue)',
          keyFeatures: [
            'Expert verification system: AI-powered credentialing and background checks for service providers',
            'Smart matching algorithm: Connects users with relevant experts, products, and community members',
            'Integrated video conferencing: Built-in video calls, screen sharing, and session recording',
            'Community challenges: Gamified engagement with leaderboards, rewards, and social recognition',
            'Multi-currency support: Global payments with automatic currency conversion and tax handling'
          ],
          targetAudience: `${input} enthusiasts aged 22-50, community-oriented, willing to pay for quality connections and expertise`,
          businessModel: 'Two-sided marketplace with community features, focusing on network effects and user retention',
          scalability: 'Geographic expansion, vertical specialization, white-label licensing to enterprises',
          problemSolved: `${input} community is fragmented across multiple platforms with no centralized expertise marketplace`,
          solution: 'All-in-one platform combining community building with expert marketplace functionality',
          competitiveAdvantage: 'Network effects, verified expert system, and integrated community features',
          marketingStrategy: 'Influencer partnerships, community seeding, content marketing, referral programs',
          fundingNeeds: '$3M Series A: 50% platform development, 30% user acquisition, 20% team expansion',
          timeline: '8 months beta launch, 14 months public release, 20 months mobile apps, 30 months white-label',
          riskMitigation: 'Diversified revenue streams, strong moderation systems, legal compliance framework'
        },
        {
          name: `Smart${input.charAt(0).toUpperCase() + input.slice(1)} Analytics`,
          tagline: `Data-driven insights platform transforming ${input} decision making`,
          description: `Smart${input.charAt(0).toUpperCase() + input.slice(1)} Analytics is an enterprise-grade analytics platform that provides actionable insights for ${input} businesses and professionals. The platform aggregates data from multiple sources, applies machine learning algorithms, and delivers predictive analytics through customizable dashboards. Features include real-time monitoring, trend analysis, competitor benchmarking, automated reporting, and API integrations. The platform serves ${input} companies looking to optimize operations, improve performance, and make data-driven decisions. Advanced AI models provide forecasting, anomaly detection, and recommendation engines.`,
          techStack: ['Python', 'Django', 'React', 'D3.js', 'PostgreSQL', 'Apache Kafka', 'TensorFlow', 'Docker', 'Kubernetes'],
          market: `$12B business analytics market with strong ${input} sector growth`,
          revenueModel: 'Tiered SaaS: Starter ($99/month), Professional ($299/month), Enterprise (custom pricing)',
          uniqueValue: 'Industry-specific analytics with pre-built ${input} KPIs and benchmarking datasets',
          marketSize: '$12B TAM, $1.2B SAM, targeting 1% market share ($12M) within 4 years',
          keyFeatures: [
            'Predictive analytics engine: Machine learning models for forecasting trends and outcomes',
            'Real-time dashboard builder: Drag-and-drop interface for creating custom analytics dashboards',
            'Competitive intelligence: Automated monitoring and analysis of competitor activities and market trends',
            'API-first architecture: Seamless integrations with existing business tools and data sources',
            'Automated insights delivery: AI-generated reports and alerts delivered via email, Slack, or mobile'
          ],
          targetAudience: `${input} business leaders, analysts, and decision-makers in companies with 50+ employees`,
          businessModel: 'B2B SaaS with annual contracts, professional services, and data licensing revenue',
          scalability: 'Industry expansion, AI model marketplace, acquisition of specialized analytics tools',
          problemSolved: `${input} businesses lack comprehensive analytics tools and struggle with data-driven decision making`,
          solution: 'Purpose-built analytics platform with industry-specific insights and predictive capabilities',
          competitiveAdvantage: 'Deep industry expertise, proprietary datasets, and advanced ML capabilities',
          marketingStrategy: 'Enterprise sales, industry conferences, thought leadership, partner channels',
          fundingNeeds: '$4M Series A: 40% product development, 35% sales team, 25% data acquisition',
          timeline: '10 months MVP, 16 months enterprise features, 24 months AI marketplace, 36 months IPO track',
          riskMitigation: 'Diversified customer base, strong data security, regulatory compliance focus'
        },
        {
          name: `${input} Learning Lab`,
          tagline: `Personalized education platform revolutionizing ${input} skill development`,
          description: `${input} Learning Lab is an adaptive learning platform that personalizes ${input} education using AI-driven curriculum optimization. The platform offers interactive courses, hands-on projects, peer collaboration, and expert mentorship. Advanced algorithms track learning patterns and adjust content difficulty, pacing, and format to maximize retention and engagement. Features include virtual labs, skill assessments, certification programs, and career pathway guidance. The platform serves both individual learners and corporate training programs, with specialized tracks for beginners to advanced practitioners in the ${input} field.`,
          techStack: ['Vue.js', 'Node.js', 'GraphQL', 'MongoDB', 'Docker', 'WebRTC', 'Three.js', 'Stripe', 'SendGrid'],
          market: `$8.5B online education market with ${input} skills in high demand`,
          revenueModel: 'Subscription ($39/month individual, $199/month corporate), Course sales, Certification fees ($149 each)',
          uniqueValue: 'Adaptive AI that personalizes learning paths and provides real-time skill gap analysis',
          marketSize: '$8.5B TAM, $950M SAM, targeting 2.5% market share ($24M) within 4 years',
          keyFeatures: [
            'Adaptive learning AI: Personalized curriculum that adjusts based on learning style and progress',
            'Virtual lab environments: Hands-on practice with simulated real-world scenarios and tools',
            'Peer learning network: Collaborative projects, study groups, and peer-to-peer mentoring',
            'Industry certification paths: Structured programs leading to recognized professional certifications',
            'Skills gap analysis: AI assessment of current skills vs. market demands with improvement roadmaps'
          ],
          targetAudience: `Career-focused individuals aged 20-40, corporate training managers, ${input} professionals seeking upskilling`,
          businessModel: 'B2C subscriptions with B2B corporate training contracts and certification revenue',
          scalability: 'Global expansion, language localization, industry-specific verticals, university partnerships',
          problemSolved: `Generic online courses don't provide personalized ${input} learning experiences or career guidance`,
          solution: 'AI-powered adaptive platform with personalized learning paths and industry connections',
          competitiveAdvantage: 'Advanced personalization AI, industry partnerships, and comprehensive skill tracking',
          marketingStrategy: 'Content marketing, corporate partnerships, influencer collaborations, free trial campaigns',
          fundingNeeds: '$2.5M seed round: 45% content development, 30% AI/platform, 25% marketing',
          timeline: '7 months beta platform, 13 months public launch, 20 months mobile apps, 28 months corporate features',
          riskMitigation: 'Diverse content library, multiple revenue streams, strong instructor network'
        },
        {
          name: `${input} Optimizer`,
          tagline: `Intelligent automation platform streamlining ${input} workflows and processes`,
          description: `${input} Optimizer is a workflow automation and optimization platform designed specifically for ${input} businesses and professionals. The platform uses AI to analyze existing processes, identify inefficiencies, and automatically implement improvements. Features include workflow builder, task automation, performance monitoring, cost optimization, and integration with popular ${input} tools. The system learns from user behavior and continuously optimizes processes without manual intervention. Advanced analytics provide insights into productivity gains, cost savings, and performance improvements across teams and departments.`,
          techStack: ['React', 'Python', 'FastAPI', 'PostgreSQL', 'Celery', 'Redis', 'Docker', 'Terraform', 'Grafana'],
          market: `$6.2B business process automation market growing rapidly in ${input} sector`,
          revenueModel: 'Usage-based pricing: $0.10 per automated task, Plus plans ($79-$299/month), Enterprise (custom)',
          uniqueValue: 'Self-improving automation that learns and optimizes without human intervention',
          marketSize: '$6.2B TAM, $720M SAM, targeting 2% market penetration ($14.4M) within 3 years',
          keyFeatures: [
            'AI workflow analyzer: Automatically identifies bottlenecks and optimization opportunities',
            'No-code automation builder: Visual interface for creating complex workflows without programming',
            'Smart task routing: AI-powered assignment of tasks based on team capacity and expertise',
            'Performance prediction: Machine learning models forecast project timelines and resource needs',
            'Cost optimization engine: Automated resource allocation and expense optimization across projects'
          ],
          targetAudience: `${input} business owners, operations managers, and teams looking to improve efficiency`,
          businessModel: 'Usage-based SaaS with enterprise consulting services and custom automation development',
          scalability: 'Industry-specific modules, API marketplace, acquisition of complementary automation tools',
          problemSolved: `${input} businesses waste time on repetitive tasks and struggle with process optimization`,
          solution: 'Intelligent automation that learns, adapts, and continuously improves business processes',
          competitiveAdvantage: 'Self-improving AI, industry specialization, and comprehensive process optimization',
          marketingStrategy: 'Performance-based marketing, case studies, industry partnerships, free optimization audits',
          fundingNeeds: '$3.5M Series A: 40% AI development, 35% sales/marketing, 25% enterprise partnerships',
          timeline: '9 months MVP, 15 months enterprise features, 22 months AI marketplace, 30 months acquisition ready',
          riskMitigation: 'Performance guarantees, flexible pricing, strong customer success team'
        }
      ];
    }

    const ideasToSave = ideas.map((idea, i) => ({
      ...idea,
      id: `${Date.now()}-${i}`,
      userId: req.user.id,
      input,
      isSelected: false,
      isLiked: false,
    }));

    await Idea.insertMany(ideasToSave);
    res.json({ ideas: ideasToSave });
  } catch (err) {
    console.error('Create ideas error:', err);
    res.status(500).json({ error: 'Failed to generate ideas' });
  }
});

// Select/Like idea
app.post('/select-idea', authenticateToken, async (req, res) => {
  const { ideaId, isSelected, isLiked } = req.body;
  if (!ideaId || (isSelected === undefined && isLiked === undefined)) {
    return res.status(400).json({ error: 'Missing ideaId or action' });
  }

  const update = {};
  if (isSelected !== undefined) update.isSelected = isSelected;
  if (isLiked !== undefined) update.isLiked = isLiked;

  const idea = await Idea.findOneAndUpdate(
    { id: ideaId, userId: req.user.id },
    update,
    { new: true }
  );

  if (!idea) return res.status(404).json({ error: 'Idea not found' });
  res.json({ message: 'Updated', idea });
});

// Generate complete applications (using Gemini 2.0 - change API key as needed)
app.post('/code', authenticateToken, async (req, res) => {
  const { ideaIds } = req.body;
  if (!ideaIds || !Array.isArray(ideaIds) || ideaIds.length === 0) {
    return res.status(400).json({ error: 'Valid ideaIds array required' });
  }

  const ideas = await Idea.find({
    id: { $in: ideaIds },
    userId: req.user.id,
  });

  if (ideas.length !== ideaIds.length) {
    return res.status(404).json({ error: 'One or more ideas not found' });
  }

  try {
    // Use Gemini 2.0 for code generation (change this to your Gemini 2.0 API key)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_2_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }); // Use Gemini 2.0 model

    const results = await Promise.all(
      ideas.map(async (idea) => {
        const prompt = `
          Generate a COMPLETE, PRODUCTION-READY application for: "${idea.name}"
          
          Startup Details:
          - Name: ${idea.name}
          - Description: ${idea.description}
          - Tech Stack: ${idea.techStack.join(', ')}
          - Key Features: ${idea.keyFeatures.join(', ')}
          - Target Audience: ${idea.targetAudience || 'General users'}
          - Business Model: ${idea.businessModel || 'SaaS'}
          
          Generate a complete, functional application with:
          1. Frontend (React with modern styling)
          2. Backend API (Node.js/Express)
          3. Database models
          4. Authentication system
          5. Core business logic
          6. Responsive UI with Tailwind CSS
          7. Error handling
          8. Security features
          
          Return ONLY this JSON structure:
          {
            "id": "${idea.id}",
            "name": "${idea.name}",
            "description": "Complete application for ${idea.name}",
            "techStack": ${JSON.stringify(idea.techStack)},
            "files": [
              {
                "path": "src/App.js",
                "language": "javascript",
                "content": "// Complete React App component with routing, state management, and UI\\n...",
                "description": "Main React application component"
              },
              {
                "path": "src/components/Dashboard.js",
                "language": "javascript", 
                "content": "// Complete dashboard component with all features\\n...",
                "description": "User dashboard with analytics and controls"
              },
              {
                "path": "src/components/Header.js",
                "language": "javascript",
                "content": "// Navigation header component\\n...",
                "description": "Application header with navigation"
              },
              {
                "path": "server/app.js",
                "language": "javascript",
                "content": "// Complete Express server with all routes\\n...",
                "description": "Main server application"
              },
              {
                "path": "server/models/User.js",
                "language": "javascript",
                "content": "// User model with full schema\\n...",
                "description": "User data model"
              },
              {
                "path": "server/routes/api.js",
                "language": "javascript",
                "content": "// All API routes\\n...",
                "description": "API endpoints"
              },
              {
                "path": "src/styles/globals.css",
                "language": "css",
                "content": "/* Complete Tailwind CSS styles */\\n...",
                "description": "Global styles and custom CSS"
              },
              {
                "path": "package.json",
                "language": "json",
                "content": "{ \\"dependencies\\": {...}, \\"scripts\\": {...} }",
                "description": "Project dependencies"
              },
              {
                "path": "README.md",
                "language": "markdown",
                "content": "# ${idea.name}\\n\\nComplete setup and usage instructions...",
                "description": "Project documentation"
              }
            ],
            "setupInstructions": "Step-by-step setup guide...",
            "deploymentGuide": "How to deploy this application..."
          }
          
          Requirements for generated code:
          1. All code must be COMPLETE and FUNCTIONAL - no placeholders or TODO comments
          2. Include proper error handling, validation, and security measures
          3. Use modern React patterns (hooks, functional components)
          4. Include responsive design with Tailwind CSS
          5. Add proper authentication and authorization
          6. Include database schemas and API endpoints
          7. Add comprehensive styling that looks professional
          8. Include loading states, error boundaries, and user feedback
          9. Make it production-ready with proper file structure
          10. Add comments explaining complex logic
          
          Generate REAL, WORKING CODE - not pseudocode or examples.
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
          const parsed = JSON.parse(text);
          return {
            id: idea.id,
            name: idea.name,
            description: parsed.description || `Complete application for ${idea.name}`,
            techStack: idea.techStack,
            files: parsed.files || [],
            setupInstructions: parsed.setupInstructions || 'Standard React + Node.js setup',
            deploymentGuide: parsed.deploymentGuide || 'Deploy to Vercel (frontend) + Railway (backend)'
          };
        } catch (e) {
          console.error('JSON parse error for idea:', idea.name, e);
          
          // Enhanced fallback with more comprehensive structure
          const fallbackFiles = [
            {
              path: 'src/App.js',
              language: 'javascript',
              content: `import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './styles/globals.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {user && <Header user={user} onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/" 
            element={user ? <Dashboard user={user} /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;`,
              description: 'Main React application with routing and authentication'
            },
            {
              path: 'src/components/Dashboard.js',
              language: 'javascript',
              content: `import React, { useState, useEffect } from 'react';
import { BarChart, Users, TrendingUp, DollarSign } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    users: 0,
    revenue: 0,
    growth: 0,
    conversion: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          <p className={\`text-sm mt-2 \${change >= 0 ? 'text-green-400' : 'text-red-400'}\`}>
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        </div>
        <div className={\`p-3 rounded-lg \${color}\`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-400 mt-2">
          Here's what's happening with your ${idea.name} today.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.users.toLocaleString()}
            change={12.5}
            color="bg-blue-500"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={\`$\${stats.revenue.toLocaleString()}\`}
            change={8.2}
            color="bg-green-500"
          />
          <StatCard
            icon={TrendingUp}
            title="Growth Rate"
            value={\`\${stats.growth}%\`}
            change={15.3}
            color="bg-purple-500"
          />
          <StatCard
            icon={BarChart}
            title="Conversion"
            value={\`\${stats.conversion}%\`}
            change={-2.1}
            color="bg-orange-500"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">New user registered</p>
                  <p className="text-gray-400 text-xs">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors">
              Add New Item
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors">
              View Analytics
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;`,
              description: 'Feature-rich dashboard component with statistics and analytics'
            },
            {
              path: 'src/components/Header.js',
              language: 'javascript',
              content: `import React, { useState } from 'react';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">
              ${idea.name}
            </h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="/analytics" className="text-gray-300 hover:text-white transition-colors">
              Analytics
            </a>
            <a href="/settings" className="text-gray-300 hover:text-white transition-colors">
              Settings
            </a>
          </nav>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-gray-300" />
              <span className="text-white text-sm">{user.name}</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <a
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </a>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="space-y-2">
              <a
                href="/dashboard"
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              >
                Dashboard
              </a>
              <a
                href="/analytics"
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              >
                Analytics
              </a>
              <a
                href="/settings"
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              >
                Settings
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;`,
              description: 'Responsive navigation header with user menu'
            },
            {
              path: 'src/components/Login.js',
              language: 'javascript',
              content: `import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome to ${idea.name}
          </h2>
          <p className="text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-400 hover:text-blue-300">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;`,
              description: 'Authentication component with modern UI'
            },
            {
              path: 'server/app.js',
              language: 'javascript',
              content: `const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/${idea.name.toLowerCase().replace(/\s+/g, '_')}', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Dashboard API
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Sample dashboard statistics
    const stats = {
      users: Math.floor(Math.random() * 10000) + 1000,
      revenue: Math.floor(Math.random() * 100000) + 10000,
      growth: Math.floor(Math.random() * 50) + 10,
      conversion: Math.floor(Math.random() * 20) + 5
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(\`${idea.name} server running on port \${PORT}\`);
});

module.exports = app;`,
              description: 'Complete Express.js server with authentication and API endpoints'
            },
            {
              path: 'src/styles/globals.css',
              language: 'css',
              content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-900 text-white antialiased;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  }
  
  .btn-secondary {
    @apply bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
  }
  
  .card {
    @apply bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg;
  }
  
  .input-field {
    @apply w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
  
  .sidebar {
    @apply bg-gray-800 border-r border-gray-700 h-full;
  }
  
  .nav-link {
    @apply text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;
  }
  
  .nav-link-active {
    @apply bg-gray-700 text-white;
  }
}

@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }
  
  .animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .glass-effect {
    @apply bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20;
  }
  
  .gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .gradient-secondary {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  .text-gradient {
    @apply bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-900;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}

/* Loading states */
.skeleton {
  @apply animate-pulse bg-gray-700 rounded;
}

/* Focus states */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900;
}

/* Hover effects */
.hover-lift {
  @apply transition-transform duration-200 hover:scale-105;
}

.hover-glow {
  @apply transition-shadow duration-300 hover:shadow-lg hover:shadow-blue-500/25;
}`,
              description: 'Complete Tailwind CSS with custom styles and animations'
            },
            {
              path: 'package.json',
              language: 'json',
              content: `{
  "name": "${idea.name.toLowerCase().replace(/\s+/g, '-')}",
  "version": "1.0.0",
  "description": "${idea.description}",
  "main": "server/app.js",
  "scripts": {
    "dev": "concurrently \\"npm run server\\" \\"npm run client\\"",
    "client": "react-scripts start",
    "server": "nodemon server/app.js",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "start": "node server/app.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "react-scripts": "5.0.1",
    "express": "^4.18.2",
    "mongoose": "^7.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "helmet": "^6.1.5",
    "express-rate-limit": "^6.7.0",
    "dotenv": "^16.0.3",
    "lucide-react": "^0.263.1",
    "@tailwindcss/forms": "^0.5.3"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.2",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "concurrently": "^8.0.1",
    "nodemon": "^2.0.22"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
              description: 'Complete package.json with all dependencies'
            },
            {
              path: 'README.md',
              language: 'markdown',
              content: `# ${idea.name}

${idea.description}

## 🚀 Features

${idea.keyFeatures.map(feature => `- ${feature}`).join('\n')}

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router
- Tailwind CSS
- Lucide React (Icons)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Bcrypt

### DevOps
- Concurrently for development
- Nodemon for auto-restart

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd ${idea.name.toLowerCase().replace(/\s+/g, '-')}
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Variables**
   Create a \`.env\` file in the root directory:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/${idea.name.toLowerCase().replace(/\s+/g, '_')}
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   \`\`\`

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   \`\`\`bash
   npm run dev
   \`\`\`

   This will start both the React frontend (http://localhost:3000) and Express backend (http://localhost:5000).

## 🏗️ Project Structure

\`\`\`
${idea.name.toLowerCase().replace(/\s+/g, '-')}/
├── public/                 # Public assets
├── src/                   # React frontend
│   ├── components/        # React components
│   │   ├── Dashboard.js
│   │   ├── Header.js
│   │   └── Login.js
│   ├── styles/           # CSS files
│   │   └── globals.css
│   └── App.js           # Main App component
├── server/               # Backend
│   └── app.js           # Express server
├── package.json
└── README.md
\`\`\`

## 🚀 Deployment

### Frontend (Vercel)
1. Build the project: \`npm run build\`
2. Deploy the \`build\` folder to Vercel
3. Set environment variables in Vercel dashboard

### Backend (Railway/Heroku)
1. Deploy the server code
2. Set environment variables
3. Ensure MongoDB connection string is correct

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration can be found in \`tailwind.config.js\`.

### Database
MongoDB is used as the database. The connection string can be configured in the \`.env\` file.

## 📝 API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login user
- \`GET /api/auth/me\` - Get current user
- \`POST /api/auth/logout\` - Logout user

### Dashboard
- \`GET /api/dashboard/stats\` - Get dashboard statistics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you have any questions or need help, please open an issue or contact the development team.

---

Built with ❤️ using React and Node.js`,
              description: 'Complete project documentation'
            }
          ];

          return {
            id: idea.id,
            name: idea.name,
            description: `Complete ${idea.name} application with authentication, dashboard, and modern UI`,
            techStack: idea.techStack,
            files: fallbackFiles,
            setupInstructions: 'Run npm install, set up .env file, start MongoDB, then npm run dev',
            deploymentGuide: 'Deploy frontend to Vercel and backend to Railway or Heroku'
          };
        }
      })
    );

    await Idea.updateMany(
      { id: { $in: ideaIds }, userId: req.user.id },
      { status: 'processed' }
    );

    res.json({ codebases: results });
  } catch (err) {
    console.error('Code generation error:', err);
    res.status(500).json({ error: 'Code generation failed' });
  }
});

// Get liked ideas
app.get('/ideas/liked', authenticateToken, async (req, res) => {
  try {
    const ideas = await Idea.find({ userId: req.user.id, isLiked: true }).sort({ createdAt: -1 });
    res.json({ ideas });
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));