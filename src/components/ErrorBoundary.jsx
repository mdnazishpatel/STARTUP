import React, { Component } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-cyber-black flex items-center justify-center px-4 relative overflow-hidden">
          <div className="holo-bg absolute inset-0 pointer-events-none" />
          <div className="holo-card rounded-3xl p-8 border border-neon-red/30 backdrop-blur-2xl shadow-neon max-w-md w-full">
            <div className="text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-neon-red/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-neon-red" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-extrabold text-neon-red">Something Went Wrong</h3>
                <p className="text-neon-white/70 leading-relaxed">
                  {this.state.error.message || 'An unexpected error occurred.'}
                </p>
                <p className="text-neon-white/50 text-sm">
                  Check the console for details or try refreshing the page.
                </p>
              </div>
              <button
                onClick={() => (window.location.href = '/create')}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 shadow-neon hover:shadow-neon-cyan"
              >
                <X className="w-5 h-5" />
                <span>Back to Create</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}