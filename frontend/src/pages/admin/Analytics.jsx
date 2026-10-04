import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Users, Code, Activity, Target } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#AF19FF', '#FF1919'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/analytics', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center p-10 text-cyan-400 animate-pulse">Loading Analytics Data...</div>;
  if (!data) return <div className="text-center p-10 text-red-400">Failed to load data</div>;

  const { stats, charts } = data;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="bg-blue-500/20 p-4 rounded-lg text-blue-400"><Users size={32} /></div>
          <div>
            <p className="text-gray-400 text-sm">Total Students</p>
            <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="bg-cyan-500/20 p-4 rounded-lg text-cyan-400"><Code size={32} /></div>
          <div>
            <p className="text-gray-400 text-sm">Total Submissions</p>
            <h3 className="text-3xl font-bold">{stats.totalSubmissions}</h3>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="bg-green-500/20 p-4 rounded-lg text-green-400"><Target size={32} /></div>
          <div>
            <p className="text-gray-400 text-sm">Acceptance Rate</p>
            <h3 className="text-3xl font-bold">{stats.acceptanceRate}%</h3>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="bg-purple-500/20 p-4 rounded-lg text-purple-400"><Activity size={32} /></div>
          <div>
            <p className="text-gray-400 text-sm">Active Problems</p>
            <h3 className="text-3xl font-bold">{stats.totalProblems}</h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Line Chart */}
        <GlassCard>
          <h3 className="text-lg font-bold mb-6">Daily Registrations (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.registrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Difficulty Pie Chart */}
        <GlassCard>
          <h3 className="text-lg font-bold mb-6">Problem Difficulty Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.difficulties} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {charts.difficulties.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Department Bar Chart */}
        <GlassCard>
          <h3 className="text-lg font-bold mb-6">Department-wise Participation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', color: '#fff' }} cursor={{fill: 'transparent'}}/>
                <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]}>
                  {charts.departments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Year Radar Chart */}
        <GlassCard>
          <h3 className="text-lg font-bold mb-6">Year-wise Participation</h3>
          <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={charts.years}>
                <PolarGrid stroke="#555" />
                <PolarAngleAxis dataKey="name" stroke="#ccc" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#888" />
                <Radar name="Students" dataKey="value" stroke="#AF19FF" fill="#AF19FF" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default Analytics;
