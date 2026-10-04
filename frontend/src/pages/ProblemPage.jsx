import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { Play, CheckCircle, Clock, Terminal, Send, ChevronUp, ChevronDown } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import SecureAssessmentWrapper from '../components/SecureAssessmentWrapper';
import { AuthContext } from '../context/AuthContext';

const ProblemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`/api/problems/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProblem(res.data);
        
        // Set default language if available
        if (res.data.supportedLanguages && res.data.supportedLanguages.length > 0) {
          const firstLang = res.data.supportedLanguages[0].toLowerCase();
          setLanguage(firstLang);
          setCode(res.data.starterCode?.[firstLang] || '// Write your code here\n');
        }
      } catch (err) {
        toast.error('Failed to load problem. It might be locked or hidden.');
        navigate('/dashboard');
      }
    };
    fetchProblem();
  }, [id, navigate]);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode?.[language] || '// Write your code here\n');
    }
  }, [language, problem]);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setIsConsoleOpen(true);
    setConsoleOutput('Running tests...\n');
    try {
      const res = await axios.post(`/api/problems/${id}/run`, {
        code,
        language
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConsoleOutput(res.data.output || 'Execution complete.');
    } catch (err) {
      setConsoleOutput(err.response?.data?.message || 'Failed to run code. Check network connection.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    // If empty code is submitted manually, we allow it (scores 0). 
    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/submissions', {
        problemId: id,
        code: isAutoSubmit ? '// Automatically submitted due to anti-cheat violation' : code,
        language
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.data.status === 'Accepted') {
        toast.success(`Solution Accepted! +${problem.marks || 10} Points`);
        if (!isAutoSubmit) navigate('/dashboard');
      } else {
        toast.error(`Submission evaluated as: ${res.data.status}`);
        if (!isAutoSubmit) navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Failed to submit code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViolationLimit = () => {
    handleSubmit(true); // Auto-submit on violation
  };

  if (!problem) return <div className="p-10 text-center animate-pulse text-cyan-400">Loading problem environment...</div>;

  const sampleTestcases = problem.sampleTestcases && problem.sampleTestcases.length > 0 ? problem.sampleTestcases : problem.examples; // fallback to legacy

  return (
    <SecureAssessmentWrapper 
      isActive={user?.role === 'Member' && problem.settings?.availableInContest} 
      maxTabSwitches={5}
      onViolationLimit={handleViolationLimit}
    >
      <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row bg-brand-dark overflow-hidden">
        
        {/* Left Pane: Problem Description */}
        <div className="w-full md:w-1/2 h-full overflow-y-auto border-r border-white/10 p-6 custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="text-sm font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">{problem.problemCode || `DAY-${problem.day}`}</span>
                 {problem.category && <span className="text-xs text-gray-400 border border-gray-500/30 px-2 py-0.5 rounded">{problem.category}</span>}
              </div>
              <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded text-xs font-bold ${problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                {problem.difficulty}
              </span>
              <span className="text-xs text-gray-400 font-bold">{problem.marks} Marks</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-8">
            <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">{problem.description}</p>
          </div>
          
          {problem.inputFormat && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2">Input Format</h3>
              <p className="text-sm text-gray-400 whitespace-pre-wrap bg-white/5 p-3 rounded-lg border border-white/5">{problem.inputFormat}</p>
            </div>
          )}

          {problem.outputFormat && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2">Output Format</h3>
              <p className="text-sm text-gray-400 whitespace-pre-wrap bg-white/5 p-3 rounded-lg border border-white/5">{problem.outputFormat}</p>
            </div>
          )}

          {sampleTestcases && sampleTestcases.length > 0 && problem.settings?.showSampleTestcases !== false && (
            <div className="space-y-6 mb-8">
              <h3 className="text-lg font-bold text-white">Sample Test Cases</h3>
              {sampleTestcases.map((ex, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
                  <div className="bg-white/5 px-4 py-2 border-b border-white/10 text-sm font-bold text-gray-300">
                    Test Case {idx + 1}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-bold">Input</p>
                      <pre className="font-mono text-sm text-cyan-100 bg-black/50 p-2 rounded">{ex.input}</pre>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-bold">Output</p>
                      <pre className="font-mono text-sm text-green-100 bg-black/50 p-2 rounded">{ex.output}</pre>
                    </div>
                    {ex.explanation && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1 font-bold">Explanation</p>
                        <p className="text-sm text-gray-400">{ex.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {problem.constraints && problem.constraints.length > 0 && (
            <div className="mb-8">
               <h3 className="text-lg font-bold text-white mb-3">Constraints</h3>
               <ul className="list-disc pl-5 space-y-2">
                 {problem.constraints.map((c, i) => (
                   <li key={i} className="text-gray-300"><span className="font-mono text-sm bg-black/40 px-2 py-1 rounded border border-white/5">{c}</span></li>
                 ))}
               </ul>
            </div>
          )}
          
          {problem.explanation && (
            <div className="mb-8 p-4 bg-cyan-900/20 border border-cyan-500/20 rounded-lg">
              <h3 className="text-sm font-bold text-cyan-400 mb-2">Note</h3>
              <p className="text-sm text-gray-300">{problem.explanation}</p>
            </div>
          )}
        </div>

        {/* Right Pane: Code Editor & Console */}
        <div className="w-full md:w-1/2 h-full flex flex-col relative">
          {/* Editor Toolbar */}
          <div className="h-14 bg-[#1e1e1e] border-b border-black/50 flex justify-between items-center px-4 z-10">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/10 border-none outline-none text-sm text-white px-3 py-1.5 rounded cursor-pointer hover:bg-white/20 transition-colors capitalize"
            >
              {problem.supportedLanguages?.map(lang => (
                <option key={lang} value={lang.toLowerCase()}>{lang}</option>
              )) || (
                <>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </>
              )}
            </select>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
               <div className="flex items-center gap-1">
                 <Clock size={16} /> <span className="font-mono">{formatTime(timer)}</span>
               </div>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-grow relative" style={{ height: isConsoleOpen ? 'calc(100% - 250px)' : '100%' }}>
            <Editor
              height="100%"
              language={language === 'c' || language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                roundedSelection: false,
              }}
            />
          </div>

          {/* Console Pane */}
          {isConsoleOpen && (
            <div className="h-[200px] bg-[#1e1e1e] border-t border-white/10 flex flex-col z-10">
              <div className="flex justify-between items-center px-4 py-2 bg-black/40 border-b border-white/5">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><Terminal size={14}/> Console Output</span>
                <button onClick={() => setIsConsoleOpen(false)} className="text-gray-500 hover:text-white transition-colors"><ChevronDown size={16}/></button>
              </div>
              <div className="p-4 overflow-y-auto flex-grow font-mono text-sm whitespace-pre-wrap text-gray-300">
                {consoleOutput}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="h-16 bg-[#1a1a1a] border-t border-white/10 flex justify-between items-center px-4 z-10">
             <button 
               onClick={() => setIsConsoleOpen(!isConsoleOpen)}
               className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
             >
               <Terminal size={18} /> {isConsoleOpen ? 'Close Console' : 'Open Console'}
             </button>

             <div className="flex gap-3">
               <button 
                 onClick={handleRunCode}
                 disabled={isRunning || isSubmitting}
                 className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-5 py-2 rounded text-sm font-bold transition-colors"
               >
                 {isRunning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Play size={16} fill="currentColor" />}
                 Run Code
               </button>
               <button 
                 onClick={() => handleSubmit(false)}
                 disabled={isSubmitting || isRunning}
                 className="flex items-center gap-2 bg-brand-accent hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded text-sm font-bold transition-colors shadow-[0_0_15px_rgba(0,163,255,0.4)]"
               >
                 {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={16} />}
                 Submit Solution
               </button>
             </div>
          </div>
        </div>

      </div>
    </SecureAssessmentWrapper>
  );
};

export default ProblemPage;
