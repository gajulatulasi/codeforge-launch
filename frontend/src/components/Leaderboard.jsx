import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Filter, Award, Target, Flame } from 'lucide-react';
import GlassCard from './GlassCard';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: 'All',
    year: 'All',
    timeframe: 'Overall' // Overall, Weekly, Monthly
  });

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`/api/users/leaderboard?${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [filters]);

  const getRankBadge = (index) => {
    if (index === 0) return <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold border border-yellow-500/50"><Trophy size={16}/></div>;
    if (index === 1) return <div className="w-8 h-8 rounded-full bg-gray-400/20 text-gray-300 flex items-center justify-center font-bold border border-gray-400/50"><Trophy size={16}/></div>;
    if (index === 2) return <div className="w-8 h-8 rounded-full bg-orange-700/20 text-orange-500 flex items-center justify-center font-bold border border-orange-700/50"><Trophy size={16}/></div>;
    return <span className="text-gray-500 font-bold w-8 text-center">{index + 1}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-yellow-400" /> Leaderboard</h2>
        
        <div className="flex flex-wrap gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
           <div className="flex items-center gap-2 px-2 text-sm text-gray-400"><Filter size={16}/> Filters:</div>
           <select 
             value={filters.department} 
             onChange={(e) => setFilters({...filters, department: e.target.value})}
             className="bg-[#1a1a2e] border border-white/10 rounded px-3 py-1 text-sm text-white outline-none focus:border-cyan-500"
           >
             <option value="All">All Departments</option>
             <option value="CSE">CSE</option>
             <option value="ECE">ECE</option>
             <option value="EEE">EEE</option>
             <option value="MECH">MECH</option>
             <option value="CIVIL">CIVIL</option>
           </select>

           <select 
             value={filters.year} 
             onChange={(e) => setFilters({...filters, year: e.target.value})}
             className="bg-[#1a1a2e] border border-white/10 rounded px-3 py-1 text-sm text-white outline-none focus:border-cyan-500"
           >
             <option value="All">All Years</option>
             <option value="1">1st Year</option>
             <option value="2">2nd Year</option>
             <option value="3">3rd Year</option>
             <option value="4">4th Year</option>
           </select>

           <select 
             value={filters.timeframe} 
             onChange={(e) => setFilters({...filters, timeframe: e.target.value})}
             className="bg-[#1a1a2e] border border-white/10 rounded px-3 py-1 text-sm text-white outline-none focus:border-cyan-500"
           >
             <option value="Overall">Overall</option>
             <option value="Weekly">Weekly</option>
             <option value="Monthly">Monthly</option>
           </select>
        </div>
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center animate-pulse text-cyan-400">Updating ranks...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Dept / Year</th>
                  <th className="px-6 py-4 text-center">Solved</th>
                  <th className="px-6 py-4 text-center">Streak</th>
                  <th className="px-6 py-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{getRankBadge(i)}</td>
                    <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{u.department || 'N/A'} - Year {u.year || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                       <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold">
                         <Target size={12}/> {u.completedProblems?.length || 0}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-400 px-2 py-1 rounded text-xs font-bold">
                         <Flame size={12}/> {u.currentStreak || 0}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="inline-flex items-center gap-1 text-cyan-400 font-bold text-lg">
                         {u.points} <Award size={16}/>
                       </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No students found for this criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Leaderboard;
