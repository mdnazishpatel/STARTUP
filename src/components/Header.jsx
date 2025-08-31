import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Hammer,
  Lightbulb,
  Heart,
  Code,
  LogOut,
  Menu,
  X,
  Sparkles,
  Zap,
  Rocket,
  Crown,
  User,
  ChevronDown,
} from 'lucide-react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 200, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, 200);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      sceneRef.current = scene;
      rendererRef.current = renderer;

      const particleCount = 50;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 8;
        positions[i + 2] = (Math.random() - 0.5) * 10;
        const color = new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.8, 0.6);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);
      particlesRef.current = particles;

      const connections = new THREE.Group();
      for (let i = 0; i < 10; i++) {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.6, 0.4),
          transparent: true,
          opacity: 0.3,
        });
        const points = [
          new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 8),
          new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 8),
        ];
        geometry.setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        connections.add(line);
      }
      scene.add(connections);

      camera.position.z = 8;

      const animate = (time) => {
        frameRef.current = requestAnimationFrame(animate);
        if (particlesRef.current) {
          particlesRef.current.rotation.y += 0.002;
          particlesRef.current.rotation.x += 0.001;
          const positions = particlesRef.current.geometry.attributes.position.array;
          for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(time * 0.001 + positions[i] * 0.1) * 0.002;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
        connections.rotation.y += 0.001;
        connections.rotation.z += 0.0005;
        renderer.render(scene, camera);
      };

      animate(0);

      const handleResize = () => {
        camera.aspect = window.innerWidth / 200;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, 200);
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
      console.error('ThreeBackground Error:', error);
      return () => {};
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none opacity-60"
      style={{ zIndex: -1 }} // Ensure it's behind everything
    />
  );
};

