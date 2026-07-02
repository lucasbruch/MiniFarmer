const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let win;

function createWindow() {
  const { width: sw } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 580,
    height: 680,
    useContentSize: true,
    x: sw - 600,
    y: 50,
    frame: false,
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    title: 'Mini Farmer',
    backgroundColor: '#8fce6b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  win.setAlwaysOnTop(true, 'floating');
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Window controls from the renderer's custom title bar.
ipcMain.on('win:minimize', () => win && win.minimize());
ipcMain.on('win:close', () => win && win.close());
ipcMain.on('win:pin', (_e, pinned) => {
  if (!win) return;
  win.setAlwaysOnTop(pinned, 'floating');
});
