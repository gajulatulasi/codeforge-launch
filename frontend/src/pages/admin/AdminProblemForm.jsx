import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Eye, Send, X } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const CATEGORIES = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graph', 'Dynamic Programming', 'SQL', 'Others'];

const AdminProblemForm = ({ onCancel, onSuccess, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    problemCode: '',
    difficulty: 'Easy',
    category: 'Arrays',
    tags: '',
    marks: 10,
    publishDate: '',
    expiryDate: '',
    status: 'Draft',
    description: '',
    constraints: [''],
    inputFormat: '',
    outputFormat: '',
    explanation: '',
    sampleTestcases: [{ input: '', output: '', explanation: '' }],
    hiddenTestcases: [{ input: '', output: '' }],
    supportedLanguages: { java: true, python: true, c: true, cpp: true, javascript: true },
    settings: {
      oneSubmissionOnly: true,
      allowCustomInput: false,
      showSampleTestcases: true,
      enableProblem: true,
      availableInPractice: true,
      availableInContest: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: type === 'checkbox' ? checked : value }
      });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleArrayChange = (index, field, value, arrayName) => {
    const newArray = [...formData[arrayName]];
    if (typeof newArray[index] === 'string') {
      newArray[index] = value;
    } else {
      newArray[index][field] = value;
    }
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const addArrayItem = (arrayName, emptyItem) => {
    setFormData({ ...formData, [arrayName]: [...formData[arrayName], emptyItem] });
  };

  const removeArrayItem = (index, arrayName) => {
    const newArray = formData[arrayName].filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const handleSave = async (statusOverride) => {
    if (!formData.title || !formData.description) {
      return toast.error('Title and Description are required');
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      status: statusOverride || formData.status,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      supportedLanguages: Object.keys(formData.supportedLanguages).filter(k => formData.supportedLanguages[k]),
      constraints: formData.constraints.filter(Boolean)
    };

    try {
      if (initialData?.id) {
        await axios.put(`/api/problems/${initialData.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Problem updated successfully!');
      } else {
        await axios.post('/api/problems', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Problem created successfully!');
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save problem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{initialData ? 'Edit Coding Problem' : 'Create Coding Problem'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white"><X size={24}/></button>
      </div>

      {/* 1. Problem Information */}
      <GlassCard>
        <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">1. Problem Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Problem Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Problem Code (Auto Generated if empty)</label>
            <input type="text" name="problemCode" value={formData.problemCode} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" placeholder="e.g. PRB-001" disabled={!!initialData} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
            <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full bg-[#1a1a2e] border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#1a1a2e] border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tags (Comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" placeholder="e.g. Array, Math" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Marks</label>
            <input type="number" name="marks" value={formData.marks} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" min="1" />
          </div>
        </div>
      </GlassCard>

      {/* 2. Availability */}
      <GlassCard>
        <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">2. Availability</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Publish Date</label>
            <input type="datetime-local" name="publishDate" value={formData.publishDate} onChange={handleChange} className="w-full bg-[rgba(255,255,255,0.05)] border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Expiry Date (Optional)</label>
            <input type="datetime-local" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full bg-[rgba(255,255,255,0.05)] border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#1a1a2e] border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* 3. Problem Statement */}
      <GlassCard>
        <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">3. Problem Statement</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description (Markdown Supported)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="5" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500 font-mono text-sm" placeholder="Write problem description here..."></textarea>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Input Format</label>
            <textarea name="inputFormat" value={formData.inputFormat} onChange={handleChange} rows="2" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500 font-mono text-sm"></textarea>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Output Format</label>
            <textarea name="outputFormat" value={formData.outputFormat} onChange={handleChange} rows="2" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500 font-mono text-sm"></textarea>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Constraints</label>
            {formData.constraints.map((c, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={c} onChange={(e) => handleArrayChange(i, null, e.target.value, 'constraints')} className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-white outline-none font-mono text-sm" placeholder="e.g. 1 <= N <= 10^5" />
                <button onClick={() => removeArrayItem(i, 'constraints')} className="p-2 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={18}/></button>
              </div>
            ))}
            <button onClick={() => addArrayItem('constraints', '')} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1"><Plus size={16}/> Add Constraint</button>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Explanation (Optional)</label>
            <textarea name="explanation" value={formData.explanation} onChange={handleChange} rows="3" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500 font-mono text-sm"></textarea>
          </div>
        </div>
      </GlassCard>

      {/* 4. Sample Test Cases */}
      <GlassCard>
        <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">4. Sample Test Cases (Visible to Students)</h3>
        {formData.sampleTestcases.map((tc, i) => (
          <div key={i} className="bg-black/20 p-4 rounded-lg mb-4 border border-white/5 relative">
            <button onClick={() => removeArrayItem(i, 'sampleTestcases')} className="absolute top-2 right-2 text-red-400 hover:bg-red-500/20 p-1 rounded"><Trash2 size={16}/></button>
            <h4 className="text-sm font-bold text-gray-300 mb-3">Sample Test Case {i + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Sample Input</label>
                <textarea value={tc.input} onChange={(e) => handleArrayChange(i, 'input', e.target.value, 'sampleTestcases')} rows="3" className="w-full bg-white/5 border border-white/10 rounded p-2 font-mono text-sm outline-none focus:border-cyan-500"></textarea>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Sample Output</label>
                <textarea value={tc.output} onChange={(e) => handleArrayChange(i, 'output', e.target.value, 'sampleTestcases')} rows="3" className="w-full bg-white/5 border border-white/10 rounded p-2 font-mono text-sm outline-none focus:border-cyan-500"></textarea>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-xs text-gray-400 mb-1">Explanation (Optional)</label>
              <input type="text" value={tc.explanation} onChange={(e) => handleArrayChange(i, 'explanation', e.target.value, 'sampleTestcases')} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm outline-none focus:border-cyan-500" />
            </div>
          </div>
        ))}
        <button onClick={() => addArrayItem('sampleTestcases', { input: '', output: '', explanation: '' })} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors text-sm"><Plus size={16}/> Add Another Sample Test Case</button>
      </GlassCard>

      {/* 5. Hidden Test Cases */}
      <GlassCard>
        <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">5. Hidden Test Cases (Used for Evaluation)</h3>
        {formData.hiddenTestcases.map((tc, i) => (
          <div key={i} className="bg-black/20 p-4 rounded-lg mb-4 border border-white/5 relative">
             <button onClick={() => removeArrayItem(i, 'hiddenTestcases')} className="absolute top-2 right-2 text-red-400 hover:bg-red-500/20 p-1 rounded"><Trash2 size={16}/></button>
             <h4 className="text-sm font-bold text-gray-300 mb-3">Hidden Test Case {i + 1}</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Input</label>
                <textarea value={tc.input} onChange={(e) => handleArrayChange(i, 'input', e.target.value, 'hiddenTestcases')} rows="3" className="w-full bg-white/5 border border-white/10 rounded p-2 font-mono text-sm outline-none focus:border-cyan-500"></textarea>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Expected Output</label>
                <textarea value={tc.output} onChange={(e) => handleArrayChange(i, 'output', e.target.value, 'hiddenTestcases')} rows="3" className="w-full bg-white/5 border border-white/10 rounded p-2 font-mono text-sm outline-none focus:border-cyan-500"></textarea>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => addArrayItem('hiddenTestcases', { input: '', output: '' })} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors text-sm"><Plus size={16}/> Add Hidden Test Case</button>
      </GlassCard>

      {/* 6 & 7: Settings and Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">6. Supported Languages</h3>
          <div className="space-y-3">
            {Object.keys(formData.supportedLanguages).map(lang => (
              <label key={lang} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name={`supportedLanguages.${lang}`} checked={formData.supportedLanguages[lang]} onChange={handleChange} className="w-4 h-4 accent-cyan-500" />
                <span className="capitalize text-gray-300">{lang}</span>
              </label>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">7. Problem Settings</h3>
          <div className="space-y-3">
             {Object.keys(formData.settings).map(setting => (
              <label key={setting} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name={`settings.${setting}`} checked={formData.settings[setting]} onChange={handleChange} className="w-4 h-4 accent-cyan-500" />
                <span className="text-gray-300">{setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* 8. Actions */}
      <div className="flex gap-4 sticky bottom-0 bg-[#0f0f16] p-4 border-t border-white/10 rounded-t-xl z-10">
        <button onClick={() => handleSave('Draft')} disabled={isSubmitting} className="flex-1 flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50">
          <Save size={18}/> Save Draft
        </button>
        <button onClick={() => handleSave('Published')} disabled={isSubmitting} className="flex-1 flex justify-center items-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(0,163,255,0.4)] disabled:opacity-50">
          <Send size={18}/> Publish Problem
        </button>
      </div>
    </div>
  );
};

export default AdminProblemForm;
