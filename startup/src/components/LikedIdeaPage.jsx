import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Loader2, ArrowRight, Check, X } from 'lucide-react';
import Header from './Header.jsx'
const LikedIdeasPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedIdeas, setSelectedIdeas] = useState(new Set());
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Fetch liked ideas - FIXED
  useEffect(() => {
    const fetchLikedIdeas = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8000/liked', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch liked ideas');
        }

        const data = await response.json();
        setIdeas(data.ideas || []);
      } catch (err) {
        setErrorMessage(err.message || 'Error fetching liked ideas');
        console.error('Fetch liked ideas error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedIdeas();
  }, [navigate]);

  // Toggle idea selection - FIXED
  const toggleIdea = (ideaId) => {
    setSelectedIdeas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ideaId)) {
        newSet.delete(ideaId);
      } else {
        newSet.add(ideaId);
      }
      return newSet;
    });
  };

  // Unlike idea - FIXED
  const unlikeIdea = async (ideaId) => {
    try {
      const response = await fetch('http://localhost:8000/unlike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to unlike idea');
      }

      // Remove from local state
      setIdeas(prev => prev.filter(idea => idea.id !== ideaId));
      setSelectedIdeas(prev => {
        const newSet = new Set(prev);
        newSet.delete(ideaId);
        return newSet;
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to unlike idea');
      console.error('Unlike idea error:', err);
    }
  };

  // Process selected ideas - FIXED
  const handleProcess = () => {
    if (selectedIdeas.size === 0) {
      setErrorMessage('Please select at least one idea to process');
      return;
    }

    navigate('/code', { state: { ideaIds: Array.from(selectedIdeas) } });
  };

  // Apply fade-in animation
  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll('.fade-in');
    elements?.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('visible');
      }, index * 200);
    });
  }, [ideas]);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <Header/>
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.2), transparent 30%), ' +
            'radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.2), transparent 30%)',
        }}
      />
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32">
        <div ref={containerRef} className="space-y-20">
          {/* Hero section */}
          <section className="text-center space-y-8 fade-in">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all">
              <Heart className="text-red-400" size={20} />
              <span className="font-semibold">Your Liked Startup Ideas</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Your{' '}
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                Saved Ideas
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              View and manage your favorite startup ideas. Select ideas to generate codebases or unlike them to remove from this list.
            </p>
          </section>

          {/* Loading state */}
          {isLoading && (
            <section className="text-center fade-in">
              <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-lg px-8 py-6 rounded-3xl border border-white/20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <p className="text-lg">
                  <strong>Loading...</strong> Fetching your liked ideas
                </p>
              </div>
            </section>
          )}

          {/* Error message */}
          {errorMessage && (
            <section className="text-center fade-in">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-red-400 text-lg">{errorMessage}</p>
                <button
                  onClick={() => setErrorMessage('')}
                  className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </section>
          )}

          {/* Ideas grid */}
          {ideas.length > 0 && !isLoading && (
            <section className="fade-in">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">
                  Your{' '}
                  <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                    Liked Ideas
                  </span>
                </h2>
                <p className="text-gray-400">
                  {ideas.length} idea{ideas.length !== 1 ? 's' : ''} saved • Select to generate code
                </p>
              </div>

              <div className={`grid ${ideas.length <= 2 ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
                {ideas.map((idea, index) => (
                  <div
                    key={idea.id}
                    className={`relative group bg-white/5 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 hover:bg-white/10 hover:border-white/30 ${
                      selectedIdeas.has(idea.id)
                        ? 'ring-4 ring-cyan-500/50 bg-white/15 border-cyan-500/50'
                        : 'border-white/15'
                    } fade-in`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {/* Selection checkbox */}
                    <button
                      onClick={() => toggleIdea(idea.id)}
                      className={`absolute top-5 right-16 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedIdeas.has(idea.id)
                          ? 'bg-cyan-500 border-cyan-400'
                          : 'border-white/50 group-hover:border-cyan-400'
                      }`}
                    >
                      {selectedIdeas.has(idea.id) && <Check className="w-4 h-4 text-white" />}
                    </button>

                    {/* Unlike button */}
                    <button
                      onClick={() => unlikeIdea(idea.id)}
                      className="absolute top-5 right-5 p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all"
                      title="Unlike idea"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Idea icon */}
                    <div className="mb-6 inline-block">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Idea content */}
                    <h3 className="text-2xl font-bold mb-3 text-white">{idea.name}</h3>
                    
                    {idea.tagline && (
                      <p className="text-cyan-300 text-sm font-medium mb-4 italic">"{idea.tagline}"</p>
                    )}
                    
                    <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-4">
                      {idea.description}
                    </p>

                    {/* Metadata */}
                    <div className="space-y-3 text-xs">
                      {idea.techStack && idea.techStack.length > 0 && (
                        <div>
                          <span className="text-gray-500">Tech Stack:</span>{' '}
                          <span className="text-white">
                            {Array.isArray(idea.techStack) 
                              ? idea.techStack.join(', ') 
                              : idea.techStack
                            }
                          </span>
                        </div>
                      )}
                      
                      {idea.market && (
                        <div>
                          <span className="text-gray-500">Market:</span>{' '}
                          <span className="text-purple-300">{idea.market}</span>
                        </div>
                      )}
                      
                      {idea.revenueModel && (
                        <div>
                          <span className="text-gray-500">Revenue:</span>{' '}
                          <span className="text-cyan-300">{idea.revenueModel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Process button */}
              <div className="flex justify-center mt-16">
                <button
                  onClick={handleProcess}
                  disabled={selectedIdeas.size === 0}
                  className="group bg-gradient-to-r from-purple-600 to-cyan-600 px-10 py-5 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-cyan-700 disabled:from-gray-700 disabled:to-gray-800 transition-all flex items-center space-x-3 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-xl"
                >
                  Generate Code for {selectedIdeas.size > 0 ? `${selectedIdeas.size} ` : ''}Selected Ideas
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {selectedIdeas.size === 0 && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  Select at least one idea to generate code
                </p>
              )}
            </section>
          )}

          {/* Empty state */}
          {!isLoading && ideas.length === 0 && !errorMessage && (
            <section className="text-center py-20 fade-in">
              <div className="inline-flex flex-col items-center space-y-6 text-gray-500">
                <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <Heart className="w-12 h-12 opacity-30" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl">No liked ideas yet</p>
                  <p className="text-sm opacity-70">Go to the Create page to generate and like ideas</p>
                </div>
                <button
                  onClick={() => navigate('/create')}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 rounded-2xl font-bold hover:from-purple-700 hover:to-cyan-700 transition-all transform hover:scale-105"
                >
                  Start Creating Ideas
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Styles */}
      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LikedIdeasPage;