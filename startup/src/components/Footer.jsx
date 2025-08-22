import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

// Footer Component
const Footer = () => {
  return (
    <footer className="relative bg-slate-950 text-white py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-8">
        {/* Social Links */}
        <div className="flex space-x-6">
          <a
            href="https://github.com/your-username" // Replace with your actual GitHub handle
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300"
          >
            <Github className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
          </a>
          <a
            href="https://twitter.com/your-username" // Replace with your actual Twitter/X handle
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300"
          >
            <Twitter className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
          </a>
          <a
            href="https://www.linkedin.com/in/your-username" // Replace with your actual LinkedIn profile URL
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300"
          >
            <Linkedin className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
          </a>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 text-gray-400 text-sm">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="/contact" className="hover:text-white transition-colors">Contact Us</a>
        </div>

        {/* Copyright */}
        <div className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} StartupGenius. All rights reserved.
        </div>
      </div>

      <style jsx>{`
        footer {
          position: relative;
          z-index: 10;
        }
        @media (max-width: 640px) {
          .flex-col {
            align-items: center;
          }
          .space-x-6 > * {
            margin: 0 8px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;