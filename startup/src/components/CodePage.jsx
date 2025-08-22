import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Code, 
  Loader2, 
  Heart, 
  Copy, 
  Check, 
  Download, 
  FolderOpen, 
  File,
  ChevronRight,
  ChevronDown,
  Play,
  Terminal
} from 'lucide-react';
import EnhancedHeader from './Header';
import Footer from './Footer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodePage = () => {
  const [codebases, setCodebases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCodebase, setSelectedCodebase] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [copiedStates, setCopiedStates] = useState({});
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src']));
  const containerRef = useRef(null);
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCode = async () => {
      if (state?.codebases?.length > 0) {
        setCodebases(state.codebases);
        if (state.codebases[0]?.files?.length > 0) {
          setSelectedFile(state.codebases[0].files[0]);
        }
        return;
      }

      const ideaIds = state?.ideaIds;
      if (!ideaIds || ideaIds.length === 0) {
        setErrorMessage('No ideas selected. Go back to Create.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:8000/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ideaIds }),
          credentials: 'include',
        });

        if (res.status === 401) {
          navigate('/login');
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');

        setCodebases(data.codebases || []);
        if (data.codebases?.[0]?.files?.length > 0) {
          setSelectedFile(data.codebases[0].files[0]);
        }
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCode();
  }, [state, navigate]);

  const handleLikeIdea = async (ideaId) => {
    try {
      await fetch('http://localhost:8000/select-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, isLiked: true }),
        credentials: 'include',
      });
    } catch (err) {
      setErrorMessage('Could not save idea');
    }
  };

  const copyToClipboard = async (content, fileId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates(prev => ({ ...prev, [fileId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [fileId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadProject = (codebase) => {
    const zip = codebase.files.map(file => `// ${file.path}\n${file.content}`).join('\n\n// ==================\n\n');
    const blob = new Blob([zip], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${codebase.name}-project.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderName)) {
        next.delete(folderName);
      } else {
        next.add(folderName);
      }
      return next;
    });
  };

  const FileTree = ({ files, level = 0 }) => {
    const folders = {};
    const fileItems = [];

    files.forEach(file => {
      const pathParts = file.path.split('/');
      if (pathParts.length > level + 1) {
        const folderName = pathParts[level];
        if (!folders[folderName]) {
          folders[folderName] = [];
        }
        folders[folderName].push(file);
      } else {
        fileItems.push(file);
      }
    });

    return (
      <div>
        {Object.entries(folders).map(([folderName, folderFiles]) => (
          <div key={folderName}>
            <div
              className="flex items-center space-x-2 py-1 px-2 hover:bg-white/5 cursor-pointer rounded"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => toggleFolder(folderName)}
            >
              {expandedFolders.has(folderName) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">{folderName}</span>
            </div>
            {expandedFolders.has(folderName) && (
              <FileTree files={folderFiles} level={level + 1} />
            )}
          </div>
        ))}
        {fileItems.map(file => (
          <div
            key={file.path}
            className={`flex items-center space-x-2 py-1 px-2 hover:bg-white/5 cursor-pointer rounded ${
              selectedFile?.path === file.path ? 'bg-white/10 border-l-2 border-cyan-400' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 24}px` }}
            onClick={() => setSelectedFile(file)}
          >
            <File className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{file.path.split('/').pop()}</span>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const els = containerRef.current?.querySelectorAll('.fade-in');
    els?.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 150);
    });
  }, [codebases]);

  useEffect(() => {
    if (errorMessage.includes('Access denied') || errorMessage.includes('Invalid token')) {
      navigate('/login');
    }
  }, [errorMessage, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xl">Generating your complete application...</p>
          <p className="text-gray-400">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <EnhancedHeader />
      <br></br>
      <main className="pt-16 h-screen flex flex-col">
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 m-4 rounded-lg">
            <p className="text-red-400">{errorMessage}</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-2 bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Back to Create
            </button>
          </div>
        )}

        {codebases.length > 0 && (
          <>
            {/* Project Tabs */}
            <div className="flex border-b border-white/10 bg-slate-900/50">
              {codebases.map((codebase, index) => (
                <button
                  key={codebase.id}
                  onClick={() => {
                    setSelectedCodebase(index);
                    if (codebase.files?.[0]) {
                      setSelectedFile(codebase.files[0]);
                    }
                  }}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    selectedCodebase === index
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>{codebase.name || `Project ${index + 1}`}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Main Editor Layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar - File Explorer */}
              <div className="w-80 bg-slate-900/30 border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-200">
                      {codebases[selectedCodebase]?.name || 'Project Explorer'}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleLikeIdea(codebases[selectedCodebase].id)}
                        className="p-1.5 rounded hover:bg-white/10"
                        title="Save Project"
                      >
                        <Heart className="w-4 h-4 text-red-400" />
                      </button>
                      <button
                        onClick={() => downloadProject(codebases[selectedCodebase])}
                        className="p-1.5 rounded hover:bg-white/10"
                        title="Download Project"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {codebases[selectedCodebase]?.files?.length || 0} files
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                  {codebases[selectedCodebase]?.files && (
                    <FileTree files={codebases[selectedCodebase].files} />
                  )}
                </div>

                {/* Project Info */}
                <div className="p-4 border-t border-white/10 bg-slate-900/50">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tech Stack:</span>
                      <span className="text-gray-300">
                        {codebases[selectedCodebase]?.techStack?.join(', ') || 'React, Node.js'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="text-green-400 flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        Generated
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col">
                {selectedFile ? (
                  <>
                    {/* File Header */}
                    <div className="flex items-center justify-between bg-slate-900/30 border-b border-white/10 px-6 py-3">
                      <div className="flex items-center space-x-3">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm text-gray-200">
                          {selectedFile.path}
                        </span>
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                          {selectedFile.language || 'javascript'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(selectedFile.content, selectedFile.path)}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                        >
                          {copiedStates[selectedFile.path] ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span>{copiedStates[selectedFile.path] ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 overflow-hidden">
                      <div className="h-full overflow-auto bg-[#1e1e1e]">
                        <SyntaxHighlighter
                          language={selectedFile.language || 'javascript'}
                          style={vscDarkPlus}
                          showLineNumbers={true}
                          wrapLines={true}
                          customStyle={{
                            margin: 0,
                            padding: '1rem',
                            background: 'transparent',
                            fontSize: '14px',
                            lineHeight: '1.5',
                          }}
                          lineNumberStyle={{
                            color: '#6B7280',
                            paddingRight: '1rem',
                            minWidth: '3rem',
                          }}
                        >
                          {selectedFile.content}
                        </SyntaxHighlighter>
                      </div>
                    </div>

                    {/* File Description */}
                    {selectedFile.description && (
                      <div className="bg-slate-900/30 border-t border-white/10 p-4">
                        <p className="text-sm text-gray-400">{selectedFile.description}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center space-y-4">
                      <File className="w-16 h-16 mx-auto opacity-30" />
                      <p>Select a file to view its contents</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-slate-900 border-t border-white/10 px-6 py-2 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-6">
                <span>Ready</span>
                {selectedFile && (
                  <span>{selectedFile.content.split('\n').length} lines</span>
                )}
              </div>
              <div className="flex items-center space-x-6">
                <span>{codebases[selectedCodebase]?.techStack?.join(' • ') || 'Full Stack'}</span>
                <button
                  onClick={() => navigate('/create')}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <Terminal className="w-3 h-3" />
                  <span>Generate New</span>
                </button>
              </div>
            </div>
          </>
        )}

        {!isLoading && codebases.length === 0 && !errorMessage && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6">
              <Code className="w-20 h-20 opacity-30 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">No Projects Generated</h2>
                <p className="text-gray-400">Create some ideas first to generate code</p>
              </div>
              <button
                onClick={() => navigate('/create')}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 px-8 py-3 rounded-2xl font-semibold flex items-center space-x-2 mx-auto"
              >
                <Loader2 className="w-5 h-5" />
                <span>Create Ideas</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .fade-in { 
          opacity: 0; 
          transform: translateY(30px); 
          transition: all 0.8s ease; 
        }
        .fade-in.visible { 
          opacity: 1; 
          transform: translateY(0); 
        }
      `}</style>
    </div>
  );
};

export default CodePage;