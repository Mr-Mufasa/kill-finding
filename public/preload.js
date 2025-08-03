const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Screen recording
  getScreenSources: () => ipcRenderer.invoke('get-screen-sources'),
  saveRecording: (buffer, filename) => ipcRenderer.invoke('save-recording', buffer, filename),
  
  // Recording state
  onRecordingStart: () => ipcRenderer.send('recording-started'),
  onRecordingStop: () => ipcRenderer.send('recording-stopped'),
  
  // Valorant monitoring
  onValorantStatus: (callback) => {
    ipcRenderer.on('valorant-status', (event, isRunning) => callback(isRunning));
  },
  
  // Screen sources
  onScreenSources: (callback) => {
    ipcRenderer.on('screen-sources', (event, sources) => callback(sources));
  },
  
  // Stop recording
  onStopRecording: (callback) => {
    ipcRenderer.on('stop-recording', () => callback());
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});