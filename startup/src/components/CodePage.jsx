// src/pages/CodePage.jsx - Fixed Version
import React, { useState, useEffect, useRef } from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import { useLocation, useNavigate } from 'react-router-dom';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  Copy,
  Loader2,
  FileText,
  Database,
  Settings,
  Cloud,
  TestTube,
  Folder,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  GitBranch,
  AlertTriangle,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer'; // Fixed import path
// import { toast } from 'react-toastify'; // Commented out - might not be installed

const CodePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [codebases, setCodebases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState('desktop');
  const [activeTab, setActiveTab] = useState('architecture');
  const [expandedSections, setExpandedSections] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const containerRef = useRef(null);

  // Simple toast replacement function
  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  useEffect(() => {
    const fetchCode = async () => {
      // Check if we have valid state
      if (!state?.ideaIds || !Array.isArray(state.ideaIds) || state.ideaIds.length === 0) {
        setErrorMessage('No ideas selected. Please go back and select ideas first.');
        setIsLoading(false);
        return;
      }

      console.log('Fetching code for idea IDs:', state.ideaIds); // Debug log

      try {
        const response = await fetch('http://localhost:8000/code', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ ideaIds: state.ideaIds }),
          credentials: 'include',
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText); // Debug log
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
          
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data); // Debug log

        if (!data.codebases || !Array.isArray(data.codebases)) {
          throw new Error('Invalid response format - expected codebases array');
        }

        if (data.codebases.length === 0) {
          throw new Error('No codebases were generated');
        }

        setCodebases(data.codebases);

        // Auto-expand architecture & files sections
        const initialExpanded = {};
        data.codebases.forEach((_, idx) => {
          initialExpanded[`architecture-${idx}`] = true;
          initialExpanded[`files-${idx}`] = true;
          // Auto-expand first category in files
          if (data.codebases[idx].files && data.codebases[idx].files.length > 0) {
            const firstCategory = data.codebases[idx].files[0].category || 'misc';
            initialExpanded[`category-${idx}-${firstCategory}`] = true;
          }
        });
        setExpandedSections(initialExpanded);
        
        showToast('Code generation completed successfully!');
      } catch (err) {
        console.error('Code generation error:', err);
        setErrorMessage(err.message || 'Failed to generate code');
      } finally {
        setIsLoading(false);
        // Highlight syntax after render
        setTimeout(() => {
          try {
            hljs.highlightAll();
          } catch (highlightErr) {
            console.warn('Syntax highlighting failed:', highlightErr);
          }
        }, 100);
      }
    };

    fetchCode();
  }, [state]);

  // Re-highlight when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        hljs.highlightAll();
      } catch (err) {
        console.warn('Syntax highlighting failed:', err);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, expandedSections, codebases]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast('Code copied to clipboard!');
    } catch (err) {
      console.error('Copy failed:', err);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownloadAll = (codebase) => {
    try {
      const files = codebase.files || [];
      const projectName = (codebase.name || 'project').replace(/\s+/g, '_').toLowerCase();

      if (files.length === 0) {
        showToast('No files to download', 'error');
        return;
      }

      files.forEach((file, index) => {
        setTimeout(() => {
          const blob = new Blob([file.content || ''], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          // Create safe filename
          const safePath = (file.path || `file_${index}.txt`).replace(/[^a-zA-Z0-9._-]/g, '_');
          a.download = `${projectName}_${safePath}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, index * 100); // Stagger downloads to avoid browser blocking
      });

      showToast(`Downloading ${files.length} files...`);
    } catch (err) {
      console.error('Download error:', err);
      showToast('Download failed', 'error');
    }
  };

  const getFilesByCategory = (files) => {
    if (!Array.isArray(files)) return [];
    
    const categories = {
      config: 'Configuration',
      frontend: 'Frontend',
      backend: 'Backend',
      database: 'Database',
      devops: 'DevOps',
      docs: 'Documentation',
      tests: 'Tests',
      misc: 'Miscellaneous',
    };

    const grouped = {};
    files.forEach((file) => {
      const category = file.category || 'misc';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(file);
    });

    return Object.entries(grouped).map(([key, files]) => ({
      name: categories[key] || key,
      key,
      files,
    }));
  };

  const renderPreview = (file) => {
    if (!file.content) {
      return <p className="text-gray-400">No content to preview.</p>;
    }

    // Only try to render React components
    if (file.language === 'jsx' || file.language === 'javascript') {
      try {
        const cleanCode = file.content
          .replace(/import\s+.*from\s+['"][^'"]+['"]/g, '') // Remove imports
          .replace(/export\s+default\s+.*$/gm, '') // Remove exports
          .trim();

        if (cleanCode) {
          return (
            <LiveProvider
              key={file.path}
              code={cleanCode}
              scope={{ React, useState: React.useState, useEffect: React.useEffect }}
              noInline={false}
            >
              <div
                className={`border border-white/20 rounded-2xl p-4 bg-gray-800/50 backdrop-blur-sm ${
                  viewMode === 'mobile'
                    ? 'max-w-xs'
                    : viewMode === 'tablet'
                    ? 'max-w-md'
                    : 'max-w-4xl'
                } mx-auto`}
              >
                <LivePreview className="p-4 rounded-lg bg-slate-900" />
                <LiveError className="text-red-400 text-sm mt-2" />
              </div>
            </LiveProvider>
          );
        }
      } catch (err) {
        console.warn('Preview error:', err);
        return <p className="text-yellow-400">Preview not available for this file.</p>;
      }
    }
    
    return <p className="text-gray-400">Live preview only available for React components.</p>;
  };

  const MarkdownRenderer = ({ content }) => {
    if (!content || content === 'undefined' || content === 'null') {
      return <p className="text-gray-400 italic">Content not available</p>;
    }

    return (
      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children, ...props }) => (
              <p className="mb-2 text-gray-300" {...props}>{children}</p>
            ),
            ul: ({ children, ...props }) => (
              <ul className="list-disc list-inside mb-2 ml-4 text-gray-300" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal list-inside mb-2 ml-4 text-gray-300" {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="mb-1 text-gray-300" {...props}>{children}</li>
            ),
            code: ({ children, ...props }) => (
              <code
                className="bg-gray-800 px-1.5 py-0.5 rounded text-cyan-400 text-xs"
                {...props}
              >
                {children}
              </code>
            ),
            pre: ({ children, ...props }) => (
              <pre
                className="bg-gray-900 p-3 rounded-lg overflow-x-auto text-xs"
                {...props}
              >
                {children}
              </pre>
            ),
            h1: ({ children, ...props }) => (
              <h1 className="text-xl font-bold text-cyan-400 mb-3" {...props}>{children}</h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-lg font-semibold text-purple-400 mb-2" {...props}>{children}</h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-md font-medium text-gray-200 mb-2" {...props}>{children}</h3>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const ArchitectureSection = ({ codebase, idx }) => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          System Architecture
        </h3>
        <MarkdownRenderer content={codebase.architecture?.overview || 'Architecture overview not available.'} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Database Design
          </h4>
          <MarkdownRenderer content={codebase.architecture?.databaseDesign || 'Database design not available.'} />
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            API Design
          </h4>
          <MarkdownRenderer content={codebase.architecture?.apiDesign || 'API design not available.'} />
        </div>
      </div>
    </div>
  );

  const FilesSection = ({ codebase, idx }) => {
    const categorizedFiles = getFilesByCategory(codebase.files || []);
    
    if (categorizedFiles.length === 0) {
      return (
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Files Generated</h3>
          <p className="text-gray-500">There was an issue generating files for this project.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {categorizedFiles.map((category) => (
          <div
            key={category.key}
            className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/20 overflow-hidden"
          >
            <button
              onClick={() => toggleSection(`category-${idx}-${category.key}`)}
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
              <h3 className="text-xl font-bold text-cyan-400 flex items-center">
                <Folder className="w-5 h-5 mr-2" />
                {category.name} ({category.files.length})
              </h3>
              {expandedSections[`category-${idx}-${category.key}`] ? (
                <ChevronDown className="w-5 h-5 text-cyan-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-cyan-400" />
              )}
            </button>

            {expandedSections[`category-${idx}-${category.key}`] && (
              <div className="space-y-4 p-6 pt-0">
                {category.files.map((file, fileIdx) => (
                  <div
                    key={`${file.path}-${fileIdx}`}
                    className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <span className="text-cyan-400 font-mono text-sm truncate max-w-xs">
                        {file.path || `file_${fileIdx}`}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCopy(file.content || '')}
                          className="p-2 rounded-full bg-white/10 hover:bg-cyan-500/20 transition-all"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4 text-cyan-400" />
                        </button>
                        {(file.language === 'jsx' || file.language === 'javascript') && (
                          <button
                            onClick={() => toggleSection(`preview-${idx}-${fileIdx}`)}
                            className="p-2 rounded-full bg-white/10 hover:bg-green-500/20 transition-all"
                            title="Toggle preview"
                          >
                            <Eye className="w-4 h-4 text-green-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    <pre className="text-xs p-4 overflow-x-auto font-mono bg-gray-900/50">
                      <code className={`language-${file.language || 'text'}`}>
                        {file.content || '// No content available'}
                      </code>
                    </pre>

                    <div className="p-4 border-t border-white/10 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
                      <h5 className="text-sm font-semibold text-purple-400 mb-2">Explanation</h5>
                      <MarkdownRenderer content={file.explanation || 'No explanation provided.'} />
                    </div>

                    {expandedSections[`preview-${idx}-${fileIdx}`] && 
                     (file.language === 'jsx' || file.language === 'javascript') && (
                      <div className="p-4 border-t border-white/10">
                        <h5 className="text-sm font-semibold text-cyan-400 mb-3">Live Preview</h5>
                        <div className="flex justify-center mb-4">
                          <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="bg-gray-800 rounded-lg p-2 text-white border border-white/10 text-sm"
                          >
                            <option value="desktop">Desktop</option>
                            <option value="tablet">Tablet</option>
                            <option value="mobile">Mobile</option>
                          </select>
                        </div>
                        {renderPreview(file)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const SetupSection = ({ codebase }) => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Development Setup</h3>
        <MarkdownRenderer 
          content={codebase.setupInstructions?.development || 'Development setup instructions not available.'} 
        />
      </div>
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-green-400 mb-4">Production Setup</h3>
        <MarkdownRenderer 
          content={codebase.setupInstructions?.production || 'Production setup instructions not available.'} 
        />
      </div>
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-purple-400 mb-4">Environment Variables</h3>
        <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto text-gray-300">
          {codebase.setupInstructions?.environment || '# Environment variables not available'}
        </pre>
      </div>
    </div>
  );

  const DeploymentSection = ({ codebase }) => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
          <Cloud className="w-5 h-5 mr-2" />
          Deployment Guide
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {(codebase.deploymentGuide?.platforms || ['Not specified']).map((platform, idx) => (
            <span
              key={`${platform}-${idx}`}
              className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm"
            >
              {platform}
            </span>
          ))}
        </div>
        <MarkdownRenderer 
          content={codebase.deploymentGuide?.steps || 'Deployment steps not available.'} 
        />
      </div>
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
          <GitBranch className="w-5 h-5 mr-2" />
          CI/CD Pipeline
        </h3>
        <MarkdownRenderer 
          content={codebase.deploymentGuide?.cicd || 'CI/CD configuration not available.'} 
        />
      </div>
    </div>
  );

  const TestingSection = ({ codebase }) => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
          <TestTube className="w-5 h-5 mr-2" />
          Testing Strategy
        </h3>
        <MarkdownRenderer 
          content={codebase.testingStrategy?.overview || 'Testing strategy overview not available.'} 
        />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['unit', 'integration', 'e2e'].map((testType) => (
          <div
            key={testType}
            className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
          >
            <h4 className="text-lg font-bold capitalize text-green-400 mb-4">
              {testType === 'e2e' ? 'End-to-End' : testType} Testing
            </h4>
            <MarkdownRenderer 
              content={codebase.testingStrategy?.[testType] || `${testType} testing information not available.`} 
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 animate-gradient-shift" />
        <Header />
        <main className="relative z-10 flex flex-col items-center justify-center h-screen space-y-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 rounded-full animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">Generating Full-Stack Project</h2>
            <p className="text-gray-400 max-w-md">
              Creating architecture, generating files, and setting up deployment guides...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (errorMessage && codebases.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 animate-gradient-shift" />
        <Header />
        <main className="relative z-10 max-w-4xl mx-auto px-4 pt-32">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-8 rounded-2xl mb-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Code Generation Failed</h3>
            <p className="text-lg mb-6">{errorMessage}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/create')}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors"
              >
                Back to Ideas
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Success/error messages
  const MessageBar = () => (
    <>
      {successMessage && (
        <div className="fixed top-20 right-4 bg-green-500/20 border border-green-500/50 text-green-400 p-4 rounded-xl z-50">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-4 bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl z-50">
          {errorMessage}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 animate-gradient-shift" />
      <Header />
      <MessageBar />

      <main
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24"
        ref={containerRef}
      >
        {codebases.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-4">No Code Generated</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              There was an issue generating code for your selected ideas.
            </p>
            <button
              onClick={() => navigate('/create')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors"
            >
              Back to Ideas
            </button>
          </div>
        ) : (
          codebases.map((codebase, idx) => (
            <section key={codebase.id || idx} className="mb-16 animate-fade-in">
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-xl mb-8">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-3">
                      {codebase.name || `Project ${idx + 1}`}
                    </h1>
                    <p className="text-gray-300 text-lg mb-4">
                      {codebase.description || 'Full-stack application with modern architecture'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(codebase.architecture?.techStack || []).map((tech, techIdx) => (
                        <span
                          key={`${tech}-${techIdx}`}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadAll(codebase)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:scale-105 transition-all shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Project</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-white/10 pt-6">
                  {[
                    { id: 'architecture', label: 'Architecture', icon: Settings },
                    { id: 'files', label: 'Files', icon: FileText },
                    { id: 'setup', label: 'Setup', icon: Settings },
                    { id: 'deployment', label: 'Deployment', icon: Cloud },
                    { id: 'testing', label: 'Testing', icon: TestTube },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="animate-fade-in">
                {activeTab === 'architecture' && <ArchitectureSection codebase={codebase} idx={idx} />}
                {activeTab === 'files' && <FilesSection codebase={codebase} idx={idx} />}
                {activeTab === 'setup' && <SetupSection codebase={codebase} />}
                {activeTab === 'deployment' && <DeploymentSection codebase={codebase} />}
                {activeTab === 'testing' && <TestingSection codebase={codebase} />}
              </div>

              {codebase.error && (
                <div className="mt-6 bg-red-500/20 border border-red-500 text-red-400 p-6 rounded-xl">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <h3 className="font-bold">Generation Error</h3>
                  </div>
                  <p>{codebase.error}</p>
                </div>
              )}
            </section>
          ))
        )}
      </main>
      <Footer />

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
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
        
        /* Code highlighting improvements */
        .hljs {
          background: transparent !important;
        }
        
        pre code.hljs {
          background: rgba(15, 23, 42, 0.5) !important;
          color: #e2e8f0 !important;
        }
      `}</style>
    </div>
  );
};

export default CodePage;