import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

// Floating 3D Icon Component
const Floating3DIcon = ({ icon: Icon, position, delay = 0 }) => {
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

// Animated Background Component
const AnimatedBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/30 to-cyan-600/30 rounded-full opacity-20 blur-3xl animate-float-3d" style={{ animationDelay: '0s' }}></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 rounded-full opacity-15 blur-3xl animate-float-3d" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-bl from-cyan-600/30 to-blue-600/30 rounded-full opacity-10 blur-3xl animate-float-3d" style={{ animationDelay: '2s' }}></div>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 opacity-60"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animation: `particle-float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        ></div>
      ))}
      <style jsx>{`
        @keyframes particle-float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

function Login() {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  const floatingIcons = [
    { icon: Mail, position: { x: 10, y: 20 }, delay: 0 },
    { icon: Lock, position: { x: 85, y: 15 }, delay: 1 },
    { icon: Mail, position: { x: 15, y: 70 }, delay: 2 },
  ];

 async function handleLogin(e) {
  e.preventDefault();
  setIsLoading(true);

  console.log('Attempting login with:', { mail, password: '***' });

  try {
    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mail, password }),
      credentials: 'include',
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to login');
    }

    // Check if user data exists
    if (data.user) {
      alert(`Welcome back ${data.user.name}`);
      navigate('/home');
      setMail('');
      setPassword('');
    } else {
      console.error('No user data in response:', data);
      alert('Login successful but user data missing');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert(error.message);
  } finally {
    setIsLoading(false);
  }
}

  return (
    <>
      <style jsx global>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1.5rem;
        }
        .gradient-text {
          background: linear-gradient(135deg, #ffffff, #a5b4fc, #4f46e5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glow {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
        }
        @keyframes float-3d {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-15px) translateX(10px) rotate(5deg) scale(1.1);
          }
          66% {
            transform: translateY(8px) translateX(-5px) rotate(-3deg) scale(0.95);
          }
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

      <div className="min-h-screen relative flex items-center justify-center p-6 bg-slate-950 overflow-hidden">
        <AnimatedBackground />
        {floatingIcons.map((item, index) => (
          <Floating3DIcon key={index} icon={item.icon} position={item.position} delay={item.delay} />
        ))}
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-white/20 mb-6 glow animate-float-3d">
              <img
                src="https://www.newtraderu.com/wp-content/uploads/mind-control-2.jpg"
                alt="StartupGenius Logo"
                className="w-14 h-14 object-cover rounded-2xl"
              />
            </div>
            <h1 className="text-5xl font-black gradient-text mb-3">StartupGenius</h1>
            <p className="text-xl text-gray-300">Welcome Back, Innovator!</p>
          </div>
          <div className="glass-morphism p-10 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Sign In to Your Account</h2>
              <p className="text-gray-400 text-lg">Continue Your Entrepreneurial Journey</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    required
                    autoComplete="email"
                    className={`w-full px-4 py-3 rounded-2xl bg-white/10 border ${
                      focusedField === 'email' ? 'border-purple-500 glow' : 'border-white/20'
                    } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform`}
                    placeholder="Enter your email"
                    style={{ transform: focusedField === 'email' ? 'scale(1.02)' : 'scale(1)' }}
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-300"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    required
                    className={`w-full px-4 py-3 rounded-2xl bg-white/10 border ${
                      focusedField === 'password' ? 'border-purple-500 glow' : 'border-white/20'
                    } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform`}
                    placeholder="Enter your password"
                    style={{ transform: focusedField === 'password' ? 'scale(1.02)' : 'scale(1)' }}
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group animate-gradient"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Not a member?{' '}
                <Link
                  to="/register"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
                >
                  Create an account for free
                </Link>
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  AI-Powered Ideas
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Expert Guidance
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  24/7 Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;