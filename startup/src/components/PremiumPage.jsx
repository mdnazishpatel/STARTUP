import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Code, Zap, Rocket, Brain, FileCode, Crown, Check, X, 
  TrendingUp, Lock, Unlock, Star, Gift, ArrowRight, Infinity, Users,
  Server, Clock, Shield, Headphones, Download
} from 'lucide-react';

const PremiumPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const plans = [
    {
      name: 'Free',
      icon: Code,
      description: 'Perfect for trying out',
      price: { monthly: 0, yearly: 0 },
      color: 'gray',
      popular: false,
      features: [
        { text: '3 project generations per month', included: true },
        { text: '6 AI ideas per word', included: true },
        { text: 'Basic code templates', included: true },
        { text: 'Community support', included: true },
        { text: 'Single tech stack', included: true },
        { text: 'Advanced architecture', included: false },
        { text: 'Priority generation', included: false },
        { text: 'Custom templates', included: false },
        { text: 'API access', included: false },
      ],
      cta: 'Get Started Free'
    },
    {
      name: 'Pro',
      icon: Zap,
      description: 'For serious developers',
      price: { monthly: 29, yearly: 290 },
      color: 'cyan',
      popular: true,
      features: [
        { text: '50 project generations per month', included: true },
        { text: '6 AI ideas per word', included: true },
        { text: 'All tech stacks available', included: true },
        { text: 'Advanced architecture patterns', included: true },
        { text: 'Priority generation queue', included: true },
        { text: 'Custom code templates', included: true },
        { text: 'Email support', included: true },
        { text: 'Export to GitHub', included: true },
        { text: 'API access (1000 calls/month)', included: true },
      ],
      cta: 'Upgrade to Pro'
    },
    {
      name: 'Enterprise',
      icon: Crown,
      description: 'For teams & businesses',
      price: { monthly: 99, yearly: 990 },
      color: 'purple',
      popular: false,
      features: [
        { text: 'Unlimited project generations', included: true },
        { text: 'Unlimited AI ideas', included: true },
        { text: 'All tech stacks + custom stacks', included: true },
        { text: 'Enterprise architecture patterns', included: true },
        { text: 'Instant generation', included: true },
        { text: 'Unlimited custom templates', included: true },
        { text: 'Team collaboration (10 users)', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Unlimited API access', included: true },
        { text: 'Private cloud deployment', included: true },
        { text: 'Custom integrations', included: true },
      ],
      cta: 'Contact Sales'
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Generation',
      description: 'Advanced machine learning creates unique, production-ready code'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your code and ideas are encrypted and never shared'
    },
    {
      icon: Clock,
      title: 'Lightning Fast',
      description: 'Generate complete projects in under 30 seconds'
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      description: 'Our team helps you succeed with your projects'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Full-Stack Developer',
      company: 'TechCorp',
      text: 'This tool saved me weeks of development time. The generated code is clean and well-structured.',
      avatar: '👩‍💻'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO',
      company: 'StartupXYZ',
      text: 'We use this for rapid prototyping. Our team can now validate ideas 10x faster.',
      avatar: '👨‍💼'
    },
    {
      name: 'Emily Watson',
      role: 'Indie Maker',
      company: 'Solo Projects',
      text: 'As a solo developer, this is a game-changer. I can focus on unique features instead of boilerplate.',
      avatar: '👩‍🎨'
    }
  ];

  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! Cancel your subscription anytime with no questions asked. You\'ll have access until the end of your billing period.'
    },
    {
      question: 'What tech stacks are supported?',
      answer: 'We support 50+ tech stacks including React, Vue, Angular, Node.js, Python, Go, and more. Pro and Enterprise plans get access to all stacks.'
    },
    {
      question: 'Do I own the generated code?',
      answer: 'Absolutely! All generated code is 100% yours. Use it for commercial projects, modify it, or share it however you like.'
    },
    {
      question: 'How accurate is the AI?',
      answer: 'Our AI generates production-ready code with 99% accuracy. All code follows best practices and includes proper error handling.'
    }
  ];

  const PricingCard = ({ plan, index }) => {
    const Icon = plan.icon;
    const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
    const savings = billingCycle === 'yearly' ? Math.round(((plan.price.monthly * 12 - plan.price.yearly) / (plan.price.monthly * 12)) * 100) : 0;

    return (
      <div
        className={`relative group ${plan.popular ? 'lg:-mt-4' : ''}`}
        onMouseEnter={() => setSelectedPlan(index)}
        onMouseLeave={() => setSelectedPlan(null)}
      >
        {plan.popular && (
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
            <div className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
              <Star className="w-4 h-4" />
              <span>Most Popular</span>
            </div>
          </div>
        )}

        <div
          className={`relative bg-white/5 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 ${
            plan.popular
              ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/20 lg:scale-105'
              : 'border-white/20 hover:border-white/40'
          } ${
            selectedPlan === index ? 'scale-105 shadow-2xl' : ''
          } ${plan.popular ? 'lg:p-10' : ''}`}
        >
          {/* Animated Background */}
          <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            plan.color === 'cyan' ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10' :
            plan.color === 'purple' ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10' :
            'bg-gradient-to-br from-gray-500/5 to-gray-600/5'
          }`} />

          <div className="relative z-10">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
              plan.color === 'cyan' ? 'bg-gradient-to-br from-cyan-500 to-cyan-600' :
              plan.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
              'bg-gradient-to-br from-gray-600 to-gray-700'
            } group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-8 h-8" />
            </div>

            {/* Plan Name */}
            <h3 className="text-3xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-400 mb-6">{plan.description}</p>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-end space-x-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  ${price}
                </span>
                {price > 0 && (
                  <span className="text-gray-400 text-lg mb-2">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                )}
              </div>
              {billingCycle === 'yearly' && price > 0 && (
                <div className="mt-2 inline-flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  <Gift className="w-3 h-3" />
                  <span>Save {savings}%</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button className={`w-full py-4 rounded-xl font-semibold mb-8 transition-all duration-300 ${
              plan.popular
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 shadow-lg hover:shadow-cyan-500/50'
                : 'bg-white/10 hover:bg-white/20 border border-white/20'
            }`}>
              {plan.cta}
            </button>

            {/* Features */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                What's Included
              </p>
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-slate-950 to-cyan-900/30">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Cursor Glow */}
      <div 
        className="pointer-events-none fixed w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Header */}
      <header className="relative z-10 pt-8 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center animate-pulse-slow">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              CodeGenAI
            </span>
          </div>
          <button className="px-6 py-2.5 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105">
            Sign In
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/20 rounded-full mb-6 animate-fade-in-down">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-300">Choose Your Perfect Plan</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 animate-fade-in-up">
          <span className="block mb-2">Unlock the Power of</span>
          <span className="block bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Code Generation
          </span>
        </h1>

        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 animate-fade-in-up animation-delay-200">
          From idea to production-ready code in seconds. Choose the plan that scales with your ambitions.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center space-x-4 p-2 bg-white/5 backdrop-blur-lg border border-white/20 rounded-full animate-fade-in-up animation-delay-400">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center space-x-2 ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Yearly</span>
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Why Choose Premium?
            </span>
          </h2>
          <p className="text-xl text-gray-400">Everything you need to succeed</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Loved by Developers
            </span>
          </h2>
          <p className="text-xl text-gray-400">See what our users are saying</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                  <p className="text-xs text-cyan-400">{testimonial.company}</p>
                </div>
              </div>
              <p className="text-gray-300 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300"
            >
              <summary className="cursor-pointer p-6 font-semibold text-lg flex items-center justify-between">
                <span>{faq.question}</span>
                <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-x" />
          
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Development Workflow?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers building faster with AI. Start free, upgrade anytime.
            </p>
            
            <button className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xl font-semibold hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 inline-flex items-center space-x-3">
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span>Start Free Trial</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-sm text-gray-400 mt-4">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold">CodeGenAI</span>
            </div>
            <p className="text-gray-400 text-sm">© 2025 CodeGenAI. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PremiumPage;