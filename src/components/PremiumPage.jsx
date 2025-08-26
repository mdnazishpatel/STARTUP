import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Preload } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Crown,
  Shield,
  Brain,
  Cpu,
  Database,
  Rocket,
  Sparkles,
  Code,
  Check,
  X,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// Error Boundary
class PremiumPageErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error('PremiumPage Error:', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <p className="text-lg text-gray-400 mb-8">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl text-white font-semibold hover:scale-105 transition-all"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Three.js Background (Same as CreatePage)
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

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = nodes[i].position.distanceTo(nodes[j].position);
          if (distance < 3 && Math.random() > 0.7) {
            const geometry = new THREE.BufferGeometry().setFromPoints([nodes[i].position, nodes[j].position]);
            const material = new THREE.LineBasicMaterial({
              color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.6, 0.4),
              transparent: true,
              opacity: 0.2,
            });
            brainGroup.add(new THREE.Line(geometry, material));
          }
        }
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

// Floating 3D Icons
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

const PremiumPage = () => {
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' or 'yearly'
  const navigate = useNavigate();

  const floatingIcons = [
    { icon: Crown, position: { x: 10, y: 25 }, delay: 0 },
    { icon: Zap, position: { x: 85, y: 20 }, delay: 1 },
    { icon: Shield, position: { x: 15, y: 70 }, delay: 2 },
    { icon: Rocket, position: { x: 75, y: 75 }, delay: 3 },
    { icon: Sparkles, position: { x: 40, y: 15 }, delay: 4 },
    { icon: Code, position: { x: 30, y: 50 }, delay: 5 },
  ];

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 9, yearly: 8 },
      description: 'Perfect for solo founders and side projects',
      popular: false,
      features: [
        { text: '3 AI-generated startups/month', icon: Brain },
        { text: 'Basic tech stack suggestions', icon: Cpu },
        { text: '1 code generation per idea', icon: Code },
        { text: 'Email support', icon: Users },
      ],
      cta: 'Start Free Trial',
      color: 'from-gray-500 to-gray-600',
    },
    {
      name: 'Pro',
      price: { monthly: 29, yearly: 24 },
      description: 'For serious founders building real startups',
      popular: true,
      features: [
        { text: 'Unlimited AI startups', icon: Brain },
        { text: 'Advanced tech stack & architecture', icon: Cpu },
        { text: 'Full-stack code generation', icon: Code },
        { text: 'Market size & revenue models', icon: TrendingUp },
        { text: 'Competitive analysis', icon: Users },
        { text: 'Priority support', icon: Shield },
        { text: 'Export to GitHub', icon: Database },
      ],
      cta: 'Upgrade to Pro',
      color: 'from-purple-600 to-cyan-600',
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, yearly: 79 },
      description: 'For teams, incubators, and accelerators',
      popular: false,
        features: [
        { text: 'Everything in Pro, plus', icon: Check },
        { text: 'Team collaboration workspace', icon: Users },
        { text: 'API access & webhooks', icon: Database },
        { text: 'Custom AI training', icon: Brain },
        { text: 'SLA & dedicated support', icon: Shield },
        { text: 'On-premise deployment option', icon: Cpu },
        { text: 'White-label solutions', icon: Sparkles },
      ],
      cta: 'Contact Sales',
      color: 'from-green-600 to-teal-600',
    },
  ];

  return (
    <PremiumPageErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
        <Header />
        <ThreeJSBackground />

        {floatingIcons.map((item, index) => (
          <Floating3DIcon key={index} icon={item.icon} position={item.position} delay={item.delay} />
        ))}

        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6 mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Build Faster.
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Scale Smarter.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Unlock the full power of AI-driven startup creation with advanced features, unlimited generations, and enterprise-grade tools.
            </p>

            {/* Billing Toggle */}
            <div className="flex justify-center mt-8">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 flex items-center">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Star className="w-4 h-4 text-yellow-300" />
                  Yearly <span className="text-sm opacity-80">(Save 20%)</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className={`relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-cyan-500/50 transition-all group ${
                  plan.popular ? 'ring-2 ring-purple-500/50 scale-105 md:scale-110' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-white">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <Icon className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature.text}</span>
                      </li>
                    );
                  })}
                </ul>

                <button
                  onClick={() =>
                    plan.name === 'Enterprise'
                      ? window.open('mailto:sales@yourstartupai.com', '_blank')
                      : navigate('/checkout', { state: { plan: plan.name, price: plan.price[billingCycle] } })
                  }
                  className={`w-full py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                    plan.popular
                      ? `bg-gradient-to-r ${plan.color} text-white hover:from-purple-700 hover:to-cyan-700`
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {plan.cta}
                  {plan.name !== 'Enterprise' && <ArrowRight className="inline w-5 h-5 ml-2" />}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Security & Trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-24 max-w-2xl mx-auto"
          >
            <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-400" />
                <span>No Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />

        {/* Global Styles */}
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
        `}</style>
      </div>
    </PremiumPageErrorBoundary>
  );
};

export default PremiumPage;