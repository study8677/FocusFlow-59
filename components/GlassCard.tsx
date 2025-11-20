import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 shadow-xl rounded-2xl ${className}`}>
      {children}
    </div>
  );
};