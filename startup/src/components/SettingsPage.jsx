import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Palette,
  Crown,
  Globe,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  User,
  Bell,
  Shield,
  HelpCircle,
  Star,
  Settings,
  Heart,
  Sparkles,
  Zap,
  Code,
  Brain,
  Cpu,
  Database,
} from 'lucide-react';
import * as THREE from 'three';
import Header from './Header';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom'; 
// Futuristic Neural Network Background
const NeuralNetworkBackground = () => {
  const mountRef = useRef(null);
  const frameRef = useRef(null);
  
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create neural network nodes
    const nodes = [];
    const connections = [];
    const nodeCount = 60;
    
    for (let i = 0; i < nodeCount; i++) {
      const geometry = new THREE.SphereGeometry(0.08, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.4, 0.8, 0.6),
        transparent: true,
        opacity: 0.6,
      });
      
      const node = new THREE.Mesh(geometry, material);
      node.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 30
      );
      
      nodes.push(node);
      scene.add(node);
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = nodes[i].position.distanceTo(nodes[j].position);
        if (distance < 8 && Math.random() > 0.8) {
          const geometry = new THREE.BufferGeometry();
          const material = new THREE.LineBasicMaterial({
            color: new THREE.Color().setHSL(0.65, 0.6, 0.4),
            transparent: true,
            opacity: 0.15,
          });
          
          const points = [nodes[i].position, nodes[j].position];
          geometry.setFromPoints(points);
          const line = new THREE.Line(geometry, material);
          connections.push(line);
          scene.add(line);
        }
      }
    }

    // Add floating particles
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 35;
      positions[i3 + 2] = (Math.random() - 0.5) * 40;
      
      const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.3, 0.7, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.z = 25;

    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.008;
      
      // Animate nodes
      nodes.forEach((node, index) => {
        node.position.y += Math.sin(time + index) * 0.002;
        node.material.opacity = 0.4 + Math.sin(time * 2 + index * 0.1) * 0.2;
        const scale = 0.8 + Math.sin(time * 1.5 + index * 0.3) * 0.3;
        node.scale.setScalar(scale);
      });
      
      // Animate connections
      connections.forEach((connection, index) => {
        connection.material.opacity = 0.1 + Math.sin(time * 1.5 + index * 0.4) * 0.05;
      });
      
      // Rotate particles
      particles.rotation.y += 0.0008;
      particles.rotation.x += 0.0005;
      
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
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// Floating Tech Icons
const FloatingTechIcon = ({ icon: Icon, position, delay = 0, color = "purple" }) => {
  const colors = {
    purple: "from-purple-600/20 to-purple-400/10 text-purple-300",
    cyan: "from-cyan-600/20 to-cyan-400/10 text-cyan-300",
    pink: "from-pink-600/20 to-pink-400/10 text-pink-300",
    green: "from-green-600/20 to-green-400/10 text-green-300",
  };

  return (
    <div
      className="fixed z-10 animate-float-tech opacity-60"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        animationDelay: `${delay}s`,
        animationDuration: '8s',
      }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} backdrop-blur-sm border border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300`}>
        <Icon className={`w-6 h-6 transition-colors ${colors[color].split(' ')[2]}`} />
      </div>
    </div>
  );
};

// Holographic Settings Card
const HolographicSettingsCard = ({ category, index, onItemClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  return (
    <div
      className="group relative transform transition-all duration-700 hover:scale-105 animate-fade-in-up"
      style={{
        animationDelay: `${index * 150}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Holographic glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-cyan-600/30 to-pink-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
      
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-slate-800/40 via-slate-900/60 to-slate-950/80 backdrop-blur-2xl border border-white/10 group-hover:border-white/30 rounded-3xl overflow-hidden transition-all duration-500">
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500 ${isHovered ? 'animate-gradient-xy' : ''}`}></div>
        </div>

        {/* Category Header */}
        <div className="relative px-6 py-5 border-b border-white/10 group-hover:border-white/20 transition-all">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/80 to-cyan-600/80 flex items-center justify-center transition-all duration-500 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
                <category.icon className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              {isHovered && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600/40 to-cyan-600/40 blur-lg animate-ping"></div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-cyan-300 group-hover:bg-clip-text transition-all duration-300">
                {category.title}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {category.items.length} {category.items.length === 1 ? 'option' : 'options'}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="relative">
          {category.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              onClick={() => onItemClick(item)}
              onMouseEnter={() => setExpandedItem(itemIndex)}
              onMouseLeave={() => setExpandedItem(null)}
              className="group/item relative px-6 py-5 hover:bg-white/5 transition-all duration-300 cursor-pointer border-b border-white/5 last:border-b-0"
            >
              {/* Item hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-cyan-600/10 opacity-0 group-hover/item:opacity-100 transition-all duration-300"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Item icon */}
                  <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    item.premium && !item.currentStatus
                      ? 'bg-gradient-to-r from-yellow-500/80 to-orange-500/80'
                      : 'bg-slate-700/60 group-hover/item:bg-slate-600/80'
                  }`}>
                    <item.icon className={`w-5 h-5 transition-all duration-300 ${
                      item.premium && !item.currentStatus
                        ? 'text-white'
                        : 'text-purple-400 group-hover/item:text-purple-300'
                    }`} />
                    
                    {/* Glow effect for premium items */}
                    {item.premium && !item.currentStatus && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-500/40 to-orange-500/40 blur-md opacity-0 group-hover/item:opacity-100 transition-all duration-300"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-semibold text-white group-hover/item:text-transparent group-hover/item:bg-gradient-to-r transition-all duration-300 ${
                        expandedItem === itemIndex 
                          ? 'from-purple-300 to-cyan-300 bg-clip-text text-transparent' 
                          : ''
                      }`}>
                        {item.title}
                      </h4>
                      
                      {/* Premium badges */}
                      {item.premium && !item.currentStatus && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded-full">
                            Pro
                          </span>
                        </div>
                      )}
                      
                      {item.premium && item.currentStatus && (
                        <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm transition-all duration-300 ${
                      expandedItem === itemIndex ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      {item.description}
                    </p>

                    {/* Current values */}
                    {item.action === 'theme' && (
                      <div className="mt-2">
                        <span className="text-xs text-purple-400 font-medium">
                          Current: Dark Mode
                        </span>
                      </div>
                    )}
                    
                    {item.action === 'language' && (
                      <div className="mt-2">
                        <span className="text-xs text-cyan-400 font-medium">
                          Current: English
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Animated arrow */}
                <div className={`transition-all duration-300 ${
                  expandedItem === itemIndex ? 'translate-x-2' : ''
                }`}>
                  <ChevronRight className={`w-5 h-5 transition-all duration-300 ${
                    expandedItem === itemIndex 
                      ? 'text-purple-400 scale-110' 
                      : 'text-gray-500'
                  }`} />
                </div>
              </div>

              {/* Expansion effect */}
              {expandedItem === itemIndex && (
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-cyan-500 rounded-r-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Quantum Action Button
const QuantumActionButton = ({ icon: Icon, label, onClick, variant = "default" }) => {
  const [isClicked, setIsClicked] = useState(false);

  const variants = {
    default: "from-purple-600/20 to-cyan-600/20 hover:from-purple-600/40 hover:to-cyan-600/40 text-purple-300 hover:text-white",
    premium: "from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/40 hover:to-orange-500/40 text-yellow-300 hover:text-white",
    success: "from-green-500/20 to-emerald-500/20 hover:from-green-500/40 hover:to-emerald-500/40 text-green-300 hover:text-white",
    danger: "from-red-500/20 to-pink-500/20 hover:from-red-500/40 hover:to-pink-500/40 text-red-300 hover:text-white",
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative bg-gradient-to-br ${variants[variant]} backdrop-blur-xl border border-white/20 rounded-2xl p-4 transition-all duration-300 hover:scale-110 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
        isClicked ? 'scale-95' : ''
      }`}
    >
      {/* Quantum particles effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse`}></div>
      </div>
      
      <div className="relative flex flex-col items-center space-y-2">
        <div className={`transition-all duration-300 ${isClicked ? 'rotate-180' : 'group-hover:rotate-12'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium transition-all duration-300">
          {label}
        </span>
      </div>
      
      {/* Click ripple effect */}
      {isClicked && (
        <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping"></div>
      )}
    </button>
  );
};

