import React from 'react';

const GlassCard = ({ children, className = '' }) => {
  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
