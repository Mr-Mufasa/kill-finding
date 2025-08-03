const { spawn } = require('child_process');
const { app } = require('electron');

let electronProcess = null;

function startElectron() {
  electronProcess = spawn('npx', ['electron', 'public/electron.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron exited with code ${code}`);
    process.exit(code);
  });
}

// Wait for Vite to be ready, then start Electron
const waitOn = require('wait-on');
waitOn({
  resources: ['http://localhost:5173'],
  delay: 1000,
  timeout: 30000
}).then(() => {
  console.log('Vite server is ready, starting Electron...');
  startElectron();
}).catch((err) => {
  console.error('Error waiting for Vite server:', err);
  process.exit(1);
});