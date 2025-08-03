export interface ElectronAPI {
  getScreenSources: () => Promise<any[]>;
  saveRecording: (buffer: Buffer, filename: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  onValorantStatus: (callback: (isRunning: boolean) => void) => void;
  onScreenSources: (callback: (sources: any[]) => void) => void;
  onStopRecording: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}