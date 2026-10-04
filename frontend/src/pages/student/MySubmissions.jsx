import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../../components/GlassCard';
import { History, CheckCircle, XCircle, AlertTriangle, Code } from 'lucide-react';
import toast from 'react-hot-toast';

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get('/api/submissions/me', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setSubmissions(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load submissions');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Accepted': return <CheckCircle className="text-green-400" size={18} />;
      case 'Wrong Answer': return <XCircle className="text-red-400" size={18} />;
      case 'Error': return <AlertTriangle className="text-yellow-400" size={18} />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-accent"></div></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <History className="text-brand-accent" size={32} /> My Submissions
        </h1>
        <p className="text-gray-400">Review your past code submissions and their results.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-[600px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {submissions.map((sub) => (
            <GlassCard 
              key={sub.id} 
              className={`p-4 cursor-pointer hover:border-white/20 transition-all ${selectedSub?.id === sub.id ? 'border-brand-accent bg-white/10' : ''}`}
              onClick={() => setSelectedSub(sub)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-white truncate pr-2">{sub.Problem?.title || `Problem #${sub.problemId}`}</h4>
                <div className="flex items-center gap-1 shrink-0">
                  {getStatusIcon(sub.status)}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span className="bg-white/5 px-2 py-1 rounded font-mono">{sub.language}</span>
                <span>{new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </GlassCard>
          ))}
          {submissions.length === 0 && (
            <div className="text-center py-10">
              <History size={32} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-500">No submissions yet.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedSub ? (
            <GlassCard className="h-[600px] flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold">{selectedSub.Problem?.title || `Problem #${selectedSub.problemId}`}</h3>
                  <p className="text-sm text-gray-400">{new Date(selectedSub.createdAt).toLocaleString()}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${
                  selectedSub.status === 'Accepted' ? 'bg-green-500/20 text-green-400' :
                  selectedSub.status === 'Wrong Answer' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {getStatusIcon(selectedSub.status)}
                  {selectedSub.status}
                </div>
              </div>
              
              <div className="flex-1 bg-[#1e293b] rounded-lg p-4 overflow-auto border border-white/5 relative group">
                <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-gray-400 font-mono">
                  {selectedSub.language}
                </div>
                <pre className="text-sm font-mono text-gray-300">
                  <code>{selectedSub.code}</code>
                </pre>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="h-[600px] flex items-center justify-center text-center">
              <div>
                <Code size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">Select a submission to view the code</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySubmissions;
