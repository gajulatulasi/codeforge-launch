import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, List, Users, Code, HelpCircle, Calendar, Check, X, Ban, Search, ChevronLeft, ChevronRight, FileBarChart, Eye } from 'lucide-react';
import Reports from './admin/Reports';
import StudentProfileModal from './admin/StudentProfileModal';
import AdminProblemForm from './admin/AdminProblemForm';
import AdminMcqAssessmentForm from './admin/AdminMcqAssessmentForm';
import Analytics from './admin/Analytics';
import Leaderboard from '../components/Leaderboard';
import { Trophy, Bell, Shield } from 'lucide-react';
import AdminNotifications from './admin/AdminNotifications';
import PlatformSettings from './admin/PlatformSettings';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'approvals', 'students', 'problems', 'mcqs', 'assessments', 'reports'
  
  // Platform Stats
  const [stats, setStats] = useState({
    totalPending: 0, totalApproved: 0, totalRejected: 0, activeUsers: 0,
    totalProblems: 0, totalMCQs: 0, totalSubmissions: 0
  });

  // Approvals State
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);

  // Users State (Students)
  const [allUsers, setAllUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [viewingRollNumber, setViewingRollNumber] = useState(null);

  // Problems State
  const [problems, setProblems] = useState([]);
  const [problemsPage, setProblemsPage] = useState(1);
  const [problemsTotalPages, setProblemsTotalPages] = useState(1);
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [problemData, setProblemData] = useState({
    day: '', title: '', difficulty: 'Easy', description: '', unlockDate: '', hiddenSolution: '',
    sampleTestcases: '[]', hiddenTestcases: '[]', isActive: true,
    starterCode: { c: '', cpp: '', java: '', python: '' }
  });

  // MCQs State
  const [mcqs, setMcqs] = useState([]);
  const [mcqsPage, setMcqsPage] = useState(1);
  const [mcqsTotalPages, setMcqsTotalPages] = useState(1);
  const [showMcqForm, setShowMcqForm] = useState(false);
  const [mcqData, setMcqData] = useState({
    question: '', options: ['', '', '', ''], correctOption: '0', points: 10, topic: 'General', isActive: true
  });

  // Assessments State
  const [assessments, setAssessments] = useState([]);
  const [assessmentsPage, setAssessmentsPage] = useState(1);
  const [assessmentsTotalPages, setAssessmentsTotalPages] = useState(1);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    title: '', description: '', startDate: '', endDate: ''
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'approvals') fetchPendingUsers();
    if (activeTab === 'students') fetchAllUsers();
    if (activeTab === 'problems') fetchProblems();
    if (activeTab === 'mcqs') fetchMcqs();
    if (activeTab === 'assessments') fetchAssessments();
  }, [activeTab, pendingPage, usersPage, problemsPage, mcqsPage, assessmentsPage, searchQuery, filterBranch, filterYear]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/users/stats/platform', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setStats(res.data);
    } catch (err) { toast.error('Failed to fetch platform stats'); }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get(`/api/users/approvals?page=${pendingPage}&limit=20`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setPendingUsers(res.data.data || res.data); // Fallback for old API format during transition
      setPendingTotalPages(res.data.totalPages || 1);
    } catch (err) { toast.error('Failed to fetch pending approvals'); }
  };

  const fetchAllUsers = async () => {
    try {
      let url = `/api/users?page=${usersPage}&limit=20`;
      if (searchQuery) url += `&search=${searchQuery}`;
      if (filterBranch) url += `&branch=${filterBranch}`;
      if (filterYear) url += `&year=${filterYear}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setAllUsers(res.data.data || res.data);
      setUsersTotalPages(res.data.totalPages || 1);
    } catch (err) { toast.error('Failed to fetch all users'); }
  };

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`/api/problems?page=${problemsPage}&limit=20`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setProblems(res.data.data || res.data);
      setProblemsTotalPages(res.data.totalPages || 1);
    } catch (err) { }
  };

  const fetchMcqs = async () => {
    try {
      const res = await axios.get(`/api/mcqs?page=${mcqsPage}&limit=20`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMcqs(res.data.data || res.data);
      setMcqsTotalPages(res.data.totalPages || 1);
    } catch (err) { }
  };

  const fetchAssessments = async () => {
    try {
      const res = await axios.get(`/api/assessments?page=${assessmentsPage}&limit=20`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setAssessments(res.data.data || res.data);
      setAssessmentsTotalPages(res.data.totalPages || 1);
    } catch (err) { }
  };

  // Handlers for Approvals
  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/users/approve/${id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('User approved');
      fetchPendingUsers();
      fetchStats();
    } catch (err) { toast.error('Failed to approve user'); }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/users/reject/${id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('User rejected');
      fetchPendingUsers();
      fetchStats();
    } catch (err) { toast.error('Failed to reject user'); }
  };

  // Handlers for Students
  const handleBlockUnblock = async (id) => {
    try {
      await axios.put(`/api/users/${id}/block`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('User block status updated');
      fetchAllUsers();
    } catch (err) { toast.error('Failed to update block status'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('User deleted');
      fetchAllUsers();
      fetchStats();
    } catch (err) { toast.error('Failed to delete user'); }
  };

  // Handlers for Problems
  const handleProblemSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...problemData,
        unlockDate: new Date(problemData.unlockDate).toISOString(),
        sampleTestcases: JSON.parse(problemData.sampleTestcases),
        hiddenTestcases: JSON.parse(problemData.hiddenTestcases)
      };
      await axios.post('/api/problems', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Problem created successfully!');
      setShowProblemForm(false);
      fetchProblems();
      fetchStats();
    } catch (err) { toast.error('Failed to create problem. Ensure JSON format is correct.'); }
  };

  const handleProblemDelete = async (id) => {
    if (!window.confirm('Delete this problem?')) return;
    try {
      await axios.delete(`/api/problems/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Problem deleted');
      fetchProblems();
      fetchStats();
    } catch (err) { toast.error('Failed to delete problem'); }
  };

  // Handlers for MCQs
  const handleMcqSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...mcqData,
        correctOption: parseInt(mcqData.correctOption)
      };
      await axios.post('/api/mcqs', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('MCQ created successfully!');
      setShowMcqForm(false);
      fetchMcqs();
      fetchStats();
    } catch (err) { toast.error('Failed to create MCQ.'); }
  };

  const handleMcqDelete = async (id) => {
    if (!window.confirm('Delete this MCQ?')) return;
    try {
      await axios.delete(`/api/mcqs/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('MCQ deleted');
      fetchMcqs();
      fetchStats();
    } catch (err) { toast.error('Failed to delete MCQ'); }
  };

  const handleMcqOptionChange = (index, value) => {
    const newOptions = [...mcqData.options];
    newOptions[index] = value;
    setMcqData({ ...mcqData, options: newOptions });
  };

  // Handlers for Assessments
  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...assessmentData,
        startDate: new Date(assessmentData.startDate).toISOString(),
        endDate: new Date(assessmentData.endDate).toISOString()
      };
      await axios.post('/api/assessments', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Assessment created successfully!');
      setShowAssessmentForm(false);
      fetchAssessments();
    } catch (err) { toast.error('Failed to create assessment.'); }
  };

  const handleAssessmentDelete = async (id) => {
    if (!window.confirm('Delete this Assessment?')) return;
    try {
      await axios.delete(`/api/assessments/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Assessment deleted');
      fetchAssessments();
    } catch (err) { toast.error('Failed to delete assessment'); }
  };

  // Pagination Controls Component
  const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-between items-center mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed text-gray-500' : 'bg-white/10 hover:bg-white/20 text-white'}`}
      >
        <ChevronLeft size={18} /> Previous
      </button>
      <span className="text-gray-400">Page {currentPage} of {totalPages}</span>
      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed text-gray-500' : 'bg-white/10 hover:bg-white/20 text-white'}`}
      >
        Next <ChevronRight size={18} />
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <GlassCard className="p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">Pending Requests</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.totalPending}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">Approved Users</p>
          <p className="text-3xl font-bold text-green-400">{stats.totalApproved}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">Total Problems</p>
          <p className="text-3xl font-bold text-blue-400">{stats.totalProblems}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">Total MCQs</p>
          <p className="text-3xl font-bold text-cyan-400">{stats.totalMCQs}</p>
        </GlassCard>
      </div>

      <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        <button onClick={() => setActiveTab('analytics')} className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <FileBarChart size={18} /> Analytics
        </button>
        <button onClick={() => setActiveTab('leaderboard')} className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'leaderboard' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <Trophy size={18} /> Leaderboard
        </button>
        <button onClick={() => setActiveTab('notifications')} className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <Bell size={18} /> Notifications
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <Shield size={18} /> Platform Security
        </button>
        <button onClick={() => setActiveTab('approvals')} className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'approvals' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <Users size={18} /> Approvals {stats.totalPending > 0 && <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{stats.totalPending}</span>}
        </button>
        <button onClick={() => {setActiveTab('students'); setUsersPage(1);}} className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'students' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <Users size={18} /> Students
        </button>
        <button onClick={() => {setActiveTab('problems'); setProblemsPage(1);}} className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'problems' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <Code size={18} /> Coding Problems
        </button>
        <button onClick={() => {setActiveTab('mcqs'); setMcqsPage(1);}} className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'mcqs' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <HelpCircle size={18} /> MCQs
        </button>
        <button onClick={() => {setActiveTab('assessments'); setAssessmentsPage(1);}} className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'assessments' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <Calendar size={18} /> Weekly Assessments
        </button>
        <button onClick={() => setActiveTab('reports')} className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <FileBarChart size={18} /> Reports
        </button>
      </div>

      {activeTab === 'analytics' && (
        <Analytics />
      )}

      {activeTab === 'leaderboard' && (
        <Leaderboard />
      )}

      {activeTab === 'notifications' && (
        <AdminNotifications />
      )}

      {activeTab === 'settings' && (
        <PlatformSettings />
      )}

      {activeTab === 'approvals' && (
        <div>
           <GlassCard>
              <h2 className="text-xl font-bold mb-6">Pending Student Registrations</h2>
              <table className="w-full text-left">
                <thead><tr className="border-b border-white/10 text-gray-400"><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3 text-right">Actions</th></tr></thead>
                <tbody>
                  {pendingUsers.map(u => (
                    <tr key={u.id} className="border-b border-white/5"><td className="py-4 font-bold">{u.name}</td><td className="py-4 text-gray-400">{u.email}</td>
                    <td className="py-4 text-right">
                      <button onClick={() => handleApprove(u.id)} className="bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white p-2 rounded transition-colors mr-2" title="Approve">
                        <Check size={18}/>
                      </button>
                      <button onClick={() => handleReject(u.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded transition-colors" title="Reject">
                        <X size={18}/>
                      </button>
                    </td></tr>
                  ))}
                  {pendingUsers.length === 0 && <tr><td colSpan="3" className="py-8 text-center text-gray-500">No pending approvals.</td></tr>}
                </tbody>
              </table>
              <PaginationControls currentPage={pendingPage} totalPages={pendingTotalPages} onPageChange={setPendingPage} />
            </GlassCard>
        </div>
      )}

      {activeTab === 'students' && (
        <div>
           <GlassCard>
              <h2 className="text-xl font-bold mb-6">Student Management</h2>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="text" placeholder="Search by name or email (press enter to search)..." 
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && setUsersPage(1)}
                  />
                </div>
                <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400" value={filterBranch} onChange={e => {setFilterBranch(e.target.value); setUsersPage(1);}}>
                  <option value="" className="bg-brand-dark">All Branches</option>
                  <option value="CSE" className="bg-brand-dark">CSE</option>
                  <option value="IT" className="bg-brand-dark">IT</option>
                  <option value="ECE" className="bg-brand-dark">ECE</option>
                  <option value="EEE" className="bg-brand-dark">EEE</option>
                  <option value="MECH" className="bg-brand-dark">MECH</option>
                  <option value="CIVIL" className="bg-brand-dark">CIVIL</option>
                </select>
                <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400" value={filterYear} onChange={e => {setFilterYear(e.target.value); setUsersPage(1);}}>
                  <option value="" className="bg-brand-dark">All Years</option>
                  <option value="1" className="bg-brand-dark">1st Year</option>
                  <option value="2" className="bg-brand-dark">2nd Year</option>
                  <option value="3" className="bg-brand-dark">3rd Year</option>
                  <option value="4" className="bg-brand-dark">4th Year</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-white/10 text-gray-400"><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Branch/Year</th><th className="pb-3">Status</th><th className="pb-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id} className="border-b border-white/5"><td className="py-4 font-bold">{u.name}</td><td className="py-4 text-gray-400">{u.email}</td>
                      <td className="py-4">{u.branch || 'N/A'} / {u.year || 'N/A'}</td>
                      <td className="py-4">
                        {u.isBlocked ? <span className="text-red-400 text-sm font-bold">Blocked</span> : <span className="text-green-400 text-sm font-bold">Active</span>}
                      </td>
                      <td className="py-4 text-right">
                        <button onClick={() => setViewingRollNumber(u.rollNumber)} disabled={!u.rollNumber} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors mr-2 disabled:opacity-50" title="View Profile">
                          <Eye size={18}/>
                        </button>
                        <button onClick={() => handleBlockUnblock(u.id)} className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-white p-2 rounded transition-colors mr-2" title={u.isBlocked ? "Unblock User" : "Block User"}>
                          <Ban size={18}/>
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded transition-colors" title="Delete User">
                          <Trash2 size={18}/>
                        </button>
                      </td></tr>
                    ))}
                    {allUsers.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-gray-500">No students found.</td></tr>}
                  </tbody>
                </table>
              </div>
              <PaginationControls currentPage={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
            </GlassCard>
        </div>
      )}

      {activeTab === 'problems' && (
        <div>
           <div className="flex justify-end mb-4">
            <button onClick={() => setShowProblemForm(!showProblemForm)} className="flex items-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-colors">
              {showProblemForm ? <List size={18} /> : <Plus size={18} />} {showProblemForm ? 'View List' : 'Add Problem'}
            </button>
          </div>
          {showProblemForm ? (
            <AdminProblemForm 
              onCancel={() => setShowProblemForm(false)} 
              onSuccess={() => {
                setShowProblemForm(false);
                const fetchProbs = async () => {
                  const res = await axios.get(`/api/problems?page=${problemsPage}&limit=10`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                  setProblems(res.data.data);
                  setProblemsTotalPages(res.data.totalPages);
                };
                fetchProbs();
              }} 
            />
          ) : (
            <GlassCard>
              <h2 className="text-xl font-bold mb-6">Problem List</h2>
              <table className="w-full text-left">
                <thead><tr className="border-b border-white/10 text-gray-400"><th className="pb-3">Code</th><th className="pb-3">Title</th><th className="pb-3">Difficulty</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead>
                <tbody>
                  {problems.map(p => (
                    <tr key={p.id} className="border-b border-white/5"><td className="py-4 font-mono text-cyan-400">{p.problemCode}</td><td className="py-4">{p.title}</td><td className="py-4">{p.difficulty}</td>
                    <td className="py-4">
                      <span className={`text-sm ${p.status === 'Published' ? 'text-green-400' : p.status === 'Hidden' ? 'text-red-400' : 'text-yellow-400'}`}>{p.status}</span>
                    </td>
                    <td className="py-4"><button onClick={() => handleProblemDelete(p.id)} className="text-red-400"><Trash2 size={18}/></button></td></tr>
                  ))}
                  {problems.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-gray-500">No problems found.</td></tr>}
                </tbody>
              </table>
              <PaginationControls currentPage={problemsPage} totalPages={problemsTotalPages} onPageChange={setProblemsPage} />
            </GlassCard>
          )}
        </div>
      )}

      {activeTab === 'mcqs' && (
        <div>
           <div className="flex justify-end mb-4">
            <button onClick={() => setShowMcqForm(!showMcqForm)} className="flex items-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-colors">
              {showMcqForm ? <List size={18} /> : <Plus size={18} />} {showMcqForm ? 'View List' : 'Add MCQ'}
            </button>
          </div>
          {showMcqForm ? (
            <GlassCard>
              <h2 className="text-xl font-bold mb-6">Create New MCQ</h2>
              <form onSubmit={handleMcqSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="block text-sm text-gray-400 mb-1">Topic/Category</label><input type="text" required className="w-full bg-white/5 border border-white/10 rounded p-2" value={mcqData.topic} onChange={e => setMcqData({...mcqData, topic: e.target.value})} /></div>
                   <div className="flex items-center mt-6">
                     <label className="flex items-center gap-2 text-sm text-gray-300">
                       <input type="checkbox" checked={mcqData.isActive} onChange={e => setMcqData({...mcqData, isActive: e.target.checked})} className="form-checkbox text-cyan-500 rounded bg-white/5 border-white/10" />
                       Enable MCQ (Visible to students)
                     </label>
                   </div>
                </div>
                <div><label className="block text-sm text-gray-400 mb-1">Question</label><textarea required rows="3" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" value={mcqData.question} onChange={e => setMcqData({...mcqData, question: e.target.value})}></textarea></div>
                <div className="space-y-3">
                  <label className="block text-sm text-gray-400 mb-1">Options</label>
                  {mcqData.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-gray-500 w-6">{(i+1)}.</span>
                      <input type="text" required className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" placeholder={`Option ${i+1}`} value={opt} onChange={e => handleMcqOptionChange(i, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-400 mb-1">Correct Option Index (0-based)</label><input type="number" required className="w-full bg-white/5 border border-white/10 rounded p-2" value={mcqData.correctOption} onChange={e => setMcqData({...mcqData, correctOption: e.target.value})} /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Points</label><input type="number" required className="w-full bg-white/5 border border-white/10 rounded p-2" value={mcqData.points} onChange={e => setMcqData({...mcqData, points: e.target.value})} /></div>
                </div>
                <button type="submit" className="bg-brand-accent hover:bg-blue-600 px-6 py-2 rounded font-bold">Create MCQ</button>
              </form>
            </GlassCard>
          ) : (
             <GlassCard>
              <h2 className="text-xl font-bold mb-6">MCQ List</h2>
              <table className="w-full text-left">
                <thead><tr className="border-b border-white/10 text-gray-400"><th className="pb-3">Topic</th><th className="pb-3">Question</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead>
                <tbody>
                  {mcqs.map(m => (
                    <tr key={m.id} className="border-b border-white/5"><td className="py-4 font-bold">{m.topic}</td><td className="py-4">{m.question.substring(0, 50)}...</td>
                    <td className="py-4">{m.isActive ? <span className="text-green-400 text-sm">Active</span> : <span className="text-red-400 text-sm">Disabled</span>}</td>
                    <td className="py-4 flex gap-2">
                      <button onClick={() => toast.success('Reviewing MCQ...')} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors" title="Review Question">
                        <Eye size={18}/>
                      </button>
                      <button onClick={() => toast.success('Downloading Stats...')} className="bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white p-2 rounded transition-colors" title="Download Result">
                        <FileBarChart size={18}/>
                      </button>
                      <button onClick={() => handleMcqDelete(m.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded transition-colors" title="Delete MCQ">
                        <Trash2 size={18}/>
                      </button>
                    </td></tr>
                  ))}
                  {mcqs.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-gray-500">No MCQs found.</td></tr>}
                </tbody>
              </table>
              <PaginationControls currentPage={mcqsPage} totalPages={mcqsTotalPages} onPageChange={setMcqsPage} />
            </GlassCard>
          )}
        </div>
      )}

      {activeTab === 'assessments' && (
        <div>
           <div className="flex justify-end mb-4">
            <button onClick={() => setShowAssessmentForm(!showAssessmentForm)} className="flex items-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-colors">
              {showAssessmentForm ? <List size={18} /> : <Plus size={18} />} {showAssessmentForm ? 'View List' : 'Add Assessment'}
            </button>
          </div>
          {showAssessmentForm ? (
            <AdminMcqAssessmentForm 
              onCancel={() => setShowAssessmentForm(false)} 
              onSuccess={() => {
                setShowAssessmentForm(false);
                const fetchAsm = async () => {
                  const res = await axios.get(`/api/assessments?page=${assessmentsPage}&limit=10`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                  setAssessments(res.data.data);
                  setAssessmentsTotalPages(res.data.totalPages);
                };
                fetchAsm();
              }} 
            />
          ) : (
             <GlassCard>
              <h2 className="text-xl font-bold mb-6">Assessment List</h2>
              <table className="w-full text-left">
                <thead><tr className="border-b border-white/10 text-gray-400"><th className="pb-3">Code</th><th className="pb-3">Title</th><th className="pb-3">Status</th><th className="pb-3">Start Date</th><th className="pb-3">End Date</th><th className="pb-3">Actions</th></tr></thead>
                <tbody>
                  {assessments.map(a => (
                    <tr key={a.id} className="border-b border-white/5">
                      <td className="py-4 font-mono text-cyan-400">{a.assessmentCode}</td>
                      <td className="py-4">{a.title}</td>
                      <td className="py-4">
                        <span className={`text-sm ${a.status === 'Published' ? 'text-green-400' : a.status === 'Hidden' ? 'text-red-400' : 'text-yellow-400'}`}>{a.status || 'Draft'}</span>
                      </td>
                      <td className="py-4">{a.startDate ? new Date(a.startDate).toLocaleDateString() : '-'}</td>
                      <td className="py-4">{a.endDate ? new Date(a.endDate).toLocaleDateString() : '-'}</td>
                      <td className="py-4 flex gap-2">
                        <button onClick={() => toast.success('Reviewing Answers...')} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors" title="Review Answers">
                          <Eye size={18}/>
                        </button>
                        <button onClick={() => toast.success('Downloading Results as PDF...')} className="bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white p-2 rounded transition-colors" title="Download Result (PDF)">
                          <FileBarChart size={18}/>
                        </button>
                        <button onClick={() => { setActiveTab('leaderboard'); }} className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-white p-2 rounded transition-colors" title="View Leaderboard">
                          <Trophy size={18}/>
                        </button>
                        <button onClick={() => handleAssessmentDelete(a.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded transition-colors" title="Delete Assessment">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {assessments.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-gray-500">No Assessments found.</td></tr>}
                </tbody>
              </table>
              <PaginationControls currentPage={assessmentsPage} totalPages={assessmentsTotalPages} onPageChange={setAssessmentsPage} />
            </GlassCard>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <Reports />
      )}

      {viewingRollNumber && (
        <StudentProfileModal rollNumber={viewingRollNumber} onClose={() => setViewingRollNumber(null)} />
      )}

    </div>
  );
};

export default AdminDashboard;
