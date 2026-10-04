import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { Code2, CheckCircle, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const CodingPractice = () => {
  const { user } = useContext(AuthContext);
  const [problems, setProblems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProblems();
  }, [page, difficulty]);

  const fetchProblems = async () => {
    try {
      let url = `/api/problems?page=${page}&limit=12`;
      if (difficulty) url += `&difficulty=${difficulty}`;
      
      // If we had a search endpoint, we'd add it here, but for now we filter locally if small,
      // or implement server-side search in problemRoutes later.
      
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setProblems(res.data.data || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to fetch problems');
    }
  };

  const isCompleted = (id) => user?.completedProblems?.includes(id);

  // Local search filter for title
  const filteredProblems = problems.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Code2 className="text-cyan-400" size={32} /> Coding Practice
          </h1>
          <p className="text-gray-400">Master algorithms and data structures.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search problems by title..." 
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="bg-transparent text-white focus:outline-none"
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          >
            <option value="" className="bg-[#0f172a]">All Difficulties</option>
            <option value="Easy" className="bg-[#0f172a]">Easy</option>
            <option value="Medium" className="bg-[#0f172a]">Medium</option>
            <option value="Hard" className="bg-[#0f172a]">Hard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProblems.map((prob) => {
          const completed = isCompleted(prob.id);
          return (
            <Link key={prob.id} to={`/problem/${prob.id}`}>
              <GlassCard className="h-full hover:-translate-y-1 transition-transform group border border-white/5 hover:border-cyan-500/30 relative">
                {completed && (
                  <div className="absolute top-4 right-4 text-green-400 bg-green-400/10 p-1 rounded-full" title="Completed">
                    <CheckCircle size={20} />
                  </div>
                )}
                <div className="text-sm text-gray-400 mb-2 font-mono">Day {prob.day}</div>
                <h4 className="text-lg font-bold mb-4 pr-8">{prob.title}</h4>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${prob.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : prob.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                    {prob.difficulty}
                  </span>
                  <span className="text-sm font-medium text-cyan-400 group-hover:underline">
                    {completed ? 'Review Solution' : 'Solve Challenge'}
                  </span>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>
      
      {filteredProblems.length === 0 && (
        <div className="text-center py-20">
          <Code2 size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No coding problems found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
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

export default CodingPractice;
