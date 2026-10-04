import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../../components/GlassCard';
import { TrendingUp, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const MyProgress = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await axios.get('/api/users/me/progress', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load progress data');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-accent"></div></div>;
  }

  if (!stats) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <TrendingUp className="text-green-400" size={32} /> My Progress
        </h1>
        <p className="text-gray-400">Track your performance and submission history over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Activity Line Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="text-blue-400" size={20} /> Past 7 Days Activity
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Line type="monotone" dataKey="submissions" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#38bdf8' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Difficulty Pie Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieChartIcon className="text-purple-400" size={20} /> Solved by Difficulty
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {stats.problemsSolved > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-center">
                <PieChartIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p>No problems solved yet.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Accuracy & Score Bar Chart */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="text-green-400" size={20} /> Performance Metrics
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Coding Accuracy', value: stats.accuracyPercentage, fill: '#34d399' },
              { name: 'MCQ Avg Score', value: stats.averageMCQScore, fill: '#a78bfa' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                formatter={(value) => [`${value}%`, 'Score']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {
                  [
                    { name: 'Coding Accuracy', value: stats.accuracyPercentage, fill: '#34d399' },
                    { name: 'MCQ Avg Score', value: stats.averageMCQScore, fill: '#a78bfa' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};

export default MyProgress;
