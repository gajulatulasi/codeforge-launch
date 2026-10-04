import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Download, FileText, FileSpreadsheet, Search, Filter } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

// Report Types mapping
const REPORT_TYPES = [
  { id: 'all-students', label: 'All Students Report' },
  { id: 'weekly-activity', label: 'Weekly Activity' },
  { id: 'monthly-performance', label: 'Monthly Performance' },
  { id: 'assessments', label: 'Assessment Report' },
  { id: 'login-activity', label: 'Login Activity' },
  { id: 'security', label: 'Security Report' },
  { id: 'single-student', label: 'Single Student Report' }
];

const Reports = () => {
  const [activeReport, setActiveReport] = useState('all-students');
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    branch: '',
    year: '',
    status: '',
    startDate: '',
    endDate: '',
    rollNumber: ''
  });

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      let url = '';
      if (activeReport === 'single-student') {
        if (!filters.rollNumber) {
          setReportData([]);
          setIsLoading(false);
          return;
        }
        url = `/api/reports/student/${filters.rollNumber}`;
      } else {
        const queryParams = new URLSearchParams();
        if (filters.branch) queryParams.append('branch', filters.branch);
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.status) queryParams.append('accountStatus', filters.status);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        url = `/api/reports/${activeReport}?${queryParams.toString()}`;
      }
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReportData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, [activeReport]);

  const handleExportCSV = () => {
    if (!reportData.length) return toast.error('No data to export');
    
    // Simple CSV export
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(obj => 
      Object.values(obj).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeReport}-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!reportData.length) return toast.error('No data to export');
    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeReport}-export.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTableHeaders = () => {
    if (!reportData.length) return null;
    return Object.keys(reportData[0]).map(key => (
      <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
        {key.replace(/([A-Z])/g, ' $1').trim()}
      </th>
    ));
  };

  const renderTableRows = () => {
    return reportData.map((row, idx) => (
      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
        {Object.values(row).map((val, cellIdx) => (
          <td key={cellIdx} className="px-4 py-3 text-sm text-gray-300">
            {val?.toString() || 'N/A'}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-gray-400">Generate, view, and export comprehensive platform reports.</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-colors">
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button onClick={handleExportJSON} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-medium transition-colors">
            <FileText size={16} /> Export JSON
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar Controls */}
        <div className="w-full lg:w-64 flex flex-col gap-6">
          {/* Report Selector */}
          <GlassCard className="!p-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Report Type</h3>
            <div className="flex flex-col gap-2">
              {REPORT_TYPES.map(report => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`px-3 py-2 text-left rounded text-sm font-medium transition-all ${activeReport === report.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {report.label}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Filters */}
          <GlassCard className="!p-4">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-300 uppercase tracking-wider">
              <Filter size={16} /> Filters
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Branch</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm outline-none focus:border-cyan-500 text-white"
                  value={filters.branch} onChange={(e) => setFilters({...filters, branch: e.target.value})}
                >
                  <option value="">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Year</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm outline-none focus:border-cyan-500 text-white"
                  value={filters.year} onChange={(e) => setFilters({...filters, year: e.target.value})}
                >
                  <option value="">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              {activeReport === 'single-student' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Search by Roll Number</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 text-gray-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="e.g. 21B91A05A1"
                      className="w-full pl-7 pr-2 py-1.5 bg-white/5 border border-white/10 rounded text-sm outline-none focus:border-cyan-500 text-white uppercase"
                      value={filters.rollNumber} 
                      onChange={(e) => setFilters({...filters, rollNumber: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>
              )}
              <button 
                onClick={fetchReport}
                className="w-full mt-2 bg-white/10 hover:bg-white/20 py-2 rounded text-sm transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Report Data Table */}
        <div className="flex-grow">
          <GlassCard className="h-[600px] flex flex-col overflow-hidden !p-0 border border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h2 className="font-bold text-lg">{REPORT_TYPES.find(r => r.id === activeReport)?.label}</h2>
              <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                {reportData.length} records found
              </span>
            </div>
            
            <div className="flex-grow overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-400">Loading data...</div>
              ) : reportData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">No data available for this report.</div>
              ) : (
                <table className="w-full min-w-[800px]">
                  <thead className="bg-black/40 sticky top-0">
                    <tr>{renderTableHeaders()}</tr>
                  </thead>
                  <tbody>
                    {renderTableRows()}
                  </tbody>
                </table>
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Reports;
