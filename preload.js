const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('winControls', {
  minimize: () => ipcRenderer.send('win:minimize'),
  close: () => ipcRenderer.send('win:close'),
  setPin: (pinned) => ipcRenderer.send('win:pin', pinned)
});
