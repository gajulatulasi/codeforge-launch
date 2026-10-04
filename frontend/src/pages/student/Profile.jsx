import React, { useContext, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { Award, Flame, CheckSquare, Star, Trophy, User as UserIcon, Settings, Lock, Save } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview'); // overview, edit, security
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    year: user?.year || '',
    mobileNumber: user?.mobileNumber || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user) return null;

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put('/api/users/profile', profileData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Profile updated successfully! Refresh to see changes.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setIsSubmitting(true);
    try {
      await axios.put('/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <UserIcon size={18}/> Overview
        </button>
        <button onClick={() => setActiveTab('edit')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'edit' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <Settings size={18}/> Edit Profile
        </button>
        <button onClick={() => setActiveTab('security')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'security' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <Lock size={18}/> Security
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Stats Summary */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="text-center py-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-brand-accent to-cyan-400 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-gray-400 mb-2">{user.email}</p>
              <p className="text-sm text-brand-accent mb-6 font-mono">{user.rollNumber} | {user.department} | Year {user.year}</p>
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
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-gray-400">Account Status</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-xs ${user.accountStatus === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{user.accountStatus}</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Badges & Achievements */}
          <div className="lg:col-span-2 space-y-8">
            <GlassCard>
              <h3 className="text-xl font-bold mb-6">Achievements & Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <div className={`text-center p-4 rounded-xl border ${user.longestStreak >= 7 ? 'bg-orange-500/10 border-orange-500/30 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-50'}`}>
                   <Flame size={32} className={`mx-auto mb-2 ${user.longestStreak >= 7 ? 'text-orange-500' : ''}`} />
                   <p className="font-bold text-sm">7-Day Streak</p>
                 </div>
                 <div className={`text-center p-4 rounded-xl border ${user.longestStreak >= 30 ? 'bg-red-500/10 border-red-500/30 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-50'}`}>
                   <Flame size={32} className={`mx-auto mb-2 ${user.longestStreak >= 30 ? 'text-red-500' : ''}`} />
                   <p className="font-bold text-sm">30-Day Streak</p>
                 </div>
                 <div className={`text-center p-4 rounded-xl border ${user.longestStreak >= 100 ? 'bg-purple-500/10 border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-50'}`}>
                   <Flame size={32} className={`mx-auto mb-2 ${user.longestStreak >= 100 ? 'text-purple-500' : ''}`} />
                   <p className="font-bold text-sm">100-Day Centurion</p>
                 </div>
                 <div className={`text-center p-4 rounded-xl border ${(user.completedProblems?.length || 0) >= 50 ? 'bg-yellow-500/10 border-yellow-500/30 text-white shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-50'}`}>
                   <Trophy size={32} className={`mx-auto mb-2 ${(user.completedProblems?.length || 0) >= 50 ? 'text-yellow-500' : ''}`} />
                   <p className="font-bold text-sm">50 Problems</p>
                 </div>
              </div>
            </GlassCard>

          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <GlassCard className="max-w-2xl">
          <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Edit Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Department</label>
                <select value={profileData.department} onChange={e => setProfileData({...profileData, department: e.target.value})} className="w-full bg-[#1a1a2e] border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" required>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Year</label>
                <select value={profileData.year} onChange={e => setProfileData({...profileData, year: e.target.value})} className="w-full bg-[#1a1a2e] border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" required>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mobile Number</label>
              <input type="text" value={profileData.mobileNumber} onChange={e => setProfileData({...profileData, mobileNumber: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email (Cannot be changed)</label>
              <input type="email" value={user.email} disabled className="w-full bg-white/5 border border-white/10 rounded p-2 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Roll Number (Cannot be changed)</label>
              <input type="text" value={user.rollNumber} disabled className="w-full bg-white/5 border border-white/10 rounded p-2 text-gray-500 cursor-not-allowed" />
            </div>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-colors mt-4 disabled:opacity-50">
              <Save size={18}/> Save Changes
            </button>
          </form>
        </GlassCard>
      )}

      {activeTab === 'security' && (
        <GlassCard className="max-w-xl">
          <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Password</label>
              <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" required minLength="6" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
              <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" required minLength="6" />
            </div>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-red-500/80 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold transition-colors mt-4 disabled:opacity-50">
              <Lock size={18}/> Update Password
            </button>
          </form>
        </GlassCard>
      )}
    </div>
  );
};

export default Profile;
