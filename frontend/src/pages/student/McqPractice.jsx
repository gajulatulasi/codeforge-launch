import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../../components/GlassCard';
import { HelpCircle, Clock, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const McqPractice = () => {
  const [mcqs, setMcqs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMcqs();
  }, [page]);

  const fetchMcqs = async () => {
    try {
      const res = await axios.get(`/api/mcqs?page=${page}&limit=12`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setMcqs(res.data.data || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to fetch MCQs');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <HelpCircle className="text-purple-400" size={32} /> MCQ Practice
        </h1>
        <p className="text-gray-400">Test your theoretical knowledge. You have 1 minute per quiz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mcqs.map((mcq) => (
          <GlassCard key={mcq.id} className="relative flex flex-col h-full hover:-translate-y-1 transition-transform border border-white/5 hover:border-purple-500/30 group">
             <div className="inline-block px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-bold mb-4 self-start">
               {mcq.topic}
             </div>
             <h4 className="text-lg font-bold mb-6 flex-grow">{mcq.question.substring(0, 100)}{mcq.question.length > 100 ? '...' : ''}</h4>
             
             <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-4">
               <div className="flex items-center gap-2 text-sm text-yellow-400 font-bold">
                 <Clock size={16} /> 1 Min
               </div>
               <button 
                 onClick={() => alert("MCQ taking interface coming soon")} 
                 className="flex items-center gap-2 text-sm bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white px-4 py-2 rounded-lg font-bold transition-colors"
               >
                 <Play size={16} /> Start
               </button>
             </div>
          </GlassCard>
        ))}
      </div>

      {mcqs.length === 0 && (
        <div className="text-center py-20">
          <HelpCircle size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No MCQs available yet.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 gap-4">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400 font-medium">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default McqPractice;
