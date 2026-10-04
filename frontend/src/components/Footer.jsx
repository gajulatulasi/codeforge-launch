import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 mt-20 py-8 bg-brand-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="The Coding Club" className="h-6 w-6 opacity-70 rounded-full" />
          <span className="text-gray-400 font-medium">The Coding Club</span>
        </div>
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} The Coding Club. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
