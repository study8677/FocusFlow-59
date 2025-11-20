import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode, TimerStatus, AIResponse } from './types';
import { fetchMotivation } from './services/geminiService';
import { CircularProgress } from './components/CircularProgress';
import { GlassCard } from './components/GlassCard';
import { AIStatus } from './components/AIStatus';
import { SettingsForm } from './components/SettingsForm';

// Sound utilities
const playNotificationSound = () => {
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
  oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.5, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.5);
};

export const App: React.FC = () => {
  // Settings State
  const [workMinutes, setWorkMinutes] = useState<number>(50);
  const [breakMinutes, setBreakMinutes] = useState<number>(10);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoStartBreak, setAutoStartBreak] = useState<boolean>(false);
  const [autoStartWork, setAutoStartWork] = useState<boolean>(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Timer State
  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [timeLeft, setTimeLeft] = useState<number>(50 * 60);
  const [sessionCount, setSessionCount] = useState<number>(0);
  
  // AI State
  const [aiData, setAiData] = useState<AIResponse | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  
  // Refs for interval
  const timerRef = useRef<number | null>(null);
  // Ref to hold the latest completion handler to avoid stale closures or interval resets
  const handleTimerCompleteRef = useRef<() => void>(() => {});

  // Helpers
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = useCallback(() => {
    return mode === TimerMode.WORK ? workMinutes * 60 : breakMinutes * 60;
  }, [mode, workMinutes, breakMinutes]);

  const getProgress = useCallback(() => {
    const total = getTotalDuration();
    const elapsed = total - timeLeft;
    return (elapsed / total) * 100;
  }, [timeLeft, getTotalDuration]);

  const fetchAIMessage = useCallback(async (currentMode: TimerMode) => {
    setLoadingAI(true);
    try {
      const data = await fetchMotivation(currentMode);
      setAiData(data);
    } catch (e) {
      console.error(e);
      setAiData({ message: "加油！保持专注。" });
    } finally {
      setLoadingAI(false);
    }
  }, []);

  const handleDownload = () => {
    // Create a dummy file for demonstration
    const content = "FocusFlow Desktop Version\n\n感谢您下载 FocusFlow 桌面版。\n这是一个演示文件，在实际生产环境中，这里将下载 .exe 安装包。\n\n提示：您可以使用 Chrome 的 '安装 FocusFlow' 功能将其作为桌面应用运行。";
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FocusFlow-Desktop-Readme.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initialization
  useEffect(() => {
    fetchAIMessage(TimerMode.WORK);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTimerComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (soundEnabled) {
        playNotificationSound();
    }

    // If we just finished a work session, increment count
    if (mode === TimerMode.WORK) {
        setSessionCount(prev => prev + 1);
    }
    
    const nextMode = mode === TimerMode.WORK ? TimerMode.BREAK : TimerMode.WORK;
    setMode(nextMode);
    setTimeLeft(nextMode === TimerMode.WORK ? workMinutes * 60 : breakMinutes * 60);

    // Auto-start logic
    const shouldAutoStart = nextMode === TimerMode.WORK ? autoStartWork : autoStartBreak;
    setStatus(shouldAutoStart ? TimerStatus.RUNNING : TimerStatus.IDLE);
    
    // Fetch new motivation for the new mode
    fetchAIMessage(nextMode);
  };

  // Update the ref whenever the underlying data for completion changes
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [mode, workMinutes, breakMinutes, soundEnabled, autoStartBreak, autoStartWork, fetchAIMessage]);

  // Timer Logic
  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer Finished
            handleTimerCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const toggleTimer = () => {
    if (status === TimerStatus.RUNNING) {
      setStatus(TimerStatus.PAUSED);
    } else {
      setStatus(TimerStatus.RUNNING);
    }
  };

  const resetTimer = () => {
    setStatus(TimerStatus.IDLE);
    setMode(TimerMode.WORK);
    setTimeLeft(workMinutes * 60);
    fetchAIMessage(TimerMode.WORK);
  };

  const skipPhase = () => {
    handleTimerComplete();
  };

  const handleSaveSettings = (newSettings: {
      work: number; 
      breakTime: number; 
      sound: boolean;
      autoStartBreak: boolean;
      autoStartWork: boolean;
    }) => {
    setWorkMinutes(newSettings.work);
    setBreakMinutes(newSettings.breakTime);
    setSoundEnabled(newSettings.sound);
    setAutoStartBreak(newSettings.autoStartBreak);
    setAutoStartWork(newSettings.autoStartWork);
    setIsSettingsOpen(false);
    
    // Apply changes: Reset timer to Work mode with new settings only if Idle to avoid disrupting flow
    // Or just update current timeLeft if currently IDLE and in Work mode matching old config
    if (status === TimerStatus.IDLE && mode === TimerMode.WORK) {
        setTimeLeft(newSettings.work * 60);
    }
  };

  // Theme Colors
  const isWork = mode === TimerMode.WORK;
  const bgGradient = isWork 
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950' 
    : 'bg-gradient-to-br from-slate-900 via-slate-800 to-pink-950';

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-1000 ${bgGradient}`}>
      
      <div className="max-w-md w-full flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex justify-between items-end px-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                FocusFlow
            </h1>
            <p className="text-slate-400 text-sm">
                {isWork ? "深度工作 · 保持专注" : "休息时间 · 放松身心"}
            </p>
          </div>
          <div className="text-right">
             <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">今日专注</div>
             <div className="text-xl font-mono font-bold text-white">{sessionCount} <span className="text-xs text-slate-500 font-normal">次</span></div>
          </div>
        </header>

        {/* Main Card */}
        <GlassCard className="p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none transition-colors duration-1000 ${isWork ? 'bg-indigo-600' : 'bg-pink-600'}`}></div>

            {/* Settings Toggle Button */}
            <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-20 rounded-full hover:bg-white/10"
                title="Settings"
            >
                {isSettingsOpen ? (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.941l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                )}
            </button>

            {isSettingsOpen ? (
                <SettingsForm
                    initialWork={workMinutes}
                    initialBreak={breakMinutes}
                    initialSound={soundEnabled}
                    initialAutoStartBreak={autoStartBreak}
                    initialAutoStartWork={autoStartWork}
                    onSave={handleSaveSettings}
                    onCancel={() => setIsSettingsOpen(false)}
                />
            ) : (
                <>
                    <div className="mb-8 relative z-10">
                        <CircularProgress
                            radius={120}
                            stroke={6}
                            progress={getProgress()}
                            color={isWork ? '#6366f1' : '#ec4899'}
                        />
                        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-5xl font-bold font-mono text-white mb-1 tracking-wider">
                                {formatTime(timeLeft)}
                            </span>
                            <span className={`text-sm font-medium tracking-widest uppercase ${isWork ? 'text-indigo-300' : 'text-pink-300'}`}>
                                {status === TimerStatus.PAUSED ? 'PAUSED' : (isWork ? 'FOCUS' : 'BREAK')}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4 z-10 w-full max-w-xs">
                        <button
                            onClick={toggleTimer}
                            className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                                isWork 
                                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25' 
                                    : 'bg-pink-600 hover:bg-pink-500 shadow-pink-500/25'
                            }`}
                        >
                            {status === TimerStatus.RUNNING ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                                    </svg>
                                    暂停
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                    </svg>
                                    {status === TimerStatus.IDLE ? '开始' : '继续'}
                                </>
                            )}
                        </button>
                        
                        {status !== TimerStatus.IDLE && (
                            <button
                                onClick={resetTimer}
                                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title="重置"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>
                        )}
                        
                         <button
                            onClick={skipPhase}
                            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="跳过当前阶段"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zm9.75 0c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
                            </svg>
                        </button>
                    </div>

                    {/* AI Motivation Section */}
                    <div className="mt-8 w-full">
                        <AIStatus loading={loadingAI} data={aiData} />
                    </div>
                </>
            )}
        </GlassCard>

        {/* Download Button Footer */}
        <div className="flex justify-center">
             <button 
                onClick={handleDownload}
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 text-xs hover:text-white hover:bg-slate-800 transition-all"
             >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover:text-indigo-400 transition-colors">
                    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
                下载 Windows 桌面版
             </button>
        </div>
      </div>
    </div>
  );
};