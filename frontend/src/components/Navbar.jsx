import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, Code2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 rounded-none border-t-0 border-x-0 border-white/10 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex flex-col items-center justify-center mt-1">
        <img src="/logo.jpg" alt="The Coding Club Logo" className="h-10 w-10 object-contain drop-shadow-md rounded-full border border-white/20" />
        <span className="text-[10px] font-bold tracking-widest text-white mt-1 uppercase">
          The Coding Club
        </span>
      </Link>
      
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link to={user.role === 'Admin' ? '/admin' : '/dashboard'} className="text-gray-300 hover:text-white transition-colors font-medium">
              Dashboard
            </Link>
            <Link to="/leaderboard" className="text-gray-300 hover:text-white transition-colors font-medium">
              Leaderboard
            </Link>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
              <Link to="/profile" className="flex items-center gap-2 text-brand-accent hover:text-blue-300 transition-colors">
                <UserIcon size={18} />
                <span className="font-semibold">{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium">
              Login
            </Link>
            <Link to="/register" className="bg-brand-accent hover:bg-blue-600 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-blue-500/30">
              Join Now
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
