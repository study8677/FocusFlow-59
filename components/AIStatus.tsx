import React from 'react';
import { AIResponse } from '../types';

interface AIStatusProps {
  loading: boolean;
  data: AIResponse | null;
}

export const AIStatus: React.FC<AIStatusProps> = ({ loading, data }) => {
  if (loading) {
    return (
      <div className="h-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        <span className="ml-3 text-slate-400 text-sm">AI 正在思考...</span>
      </div>
    );
  }

  if (!data) {
    return (
        <div className="h-24 flex items-center justify-center text-slate-500 text-sm">
            点击开始，获取 AI 伴侣的鼓励
        </div>
    )
  }

  return (
    <div className="min-h-[6rem] flex flex-col items-center justify-center text-center p-2 animate-fade-in">
      <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed">
        "{data.message}"
      </p>
      {data.author && (
        <span className="mt-2 text-sm text-primary font-mono">— {data.author}</span>
      )}
    </div>
  );
};