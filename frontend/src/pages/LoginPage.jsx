import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      // Assuming context decodes user to check role, if not we navigate based on what we fetched
      // We'll just navigate to dashboard and App.jsx routing will handle redirection if admin
      navigate('/dashboard');
    } catch (error) {
      if (!error.response) {
        toast.error('Cannot connect to backend server. Please verify the server is running.');
      } else {
        toast.error(error.response?.data?.message || 'Invalid email or password.');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Animated Logos */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
        <img src="/logo.jpg" alt="" className="absolute top-[10%] left-[15%] w-16 h-16 rounded-full animate-slow-jump" />
        <img src="/logo.jpg" alt="" className="absolute top-[60%] left-[10%] w-12 h-12 rounded-full animate-slow-jump-delayed opacity-50" />
        <img src="/logo.jpg" alt="" className="absolute top-[20%] right-[20%] w-20 h-20 rounded-full animate-slow-jump-fast opacity-80" />
        <img src="/logo.jpg" alt="" className="absolute top-[75%] right-[15%] w-14 h-14 rounded-full animate-slow-jump opacity-60" />
        <img src="/logo.jpg" alt="" className="absolute top-[40%] left-[80%] w-10 h-10 rounded-full animate-slow-jump-delayed opacity-40" />
        <img src="/logo.jpg" alt="" className="absolute bottom-[10%] left-[40%] w-24 h-24 rounded-full animate-slow-jump-fast opacity-30" />
      </div>

      <GlassCard className="w-full max-w-md relative z-10 backdrop-blur-xl bg-brand-dark/60">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <img src="/logo.jpg" alt="The Coding Club Logo" className="w-full h-full rounded-full object-contain shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Login to continue forging your skills.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-brand-accent text-white transition-colors"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">Forgot Password?</Link>
            </div>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-brand-accent text-white transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-accent hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-blue-500/30"
          >
            Login
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

export default LoginPage;
