import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { KeyRound, Smartphone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/forgot-password', { mobileNumber });
      toast.success('OTP sent successfully!');
      
      // For development purposes, pre-fill the OTP since we are simulating SMS
      if (res.data.simulatedOtp) {
        setOtp(res.data.simulatedOtp);
        toast('Simulated OTP auto-filled for testing', { icon: '🛠️' });
      }
      
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/reset-password', {
        mobileNumber,
        otp,
        newPassword
      });
      toast.success(res.data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="text-cyan-400" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400">
            {step === 1 ? 'Enter your registered mobile number.' : 'Enter OTP and new password.'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="tel"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-colors"
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-cyan-500/30"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">6-Digit OTP</label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-colors tracking-widest"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-colors"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-cyan-500/30"
            >
              Set New Password
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full bg-transparent hover:bg-white/5 text-gray-400 font-bold py-3 rounded-lg transition-colors border border-white/10"
            >
              Back
            </button>
          </form>
        )}
        
        <p className="mt-6 text-center text-gray-400">
          Remember your password?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Login
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

export default ForgotPassword;