// Custom Toast Component
const QuantumToast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-8 right-8 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-purple-600/90 to-cyan-600/90 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-white animate-spin" />
          <span className="text-white font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isPremium, setIsPremium] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate()
  // Floating tech icons data
  const floatingIcons = [
    { icon: Settings, position: { x: 10, y: 20 }, delay: 0, color: "purple" },
    { icon: Crown, position: { x: 85, y: 15 }, delay: 1, color: "cyan" },
    { icon: Shield, position: { x: 15, y: 70 }, delay: 2, color: "pink" },
    { icon: Globe, position: { x: 80, y: 75 }, delay: 3, color: "green" },
    { icon: Brain, position: { x: 50, y: 10 }, delay: 4, color: "purple" },
    { icon: Zap, position: { x: 25, y: 45 }, delay: 5, color: "cyan" },
  ];

  const settingsCategories = [
   
    {
      title: 'Account',
      icon: User,
      items: [
        {
          title: 'Change Password',
          description: 'Update your account password',
          icon: Lock,
          action: 'navigate',
          path: '/password',
        },
        {
          title: 'Profile Dashboard',
          description: 'Customize your data view preferences',
          icon: User,
          action: 'navigate',
          path: '/profile',
        },
      ],
    },
    {
      title: 'Activity',
      icon: Palette,
      items: [
        {
          title: 'Liked-Ideas',
          description: 'All your liked ideas here!',
          icon: Heart,
          action: 'navigate',
          path: '/liked-ideas',
        },
      ],
    },
    {
      title: 'Premium',
      icon: Crown,
      items: [
        {
          title: isPremium ? 'Manage Premium' : 'Upgrade to Premium',
          description: isPremium
            ? 'You have access to all premium features'
            : 'Unlock advanced analytics and customization',
          icon: Crown,
          action: 'navigate',
          path: '/premium',
          premium: true,
          currentStatus: isPremium,
        },
      ],
    },
    {
      title: 'Preferences',
      icon: Globe,
      items: [
        {
          title: 'Language',
          description: 'Select your preferred language',
          icon: Globe,
          action: 'language',
          current: currentLanguage,
        },
        {
          title: 'Notification Preferences',
          description: 'Meal reminders, goal alerts, and weekly reports',
          icon: Bell,
          action: 'notification',
        },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          title: 'Privacy Policy & Data Usage',
          description: 'View policy and manage data preferences',
          icon: Shield,
          action: 'navigate',
          path: '/privacy',
        },
      ],
    },
    {
      title: 'Support',
      icon: HelpCircle,
      items: [
        {
          title: 'Contact Support',
          description: 'Email us for assistance',
          icon: HelpCircle,
          action: 'email',
          email: 'bitecount@gmail.com',
        },
      ],
    },
  ];

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

