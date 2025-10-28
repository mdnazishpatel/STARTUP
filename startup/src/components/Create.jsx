import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Sliders,
  Heart,
  X,
  Brain,
  Cpu,
  Database,
  Rocket,
  Sparkles,
  Code,
  ArrowRight,
  Grid,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Zap,
  Shield,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  Filter,
  Eye,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer'; // assuming you have Footer

// ======================
// Error Boundary
// ======================
class CreatePageErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <p className="text-lg text-gray-400 mb-8">
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ======================
// Three.js Background (Keep Original)
// ======================
const ThreeJSBackground = () => {
  const mountRef = useRef(null);
  const frameRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    let scene, camera, renderer, brainGroup, particles;

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      brainGroup = new THREE.Group();
      const brainGeometry = new THREE.SphereGeometry(2, 16, 16);
      const brainMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const brainSphere = new THREE.Mesh(brainGeometry, brainMaterial);
      brainGroup.add(brainSphere);

      const nodeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const nodes = [];
      for (let i = 0; i < 50; i++) {
        const nodeMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.6 + Math.random() * 0.3, 0.8, 0.6),
          transparent: true,
          opacity: 0.8,
        });
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        const phi = Math.acos(-1 + (2 * i) / 50);
        const theta = Math.sqrt(50 * Math.PI) * phi;
        const radius = 3 + Math.random() * 2;
        node.position.set(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        );
        nodes.push(node);
        brainGroup.add(node);
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = nodes[i].position.distanceTo(nodes[j].position);
          if (distance < 3 && Math.random() > 0.7) {
            const geometry = new THREE.BufferGeometry().setFromPoints([nodes[i].position, nodes[j].position]);
            const material = new THREE.LineBasicMaterial({
              color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.6, 0.4),
              transparent: true,
              opacity: 0.2,
            });
            brainGroup.add(new THREE.Line(geometry, material));
          }
        }
      }

      scene.add(brainGroup);

      const particleCount = 100;
      const positions = new Float32Array(particleCount * 3);
      const velocities = [];
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 50;
        positions[i3 + 1] = (Math.random() - 0.5) * 30;
        positions[i3 + 2] = (Math.random() - 0.5) * 30;
        velocities.push({
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        });
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xa5f3fc,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.6,
      });
      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      camera.position.set(0, 0, 15);

      let time = 0;
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        time += 0.01;
        brainGroup.rotation.y += 0.002;
        nodes.forEach((node, index) => {
          node.material.opacity = 0.5 + Math.sin(time * 2 + index * 0.1) * 0.3;
          const scale = 1 + Math.sin(time * 3 + index * 0.2) * 0.2;
          node.scale.setScalar(scale);
        });
        const pos = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          pos[i3] += velocities[i].x;
          pos[i3 + 1] += velocities[i].y;
          pos[i3 + 2] += velocities[i].z;
          if (Math.abs(pos[i3]) > 25) velocities[i].x *= -1;
          if (Math.abs(pos[i3 + 1]) > 15) velocities[i].y *= -1;
          if (Math.abs(pos[i3 + 2]) > 15) velocities[i].z *= -1;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      };
      animate();
    };

    init();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    cleanupRef.current = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (renderer) renderer.dispose();
    };

    return () => cleanupRef.current();
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0" />;
};

