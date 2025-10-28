import React, { useState, useEffect, useRef } from 'react';
import { Shield, Eye, Lock, Database, Users, Zap, ChevronDown, ChevronUp, ArrowLeft, Check, AlertTriangle, Globe, Code, Sparkles } from 'lucide-react';
import * as THREE from 'three';
import Footer from './Footer';
import Header from './Header'
// Three.js Background Component
const ThreeJSBackground = () => {
  const mountRef = useRef(null);
  const frameRef = useRef(null);
  
  useEffect(() => {
    if (!mountRef.current) return;

    let scene, camera, renderer, particles, connections;
    
    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      // Create floating data nodes
      const nodeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const nodes = [];
      const nodeConnections = [];

      for (let i = 0; i < 30; i++) {
        const nodeMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.7, 0.6),
          transparent: true,
          opacity: 0.4,
        });
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15
        );
        nodes.push(node);
        scene.add(node);
      }

      // Create connections between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = nodes[i].position.distanceTo(nodes[j].position);
          if (distance < 5 && Math.random() > 0.8) {
            const geometry = new THREE.BufferGeometry();
            const material = new THREE.LineBasicMaterial({
              color: new THREE.Color().setHSL(0.6, 0.5, 0.3),
              transparent: true,
              opacity: 0.1,
            });
            const points = [nodes[i].position, nodes[j].position];
            geometry.setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            nodeConnections.push(line);
            scene.add(line);
          }
        }
      }

      // Create floating particles
      const particleCount = 80;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 40;
        positions[i3 + 1] = (Math.random() - 0.5) * 25;
        positions[i3 + 2] = (Math.random() - 0.5) * 25;
        
        const color = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.6, 0.5);
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
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.6,
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      camera.position.set(0, 0, 12);

      let time = 0;
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        time += 0.01;
        
        // Animate nodes
        nodes.forEach((node, index) => {
          node.position.y += Math.sin(time + index * 0.5) * 0.002;
          node.material.opacity = 0.3 + Math.sin(time * 2 + index * 0.3) * 0.2;
        });

        // Animate particles
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          positions[i3 + 1] += Math.sin(time + i * 0.1) * 0.005;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.001;

        // Animate connections
        nodeConnections.forEach((connection, index) => {
          connection.material.opacity = 0.05 + Math.sin(time * 1.5 + index * 0.4) * 0.05;
        });

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
      console.error('ThreeJS Background Error:', error);
      return () => {};
    }
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none opacity-40" />;
};

// Floating Security Icons
const FloatingSecurityIcon = ({ icon: Icon, position, delay = 0, size = "w-12 h-12" }) => {
  if (!Icon) return null;
  return (
    <div
      className="absolute z-10 animate-float-security opacity-60"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        animationDelay: `${delay}s`,
        animationDuration: '8s',
      }}
    >
      <div className="relative">
        <div className={`${size} rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/20 flex items-center justify-center group hover:scale-110 transition-all duration-300`}>
          <Icon className="w-6 h-6 text-purple-300 group-hover:text-white transition-colors" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600/10 to-cyan-600/10 blur-xl group-hover:blur-2xl transition-all"></div>
        </div>
      </div>
    </div>
  );
};

// Expandable Section Component
const ExpandableSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-all"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-6 h-6 text-gray-400" />
        ) : (
          <ChevronDown className="w-6 h-6 text-gray-400" />
        )}
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-8 pb-8 pt-2 text-gray-300 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

