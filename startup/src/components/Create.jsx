// Enhanced CreatePage.jsx with detailed ideas and animations
import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  Brain,
  ArrowRight,
  Check,
  Loader2,
  Heart,
  Code2,
  Zap,
  Target,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Shield,
  Rocket,
  Star,
  CheckCircle2,
  PartyPopper,
  Trophy,
  X,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Briefcase,
  Globe
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const CreatePage = () => {
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeas, setSelectedIdeas] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [generationProgress, setGenerationProgress] = useState('');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [congratsAnimation, setCongratsAnimation] = useState(null);
  const [expandedIdeas, setExpandedIdeas] = useState(new Set());
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const toggleIdeaSelection = async (id) => {
    const isSelected = !selectedIdeas.has(id);
    try {
      const response = await fetch('http://localhost:8000/select-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: id, isSelected }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to select idea');
      await response.json();

      setSelectedIdeas(prev => {
        const next = new Set(prev);
        if (isSelected) {
          next.add(id);
          // Trigger congratulations animation
          setCongratsAnimation(id);
          setTimeout(() => setCongratsAnimation(null), 3000);
          
          // Show only selected ideas after a short delay
          setTimeout(() => setShowOnlySelected(true), 3000);
        } else {
          next.delete(id);
          // If no ideas selected, show all again
          if (next.size === 0) {
            setShowOnlySelected(false);
          }
        }
        return next;
      });
    } catch (err) {
      setErrorMessage('Network error. Try again.');
    }
  };

  const toggleIdeaLike = async (id) => {
    const idea = ideas.find(i => i.id === id);
    const isLiked = !idea.isLiked;
    try {
      const response = await fetch('http://localhost:8000/select-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: id, isLiked }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to like');
      await response.json();

      setIdeas(prev => prev.map(i => (i.id === id ? { ...i, isLiked } : i)));
    } catch (err) {
      setErrorMessage('Could not like idea');
    }
  };

  const toggleExpanded = (id) => {
    setExpandedIdeas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (selectedIdeas.size === 0) {
      setErrorMessage('Select at least one idea');
      return;
    }
    
    setIsGenerating(true);
    setErrorMessage('');
    setGenerationProgress('Initializing code generation...');

    try {
      navigate('/code', {
        state: {
          ideaIds: Array.from(selectedIdeas),
          isGenerating: true
        },
      });
    } catch (err) {
      setErrorMessage(err.message);
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setErrorMessage('Enter a keyword');
      return;
    }
    setIsGenerating(true);
    setErrorMessage('');
    setGenerationProgress('Analyzing your keyword...');
    setShowOnlySelected(false);
    setSelectedIdeas(new Set());

    try {
      setTimeout(() => setGenerationProgress('Researching market opportunities...'), 1000);
      setTimeout(() => setGenerationProgress('Creating innovative business models...'), 2000);
      setTimeout(() => setGenerationProgress('Finalizing detailed startup concepts...'), 3000);

      const response = await fetch('http://localhost:8000/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputValue }),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed');

      setIdeas(data.ideas || []);
      setGenerationProgress('');
    } catch (err) {
      setErrorMessage(err.message);
      setGenerationProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const els = containerRef.current?.querySelectorAll('.fade-in');
    els?.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 150);
    });
  }, [ideas]);

  useEffect(() => {
    if (errorMessage.includes('Access denied') || errorMessage.includes('Invalid token')) {
      navigate('/login');
    }
  }, [errorMessage, navigate]);

  const CongratsAnimation = ({ ideaId }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-black/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 animate-bounce">
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-2">
            <PartyPopper className="w-8 h-8 text-yellow-400 animate-spin" />
            <Trophy className="w-10 h-10 text-gold-400 animate-pulse" />
            <PartyPopper className="w-8 h-8 text-pink-400 animate-spin" />
          </div>
          <h3 className="text-2xl font-bold text-white">Congratulations! 🎉</h3>
          <p className="text-cyan-300">Great choice! This startup idea has been selected.</p>
          <div className="flex justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  const DetailedIdeaCard = ({ idea, index }) => {
    const isExpanded = expandedIdeas.has(idea.id);
    const isSelected = selectedIdeas.has(idea.id);
    const showCongrats = congratsAnimation === idea.id;

    return (
      <div
        className={`relative group transition-all duration-500 ${
          showOnlySelected && !isSelected ? 'opacity-0 transform scale-95 pointer-events-none' : ''
        }`}
      >
        {showCongrats && <CongratsAnimation ideaId={idea.id} />}
        
        <div
          className={`relative bg-white/5 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 ${
            isSelected 
              ? 'ring-4 ring-cyan-500/50 bg-white/10 border-cyan-500/50 shadow-2xl shadow-cyan-500/20' 
              : 'border-white/15 hover:bg-white/10 hover:border-white/30'
          } fade-in hover:scale-105 ${showCongrats ? 'animate-pulse ring-4 ring-gold-500/50' : ''}`}
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          {/* Header with Actions */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                {isSelected && (
                  <div className="flex items-center space-x-2 bg-cyan-500/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-cyan-300 font-medium">Selected</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold mb-2 group-hover:text-cyan-300 transition-colors">
                {idea.name}
              </h3>
              <p className="text-cyan-300 text-sm font-medium mb-4 italic">"{idea.tagline}"</p>
            </div>

            {/* Action Buttons - Fixed positioning to prevent overlap */}
            <div className="flex items-center space-x-3 ml-4">
              <button
                onClick={() => toggleIdeaLike(idea.id)}
                className={`p-3 rounded-full transition-all duration-200 hover:scale-110 ${
                  idea.isLiked 
                    ? 'bg-red-500/30 text-red-400 ring-2 ring-red-500/30' 
                    : 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${idea.isLiked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={() => toggleIdeaSelection(idea.id)}
                className={`p-3 rounded-full transition-all duration-200 hover:scale-110 ${
                  isSelected
                    ? 'bg-cyan-500/30 text-cyan-400 ring-2 ring-cyan-500/30'
                    : 'bg-white/10 text-white hover:bg-cyan-500/20 hover:text-cyan-400'
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 fill-current" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Problem & Solution */}
          <div className="mb-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <h4 className="text-red-300 font-semibold text-sm mb-2">Problem Solved:</h4>
              <p className="text-white text-sm">{idea.problemSolved || 'Addresses key market inefficiencies'}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-300 font-semibold text-sm mb-2">Solution:</h4>
              <p className="text-white text-sm">{idea.solution || idea.description}</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400 font-medium">Market Size</span>
              </div>
              <p className="text-sm text-white font-bold">{idea.marketSize}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400 font-medium">Revenue Model</span>
              </div>
              <p className="text-sm text-white font-bold">{idea.revenueModel}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400 font-medium">Target Audience</span>
              </div>
              <p className="text-sm text-white font-bold">{idea.targetAudience}</p>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpanded(idea.id)}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors mb-6"
          >
            <span className="text-sm font-medium">
              {isExpanded ? 'Show Less Details' : 'Show More Details'}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Expanded Content */}
          <div className={`transition-all duration-500 ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            {isExpanded && (
              <div className="space-y-6">
                {/* Key Features */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Key Features</span>
                  </h4>
                  <div className="space-y-2">
                    {idea.keyFeatures?.map((feature, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3">
                        <p className="text-sm text-gray-300">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2 flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      <span>Business Model</span>
                    </h5>
                    <p className="text-sm text-gray-300">{idea.businessModel}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2 flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-green-400" />
                      <span>Scalability</span>
                    </h5>
                    <p className="text-sm text-gray-300">{idea.scalability}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2 flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span>Competitive Advantage</span>
                    </h5>
                    <p className="text-sm text-gray-300">{idea.competitiveAdvantage || idea.uniqueValue}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Timeline</span>
                    </h5>
                    <p className="text-sm text-gray-300">{idea.timeline || 'MVP in 6 months, launch in 12 months'}</p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Technology Stack</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {idea.techStack.map((tech, i) => (
                      <span key={i} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Funding & Risk */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h5 className="text-green-300 font-semibold mb-2">Funding Requirements</h5>
                    <p className="text-sm text-gray-300">{idea.fundingNeeds || 'Seed round: $1-3M for product development and market entry'}</p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <h5 className="text-orange-300 font-semibold mb-2">Risk Mitigation</h5>
                    <p className="text-sm text-gray-300">{idea.riskMitigation || 'Diversified revenue streams and strong technical moats'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const displayedIdeas = showOnlySelected 
    ? ideas.filter(idea => selectedIdeas.has(idea.id))
    : ideas;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Enhanced Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.3), transparent 40%), ' +
            'radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.3), transparent 40%), ' +
            'radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.2), transparent 30%)',
        }}
      />

      <Header />
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div ref={containerRef} className="space-y-20">
          {/* Hero Section */}
          <section className="text-center space-y-8 fade-in">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <Sparkles className="text-yellow-400 animate-pulse" size={20} />
              <span className="font-semibold">AI-Powered Startup Generator</span>
              <Zap className="text-cyan-400" size={16} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Transform{' '}
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                Any Idea
              </span>
              <br />
              Into{' '}
              <span className="text-transparent bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text">
                Complete Apps
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Enter any keyword and watch AI generate detailed, investor-ready startup concepts 
              with complete business plans, technical specifications, and production-ready code.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                { icon: Code2, text: 'Full-Stack Apps' },
                { icon: Brain, text: 'AI-Powered' },
                { icon: Zap, text: 'Production Ready' },
                { icon: Globe, text: 'Market Validated' }
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-300">{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Input Form */}
          <section className="fade-in">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="group relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''))}
                  placeholder="e.g., fitness, travel, education, food delivery..."
                  className="w-full bg-white/10 backdrop-blur-lg border border-white/30 rounded-3xl px-8 py-6 text-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-white/50 transition-all duration-300 group-hover:border-white/40"
                  disabled={isGenerating}
                />
                {errorMessage && (
                  <p className="text-red-400 text-sm mt-3 text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">
                    {errorMessage}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isGenerating || !inputValue.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-cyan-600 p-4 rounded-2xl disabled:opacity-50 hover:scale-105 transition-all duration-200 disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Lightbulb className="w-6 h-6" />
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Generation Progress */}
          {isGenerating && (
            <section className="text-center fade-in">
              <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-lg px-8 py-6 rounded-3xl border border-white/20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <div className="text-left">
                  <p className="font-bold">AI is working...</p>
                  <p className="text-sm text-gray-400">{generationProgress}</p>
                </div>
              </div>
            </section>
          )}

          {/* Filter Controls */}
          {ideas.length > 0 && selectedIdeas.size > 0 && (
            <section className="flex justify-center fade-in">
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-2xl border border-white/20">
                <span className="text-sm text-gray-400">View:</span>
                <button
                  onClick={() => setShowOnlySelected(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !showOnlySelected 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  All Ideas ({ideas.length})
                </button>
                <button
                  onClick={() => setShowOnlySelected(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showOnlySelected 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Selected ({selectedIdeas.size})
                </button>
                <button
                  onClick={() => {
                    setSelectedIdeas(new Set());
                    setShowOnlySelected(false);
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Clear selections"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </section>
          )}

          {/* Ideas Grid */}
          {displayedIdeas.length > 0 && !isGenerating && (
            <section className="fade-in">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">
                  Your{' '}
                  <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                    {showOnlySelected ? 'Selected' : 'Startup'} Ideas
                  </span>
                </h2>
                <p className="text-gray-400 mb-4">
                  {showOnlySelected 
                    ? 'Ready to generate complete applications for your selected ideas'
                    : 'Each idea comes with detailed business plans, market analysis, and technical specifications'
                  }
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Select to generate complete apps</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>Save your favorites</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>Detailed business intelligence</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {displayedIdeas.map((idea, index) => (
                  <DetailedIdeaCard key={idea.id} idea={idea} index={index} />
                ))}
              </div>

              {/* Action Button */}
              <div className="flex justify-center mt-16">
                <button
                  onClick={handleProcess}
                  disabled={selectedIdeas.size === 0}
                  className="group bg-gradient-to-r from-purple-600 to-cyan-600 px-12 py-6 rounded-3xl font-bold text-lg hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-4 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
                >
                  <Rocket className="w-6 h-6" />
                  <span>
                    Generate Complete Apps {selectedIdeas.size > 0 && `(${selectedIdeas.size})`}
                  </span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </section>
          )}

          {/* Empty State */}
          {!isGenerating && ideas.length === 0 && (
            <section className="text-center py-20 fade-in">
              <div className="max-w-2xl mx-auto">
                <Lightbulb className="w-20 h-20 opacity-30 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Ready to Build Something Amazing?</h3>
                <p className="text-gray-400 mb-8">
                  Enter any keyword above and watch AI generate detailed startup concepts 
                  with comprehensive business plans, market analysis, and production-ready code.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="bg-white/5 rounded-xl p-6">
                    <Brain className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Detailed Analysis</h4>
                    <p className="text-gray-400">AI creates comprehensive business plans with market research</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6">
                    <Code2 className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Complete Applications</h4>
                    <p className="text-gray-400">Full-stack React + Node.js applications with modern UI</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6">
                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Production Ready</h4>
                    <p className="text-gray-400">Deploy-ready with authentication, databases, and APIs</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      
      <style jsx global>{`
        .fade-in { 
          opacity: 0; 
          transform: translateY(30px); 
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .fade-in.visible { 
          opacity: 1; 
          transform: translateY(0); 
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes congratulations {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .animate-congratulations {
          animation: congratulations 0.6s ease-in-out;
        }

        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }

        .fade-out {
          animation: fadeOut 0.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CreatePage;