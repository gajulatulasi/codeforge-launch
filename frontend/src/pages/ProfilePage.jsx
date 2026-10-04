import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Award, Flame, CheckSquare, Star } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Stats Summary */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="text-center py-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-brand-accent to-cyan-400 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-gray-400 mb-6">{user.email}</p>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full font-bold">
               <Star size={18} fill="currentColor" /> {user.points} Total Points
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-bold mb-4 border-b border-white/10 pb-2">Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-2"><Flame size={16} className="text-orange-500"/> Current Streak</span>
                <span className="font-bold">{user.currentStreak} Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-2"><Award size={16} className="text-yellow-500"/> Longest Streak</span>
                <span className="font-bold">{user.longestStreak} Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-2"><CheckSquare size={16} className="text-green-500"/> Solved Problems</span>
                <span className="font-bold">{user.completedProblems?.length || 0}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Badges & Achievements */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <h3 className="text-xl font-bold mb-6">Achievements & Badges</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {/* Badges based on streaks */}
               <div className={`text-center p-4 rounded-xl border ${user.longestStreak >= 7 ? 'bg-orange-500/10 border-orange-500/30 text-white' : 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-50'}`}>
                 <Flame size={32} className={`mx-auto mb-2 ${user.longestStreak >= 7 ? 'text-orange-500' : ''}`} />
                 <p className="font-bold text-sm">7-Day Streak</p>
               </div>
               <div className={`text-center p-4 rounded-xl border ${user.longestStreak >= 30 ? 'bg-red-500/10 border-red-500/30 text-white' : 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-50'}`}>
                 <Flame size={32} className={`mx-auto mb-2 ${user.longestStreak >= 30 ? 'text-red-500' : ''}`} />
                 <p className="font-bold text-sm">30-Day Streak</p>
               </div>
               <div className={`text-center p-4 rounded-xl border ${user.longestStreak >= 100 ? 'bg-purple-500/10 border-purple-500/30 text-white' : 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-50'}`}>
                 <Flame size={32} className={`mx-auto mb-2 ${user.longestStreak >= 100 ? 'text-purple-500' : ''}`} />
                 <p className="font-bold text-sm">100-Day Centurion</p>
               </div>
               <div className={`text-center p-4 rounded-xl border ${(user.completedProblems?.length || 0) >= 50 ? 'bg-yellow-500/10 border-yellow-500/30 text-white' : 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-50'}`}>
                 <Trophy size={32} className={`mx-auto mb-2 ${(user.completedProblems?.length || 0) >= 50 ? 'text-yellow-500' : ''}`} />
                 <p className="font-bold text-sm">50 Problems</p>
               </div>
            </div>
          </GlassCard>

          {/* Activity Heatmap Mockup */}
          <GlassCard>
             <h3 className="text-xl font-bold mb-6">Activity Heatmap</h3>
             <div className="w-full bg-black/20 p-4 rounded border border-white/5 overflow-x-auto">
               {/* Simple UI Mockup of a heatmap */}
               <div className="flex gap-1 min-w-max">
                 {Array.from({ length: 52 }).map((_, col) => (
                   <div key={col} className="flex flex-col gap-1">
                     {Array.from({ length: 7 }).map((_, row) => {
                       // Randomize heatmap slightly for demo
                       const intensity = Math.random();
                       let bg = 'bg-white/5';
                       if (intensity > 0.9) bg = 'bg-blue-400';
                       else if (intensity > 0.7) bg = 'bg-blue-600';
                       else if (intensity > 0.5) bg = 'bg-blue-800';
                       else if (intensity > 0.3) bg = 'bg-blue-900';
                       
                       return <div key={`${col}-${row}`} className={`w-3 h-3 rounded-sm ${bg}`}></div>
                     })}
                   </div>
                 ))}
               </div>
               <div className="flex justify-between text-xs text-gray-500 mt-2">
                 <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
               </div>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
