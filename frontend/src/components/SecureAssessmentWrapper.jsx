import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

const SecureAssessmentWrapper = ({ 
  children, 
  isActive = true, 
  onViolationLimit,
  maxTabSwitches = 5 
}) => {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const hasTriggeredViolation = useRef(false);

  useEffect(() => {
    if (!isActive || isLocked) return;

    // Prevent Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.error('Right-click is disabled during assessments.', { id: 'contextmenu-warn' });
    };

    // Prevent Copy/Paste
    const handleClipboard = (e) => {
      e.preventDefault();
      toast.error('Copy/Paste is disabled during assessments.', { id: 'clipboard-warn' });
    };

    // Detect Tab Switches
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          
          if (newCount > maxTabSwitches && !hasTriggeredViolation.current) {
            hasTriggeredViolation.current = true;
            setIsLocked(true);
            if (onViolationLimit) {
              onViolationLimit();
            } else {
              toast.error('Assessment terminated due to repeated tab switching.', { duration: 5000 });
            }
          } else if (newCount <= maxTabSwitches) {
            toast.error(`Warning: You switched tabs! (${newCount}/${maxTabSwitches} allowed)`, { 
              duration: 4000,
              icon: '⚠️'
            });
          }
          
          return newCount;
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    document.addEventListener('paste', handleClipboard);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      document.removeEventListener('paste', handleClipboard);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, isLocked, maxTabSwitches, onViolationLimit]);

  if (isLocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-lg text-center backdrop-blur-sm">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Assessment Terminated</h2>
          <p className="text-gray-300 text-lg mb-6">
            Your assessment has been automatically submitted and locked because you exceeded the maximum allowed tab switches ({maxTabSwitches}).
          </p>
          <div className="bg-black/20 p-4 rounded-lg text-left text-sm text-gray-400">
            <p className="font-bold text-red-400 mb-2">Anti-Cheat Policy Violation Recorded</p>
            <p>Our academic integrity policy forbids leaving the assessment environment. Your attempt has been logged.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isActive && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 border border-red-500/30 px-4 py-2 rounded-lg backdrop-blur-md flex items-center gap-3 shadow-xl shadow-red-500/10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs font-bold text-gray-300">SECURE MODE ACTIVE</span>
          <div className="h-4 w-px bg-white/20 mx-2"></div>
          <span className={`text-xs font-bold ${tabSwitches > 0 ? 'text-red-400' : 'text-gray-400'}`}>
            Warnings: {tabSwitches}/{maxTabSwitches}
          </span>
        </div>
      )}
      {children}
    </div>
  );
};

export default SecureAssessmentWrapper;
