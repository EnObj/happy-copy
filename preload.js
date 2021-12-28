const {
  ipcRenderer,
  contextBridge
} = require('electron')

contextBridge.exposeInMainWorld('trayMenu', {
  query: () => ipcRenderer.invoke('tray-menu:query'),
  add: (newMenu) => ipcRenderer.invoke('tray-menu:add', newMenu),
  delete: (menuLabel) => ipcRenderer.invoke('tray-menu:delete', menuLabel),
  sort: (from, to) => ipcRenderer.invoke('tray-menu:sort', {
    from,
    to
  }),
  selectFile: () => ipcRenderer.invoke('tray-menu:selectFile'),
});

contextBridge.exposeInMainWorld('appMenu', {
  bindClickAddTrayMenu: (fn) => ipcRenderer.on('clickAddTrayMenu', fn),
  bindClickDeleteTrayMenu: (fn) => ipcRenderer.on('clickDeleteTrayMenu', fn),
  bindClickAbout: (fn) => ipcRenderer.on('clickAbout', fn),
});

contextBridge.exposeInMainWorld('happyCopy', {
  getVersion: () => ipcRenderer.invoke('app:version'),
})