const handleSettingClick = (item) => {
  switch (item.action) {
    case 'navigate':
      showToastMessage(`🚀 Navigating to ${item.title}...`);
      navigate(item.path); // Add this line to perform the navigation
      break;
    case 'theme':
      showToastMessage('🎨 Theme selection coming soon');
      break;
    case 'language':
      showToastMessage('🌍 Language selection coming soon');
      break;
    case 'notification':
      showToastMessage('🔔 Notifications will be available soon');
      break;
    case 'email':
      window.location.href = `mailto:${item.email}?subject=Support Request&body=Hi, I need help with...`;
      break;
    default:
      break;
  }
};

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Neural Network Background */}
      <NeuralNetworkBackground />
      
      {/* Floating Tech Icons */}
      {floatingIcons.map((item, index) => (
        <FloatingTechIcon 
          key={index} 
          icon={item.icon} 
          position={item.position} 
          delay={item.delay} 
          color={item.color} 
        />
      ))}

      {/* Toast Notification */}
      <QuantumToast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Header */}
      <Header/>
      <div className="relative z-30 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center animate-pulse">
                  <Settings className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/40 via-pink-500/40 to-cyan-500/40 blur-xl animate-ping"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Quantum Settings
                </h1>
                <p className="text-gray-400 mt-1 text-lg">
                  Configure your digital experience
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-full">
                <span className="text-green-300 text-sm font-medium">System Online</span>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 py-12">
        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {settingsCategories.map((category, index) => (
            <HolographicSettingsCard
              key={index}
              category={category}
              index={index}
              onItemClick={handleSettingClick}
            />
          ))}
        </div>

        {/* Quantum Action Center */}
        <div className="bg-gradient-to-br from-slate-800/30 via-slate-900/50 to-slate-950/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Quantum Action Center
            </h3>
            <p className="text-gray-400">
              Quick access to your most used features
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <QuantumActionButton
              icon={Lock}
              label="Security"
              onClick={() => navigate ('/privacy')}
              variant="default"
            />
            <QuantumActionButton
              icon={Crown}
              label="Upgrade"
              onClick={() => navigate('/premium')}
              variant="premium"
            />
            <QuantumActionButton
              icon={Bell}
              label="Alerts"
              onClick={() => showToastMessage('🔔 Notification Center Coming Soon!')}
              variant="success"
            />
            <QuantumActionButton
              icon={HelpCircle}
              label="Help"
              onClick={() => navigate('/privacy')}
              variant="danger"
            />
          </div>
          
        </div>

        {/* App Info */}
      
       <Footer/>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float-tech {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotate(5deg); 
          }
          50% { 
            transform: translateY(0px) translateX(-10px) rotate(0deg); 
          }
          75% { 
            transform: translateY(10px) translateX(5px) rotate(-5deg); 
          }
        }
        
        @keyframes gradient-xy {
          0%, 100% { 
            background-position: 0% 50%; 
          }
          25% { 
            background-position: 100% 0%; 
          }
          50% { 
            background-position: 100% 100%; 
          }
          75% { 
            background-position: 0% 100%; 
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(6, 182, 212, 0.4);
          }
        }
        
        @keyframes quantum-drift {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-15px) translateX(8px);
          }
          50% {
            transform: translateY(8px) translateX(-12px);
          }
          75% {
            transform: translateY(-5px) translateX(15px);
          }
        }
        
        .animate-float-tech {
          animation: float-tech 8s ease-in-out infinite;
        }
        
        .animate-gradient-xy {
          animation: gradient-xy 3s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-quantum-drift {
          animation: quantum-drift 10s ease-in-out infinite;
        }
        
        /* Holographic text effect */
        .holographic-text {
          background: linear-gradient(45deg, #8b5cf6, #06b6d4, #ec4899, #8b5cf6);
          background-size: 300% 300%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-xy 3s ease infinite;
        }
        
        /* Neon glow effect */
        .neon-glow {
          filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.5)) 
                  drop-shadow(0 0 20px rgba(6, 182, 212, 0.3));
        }
        
        /* Glass morphism effect */
        .glass-morph {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Quantum particle system */
        .quantum-particles::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(2px 2px at 20px 30px, rgba(139, 92, 246, 0.3), transparent),
                            radial-gradient(2px 2px at 40px 70px, rgba(6, 182, 212, 0.3), transparent),
                            radial-gradient(1px 1px at 90px 40px, rgba(236, 72, 153, 0.3), transparent),
                            radial-gradient(1px 1px at 130px 80px, rgba(139, 92, 246, 0.3), transparent);
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: quantum-drift 20s linear infinite;
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>
      </div>
  );
};

export default SettingsPage;