// Data Protection Badge
const DataProtectionBadge = ({ title, description, icon: Icon, gradient }) => {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-300`}></div>
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300">
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
};

const PrivacyPolicyPage = () => {
  const [isVisible, setIsVisible] = useState({});
  
  const securityIcons = [
    { icon: Shield, position: { x: 10, y: 20 }, delay: 0 },
    { icon: Lock, position: { x: 85, y: 25 }, delay: 1.5 },
    { icon: Database, position: { x: 15, y: 70 }, delay: 3 },
    { icon: Eye, position: { x: 80, y: 75 }, delay: 4.5 },
    { icon: Globe, position: { x: 50, y: 10 }, delay: 6 },
    { icon: Code, position: { x: 25, y: 45 }, delay: 7.5 },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[id]');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      <ThreeJSBackground />
      
      {/* Floating Security Icons */}
      {securityIcons.map((item, index) => (
        <FloatingSecurityIcon key={index} icon={item.icon} position={item.position} delay={item.delay} />
      ))}

      {/* Header */}
     <Header/>
      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 rounded-full blur-3xl"></div>
            <div className="relative w-32 h-32 mx-auto bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center">
              <Shield className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Privacy
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Policy
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Your privacy is our priority. Learn how we protect your data while delivering 
              <span className="text-cyan-400 font-bold"> AI-powered SaaS generation</span> services.
            </p>
            <div className="text-sm text-gray-400 mt-4">
              Last updated: August 30, 2025
            </div>
          </div>
        </div>
      </section>

      {/* Data Protection Badges */}
      <section id="protection-overview" className={`relative py-16 transition-all duration-1000 ${isVisible['protection-overview'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6">
            <DataProtectionBadge
              icon={Shield}
              title="End-to-End Encryption"
              description="All data transmitted and stored is encrypted using industry-standard protocols"
              gradient="from-purple-500 to-pink-500"
            />
            <DataProtectionBadge
              icon={Lock}
              title="Secure Infrastructure"
              description="Built on enterprise-grade cloud infrastructure with 99.9% uptime"
              gradient="from-cyan-500 to-blue-500"
            />
            <DataProtectionBadge
              icon={Database}
              title="Data Minimization"
              description="We only collect essential data needed for SaaS generation services"
              gradient="from-green-500 to-emerald-500"
            />
            <DataProtectionBadge
              icon={Users}
              title="User Control"
              description="Complete control over your data with easy export and deletion options"
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Introduction */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              How We Handle Your Information
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Our SaaS generation platform transforms your single-word inputs into complete startup solutions. 
              Here's exactly how we protect your privacy throughout this process.
            </p>
          </div>

          {/* Expandable Sections */}
          <ExpandableSection 
            title="Information We Collect" 
            icon={Database}
            defaultOpen={true}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                  SaaS Generation Data
                </h4>
                <ul className="space-y-2 ml-7">
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Input Keywords:</strong> Single words you provide (e.g., "shoe", "coffee", "travel")</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>SaaS Preferences:</strong> Selected ideas from our 6 generated options</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Generated Content:</strong> Code, architecture files, testing guides, deployment instructions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Usage Analytics:</strong> How you interact with generated ideas and code</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-cyan-400" />
                  Account Information
                </h4>
                <ul className="space-y-2 ml-7">
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Basic Details:</strong> Email address, username, subscription tier</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Payment Data:</strong> Processed securely through Stripe (we don't store card details)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Usage Metrics:</strong> Generation limits, premium features accessed</span>
                  </li>
                </ul>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection title="How We Use Your Data" icon={Zap}>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-white mb-2">🚀 SaaS Generation Services</h4>
                <p>Process your input keywords to generate 6 unique SaaS ideas, complete with business models, code architecture, and deployment guides.</p>
              </div>
              
              <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-white mb-2">🎯 Personalization</h4>
                <p>Improve AI suggestions based on your preferences and previously liked ideas to deliver more relevant startup concepts.</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-white mb-2">⚡ Premium Features</h4>
                <p>For paid subscribers: live preview generation, automatic deployment to cloud platforms, custom domain setup, and priority support.</p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-white mb-2">📊 Service Improvement</h4>
                <p>Analyze usage patterns to enhance our AI models, identify popular SaaS categories, and optimize generation speed.</p>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection title="Data Sharing & Third Parties" icon={Globe}>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-2">We Never Sell Your Data</h4>
                  <p>Your SaaS ideas, generated code, and personal information are never sold to third parties or used for advertising.</p>
                </div>
              </div>
              
              <h4 className="font-semibold text-white mt-6 mb-3">Limited Sharing for Service Delivery:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h5 className="font-semibold text-cyan-400 mb-2">Cloud Infrastructure</h5>
                  <p className="text-sm">AWS/Google Cloud for secure hosting and AI processing</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h5 className="font-semibold text-purple-400 mb-2">Payment Processing</h5>
                  <p className="text-sm">Stripe for secure subscription and payment handling</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h5 className="font-semibold text-green-400 mb-2">Deployment Services</h5>
                  <p className="text-sm">Vercel/Netlify for automatic deployment (premium users)</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h5 className="font-semibold text-orange-400 mb-2">Analytics</h5>
                  <p className="text-sm">Anonymized usage data for service improvement only</p>
                </div>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection title="Your Rights & Controls" icon={Users}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-purple-400" />
                  Data Access & Export
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Download all your generated SaaS ideas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Export generated code and documentation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Request account data in JSON format</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-cyan-400" />
                  Privacy Controls
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Delete specific SaaS projects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Opt out of usage analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Complete account deletion</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl border border-white/20">
              <p className="text-sm">
                <strong>Easy Access:</strong> All privacy controls are available in your account dashboard. 
                For immediate assistance, contact our privacy team at privacy@yoursaas.com
              </p>
            </div>
          </ExpandableSection>

          <ExpandableSection title="Security Measures" icon={Shield}>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h5 className="font-semibold text-white mb-2">Encryption</h5>
                  <p className="text-sm text-gray-400">AES-256 encryption for all data at rest and TLS 1.3 for data in transit</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <h5 className="font-semibold text-white mb-2">Secure Storage</h5>
                  <p className="text-sm text-gray-400">Enterprise-grade cloud infrastructure with automated backups</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h5 className="font-semibold text-white mb-2">Access Control</h5>
                  <p className="text-sm text-gray-400">Multi-factor authentication and role-based access permissions</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h4 className="font-semibold text-white mb-4">🛡️ Additional Security Features</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <ul className="space-y-2">
                    <li>• Regular security audits and penetration testing</li>
                    <li>• Automated threat detection and response</li>
                    <li>• SOC 2 Type II compliance certification</li>
                  </ul>
                  <ul className="space-y-2">
                    <li>• Zero-knowledge architecture for sensitive data</li>
                    <li>• Geographic data residency options</li>
                    <li>• 24/7 security monitoring and incident response</li>
                  </ul>
                </div>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection title="Cookie Policy" icon={Globe}>
            <div className="space-y-4">
              <p>We use cookies to enhance your SaaS generation experience:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-600/10 rounded-xl p-4 border border-green-500/20">
                  <h5 className="font-semibold text-green-400 mb-2">Essential Cookies</h5>
                  <p className="text-sm">Required for login, session management, and core platform functionality</p>
                </div>
                
                <div className="bg-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                  <h5 className="font-semibold text-blue-400 mb-2">Preference Cookies</h5>
                  <p className="text-sm">Remember your SaaS preferences and generation history</p>
                </div>
                
                <div className="bg-purple-600/10 rounded-xl p-4 border border-purple-500/20">
                  <h5 className="font-semibold text-purple-400 mb-2">Analytics Cookies</h5>
                  <p className="text-sm">Help us improve AI suggestions and platform performance (optional)</p>
                </div>
                
                <div className="bg-orange-600/10 rounded-xl p-4 border border-orange-500/20">
                  <h5 className="font-semibold text-orange-400 mb-2">Marketing Cookies</h5>
                  <p className="text-sm">Show relevant content and features (can be disabled)</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm">
                  <strong>Cookie Management:</strong> You can control cookies through your browser settings or our cookie preference center. 
                  Note that disabling essential cookies may affect platform functionality.
                </p>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection title="Data Retention & Deletion" icon={Database}>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-400" />
                    Free Tier Users
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Generated SaaS Ideas:</strong> Stored for 30 days</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Code & Documentation:</strong> 7 days after generation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Account Data:</strong> 12 months after last activity</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Usage Analytics:</strong> Anonymized after 90 days</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                    Premium Subscribers
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Generated Projects:</strong> Unlimited storage duration</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Deployed Applications:</strong> Until subscription ends + 90 days</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Live Previews:</strong> Maintained while subscription is active</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Custom Domains:</strong> 30 days grace period after cancellation</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-xl p-6 border border-red-500/30">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                  Account Deletion Process
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🗑️</div>
                    <div><strong>Request Deletion</strong></div>
                    <div className="text-gray-400">Submit request via dashboard or email</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">⏱️</div>
                    <div><strong>30-Day Hold</strong></div>
                    <div className="text-gray-400">Grace period for account recovery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div><strong>Permanent Removal</strong></div>
                    <div className="text-gray-400">All data completely deleted</div>
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection title="International Data Transfers" icon={Globe}>
            <div className="space-y-4">
              <div className="bg-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                <h4 className="font-semibold text-blue-400 mb-2">🌍 Global Infrastructure</h4>
                <p className="text-sm">Our SaaS generation platform operates across multiple regions to ensure fast, reliable service worldwide.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-white mb-2">Data Processing Regions</h5>
                  <ul className="text-sm space-y-1">
                    <li>• United States (Primary)</li>
                    <li>• European Union (GDPR compliant)</li>
                    <li>• Canada (PIPEDA compliant)</li>
                    <li>• Australia (Privacy Act compliant)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-white mb-2">Legal Safeguards</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Standard Contractual Clauses (SCCs)</li>
                    <li>• Data Processing Agreements (DPAs)</li>
                    <li>• Regional data residency options</li>
                    <li>• Cross-border transfer notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection title="Children's Privacy" icon={Users}>
            <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-6 border border-orange-500/30">
              <div className="text-center mb-4">
                <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white text-lg">Age Restriction Policy</h4>
              </div>
              <div className="space-y-4 text-sm">
                <p>
                  <strong>Minimum Age Requirement:</strong> Our SaaS generation platform is designed for users aged 16 and above. 
                  We do not knowingly collect personal information from children under 16.
                </p>
                <p>
                  <strong>Parental Notice:</strong> If we discover that a child under 16 has provided us with personal information, 
                  we will delete such information from our systems within 30 days.
                </p>
                <p>
                  <strong>Educational Use:</strong> For educational institutions wishing to use our platform for coding education, 
                  please contact our education team for special arrangements and parental consent procedures.
                </p>
              </div>
            </div>
          </ExpandableSection>
        </div>
      </section>

      {/* Contact & Support Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Questions About Your Privacy?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Our privacy team is here to help. Reach out with any questions about how we handle your data 
              or to exercise your privacy rights.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white">Privacy Team</h4>
                <p className="text-sm text-gray-400">privacy@yoursaas.com</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white">General Support</h4>
                <p className="text-sm text-gray-400">support@yoursaas.com</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white">Security Team</h4>
                <p className="text-sm text-gray-400">security@yoursaas.com</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                <strong>Response Time:</strong> We respond to privacy inquiries within 48 hours and 
                complete data requests within 30 days as required by applicable privacy laws.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer Links */}
         <Footer/>
      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float-security {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-20px) translateX(8px) rotate(3deg) scale(1.05); }
          50% { transform: translateY(-10px) translateX(-12px) rotate(-2deg) scale(0.98); }
          75% { transform: translateY(15px) translateX(5px) rotate(1deg) scale(1.02); }
        }
        .animate-float-security {
          animation: float-security 8s ease-in-out infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease-in-out infinite;
        }
        .opacity-0 {
          opacity: 0;
        }
        .translate-y-10 {
          transform: translateY(40px);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7c3aed, #0891b2);
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicyPage;