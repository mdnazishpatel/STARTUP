import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronRight, Sparkles, Code, Rocket, Play, ArrowRight, Check, Brain, Cpu, Database } from 'lucide-react';
import * as THREE from 'three';
import Header from './Header';
import Footer from './Footer';
// Placeholder Header
const DefaultHeader = () => (
  <div className="h-16 bg-slate-950 flex items-center justify-center">
    <Header/>
    <span className="text-gray-400">Header Placeholder</span>
  </div>
);

// Error Boundary Component
class HomePageErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught:', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <p className="text-lg text-gray-400 mb-8">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl text-white font-semibold hover:scale-105 transition-all"
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

// Restored Three.js Hero Background (Globe with Stars)
const ThreeJSHeroBackground = () => {
  const mountRef = useRef(null);
  const frameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

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
      const brainGeometry = new THREE.SphereGeometry(2, 16, 16); // Optimized geometry
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
      const nodeConnections = [];

      // Restore 50 nodes on the sphere
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

      // Restore node connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = nodes[i].position.distanceTo(nodes[j].position);
          if (distance < 3 && Math.random() > 0.7) {
            const geometry = new THREE.BufferGeometry();
            const material = new THREE.LineBasicMaterial({
              color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.6, 0.4),
              transparent: true,
              opacity: 0.2,
            });
            const points = [nodes[i].position, nodes[j].position];
            geometry.setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            nodeConnections.push(line);
            brainGroup.add(line);
          }
        }
      }

      scene.add(brainGroup);

      const particleCount = 100; // Reduced from 200 for performance
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const velocities = [];

      // Restore starry particles
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 50;
        positions[i3 + 1] = (Math.random() - 0.5) * 30;
        positions[i3 + 2] = (Math.random() - 0.5) * 30;
        const color = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.6);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        velocities.push({
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        });
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.6,
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      camera.position.set(0, 0, 15);

      const handleMouseMove = (event) => {
        mouseRef.current = {
          x: (event.clientX / window.innerWidth) * 2 - 1,
          y: -(event.clientY / window.innerHeight) * 2 + 1,
        };
      };

      window.addEventListener('mousemove', handleMouseMove);

      let time = 0;
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        time += 0.01;
        brainGroup.rotation.y += 0.002;
        brainGroup.rotation.x += mouseRef.current.y * 0.001;
        brainGroup.rotation.y += mouseRef.current.x * 0.001;
        nodes.forEach((node, index) => {
          node.material.opacity = 0.5 + Math.sin(time * 2 + index * 0.1) * 0.3;
          const scale = 1 + Math.sin(time * 3 + index * 0.2) * 0.2;
          node.scale.setScalar(scale);
        });
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          positions[i3] += velocities[i].x;
          positions[i3 + 1] += velocities[i].y;
          positions[i3 + 2] += velocities[i].z;
          if (Math.abs(positions[i3]) > 25) velocities[i].x *= -1;
          if (Math.abs(positions[i3 + 1]) > 15) velocities[i].y *= -1;
          if (Math.abs(positions[i3 + 2]) > 15) velocities[i].z *= -1;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        nodeConnections.forEach((connection, index) => {
          connection.material.opacity = 0.1 + Math.sin(time * 2 + index * 0.3) * 0.1;
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
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (error) {
      console.error('ThreeJSHeroBackground Error:', error);
      return () => {};
    }
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
};

// Floating 3D Icons Component
const Floating3DIcon = ({ icon: Icon, position, delay = 0 }) => {
  if (!Icon) return null;
  return (
    <div
      className="absolute z-10 animate-float-3d opacity-70"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        animationDelay: `${delay}s`,
        animationDuration: '6s',
      }}
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/20 flex items-center justify-center group hover:scale-110 transition-all duration-300">
          <Icon className="w-8 h-8 text-purple-300 group-hover:text-white transition-colors" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/10 to-cyan-600/10 blur-xl group-hover:blur-2xl transition-all"></div>
        </div>
      </div>
    </div>
  );
};

// Idea Orb with Fixed Styling
const IdeaOrb = ({ currentExample, examples }) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const orbRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (orbRef.current && hovered) {
        const rect = orbRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        const tiltX = (y / rect.height) * 10;
        const tiltY = -(x / rect.width) * 10;
        orbRef.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (orbRef.current) {
        orbRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      }
    };
  }, [hovered]);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 1000);
  };

  // Memoize particle styles to prevent re-renders
  const particleStyles = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationName: clicked ? 'explode' : 'particle-float',
      animationDuration: clicked ? '1s' : `${2 + Math.random() * 2}s`,
      animationTimingFunction: clicked ? 'ease-out' : 'ease-in-out',
      animationIterationCount: clicked ? '1' : 'infinite',
      animationDelay: `${i * 0.2}s`,
    }));
  }, [clicked]);

  return (
    <div
      className="relative max-w-3xl mx-auto mt-16 group z-20"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-gradient-radial from-purple-600/30 to-transparent rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
      <div
        ref={orbRef}
        className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-purple-500/50 animate-pulse will-change-transform"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-cyan-600/30 rounded-full animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
        <div className="relative z-10 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            {examples[currentExample] || 'Loading...'}
          </h3>
          <p className={`text-gray-300 mt-2 text-sm sm:text-base transition-all duration-500 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            AI-Generated Startup Idea
          </p>
        </div>
        {particleStyles.map((style, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 ${hovered ? 'group-hover:opacity-60' : ''}`}
            style={{
              left: style.left,
              top: style.top,
              animationName: style.animationName,
              animationDuration: style.animationDuration,
              animationTimingFunction: style.animationTimingFunction,
              animationIterationCount: style.animationIterationCount,
              animationDelay: style.animationDelay,
            }}
          />
        ))}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <Rocket className="absolute w-10 h-10 text-purple-300 transform -translate-x-28 translate-y-12 rotate-45 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all" />
          <Brain className="absolute w-10 h-10 text-cyan-300 transform translate-x-28 -translate-y-12 -rotate-45 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(103,232,249,0.5)] transition-all" />
          <Code className="absolute w-10 h-10 text-purple-300 transform translate-y-28 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all" />
        </div>
      </div>
      <style jsx>{`
        @keyframes explode {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(2); opacity: 0; }
        }
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const HomePage = () => {
  const [currentExample, setCurrentExample] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const examples = ['gym', 'coffee', 'travel', 'fintech', 'education', 'health', 'gaming'];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Our advanced neural networks analyze market trends, consumer behavior, and emerging technologies to generate innovative startup concepts tailored to high-demand industries.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Cpu,
      title: 'Complete Tech Stack',
      description: 'Receive production-ready codebases built with modern frameworks like React, Node.js, and cloud-native solutions, including APIs and deployment guides for rapid launch.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Database,
      title: 'Market-Ready Solutions',
      description: 'Each startup idea includes a detailed business model, competitive analysis, pricing strategy, and a go-to-market plan to ensure immediate viability.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const floatingIcons = [
    { icon: Brain, position: { x: 15, y: 25 }, delay: 0 },
    { icon: Cpu, position: { x: 80, y: 20 }, delay: 1 },
    { icon: Database, position: { x: 20, y: 65 }, delay: 2 },
    { icon: Rocket, position: { x: 75, y: 70 }, delay: 3 },
    { icon: Sparkles, position: { x: 45, y: 15 }, delay: 4 },
    { icon: Code, position: { x: 30, y: 40 }, delay: 5 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % examples.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [examples]);

  useEffect(() => {
    try {
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
    } catch (error) {
      console.error('IntersectionObserver Error:', error);
    }
  }, []);

  return (
    <HomePageErrorBoundary>
     
      <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
        {typeof Header !== 'undefined' ? <Header /> : <DefaultHeader />}
        <ThreeJSHeroBackground />

        {floatingIcons.map((item, index) => (
          <Floating3DIcon key={index} icon={item.icon} position={item.position} delay={item.delay} />
        ))}

        <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-40">
          <div className="text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Transform
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                  {examples[currentExample]}
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Into Startups
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Our cutting-edge AI generates <span className="text-cyan-400 font-bold">complete startup blueprints</span> in seconds, including production-ready code, detailed business models, and actionable strategies. Turn your vision into a thriving startup with minimal effort and maximum impact.
              </p>
            </div>

            <IdeaOrb currentExample={currentExample} examples={examples} />

            <div className="flex justify-center mt-8">
              <button className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group bg-white/5 px-6 py-3 rounded-full hover:bg-white/10">
                <Play className="w-5 h-5" />
                <span className="font-medium">Watch AI in Action (2 min)</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        <section id="features" className={`relative py-32 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Next-Gen AI Technology
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Powered by advanced neural networks and machine learning, our platform delivers innovative, market-ready solutions to help you launch your startup with confidence and speed.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div key={index} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-500`}></div>
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 hover:bg-white/10 transition-all duration-500 hover:border-white/20">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-6 text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-lg">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-40">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-6xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Ready to Build Your Startup?
              </span>
            </h2>
            <p className="text-2xl text-gray-300 mb-16 max-w-3xl mx-auto">
              Join a community of innovators using our AI-powered platform to transform simple ideas into successful startups. Start building today with tools designed for speed and scalability.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group bg-gradient-to-r from-purple-600 to-cyan-600 px-10 py-5 rounded-2xl font-bold text-xl hover:from-purple-700 hover:to-cyan-700 transition-all flex items-center justify-center hover:scale-105">
                Start Generating Now
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-5 border-2 border-white/30 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all hover:border-white/50">
                Watch Demo
              </button>
            </div>
            <div className="flex items-center justify-center space-x-12 mt-16 text-gray-400">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-medium">3 free generations</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        <style jsx global>{`
          @keyframes float-3d {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
            33% { transform: translateY(-15px) translateX(10px) rotate(5deg) scale(1.1); }
            66% { transform: translateY(8px) translateX(-5px) rotate(-3deg) scale(0.95); }
          }
          .animate-float-3d {
            animation: float-3d 6s ease-in-out infinite;
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .animate-pulse {
            animation: pulse 3s ease-in-out infinite;
          }
          .opacity-0 {
            opacity: 0;
          }
          .translate-y-10 {
            transform: translateY(40px);
          }
          .will-change-transform {
            will-change: transform, opacity;
          }
        `}</style>
        <Footer/>
      </div>
    </HomePageErrorBoundary>
  );
};

export default HomePage;