// ======================
// Floating 3D Icons (Enhanced)
// ======================
const Floating3DIcon = ({ icon: Icon, position, delay = 0, size = 'md' }) => {
  if (!Icon) return null;
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <motion.div
      className="absolute z-10 hidden lg:block"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        rotate: [0, 5, -5, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 6,
        delay: delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/20 flex items-center justify-center group hover:scale-110 transition-all duration-300 hover:border-cyan-400/50`}>
        <Icon className={`${iconSizes[size]} text-purple-300 group-hover:text-cyan-300 transition-colors duration-300`} />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/10 to-cyan-600/10 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
      </div>
    </motion.div>
  );
};

// ======================
// Enhanced Feature Input
// ======================
const FeatureInput = ({ features, onAdd, onRemove }) => {
  const [newFeature, setNewFeature] = useState('');
  const handleAdd = (e) => {
    e.preventDefault();
    if (newFeature.trim()) {
      onAdd(newFeature.trim());
      setNewFeature('');
    }
  };
  return (
    <div className="space-y-3">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          placeholder="Add a feature..."
          className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
        />
        <button
          type="submit"
          className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {features.map((feature, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-200 px-3 py-1 rounded-full text-xs border border-purple-500/30"
          >
            {feature}
            <button
              onClick={() => onRemove(feature)}
              className="text-purple-300 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ======================
// Enhanced Idea Modal
// ======================
const IdeaModal = ({ idea, onClose, onLike, isSelected, onSelect }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const handleLike = (e) => {
    e.stopPropagation();
    onLike(idea.id);
  };
  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(idea.id);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'business', label: 'Business', icon: DollarSign },
    { id: 'technical', label: 'Technical', icon: Cpu },
    { id: 'market', label: 'Market', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {[
              { key: 'problemSolved', label: 'Problem', icon: AlertTriangle },
              { key: 'solution', label: 'Solution', icon: Zap },
              { key: 'uniqueValue', label: 'Unique Value', icon: Sparkles },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="border-b border-white/10 pb-4 last:border-b-0">
                <h4 className="text-lg font-semibold flex items-center text-cyan-300 mb-2">
                  <Icon className="w-5 h-5 text-purple-400 mr-2" />
                  {label}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {idea[key] || 'Not specified'}
                </p>
              </div>
            ))}
          </div>
        );
      case 'business':
        return (
          <div className="space-y-6">
            {[
              { key: 'businessModel', label: 'Business Model', icon: Grid },
              { key: 'revenueModel', label: 'Revenue Model', icon: TrendingUp },
              { key: 'fundingNeeds', label: 'Funding Needs', icon: DollarSign },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="border-b border-white/10 pb-4 last:border-b-0">
                <h4 className="text-lg font-semibold flex items-center text-cyan-300 mb-2">
                  <Icon className="w-5 h-5 text-purple-400 mr-2" />
                  {label}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {idea[key] || 'Not specified'}
                </p>
              </div>
            ))}
          </div>
        );
      case 'technical':
        return (
          <div className="space-y-6">
            {[
              { key: 'techStack', label: 'Tech Stack', icon: Cpu },
              { key: 'keyFeatures', label: 'Key Features', icon: Grid },
              { key: 'scalability', label: 'Scalability', icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="border-b border-white/10 pb-4 last:border-b-0">
                <h4 className="text-lg font-semibold flex items-center text-cyan-300 mb-2">
                  <Icon className="w-5 h-5 text-purple-400 mr-2" />
                  {label}
                </h4>
                <div className="text-gray-300 leading-relaxed">
                  {Array.isArray(idea[key])
                    ? idea[key].map((item, i) => (
                        <div key={i} className="flex items-center mb-1">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                          {item}
                        </div>
                      ))
                    : idea[key] || 'Not specified'}
                </div>
              </div>
            ))}
          </div>
        );
      case 'market':
        return (
          <div className="space-y-6">
            {[
              { key: 'market', label: 'Market', icon: Target },
              { key: 'targetAudience', label: 'Target Audience', icon: Users },
              { key: 'marketSize', label: 'Market Size', icon: TrendingUp },
              { key: 'marketingStrategy', label: 'Go-to-Market', icon: Rocket },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="border-b border-white/10 pb-4 last:border-b-0">
                <h4 className="text-lg font-semibold flex items-center text-cyan-300 mb-2">
                  <Icon className="w-5 h-5 text-purple-400 mr-2" />
                  {label}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {idea[key] || 'Not specified'}
                </p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-3xl max-w-4xl max-h-[90vh] w-full shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2">{idea.name}</h2>
              <p className="text-gray-300 text-lg">{idea.tagline}</p>
              <p className="text-gray-400 mt-2">{idea.description}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleLike}
              className={`flex items-center px-4 py-2 rounded-xl transition-all ${
                idea.isLiked
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <Heart className={`w-4 h-4 mr-2 ${idea.isLiked ? 'fill-white' : ''}`} />
              {idea.isLiked ? 'Liked' : 'Like'}
            </button>
            <button
              onClick={handleSelect}
              className={`flex items-center px-6 py-2 rounded-xl font-medium transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/25'
              }`}
            >
              <Check className="w-4 h-4 mr-2" />
              {isSelected ? 'Selected' : 'Select Idea'}
            </button>
          </div>
        </div>

        <div className="flex border-b border-white/10 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {renderTabContent()}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ======================
// Main Component
// ======================
const CreatePage = () => {
  const [inputValue, setInputValue] = useState('');
  const [userPreferences, setUserPreferences] = useState({
    techStack: ['React', 'Node.js', 'MongoDB'],
    features: [],
    designStyle: 'modern',
    targetAudience: '',
    businessModel: 'SaaS',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeas, setSelectedIdeas] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [generationProgress, setGenerationProgress] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const navigate = useNavigate();

  // Fetch preferences from backend
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('http://localhost:8000/preferences', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data) setUserPreferences(data);
        }
      } catch (err) {
        console.error('Fetch preferences error:', err);
      }
    };
    fetchPreferences();
  }, []);

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setUserPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureAdd = (feature) => {
    if (!feature.trim()) return;
    setUserPreferences((prev) => ({
      ...prev,
      features: [...prev.features, feature.trim()],
    }));
  };

  const handleFeatureRemove = (feature) => {
    setUserPreferences((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setErrorMessage('Please enter a keyword');
      return;
    }
    setIsGenerating(true);
    setErrorMessage('');
    setGenerationProgress('Analyzing preferences...');

    try {
      // Save preferences
      await fetch('http://localhost:8000/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPreferences),
        credentials: 'include',
      });

      // Generate ideas
      const response = await fetch('http://localhost:8000/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputValue, preferences: userPreferences }),
        credentials: 'include',
      });

      const text = await response.text();
      if (!response.ok) throw new Error(`API Error: ${text}`);

      let data;
      try {
        const cleaned = text.trim().replace(/^```json|```$/g, '');
        data = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('Parse error:', parseErr, 'Raw:', text);
        throw new Error('Invalid AI response format.');
      }

      if (!Array.isArray(data.ideas)) throw new Error('Invalid response structure');

      const ideasWithDefaults = data.ideas.map((idea) => ({
        ...idea,
        isLiked: idea.isLiked || false,
        isSelected: idea.isSelected || false,
      }));

      setIdeas(ideasWithDefaults);
      setGenerationProgress('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate ideas');
      console.error('Create error:', err);
    } finally {
      setIsGenerating(false);
    }
  };



