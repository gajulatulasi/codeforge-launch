import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Trophy, Target } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image Setup */}
      <div 
        className="absolute inset-0 z-0 opacity-40 mix-blend-screen"
        style={{ 
          backgroundImage: "url('/hero_background.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-brand-dark" />

      <div className="flex-grow z-10 flex flex-col items-center justify-center px-6 text-center pt-20 pb-32">
        <div className="mb-8 p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl animate-pulse">
          <img src="/logo.jpg" alt="The Coding Club Logo" className="w-24 h-24 object-contain rounded-full" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="text-white">Welcome to </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 uppercase">
            The Coding Club
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-12 font-light">
          Code Daily. Build Consistency. Forge Your Future.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <Link to="/register" className="flex items-center justify-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1">
            Start Forging Now <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="flex items-center justify-center gap-2 glass glass-hover text-white px-8 py-4 rounded-full font-bold text-lg">
            Login
          </Link>
        </div>
      </div>

      <div className="z-10 max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="text-center group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
            <Code className="text-blue-400" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">Daily Challenges</h3>
          <p className="text-gray-400 leading-relaxed">
            A new curated problem unlocks every single day. Keep your skills sharp and stay consistent.
          </p>
        </GlassCard>

        <GlassCard className="text-center group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 mx-auto mb-6 bg-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500/40 transition-colors">
            <Target className="text-cyan-400" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">Build Streaks</h3>
          <p className="text-gray-400 leading-relaxed">
            Track your progress visually with heatmaps and streak counters. Never miss a day.
          </p>
        </GlassCard>

        <GlassCard className="text-center group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 mx-auto mb-6 bg-purple-500/20 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/40 transition-colors">
            <Trophy className="text-purple-400" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">Compete & Rank</h3>
          <p className="text-gray-400 leading-relaxed">
            Earn points, climb the global leaderboard, and unlock exclusive achievement badges.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default LandingPage;
