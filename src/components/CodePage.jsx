import React, { useState, useEffect, useRef } from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import { useLocation, useNavigate } from 'react-router-dom';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';
import { Copy, Play, Loader2 } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { toast } from 'react-toastify';

const CodePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [codebases, setCodebases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState('desktop');
  const [expandedSections, setExpandedSections] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchCode = async () => {
      if (!state?.ideaIds) {
        setErrorMessage('No ideas selected');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ideaIds: state.ideaIds }),
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to generate code');
        }

        const data = await response.json();
        setCodebases(data.codebases || []);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
        hljs.highlightAll();
      }
    };

    fetchCode();
  }, [state]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Code copied!', {
      icon: '🎉',
      style: { background: '#1a1a40', color: '#00e7ff', border: '1px solid #00e7ff' },
    });
  };

  const renderPreview = (file) => {
    if (file.language === 'jsx' && file.content) {
      return (
        <LiveProvider code={file.content} scope={{ React, useState, useEffect }}>
          <div
            className={`border border-white/20 rounded-2xl p-4 bg-gray-800/50 backdrop-blur-sm ${
              viewMode === 'mobile' ? 'max-w-xs' : viewMode === 'tablet' ? 'max-w-md' : 'max-w-4xl'
            } mx-auto`}
          >
            <LivePreview className="p-4 rounded-lg bg-slate-900/60" />
            <LiveError className="text-red-400 text-sm mt-2" />
          </div>
        </LiveProvider>
      );
    }
    return <p className="text-gray-400">Preview not available for this file type.</p>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 animate-gradient-shift" />
      <Header />
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24" ref={containerRef}>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {errorMessage}
          </div>
        )}

        {/* Codebases */}
        {codebases.map((codebase, idx) => (
          <section key={idx} className="mb-12 animate-fade-in">
            
            {/* Project Header */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-xl">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                {codebase.name}
              </h2>
              <p className="text-gray-300 mt-2">{codebase.description}</p>
              <p className="text-gray-400 text-sm mt-2">Tech Stack: {codebase.techStack.join(', ')}</p>
            </div>

            {/* View Mode Selector */}
            <div className="flex justify-end my-4">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="bg-gray-800 rounded-lg p-2 text-white border border-white/10 focus:ring-2 focus:ring-cyan-500"
              >
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>

            {/* Files */}
            <div className="space-y-6">
              {codebase.files?.map((file, fileIdx) => (
                <div key={file.path} className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-lg overflow-hidden">
                  
                  {/* File Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <span className="text-cyan-400 font-mono">{file.path}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopy(file.content)}
                        className="p-3 rounded-full bg-white/10 hover:bg-cyan-500/20 transition-all"
                        title="Copy code"
                      >
                        <Copy className="w-5 h-5 text-cyan-400" />
                      </button>
                      {file.language === 'jsx' && (
                        <button
                          onClick={() => toggleSection(`preview-${idx}-${fileIdx}`)}
                          className="p-3 rounded-full bg-white/10 hover:bg-green-500/20 transition-all"
                          title="View preview"
                        >
                          <Play className="w-5 h-5 text-green-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Code */}
                  <pre className="text-sm p-6 overflow-x-auto font-mono bg-gray-900/50">
                    <code className={`language-${file.language || 'text'}`}>{file.content}</code>
                  </pre>

                  {/* Explanation (Always Visible) */}
                  <div className="p-6 border-t border-white/10 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
                    <h4 className="text-lg font-semibold text-purple-400 mb-3">Explanation</h4>
                    <div className="prose prose-invert text-gray-300 leading-relaxed">
                      {file.explanation || 'No detailed explanation provided.'}
                    </div>
                  </div>

                  {/* Preview (Optional Toggle) */}
                  {expandedSections[`preview-${idx}-${fileIdx}`] && (
                    <div className="p-6 border-t border-white/10">
                      <h4 className="text-lg font-semibold text-cyan-400 mb-3">Live Preview</h4>
                      {renderPreview(file)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Setup & Deployment */}
            <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl">
              <h3 className="text-xl font-bold text-cyan-400">Setup Instructions</h3>
              <p className="text-gray-300 mt-2">{codebase.setupInstructions}</p>
              <h3 className="text-xl font-bold text-cyan-400 mt-4">Deployment Guide</h3>
              <p className="text-gray-300 mt-2">{codebase.deploymentGuide}</p>
            </div>
          </section>
        ))}
      </main>
      <Footer />

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CodePage;
