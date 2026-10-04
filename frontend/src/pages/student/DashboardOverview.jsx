import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { Trophy, CheckCircle, Code, HelpCircle, Calendar, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardOverview = ({ setActiveTab }) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalCodingProblems: 0,
    problemsAttempted: 0,
    problemsSolved: 0,
    remainingProblems: 0,
    totalMCQsAttempted: 0,
    averageMCQScore: 0,
    accuracyPercentage: 0
  });
  
  // We can fetch today's problem just like we did before
  const [todayProblem, setTodayProblem] = useState(null);

  useEffect(() => {
    fetchProgress();
    fetchTodayProblem();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await axios.get('/api/users/me/progress', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setStats(res.data);
    } catch (err) {}
  };
  
  const fetchTodayProblem = async () => {
    try {
      const res = await axios.get('/api/problems', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      if (res.data && res.data.data && res.data.data.length > 0) {
        setTodayProblem(res.data.data[0]); // Getting the first problem
      }
    } catch (err) {}
  };

  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row justify-between md:items-end bg-brand-dark p-6 rounded-2xl border border-white/10 shadow-lg gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full flex-shrink-0 animate-pulse hidden sm:block">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full rounded-full object-contain shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
            <p className="text-gray-400">Keep up your streak! You have a <span className="text-white font-bold">{user?.currentStreak}</span> day streak going.</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-400">Total Points</p>
            <p className="text-3xl font-bold text-brand-accent">{user?.points}</p>
          </div>
          <div className="h-12 w-px bg-white/10"></div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Platform Rank</p>
            <p className="text-3xl font-bold text-yellow-400">#--</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">Your Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <GlassCard className="p-4 text-center border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-400 mb-1">Total Problems</p>
          <p className="text-2xl font-bold text-white">{stats.totalCodingProblems}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center border-l-4 border-l-cyan-500">
          <p className="text-sm text-gray-400 mb-1">Solved</p>
          <p className="text-2xl font-bold text-white">{stats.problemsSolved}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center border-l-4 border-l-green-500">
          <p className="text-sm text-gray-400 mb-1">Accuracy</p>
          <p className="text-2xl font-bold text-white">{stats.accuracyPercentage}%</p>
        </GlassCard>
        <GlassCard className="p-4 text-center border-l-4 border-l-purple-500">
          <p className="text-sm text-gray-400 mb-1">MCQs Attempted</p>
          <p className="text-2xl font-bold text-white">{stats.totalMCQsAttempted}</p>
        </GlassCard>
      </div>

      {todayProblem && (
        <div className="mb-10 relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-blue-500 to-cyan-400">
          <div className="bg-brand-dark rounded-2xl p-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold mb-4 border border-blue-500/30">
                DAILY CHALLENGE • DAY {todayProblem.day}
              </div>
              <h2 className="text-3xl font-bold mb-3">{todayProblem.title}</h2>
              <p className="text-gray-400 mb-6 max-w-2xl">
                 New day, new challenge. Solve this problem to increase your streak and earn points on the leaderboard.
              </p>
              <Link to={`/problem/${todayProblem.id}`} className="inline-flex items-center gap-2 bg-white text-brand-dark px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                <Play size={18} fill="currentColor" /> Solve Now
              </Link>
            </div>
            <div className="w-48 h-48 rounded-full border-[8px] border-white/5 flex items-center justify-center flex-shrink-0">
               <div className="text-center">
                 <p className="text-sm text-gray-500 font-medium">Difficulty</p>
                 <p className={`text-2xl font-bold ${todayProblem.difficulty === 'Easy' ? 'text-green-400' : todayProblem.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                   {todayProblem.difficulty}
                 </p>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="hover:border-cyan-500/30 cursor-pointer transition-colors" onClick={() => setActiveTab('coding')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Code className="text-blue-400" />
            </div>
            <span className="text-blue-400 text-sm font-bold bg-blue-500/10 px-3 py-1 rounded-full">Continue</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Coding Practice</h3>
          <p className="text-gray-400 text-sm">Jump back into algorithms and data structures. You have {stats.remainingProblems} problems left.</p>
        </GlassCard>

        <GlassCard className="hover:border-purple-500/30 cursor-pointer transition-colors" onClick={() => setActiveTab('mcqs')}>
           <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <HelpCircle className="text-purple-400" />
            </div>
            <span className="text-purple-400 text-sm font-bold bg-purple-500/10 px-3 py-1 rounded-full">Practice</span>
          </div>
          <h3 className="text-xl font-bold mb-2">MCQ Practice</h3>
          <p className="text-gray-400 text-sm">Test your core computer science concepts with quick 1-minute quizzes.</p>
        </GlassCard>
      </div>

    </div>
  );
};

export default DashboardOverview;
