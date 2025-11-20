export enum TimerMode {
  WORK = 'WORK',
  BREAK = 'BREAK',
}

export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
}

export interface AIResponse {
  message: string;
  author?: string; // Optional author for quotes
}