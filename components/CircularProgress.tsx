import React from 'react';

interface CircularProgressProps {
  radius: number;
  stroke: number;
  progress: number; // 0 to 100
  color: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  radius, 
  stroke, 
  progress,
  color 
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 transition-all duration-500 ease-in-out"
      >
        {/* Background Circle */}
        <circle
          stroke="#334155"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Circle */}
        <circle
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
    </div>
  );
};