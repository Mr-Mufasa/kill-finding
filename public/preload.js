const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Screen recording
  getScreenSources: () => ipcRenderer.invoke('get-screen-sources'),
  startDesktopRecording: (sourceId) => ipcRenderer.invoke('start-desktop-recording', sourceId),
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
  
  // Start recording with source
  onStartRecordingWithSource: (callback) => {
    ipcRenderer.on('start-recording-with-source', (event, sourceId) => callback(sourceId));
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});