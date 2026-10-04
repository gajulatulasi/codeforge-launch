import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ShieldAlert, Monitor, UserX, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '../../components/GlassCard';

const PlatformSettings = () => {
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings'); // settings, security-logs

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'settings') {
        const res = await axios.get('/api/settings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSettings(res.data);
      } else {
        const res = await axios.get('/api/settings/security-logs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Platform settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  const toggleSetting = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <Monitor size={18} /> Platform Settings
        </button>
        <button onClick={() => setActiveTab('security-logs')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'security-logs' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-white/5'}`}>
          <ShieldAlert size={18} /> Security Logs
        </button>
      </div>

      {loading ? (
        <div className="text-center p-10 text-cyan-400 animate-pulse">Loading...</div>
      ) : activeTab === 'settings' ? (
        <GlassCard className="max-w-3xl">
          <h2 className="text-xl font-bold mb-6">Global Platform Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Anti-Cheat Global Overrides */}
              <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-4">
                <h3 className="font-bold text-gray-300 flex items-center gap-2 mb-4"><ShieldAlert size={18}/> Global Anti-Cheat</h3>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max Tab Switches (Default Limit)</label>
                  <input type="number" value={settings?.maxTabSwitches || 5} onChange={(e) => setSettings({...settings, maxTabSwitches: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Enable Copy Protection</span>
                  <button type="button" onClick={() => toggleSetting('enableCopyProtection')} className={settings?.enableCopyProtection ? 'text-cyan-400' : 'text-gray-500'}>
                    {settings?.enableCopyProtection ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Enable Paste Protection</span>
                  <button type="button" onClick={() => toggleSetting('enablePasteProtection')} className={settings?.enablePasteProtection ? 'text-cyan-400' : 'text-gray-500'}>
                    {settings?.enablePasteProtection ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Enable Right-Click globally</span>
                  <button type="button" onClick={() => toggleSetting('enableRightClick')} className={settings?.enableRightClick ? 'text-cyan-400' : 'text-gray-500'}>
                    {settings?.enableRightClick ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
              </div>

              {/* Platform Access */}
              <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-4">
                <h3 className="font-bold text-gray-300 flex items-center gap-2 mb-4"><Monitor size={18}/> Access & Modes</h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Allow New Registrations</span>
                  <button type="button" onClick={() => toggleSetting('enableRegistrations')} className={settings?.enableRegistrations ? 'text-cyan-400' : 'text-gray-500'}>
                    {settings?.enableRegistrations ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-300 block">Practice Mode Enabled</span>
                    <span className="text-xs text-gray-500">If disabled, only active contests are accessible</span>
                  </div>
                  <button type="button" onClick={() => toggleSetting('enablePracticeMode')} className={settings?.enablePracticeMode ? 'text-cyan-400' : 'text-gray-500'}>
                    {settings?.enablePracticeMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="flex justify-center items-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-colors w-full md:w-auto shadow-[0_0_15px_rgba(0,163,255,0.4)]">
              <Save size={18}/> Save Settings
            </button>
          </form>
        </GlassCard>
      ) : (
        <GlassCard>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><AlertTriangle className="text-yellow-500"/> Assessment Security Logs</h2>
          {logs.length === 0 ? (
            <div className="text-center p-10 text-gray-500">No security violations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Assessment ID</th>
                    <th className="pb-3 text-center">Tab Switches</th>
                    <th className="pb-3 text-center">Copy/Paste Attempts</th>
                    <th className="pb-3">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="py-4 text-sm">{new Date(log.updatedAt).toLocaleString()}</td>
                      <td className="py-4">
                        <div className="font-bold">{log.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{log.user?.rollNumber || ''}</div>
                      </td>
                      <td className="py-4 font-mono text-cyan-400 text-sm">{log.assessmentId}</td>
                      <td className="py-4 text-center">
                        <span className={`font-bold ${log.tabSwitches > 3 ? 'text-red-500' : 'text-yellow-500'}`}>{log.tabSwitches}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`font-bold ${log.copyPasteAttempts > 0 ? 'text-red-500' : 'text-gray-500'}`}>{log.copyPasteAttempts}</span>
                      </td>
                      <td className="py-4">
                        {(log.tabSwitches > 5 || log.copyPasteAttempts > 3) ? (
                          <button className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded border border-red-500/30 flex items-center gap-1">
                            <UserX size={12}/> Disqualify
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">Warning threshold</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

export default PlatformSettings;
