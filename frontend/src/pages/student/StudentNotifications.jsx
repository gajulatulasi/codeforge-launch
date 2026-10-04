import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Info } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <div className="text-center p-10 text-cyan-400 animate-pulse">Loading notifications...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-cyan-500/20 p-3 rounded-full"><Bell className="text-cyan-400" size={24}/></div>
        <h2 className="text-2xl font-bold">Notifications & Announcements</h2>
      </div>

      {notifications.length === 0 ? (
        <GlassCard className="text-center py-20">
          <Info className="mx-auto text-gray-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-300">No New Notifications</h3>
          <p className="text-gray-500">You're all caught up!</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <GlassCard key={n.id} className="relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                n.type === 'Contest' ? 'bg-orange-500' :
                n.type === 'Maintenance' ? 'bg-red-500' :
                n.type === 'Problem' ? 'bg-green-500' :
                'bg-blue-500'
              }`}></div>
              
              <div className="flex justify-between items-start mb-2 ml-2">
                 <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    n.type === 'Contest' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    n.type === 'Maintenance' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    n.type === 'Problem' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {n.type}
                 </span>
                 <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="ml-2">
                <h3 className="text-lg font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">{n.title}</h3>
                <p className="text-gray-400 text-sm whitespace-pre-wrap">{n.message}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
