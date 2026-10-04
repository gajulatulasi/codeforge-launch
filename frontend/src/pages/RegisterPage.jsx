import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email.endsWith('@mbu.asia')) {
        toast.error('You must use a valid @mbu.asia college email address.');
        return;
      }
      await register(name, email, password, 'Member', branch, year, mobileNumber);
      toast.success('Registration successful! Waiting for admin approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 mt-8 mb-8">
      <GlassCard className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-cyan-400" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Join CodeForge</h2>
          <p className="text-gray-400">Register with your college email address.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-colors"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">College Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-colors"
              placeholder="you@mbu.asia"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-colors"
              placeholder="10-digit mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Branch</label>
              <select required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-colors" value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="" disabled className="bg-brand-dark">Select Branch</option>
                <option value="CSE" className="bg-brand-dark">CSE</option>
                <option value="IT" className="bg-brand-dark">IT</option>
                <option value="ECE" className="bg-brand-dark">ECE</option>
                <option value="EEE" className="bg-brand-dark">EEE</option>
                <option value="MECH" className="bg-brand-dark">MECH</option>
                <option value="CIVIL" className="bg-brand-dark">CIVIL</option>
              </select>
             </div>
             <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
              <select required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-colors" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="" disabled className="bg-brand-dark">Select Year</option>
                <option value="1" className="bg-brand-dark">1st Year</option>
                <option value="2" className="bg-brand-dark">2nd Year</option>
                <option value="3" className="bg-brand-dark">3rd Year</option>
                <option value="4" className="bg-brand-dark">4th Year</option>
              </select>
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-cyan-500/30"
          >
            Create Account
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Login
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

export default RegisterPage;
