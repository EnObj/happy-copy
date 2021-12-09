const {
  ipcRenderer,
  contextBridge
} = require('electron')

contextBridge.exposeInMainWorld('trayMenu', {
  query: () => ipcRenderer.invoke('tray-menu:query'),
  add: (newMenu) => ipcRenderer.invoke('tray-menu:add', newMenu),
  delete: (menuLabel) => ipcRenderer.invoke('tray-menu:delete', menuLabel),
});

contextBridge.exposeInMainWorld('appMenu', {
  bindClickAddTrayMenu: (fn) => ipcRenderer.on('clickAddTrayMenu', fn),
  bindClickDeleteTrayMenu: (fn) => ipcRenderer.on('clickDeleteTrayMenu', fn)
});