const FloatingIcon = ({ icon: Icon, delay = 0, className = '' }) => {
  return (
    <div
      className={`absolute opacity-20 text-purple-400 animate-float ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '4s',
      }}
    >
      <Icon size={24} />
    </div>
  );
};

function EnhancedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setIsProfileOpen(false); // Close dropdown on scroll
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
      setIsMenuOpen(false);
      setIsProfileOpen(false);
    }
  };

  const profileMenuItems = [
    { href: '/liked-ideas', icon: Heart, label: 'Liked Ideas', gradient: 'from-red-600/20 to-pink-600/20' },
    { href: '/code', icon: Code, label: 'Code', gradient: 'from-yellow-600/20 to-orange-600/20' },
    { href: '/settings', icon: Hammer, label: 'Settings', gradient: 'from-yellow-600/20 to-orange-600/20' },
    { onClick: handleLogout, icon: LogOut, label: 'Logout', gradient: 'from-red-600/20 to-orange-600/20', isButton: true },
  ];

  return (
    <header className="relative z-50 w-full">
      {/* 3D Background - now properly behind */}
      <div className="absolute inset-0 h-48 pointer-events-none overflow-hidden">
        <ThreeBackground />
      </div>

      {/* Floating Icons */}
      <FloatingIcon icon={Sparkles} delay={0} className="top-4 left-1/4" />
      <FloatingIcon icon={Zap} delay={1} className="top-8 right-1/3" />
      <FloatingIcon icon={Code} delay={2} className="top-6 left-3/4" />
      <FloatingIcon icon={Rocket} delay={3} className="top-10 left-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div
          className={`glass-enhanced rounded-3xl mt-6 p-5 backdrop-blur-xl border border-white/30 shadow-2xl transition-all duration-500 ${
            scrolled ? 'bg-slate-950/90 shadow-purple-500/30' : 'bg-gradient-to-br from-white/15 to-white/05'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center space-x-4 group"
              onClick={() => {
                setIsMenuOpen(false);
                setIsProfileOpen(false);
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-0.5 group-hover:scale-110 transition-all duration-300">
                  <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center relative overflow-hidden">
                    <img
                      src="https://www.newtraderu.com/wp-content/uploads/mind-control-2.jpg"
                      alt="StartupGenius Logo"
                      className="w-8 h-8 rounded-xl object-cover z-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 to-cyan-600/50 rounded-2xl blur-sm animate-pulse"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-300"></div>
              </div>
              <div className="relative">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-cyan-400 transition-all duration-300">
                  StartupGenius
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-500"></div>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="/home"
                className="nav-item group flex items-center space-x-2 text-gray-300 hover:text-white font-medium transition-all duration-300 relative px-4 py-2 rounded-xl hover:bg-white/10"
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-cyan-600/20 to-purple-600/20 group-hover:from-cyan-600/40 group-hover:to-purple-600/40 transition-all">
                  <Home className="w-4 h-4" />
                </div>
                <span>Home</span>
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 transition-all"></div>
              </a>
              <a
                href="/create"
                className="nav-item group flex items-center space-x-2 text-gray-300 hover:text-white font-medium transition-all duration-300 relative px-4 py-2 rounded-xl hover:bg-white/10"
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-cyan-600/20 to-purple-600/20 group-hover:from-cyan-600/40 group-hover:to-purple-600/40 transition-all">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <span>Create</span>
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 transition-all"></div>
              </a>
              <a
                href="/premium"
                className="nav-item group flex items-center space-x-2 text-gray-300 hover:text-white font-medium transition-all duration-300 relative px-4 py-2 rounded-xl hover:bg-white/10"
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 group-hover:from-blue-600/40 group-hover:to-cyan-600/40 transition-all">
                  <Crown className="w-4 h-4" />
                </div>
                <span>Premium</span>
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 transition-all"></div>
              </a>

              {/* Profile Button */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="nav-item group flex items-center space-x-2 text-gray-300 hover:text-white font-medium transition-all duration-300 relative px-4 py-2 rounded-xl hover:bg-white/10"
                >
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 group-hover:from-purple-600/40 group-hover:to-pink-600/40 transition-all">
                    <User className="w-4 h-4" />
                  </div>
                  <span>Profile</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                  />
                  <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 transition-all"></div>
                </button>

                {/* ✅ Fixed Dropdown: Proper z-index, pointer events, and position */}
                {isProfileOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl rounded-xl p-2 shadow-2xl border border-white/20 animate-fade-in z-[1000]"
                    style={{ pointerEvents: 'all' }}
                  >
                    {profileMenuItems.map((item, index) => (
                      item.isButton ? (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            item.onClick();
                          }}
                          className="w-full flex items-center space-x-3 text-gray-300 hover:text-red-400 font-medium py-2 px-3 rounded-lg hover:bg-red-500/10 transition-all duration-300 group text-left"
                        >
                          <div
                            className={`p-1.5 rounded-lg bg-gradient-to-r ${item.gradient} group-hover:from-red-600/40 group-hover:to-orange-600/40 transition-all`}
                          >
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span>{item.label}</span>
                        </button>
                      ) : (
                        <a
                          href={item.href}
                          key={index}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 text-gray-300 hover:text-white font-medium py-2 px-3 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                        >
                          <div
                            className={`p-1.5 rounded-lg bg-gradient-to-r ${item.gradient} transition-all`}
                          >
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span>{item.label}</span>
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative p-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 focus:outline-none transition-all duration-300 group"
            >
              <div className="relative">{isMenuOpen ? <X size={20} /> : <Menu size={20} />}</div>
              <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40 transition-all"></div>
            </button>
          </div>

          {/* Mobile Menu */}
        {isMenuOpen && (
  <nav className="mt-6 pt-6 border-t border-white/20 md:hidden">
    <div className="flex flex-col space-y-3">
      {/* Main Navigation Links */}
      <a
        href="/home"
        onClick={() => setIsMenuOpen(false)}
        className="flex items-center justify-center space-x-3 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
      >
        <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-600/30 to-purple-600/30">
          <Home className="w-5 h-5" />
        </div>
        <span>Home</span>
      </a>

      <a
        href="/create"
        onClick={() => setIsMenuOpen(false)}
        className="flex items-center justify-center space-x-3 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
      >
        <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-600/30 to-purple-600/30">
          <Lightbulb className="w-5 h-5" />
        </div>
        <span>Create</span>
      </a>

      <a
        href="/premium"
        onClick={() => setIsMenuOpen(false)}
        className="flex items-center justify-center space-x-3 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
      >
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600/30 to-cyan-600/30">
          <Crown className="w-5 h-5" />
        </div>
        <span>Premium</span>
      </a>

      {/* Divider */}
      <div className="border-t border-white/10 my-2"></div>

      {/* Profile Section Links */}
      {profileMenuItems.map((item, index) => (
        item.isButton ? (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              item.onClick();
            }}
            className="flex items-center justify-center space-x-3 text-gray-300 hover:text-red-400 font-medium py-3 px-4 rounded-xl hover:bg-red-500/10 transition-all duration-300 group w-full text-left"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-600/30 to-orange-600/30">
              <item.icon className="w-5 h-5" />
            </div>
            <span>{item.label}</span>
          </button>
        ) : (
          <a
            href={item.href}
            key={index}
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-center space-x-3 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-600/30 to-pink-600/30">
              <item.icon className="w-5 h-5" />
            </div>
            <span>{item.label}</span>
          </a>
        )
      ))}
    </div>
  </nav>
)}
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        .glass-enhanced {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(139, 92, 246, 0.1) 50%,
            rgba(6, 182, 212, 0.05) 100%
          );
          backdrop-filter: blur(10px) saturate(150%);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 2px 0 rgba(255, 255, 255, 0.3),
            inset 0 -2px 0 rgba(255, 255, 255, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.25);
          position: relative;
        }

        @supports not (backdrop-filter: blur(10px)) {
          .glass-enhanced {
            background: linear-gradient(
              135deg,
              rgba(30, 41, 59, 0.9) 0%,
              rgba(76, 29, 149, 0.85) 50%,
              rgba(6, 182, 212, 0.8) 100%
            );
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
            opacity: 0.4;
          }
          66% {
            transform: translateY(5px) rotate(240deg);
            opacity: 0.3;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .nav-item::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #8b5cf6, #06b6d4);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .nav-item:hover::after {
          width: 80%;
        }
      `}</style>
    </header>
  );
}

export default EnhancedHeader;