import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Award, Code, CheckCircle, AlertTriangle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const StudentProfileModal = ({ rollNumber, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/roll/${rollNumber}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfile(res.data.profile);
        setStats(res.data.stats);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch student profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (rollNumber) {
      fetchProfile();
    }
  }, [rollNumber]);

  if (!rollNumber) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/10 rounded-full p-2 transition-colors">
          <X size={20} />
        </button>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">Loading profile...</div>
        ) : error ? (
          <div className="text-red-400 text-center h-40 flex items-center justify-center">{error}</div>
        ) : profile && (
          <div className="space-y-6 mt-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <p className="text-cyan-400 font-medium">{profile.rollNumber || 'N/A'}</p>
                <p className="text-gray-400 text-sm mt-1">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Branch</p>
                <p className="font-bold text-white">{profile.branch || 'N/A'}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Year</p>
                <p className="font-bold text-white">{profile.year ? `${profile.year} Year` : 'N/A'}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <p className={`font-bold ${profile.accountStatus === 'APPROVED' ? 'text-green-400' : profile.accountStatus === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {profile.accountStatus}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Points</p>
                <p className="font-bold text-yellow-400">{profile.points}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <Award size={18} className="text-cyan-400" /> Platform Statistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-black/30 rounded-lg p-4 flex items-center justify-between border border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Code size={20} /></div>
                   <div>
                     <p className="text-sm text-gray-400">Total Code Submissions</p>
                     <p className="font-bold text-white text-xl">{stats.totalSubmissions}</p>
                   </div>
                 </div>
               </div>
               
               <div className="bg-black/30 rounded-lg p-4 flex items-center justify-between border border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><CheckCircle size={20} /></div>
                   <div>
                     <p className="text-sm text-gray-400">Problems Solved</p>
                     <p className="font-bold text-white text-xl">{profile.completedProblems ? profile.completedProblems.length : 0}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-black/30 rounded-lg p-4 flex items-center justify-between border border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><CheckCircle size={20} /></div>
                   <div>
                     <p className="text-sm text-gray-400">MCQs Attempted</p>
                     <p className="font-bold text-white text-xl">{stats.mcqsAttempted}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-black/30 rounded-lg p-4 flex items-center justify-between border border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="bg-red-500/20 p-2 rounded-lg text-red-400"><AlertTriangle size={20} /></div>
                   <div>
                     <p className="text-sm text-gray-400">Security Violations</p>
                     <p className="font-bold text-white text-xl">{stats.securityViolations}</p>
                   </div>
                 </div>
               </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
               <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm font-medium text-white">
                 Close Profile
               </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default StudentProfileModal;