// Replace your handleLike function in CreatePage with this corrected version:

const handleLike = useCallback(async (ideaId) => {
  try {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) {
      console.error('Idea not found locally:', ideaId);
      setErrorMessage('Idea not found');
      return;
    }
    
    const isCurrentlyLiked = idea.isLiked;
    console.log('Toggling like for idea:', ideaId, 'Currently liked:', isCurrentlyLiked);
    
    // Choose correct endpoint
    const endpoint = isCurrentlyLiked ? '/unlike' : '/like';
    
    // Make API call first (no optimistic update)
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ideaId }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${endpoint} failed:`, response.status, errorText);
      throw new Error(`Failed to ${isCurrentlyLiked ? 'unlike' : 'like'} idea`);
    }

    const data = await response.json();
    console.log(`${endpoint} successful:`, data);
    
    // Update state only after successful API response
    setIdeas(prev =>
      prev.map(idea =>
        idea.id === ideaId 
          ? { ...idea, isLiked: !isCurrentlyLiked }
          : idea
      )
    );
    
  } catch (err) {
    console.error('Like error:', err);
    setErrorMessage(`Failed to ${idea?.isLiked ? 'unlike' : 'like'} idea: ${err.message}`);
    
    // Clear error after 3 seconds
    setTimeout(() => setErrorMessage(''), 3000);
  }
}, [ideas]);
  const handleSelect = useCallback((ideaId) => {
    setSelectedIdeas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ideaId)) {
        newSet.delete(ideaId);
      } else {
        newSet.add(ideaId);
      }
      return newSet;
    });
  }, []);

  const handleGenerateCode = () => {
    if (selectedIdeas.size === 0) {
      setErrorMessage('Please select at least one idea');
      return;
    }
    navigate('/code', { state: { ideaIds: Array.from(selectedIdeas) } });
  };

  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const floatingIcons = [
    { icon: Brain, position: { x: 8, y: 20 }, delay: 0, size: 'lg' },
    { icon: Cpu, position: { x: 88, y: 15 }, delay: 1, size: 'md' },
    { icon: Database, position: { x: 12, y: 65 }, delay: 2, size: 'sm' },
    { icon: Rocket, position: { x: 85, y: 70 }, delay: 3, size: 'md' },
    { icon: Sparkles, position: { x: 45, y: 10 }, delay: 4, size: 'sm' },
    { icon: Code, position: { x: 25, y: 45 }, delay: 5, size: 'lg' },
  ];

  return (
    <CreatePageErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
        <Header />
        <ThreeJSBackground />

        {floatingIcons.map((item, index) => (
          <Floating3DIcon key={index} {...item} />
        ))}

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 py-16 md:py-24"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-tight">
              <span className="block bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Create Your
              </span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                AI Startup
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Instantly
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
              Enter a keyword and let our AI generate <span className="text-cyan-400 font-bold">complete startup ideas</span> with business models, tech stacks, and production-ready code.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg p-6 md:p-8 rounded-3xl border border-white/20 mb-8 shadow-2xl"
          >
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="flex items-center space-x-3 text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group"
            >
              <Sliders className="w-6 h-6" />
              <span className="text-lg font-medium">Customize Preferences</span>
              <motion.div
                animate={{ rotate: showPreferences ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showPreferences ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </motion.div>
            </button>
            <AnimatePresence>
              {showPreferences && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-purple-400" />
                      Target Audience
                    </label>
                    <input
                      type="text"
                      name="targetAudience"
                      value={userPreferences.targetAudience}
                      onChange={handlePreferenceChange}
                      placeholder="e.g., Small business owners"
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <Grid className="w-4 h-4 mr-2 text-purple-400" />
                      Business Model
                    </label>
                    <select
                      name="businessModel"
                      value={userPreferences.businessModel}
                      onChange={handlePreferenceChange}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 transition-all"
                    >
                      <option value="SaaS">SaaS</option>
                      <option value="Marketplace">Marketplace</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Freemium">Freemium</option>
                      <option value="Subscription">Subscription</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                      Design Style
                    </label>
                    <select
                      name="designStyle"
                      value={userPreferences.designStyle}
                      onChange={handlePreferenceChange}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 transition-all"
                    >
                      <option value="modern">Modern</option>
                      <option value="minimalist">Minimalist</option>
                      <option value="glassmorphism">Glassmorphism</option>
                      <option value="neumorphism">Neumorphism</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                      <Code className="w-4 h-4 mr-2 text-purple-400" />
                      Desired Features
                    </label>
                    <FeatureInput
                      features={userPreferences.features}
                      onAdd={handleFeatureAdd}
                      onRemove={handleFeatureRemove}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <form onSubmit={handleSubmit} className="mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter a keyword (e.g., Fitness, Education, Healthcare)"
                    className="w-full bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-white border border-white/10 focus:ring-2 focus:ring-cyan-500 transition-all text-lg placeholder-gray-400"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={isGenerating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-cyan-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate Ideas'
                  )}
                </motion.button>
              </div>
            </form>

            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 text-red-400"
                >
                  {errorMessage}
                </motion.div>
              )}
              {generationProgress && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 text-cyan-400"
                >
                  {generationProgress}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {ideas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="relative max-w-md">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter ideas..."
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {filteredIdeas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12"
              >
                {filteredIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    className="group bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10"
                    onClick={() => setSelectedIdea(idea)}
                    whileHover={{ y: -8, scale: 1.02 }}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors line-clamp-1">
                          {idea.name}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-1">{idea.tagline}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(idea.id);
                        }}
                        className="ml-2 text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
                      >
                        <Heart className={`w-5 h-5 ${idea.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {idea.description}
                    </p>
                    {idea.techStack && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {idea.techStack.slice(0, 3).map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-600/20 text-purple-200 rounded-full text-xs font-medium border border-purple-500/30"
                          >
                            {tech}
                          </span>
                        ))}
                        {idea.techStack.length > 3 && (
                          <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs">
                            +{idea.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(idea.id);
                        }}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedIdeas.has(idea.id)
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                        }`}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {selectedIdeas.has(idea.id) ? 'Selected' : 'Select'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIdea(idea);
                        }}
                        className="flex items-center text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors group"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {ideas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateCode}
                  disabled={selectedIdeas.size === 0}
                  className="relative bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-teal-600 transition-all flex items-center shadow-xl shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                  <Code className="w-5 h-5 mr-3 relative z-10" />
                  <span className="relative z-10">
                    Generate Code for {selectedIdeas.size} Selected Idea{selectedIdeas.size !== 1 ? 's' : ''}
                  </span>
                  <ArrowRight className="w-5 h-5 ml-3 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                {selectedIdeas.size === 0 && (
                  <p className="text-gray-400 text-sm mt-3">
                    Select at least one idea to generate code
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {ideas.length === 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center">
                <Brain className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-4">Ready to Innovate?</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Enter a keyword above to generate AI-powered startup ideas tailored to your preferences.
              </p>
            </motion.div>
          )}
        </main>

        <AnimatePresence>
          {selectedIdea && (
            <IdeaModal
              idea={selectedIdea}
              onClose={() => setSelectedIdea(null)}
              onLike={handleLike}
              onSelect={handleSelect}
              isSelected={selectedIdeas.has(selectedIdea.id)}
            />
          )}
        </AnimatePresence>
        <Footer/>

        <style jsx global>{`
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.3); border-radius: 4px; }
          ::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.5); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.7); }
          * { scroll-behavior: smooth; }
          @media (max-width: 640px) {
            .text-4xl { font-size: 2.5rem; }
            .text-5xl { font-size: 3rem; }
            .text-6xl { font-size: 3.5rem; }
            .text-8xl { font-size: 4rem; }
          }
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient-shift 3s ease-in-out infinite;
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
            50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.6); }
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </CreatePageErrorBoundary>
  );
};

export default CreatePage;