import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Send, X, Upload } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const CATEGORIES = ['Aptitude', 'Java', 'Python', 'C', 'C++', 'SQL', 'HTML/CSS', 'JavaScript', 'General Knowledge', 'Technical'];

const AdminMcqAssessmentForm = ({ onCancel, onSuccess, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    assessmentCode: '',
    description: '',
    category: 'Technical',
    difficulty: 'Medium',
    totalMarks: 100,
    passingMarks: 40,
    publishDate: '',
    startDate: '',
    endDate: '',
    status: 'Draft',
    settings: {
      timeLimitPerQuestion: 1,
      totalQuestions: 10,
      randomizeQuestions: true,
      randomizeOptions: true,
      oneAttemptOnly: true,
      autoSubmitTimeExpiry: true,
      autoSubmitTabSwitches: 5,
      disableCopy: true,
      disablePaste: true,
      disableRightClick: true,
      enableAssessment: true
    },
    adminSettings: {
      showResultsImmediately: false,
      showCorrectAnswersAfterSubmission: false,
      showExplanations: false,
      showScoreImmediately: true,
      showTopicWiseAnalysis: false,
      hideAnswersUntilEnd: true,
      allowReview: false
    },
    questions: [{ question: '', options: ['', '', '', ''], correctOption: 0, points: 10, explanation: '' }]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({ 
      ...formData, 
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correctOption: 0, points: 10, explanation: '' }] 
    });
  };

  const removeQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleSave = async (statusOverride) => {
    if (!formData.title) return toast.error('Assessment Title is required');
    if (formData.questions.length === 0) return toast.error('At least one question is required');
    
    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question) return toast.error(`Question text missing for question ${i + 1}`);
      if (q.options.some(opt => !opt.trim())) return toast.error(`All 4 options must be filled for question ${i + 1}`);
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      status: statusOverride || formData.status,
    };

    try {
      if (initialData?.id) {
        await axios.put(`/api/assessments/${initialData.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Assessment updated successfully!');
      } else {
        await axios.post('/api/assessments', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Assessment created successfully!');
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      const lines = csv.split('\n');
      const newQuestions = [];
      
      // Skip header (assuming 1st row is header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Basic CSV splitting (doesn't handle commas inside quotes perfectly, but good enough for simple use cases)
        const parts = line.split(',');
        if (parts.length >= 6) {
          const question = parts[0];
          const options = [parts[1], parts[2], parts[3], parts[4]];
          const correctStr = parts[5].trim().toUpperCase();
          let correctOption = 0;
          if (correctStr === 'B') correctOption = 1;
          if (correctStr === 'C') correctOption = 2;
          if (correctStr === 'D') correctOption = 3;
          
          const points = parts[6] ? parseInt(parts[6]) : 10;
          const explanation = parts[7] || '';
          
          newQuestions.push({ question, options, correctOption, points, explanation });
        }
      }
      
      if (newQuestions.length > 0) {
        setFormData({ ...formData, questions: [...formData.questions, ...newQuestions] });
        toast.success(`Imported ${newQuestions.length} questions successfully`);
      } else {
        toast.error('Could not parse any questions. Ensure CSV format is correct.');
      }
      
      // Reset input
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{initialData ? 'Edit MCQ Assessment' : 'Create New MCQ Assessment'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white"><X size={24}/></button>
      </div>

      {/* 1. Assessment Information */}
      <GlassCard>
        <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">1. Assessment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Assessment Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Assessment Code (Auto Generated if empty)</label>
            <input type="text" name="assessmentCode" value={formData.assessmentCode} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" placeholder="e.g. ASM-001" disabled={!!initialData} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" placeholder="Describe the assessment..."></textarea>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#1a1a2e] border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
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
            <label className="block text-sm text-gray-400 mb-1">Total Marks</label>
            <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Passing Marks</label>
            <input type="number" name="passingMarks" value={formData.passingMarks} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" />
          </div>
        </div>
      </GlassCard>

      {/* 2. Assessment Availability */}
      <GlassCard>
        <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">2. Assessment Availability</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Publish Date</label>
            <input type="datetime-local" name="publishDate" value={formData.publishDate} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Start Date & Time</label>
            <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">End Date & Time</label>
            <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Assessment Settings */}
        <GlassCard>
          <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">3. Assessment Settings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Time Limit per Q (Mins)</label>
                <input type="number" name="settings.timeLimitPerQuestion" value={formData.settings.timeLimitPerQuestion} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Total Questions to show</label>
                <input type="number" name="settings.totalQuestions" value={formData.settings.totalQuestions} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" />
              </div>
              <div>
                 <label className="block text-sm text-gray-400 mb-1">Tab Switch Limit</label>
                 <input type="number" name="settings.autoSubmitTabSwitches" value={formData.settings.autoSubmitTabSwitches} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" />
              </div>
            </div>
            
            {Object.keys(formData.settings).filter(k => typeof formData.settings[k] === 'boolean').map(setting => (
              <label key={setting} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name={`settings.${setting}`} checked={formData.settings[setting]} onChange={handleChange} className="w-4 h-4 accent-cyan-500" />
                <span className="text-gray-300 text-sm">{setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </GlassCard>

        {/* 6. Admin Settings */}
        <GlassCard>
          <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Admin Results Settings</h3>
          <div className="space-y-3">
             {Object.keys(formData.adminSettings).map(setting => (
              <label key={setting} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name={`adminSettings.${setting}`} checked={formData.adminSettings[setting]} onChange={handleChange} className="w-4 h-4 accent-cyan-500" />
                <span className="text-gray-300 text-sm">{setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* 4. Add Questions */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
           <h3 className="text-lg font-bold">4. Questions ({formData.questions.length})</h3>
           <div className="flex gap-2">
             <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCsvUpload} className="hidden" />
             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-1.5 rounded text-sm transition-colors">
               <Upload size={16}/> Import CSV
             </button>
           </div>
        </div>
        
        {formData.questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-black/30 p-4 rounded-lg mb-6 border border-white/5 relative">
            <button onClick={() => removeQuestion(qIndex)} className="absolute top-2 right-2 text-red-400 hover:bg-red-500/20 p-1 rounded"><Trash2 size={18}/></button>
            <h4 className="font-bold text-gray-300 mb-3">Question {qIndex + 1}</h4>
            
            <div className="mb-4">
               <textarea value={q.question} onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} rows="2" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-cyan-500" placeholder="Type question here..."></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               {q.options.map((opt, oIndex) => (
                 <div key={oIndex} className="flex items-center gap-2">
                    <span className="font-bold text-cyan-500">{String.fromCharCode(65 + oIndex)}.</span>
                    <input type="text" value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} className={`w-full bg-white/5 border ${q.correctOption === oIndex ? 'border-cyan-500' : 'border-white/10'} rounded p-2 text-white outline-none focus:border-cyan-500`} placeholder={`Option ${String.fromCharCode(65 + oIndex)}`} />
                    <input type="radio" name={`correct_${qIndex}`} checked={q.correctOption === oIndex} onChange={() => handleQuestionChange(qIndex, 'correctOption', oIndex)} className="w-5 h-5 accent-cyan-500 cursor-pointer" title="Mark as correct option" />
                 </div>
               ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="md:col-span-3">
                 <label className="block text-xs text-gray-400 mb-1">Explanation (Optional)</label>
                 <input type="text" value={q.explanation} onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white text-sm" placeholder="Why is this correct?" />
               </div>
               <div>
                 <label className="block text-xs text-gray-400 mb-1">Points</label>
                 <input type="number" value={q.points} onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white text-sm" />
               </div>
            </div>
          </div>
        ))}
        
        <button onClick={addQuestion} className="flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 w-full py-3 rounded border border-dashed border-white/20 text-gray-300 transition-colors">
          <Plus size={18} /> Add Another Question
        </button>
      </GlassCard>

      {/* 8. Actions */}
      <div className="flex gap-4 sticky bottom-0 bg-[#0f0f16] p-4 border-t border-white/10 rounded-t-xl z-10">
        <button onClick={() => handleSave('Draft')} disabled={isSubmitting} className="flex-1 flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50">
          <Save size={18}/> Save Draft
        </button>
        <button onClick={() => handleSave('Published')} disabled={isSubmitting} className="flex-1 flex justify-center items-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(0,163,255,0.4)] disabled:opacity-50">
          <Send size={18}/> Publish Assessment
        </button>
      </div>
    </div>
  );
};

export default AdminMcqAssessmentForm;
