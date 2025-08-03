const { app, BrowserWindow, ipcMain, Tray, Menu, desktopCapturer, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { exec } = require('child_process');

let mainWindow;
let tray;
let isRecording = false;
let valorantMonitor;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'favicon.ico'),
    title: 'Valorant Kill Extractor'
  });

  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => mainWindow = null);
  
  // Hide to system tray instead of closing
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'favicon.ico'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Start Recording',
      click: () => {
        startScreenRecording();
      },
      enabled: !isRecording
    },
    {
      label: 'Stop Recording',
      click: () => {
        stopScreenRecording();
      },
      enabled: isRecording
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Valorant Kill Extractor');
  
  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

// Monitor Valorant process
function startValorantMonitor() {
  valorantMonitor = setInterval(() => {
    exec('tasklist /FI "IMAGENAME eq VALORANT-Win64-Shipping.exe"', (error, stdout) => {
      const isValorantRunning = stdout.includes('VALORANT-Win64-Shipping.exe');
      
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('valorant-status', isValorantRunning);
      }
    });
  }, 2000); // Check every 2 seconds
}

function stopValorantMonitor() {
  if (valorantMonitor) {
    clearInterval(valorantMonitor);
    valorantMonitor = null;
  }
}

// Screen recording functions
async function startScreenRecording() {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 150, height: 150 }
    });

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('screen-sources', sources);
      mainWindow.show();
      mainWindow.focus();
    }
  } catch (error) {
    console.error('Error getting screen sources:', error);
  }
}

function stopScreenRecording() {
  isRecording = false;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('stop-recording');
  }
  updateTrayMenu();
}

function updateTrayMenu() {
  if (tray) {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          mainWindow.show();
          mainWindow.focus();
        }
      },
      {
        label: 'Start Recording',
        click: () => {
          startScreenRecording();
        },
        enabled: !isRecording
      },
      {
        label: 'Stop Recording',
        click: () => {
          stopScreenRecording();
        },
        enabled: isRecording
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuiting = true;
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
  }
}

// IPC handlers
ipcMain.handle('get-screen-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 150, height: 150 }
    });
    return sources;
  } catch (error) {
    console.error('Error getting screen sources:', error);
    return [];
  }
});

ipcMain.on('recording-started', () => {
  isRecording = true;
  updateTrayMenu();
});

ipcMain.on('recording-stopped', () => {
  isRecording = false;
  updateTrayMenu();
});

ipcMain.handle('save-recording', async (event, buffer, filename) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
      filters: [
        { name: 'Video files', extensions: ['webm', 'mp4'] }
      ]
    });

    if (filePath) {
      const fs = require('fs');
      fs.writeFileSync(filePath, buffer);
      return { success: true, path: filePath };
    }
    return { success: false };
  } catch (error) {
    console.error('Error saving recording:', error);
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createTray();
  startValorantMonitor();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopValorantMonitor();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopValorantMonitor();
});