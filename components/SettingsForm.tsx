import React, { useState } from 'react';

interface SettingsFormProps {
  initialWork: number;
  initialBreak: number;
  initialSound: boolean;
  initialAutoStartBreak: boolean;
  initialAutoStartWork: boolean;
  onSave: (settings: {
    work: number;
    breakTime: number;
    sound: boolean;
    autoStartBreak: boolean;
    autoStartWork: boolean;
  }) => void;
  onCancel: () => void;
}

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (val: boolean) => void; colorClass: string }> = ({ 
    label, checked, onChange, colorClass 
}) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm font-medium text-slate-300">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`${
        checked ? colorClass : 'bg-slate-700'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
    >
      <span
        aria-hidden="true"
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

export const SettingsForm: React.FC<SettingsFormProps> = ({
  initialWork,
  initialBreak,
  initialSound,
  initialAutoStartBreak,
  initialAutoStartWork,
  onSave,
  onCancel,
}) => {
  const [work, setWork] = useState(initialWork);
  const [breakTime, setBreakTime] = useState(initialBreak);
  const [sound, setSound] = useState(initialSound);
  const [autoStartBreak, setAutoStartBreak] = useState(initialAutoStartBreak);
  const [autoStartWork, setAutoStartWork] = useState(initialAutoStartWork);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        work, 
        breakTime, 
        sound, 
        autoStartBreak, 
        autoStartWork
    });
  };

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in overflow-y-auto custom-scrollbar">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">偏好设置</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
        {/* Time Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">时间 (分钟)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="work" className="block text-xs text-indigo-300">
                专注时长
              </label>
              <input
                type="number"
                id="work"
                min="1"
                max="120"
                value={work}
                onChange={(e) => setWork(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-center font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="break" className="block text-xs text-pink-300">
                休息时长
              </label>
              <input
                type="number"
                id="break"
                min="1"
                max="60"
                value={breakTime}
                onChange={(e) => setBreakTime(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-center font-mono focus:ring-1 focus:ring-pink-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">自动化 & 音效</h3>
          
          <Toggle 
            label="播放提示音" 
            checked={sound} 
            onChange={setSound} 
            colorClass="bg-indigo-500" 
          />
          <Toggle 
            label="自动开始休息" 
            checked={autoStartBreak} 
            onChange={setAutoStartBreak} 
            colorClass="bg-pink-500" 
          />
          <Toggle 
            label="自动开始专注" 
            checked={autoStartWork} 
            onChange={setAutoStartWork} 
            colorClass="bg-indigo-500" 
          />
        </div>

        <div className="flex gap-3 pt-2 mt-auto">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105"
          >
            保存设置
          </button>
        </div>
      </form>
    </div>
  );
};