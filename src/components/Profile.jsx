// ProfilePage.js — Badass, Clean, No Bugs
import React, { useState, useEffect } from 'react';
import {
  User, TrendingUp, Code, Lightbulb, Heart, Calendar, Zap,
  Trophy, Target, Activity, Clock, FileCode, AlertCircle, Loader
} from 'lucide-react';
import Footer from './Footer';
import Header from './Header'
const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
          <p className="text-gray-300 mt-4 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white mt-4">Something went wrong</h2>
          <p className="text-gray-300 mt-2 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-gray-400">No data found.</p>
      </div>
    );
  }

  const { user, achievements = [] } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <Header/>
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 to-cyan-600/40 rounded-full blur-xl scale-110"></div>
            <div className="relative w-24 h-24 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
            {user?.name}
          </h1>
          <p className="text-gray-300 text-lg">{user?.email}</p>
          <p className="text-gray-500 mt-2 flex items-center justify-center gap-1">
            <Calendar className="w-4 h-4" />
            Member since {new Date(user?.joinDate).toLocaleDateString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Lightbulb, title: 'Ideas Generated', value: profile.totalIdeas, gradient: 'from-purple-500 to-pink-500' },
            { icon: Code, title: 'Code Projects', value: profile.totalCodeProjects, gradient: 'from-cyan-500 to-blue-500' },
            { icon: FileCode, title: 'Files Created', value: profile.totalFilesGenerated, gradient: 'from-green-500 to-emerald-500' },
            { icon: Heart, title: 'Liked Ideas', value: profile.likedIdeas, gradient: 'from-red-500 to-pink-500' }
          ].map((stat, i) => (
            <div
              key={i}
              className="group bg-white/8 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              <p className="text-gray-300 font-medium">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Streak Badge */}
        <div className="flex justify-center mb-12">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg border border-yellow-500/30 rounded-2xl px-8 py-4 flex items-center space-x-4 hover:scale-105 transition-transform">
            <Zap className="w-8 h-8 text-yellow-400" />
            <div className="text-center">
              <h3 className="text-2xl font-bold text-yellow-300">{profile.generationStreak || 0} Days</h3>
              <p className="text-gray-300 text-sm">🔥 Generation Streak</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Trophy className="w-6 h-6 mr-3 text-yellow-400" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'idea_generator', icon: Lightbulb, title: 'Idea Generator', desc: '25+ ideas' },
              { id: 'code_master', icon: Code, title: 'Code Master', desc: '10+ codebases' },
              { id: 'curator', icon: Heart, title: 'Curator', desc: '15+ likes' },
              { id: 'speed_demon', icon: Zap, title: 'Speed Demon', desc: '7-day streak' },
              { id: 'file_creator', icon: FileCode, title: 'File Creator', desc: '100+ files' },
              { id: 'tech_explorer', icon: Target, title: 'Tech Explorer', desc: '5+ stacks' }
            ].map((ach) => {
              const data = achievements.find(a => a.id === ach.id) || { earned: false, progress: 0, target: 1 };
              const percent = Math.min((data.progress / data.target) * 100, 100);

              return (
                <div
                  key={ach.id}
                  className={`p-5 rounded-xl border transition-all ${
                    data.earned
                      ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/40'
                      : 'bg-white/5 border-white/10 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center`}>
                      <ach.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{ach.title}</h3>
                      <p className="text-gray-400 text-sm">{ach.desc}</p>
                    </div>
                    {data.earned && (
                      <Trophy className="w-5 h-5 text-yellow-400 ml-auto" fill="currentColor" />
                    )}
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-1000 ${
                        data.earned ? 'opacity-100' : 'opacity-70'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{data.progress}/{data.target}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-3 text-purple-400" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {profile.recentActivity?.length > 0 ? (
              profile.recentActivity.map((act, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{act.title}</p>
                    <p className="text-gray-400 text-sm mt-1">{act.description}</p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {act.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ProfilePage;