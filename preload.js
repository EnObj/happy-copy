const {
  ipcRenderer,
  contextBridge
} = require('electron')

contextBridge.exposeInMainWorld('trayMenu', {
  query: () => ipcRenderer.invoke('tray-menu:query'),
  add: (newMenu) => ipcRenderer.invoke('tray-menu:add', newMenu),
  delete: (menuLabel) => ipcRenderer.invoke('tray-menu:delete', menuLabel),
});