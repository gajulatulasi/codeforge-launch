import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Code2, 
  HelpCircle, 
  TrendingUp, 
  History, 
  Trophy, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import DashboardOverview from './student/DashboardOverview';
import CodingPractice from './student/CodingPractice';
import McqPractice from './student/McqPractice';
import MyProgress from './student/MyProgress';
import MySubmissions from './student/MySubmissions';
import Profile from './student/Profile';
import StudentNotifications from './student/StudentNotifications';
import LeaderboardPage from './LeaderboardPage';
import { Bell } from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const lastViewed = localStorage.getItem('lastViewedNotifications');
        if (!lastViewed) {
          setUnreadCount(res.data.length);
        } else {
          const count = res.data.filter(n => new Date(n.createdAt) > new Date(lastViewed)).length;
          setUnreadCount(count);
        }
      } catch (err) {
        console.error('Failed to load notifications count');
      }
    };
    fetchUnreadCount();
    
    // Optional: Poll every minute for new notifications
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'coding', label: 'Coding Practice', icon: Code2 },
    { id: 'mcqs', label: 'MCQ Practice', icon: HelpCircle },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'submissions', label: 'My Submissions', icon: History },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview setActiveTab={setActiveTab} />;
      case 'coding': return <CodingPractice />;
      case 'mcqs': return <McqPractice />;
      case 'progress': return <MyProgress />;
      case 'submissions': return <MySubmissions />;
      case 'leaderboard': return <LeaderboardPage isEmbedded={true} />;
      case 'notifications': return <StudentNotifications />;
      case 'profile': return <Profile />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-[90vh] bg-[#0f172a]">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="lg:hidden fixed top-20 left-4 z-50 bg-brand-accent p-2 rounded text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-[73px] left-0 h-[calc(100vh-73px)] lg:h-auto 
        w-64 bg-white/5 border-r border-white/10 backdrop-blur-xl
        transform transition-transform duration-300 z-40 overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white truncate max-w-[150px]">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate max-w-[150px]">{user?.email}</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { 
                    setActiveTab(tab.id); 
                    setSidebarOpen(false); 
                    if (tab.id === 'notifications') {
                      setUnreadCount(0);
                      localStorage.setItem('lastViewedNotifications', new Date().toISOString());
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? 'text-cyan-400' : 'text-gray-500'} />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MemberDashboard;
