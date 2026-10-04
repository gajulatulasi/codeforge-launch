import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Send, Trash2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '../../components/GlassCard';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'Announcement',
    targetAudience: 'Global',
    targetValue: ''
  });

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/notifications', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Notification published successfully');
      setFormData({ title: '', message: '', type: 'Announcement', targetAudience: 'Global', targetValue: '' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to publish notification');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await axios.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Deleted successfully');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Publish Form */}
      <GlassCard className="lg:col-span-1 h-fit sticky top-24">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Megaphone size={20} className="text-cyan-400"/> Publish Announcement</h2>
        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Message</label>
            <textarea required rows="3" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500"></textarea>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#1a1a2e] border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500">
              <option value="Announcement">Announcement</option>
              <option value="Contest">Contest</option>
              <option value="Problem">New Problem</option>
              <option value="Maintenance">Maintenance</option>
              <option value="System">System</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Audience</label>
            <select value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} className="w-full bg-[#1a1a2e] border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500">
              <option value="Global">Global (All Students)</option>
              <option value="Department">Specific Department</option>
              <option value="Year">Specific Year</option>
            </select>
          </div>
          {(formData.targetAudience === 'Department' || formData.targetAudience === 'Year') && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Specify {formData.targetAudience}</label>
              <input type="text" required placeholder={`e.g. ${formData.targetAudience === 'Department' ? 'CSE' : '3'}`} value={formData.targetValue} onChange={e => setFormData({...formData, targetValue: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" />
            </div>
          )}
          <button type="submit" className="w-full flex justify-center items-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition-colors mt-4">
            <Send size={18}/> Publish
          </button>
        </form>
      </GlassCard>

      {/* History */}
      <GlassCard className="lg:col-span-2">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell size={20} className="text-cyan-400"/> Recent Announcements</h2>
        {loading ? (
          <div className="text-center text-cyan-400 p-10 animate-pulse">Loading announcements...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 p-10">No recent announcements published.</div>
        ) : (
          <div className="space-y-4">
            {notifications.map(n => (
              <div key={n.id} className="bg-black/30 p-4 rounded-lg border border-white/5 relative">
                <button onClick={() => handleDelete(n.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400"><Trash2 size={18}/></button>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    n.type === 'Contest' ? 'bg-orange-500/20 text-orange-400' :
                    n.type === 'Maintenance' ? 'bg-red-500/20 text-red-400' :
                    n.type === 'Problem' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {n.type}
                  </span>
                  <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                    {n.targetAudience === 'Global' ? 'Global' : `${n.targetAudience}: ${n.targetValue}`}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{n.title}</h3>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default AdminNotifications;
