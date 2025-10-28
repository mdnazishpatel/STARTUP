import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User, TrendingUp, Code, Lightbulb, Heart, Calendar, Zap,
  Trophy, Target, Activity, Clock, FileCode, AlertCircle, Loader,
  Crown, Shield, Brain, Cpu, Database, Rocket, Sparkles,
  Star, Users, Award, Flame, ChevronRight, BarChart3
} from 'lucide-react';
import * as THREE from 'three';
import Header from './Header';
import Footer from './Footer';
// Three.js Background Component
const ThreeJSBackground = () => {
  const mountRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let scene, camera, renderer, brainGroup, particles;

    try {
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

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (error) {
      console.error('ThreeJSBackground Error:', error);
    }
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0" />;
};

// Floating Icon Component
const Floating3DIcon = ({ icon: Icon, position, delay = 0 }) => {
  if (!Icon) return null;
  return (
    <div
      className="absolute z-10 animate-float-3d opacity-60"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        animationDelay: `${delay}s`,
        animationDuration: '8s',
      }}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/20 flex items-center justify-center group hover:scale-110 transition-all duration-300">
          <Icon className="w-6 h-6 text-purple-300 group-hover:text-white transition-colors" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/10 to-cyan-600/10 blur-xl group-hover:blur-2xl transition-all"></div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Floating icons configuration
  const floatingIcons = [
    { icon: Crown, position: { x: 5, y: 15 }, delay: 0 },
    { icon: Zap, position: { x: 90, y: 20 }, delay: 1 },
    { icon: Shield, position: { x: 10, y: 80 }, delay: 2 },
    { icon: Rocket, position: { x: 85, y: 75 }, delay: 3 },
    { icon: Sparkles, position: { x: 15, y: 45 }, delay: 4 },
    { icon: Brain, position: { x: 80, y: 40 }, delay: 5 },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:8000/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
        
        // Fallback to mock data in development
        console.warn('API failed, using mock data:', err.message);
        const mockData = {
          user: {
            name: "Demo User",
            email: "demo@example.com",
            joinDate: "2024-01-15T10:30:00Z"
          },
          totalIdeas: 42,
          totalCodeProjects: 18,
          totalFilesGenerated: 156,
          likedIdeas: 23,
          generationStreak: 12,
          achievements: [
            { id: 'idea_generator', earned: true, progress: 42, target: 25 },
            { id: 'code_master', earned: true, progress: 18, target: 10 },
            { id: 'curator', earned: true, progress: 23, target: 15 },
            { id: 'speed_demon', earned: true, progress: 12, target: 7 },
            { id: 'file_creator', earned: true, progress: 156, target: 100 },
            { id: 'tech_explorer', earned: false, progress: 3, target: 5 }
          ]
        };
        setProfile(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <ThreeJSBackground />
        <div className="relative z-10 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 to-cyan-600/40 rounded-full blur-xl scale-150 animate-pulse"></div>
            <Loader className="w-16 h-16 text-purple-400 animate-spin mx-auto relative z-10" />
          </div>
          <p className="text-gray-200 mt-6 text-xl font-medium">Loading your profile...</p>
          <p className="text-gray-400 mt-2 text-sm">Preparing your innovation dashboard</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <ThreeJSBackground />
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-red-500/30 rounded-3xl p-10 max-w-md text-center shadow-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/40 to-pink-600/40 rounded-full blur-xl scale-150"></div>
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto relative z-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mt-6">Connection Failed</h2>
          <p className="text-gray-300 mt-3 text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <ThreeJSBackground />
        <div className="relative z-10">
          <p className="text-gray-400 text-xl">No profile data available.</p>
        </div>
      </div>
    );
  }

  const { user, achievements = [] } = profile;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <ThreeJSBackground />
      
      {/* Floating Icons */}
      {floatingIcons.map((item, index) => (
        <Floating3DIcon key={index} icon={item.icon} position={item.position} delay={item.delay} />
      ))}
<Header/>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Hero Profile Section */}
        
        <div className="text-center mb-20">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-cyan-600/50 rounded-full blur-2xl scale-150 animate-pulse"></div>
            <div className="relative w-32 h-32 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 border-white/20 hover:scale-110 transition-all duration-300">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-950">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-4">
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              {user?.name}
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-4">{user?.email}</p>
          
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Calendar className="w-5 h-5" />
            <span className="text-lg">Innovation Member since {new Date(user?.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { 
              icon: Lightbulb, 
              title: 'Ideas Generated', 
              value: profile.totalIdeas, 
              gradient: 'from-yellow-500 via-orange-500 to-red-500',
              bgGlow: 'from-yellow-500/20 to-red-500/20',
              description: 'Creative concepts born'
            },
            { 
              icon: Code, 
              title: 'Code Projects', 
              value: profile.totalCodeProjects, 
              gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
              bgGlow: 'from-cyan-500/20 to-indigo-500/20',
              description: 'Full-stack solutions'
            },
            { 
              icon: FileCode, 
              title: 'Files Created', 
              value: profile.totalFilesGenerated, 
              gradient: 'from-green-500 via-emerald-500 to-teal-500',
              bgGlow: 'from-green-500/20 to-teal-500/20',
              description: 'Lines of innovation'
            },
            { 
              icon: Heart, 
              title: 'Liked Ideas', 
              value: profile.likedIdeas, 
              gradient: 'from-pink-500 via-rose-500 to-red-500',
              bgGlow: 'from-pink-500/20 to-red-500/20',
              description: 'Community favorites'
            }
          ].map((stat, i) => (
            <div
              key={i}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGlow} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
              
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-4xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-200 transition-all">
                  {stat.value}
                </h3>
                
                <p className="text-gray-200 font-semibold text-lg mb-1">{stat.title}</p>
                <p className="text-gray-400 text-sm">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Streak Section */}
        <div className="flex justify-center mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-3xl blur-xl scale-110 group-hover:scale-125 transition-all duration-500"></div>
            <div className="relative bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/40 rounded-3xl px-12 py-8 flex items-center space-x-6 hover:scale-105 transition-all duration-300 shadow-2xl">
              <div className="relative">
                <Flame className="w-12 h-12 text-yellow-400 animate-pulse" />
                <div className="absolute inset-0 bg-yellow-400/50 rounded-full blur-lg"></div>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-black bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  {profile.generationStreak || 0} Days
                </h3>
                <p className="text-gray-200 text-lg font-semibold">🔥 Innovation Streak</p>
                <p className="text-gray-400 text-sm mt-1">Keep the momentum going!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Achievements Grid */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 mb-16 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent flex items-center">
              <Trophy className="w-8 h-8 mr-4 text-yellow-400" />
              Achievement Gallery
            </h2>
            <div className="flex items-center gap-2 text-gray-400">
              <Award className="w-5 h-5" />
              <span className="text-sm">{achievements.filter(a => a.earned).length}/{achievements.length} Unlocked</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 'idea_generator', icon: Lightbulb, title: 'Idea Generator', desc: 'Master of Innovation', target: 25, gradient: 'from-yellow-500 to-orange-500' },
              { id: 'code_master', icon: Code, title: 'Code Architect', desc: 'Full-Stack Mastery', target: 10, gradient: 'from-cyan-500 to-blue-500' },
              { id: 'curator', icon: Heart, title: 'Community Curator', desc: 'Crowd Favorite', target: 15, gradient: 'from-pink-500 to-rose-500' },
              { id: 'speed_demon', icon: Zap, title: 'Speed Innovator', desc: 'Consistency Champion', target: 7, gradient: 'from-purple-500 to-indigo-500' },
              { id: 'file_creator', icon: FileCode, title: 'Code Factory', desc: 'Productivity Beast', target: 100, gradient: 'from-green-500 to-emerald-500' },
              { id: 'tech_explorer', icon: Target, title: 'Tech Pioneer', desc: 'Stack Diversifier', target: 5, gradient: 'from-indigo-500 to-purple-500' }
            ].map((ach) => {
              const data = achievements.find(a => a.id === ach.id) || { earned: false, progress: 0, target: ach.target };
              const percent = Math.min((data.progress / data.target) * 100, 100);

              return (
                <div
                  key={ach.id}
                  className={`relative group p-8 rounded-2xl border transition-all duration-500 transform hover:scale-105 ${
                    data.earned
                      ? 'bg-gradient-to-br from-white/10 to-white/5 border-purple-500/50 shadow-lg'
                      : 'bg-white/5 border-white/20 hover:border-gray-500/50'
                  }`}
                >
                  {data.earned && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${ach.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                      <ach.icon className="w-7 h-7 text-white" />
                    </div>
                    {data.earned && (
                      <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" fill="currentColor" />
                    )}
                  </div>
                  
                  <h3 className="font-bold text-white text-xl mb-2">{ach.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{ach.desc}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Progress</span>
                      <span className="text-xs text-gray-300 font-medium">{data.progress}/{data.target}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${ach.gradient} transition-all duration-1000 relative ${
                          data.earned ? 'opacity-100' : 'opacity-80'
                        }`}
                        style={{ width: `${percent}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  {data.earned && (
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-xs font-semibold text-yellow-300">
                        <Star className="w-3 h-3" fill="currentColor" />
                        UNLOCKED
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Innovation Score */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Brain className="w-6 h-6 mr-3 text-purple-400" />
                Innovation Score
              </h3>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {Math.min(Math.round((profile.totalIdeas * 2.3 + profile.likedIdeas * 4.1 + profile.generationStreak * 3.2)), 100)}
                </div>
                <div className="text-sm text-gray-400">out of 100</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Creativity Output</span>
                <span className="text-purple-300 font-semibold">{Math.min(Math.round(profile.totalIdeas / 50 * 100), 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Community Impact</span>
                <span className="text-cyan-300 font-semibold">{Math.min(Math.round(profile.likedIdeas / 25 * 100), 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Consistency</span>
                <span className="text-green-300 font-semibold">{Math.min(Math.round(profile.generationStreak / 30 * 100), 100)}%</span>
              </div>
            </div>
          </div>

          {/* Next Level Progress */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:bg-white/10 transition-all duration-300">
            <h3 className="text-2xl font-bold text-white flex items-center mb-6">
              <Target className="w-6 h-6 mr-3 text-cyan-400" />
              Next Milestone
            </h3>
            
            <div className="space-y-6">
              {achievements.filter(a => !a.earned).slice(0, 2).map((ach, i) => {
                const percent = (ach.progress / ach.target) * 100;
                const remaining = ach.target - ach.progress;
                
                return (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-200 font-medium">
                        {ach.id === 'tech_explorer' ? 'Tech Explorer' : 'Next Goal'}
                      </span>
                      <span className="text-sm text-gray-400">{remaining} more to go</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-1000 relative"
                        style={{ width: `${percent}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t border-white/10">
                 <Link to="/create">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-xl text-purple-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/40 hover:to-cyan-600/40 transition-all duration-300">
                  <Rocket className="w-4 h-4" />
                  Continue Creating
                  <ChevronRight className="w-4 h-4" />
                </button></Link>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Feature Showcase */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Database,
              title: "Smart Analytics",
              description: "Deep insights into your innovation patterns and success metrics",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: Cpu,
              title: "AI Architecture",
              description: "Advanced system design and scalable technology recommendations",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: TrendingUp,
              title: "Growth Tracking",
              description: "Monitor your creative output and community engagement trends",
              gradient: "from-green-500 to-emerald-500"
            }
          ].map((feature, i) => (
            <div key={i} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 to-cyan-600/40 rounded-2xl blur-xl scale-110"></div>
            <Link to="/premium">
            <button className="relative px-12 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl text-white font-bold text-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              Unlock Premium Features
            </button></Link>
          </div>
          <p className="text-gray-400 mt-4 text-sm">Supercharge your innovation journey today</p>
        </div>
      </div>
        <Footer/>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float-3d {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
          33% { transform: translateY(-20px) translateX(15px) rotate(8deg) scale(1.15); }
          66% { transform: translateY(12px) translateX(-10px) rotate(-5deg) scale(0.9); }
        }
        .animate-float-3d {
          animation: float-3d 8s ease-in-out infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;