const {
  ipcRenderer,
  contextBridge
} = require('electron')

contextBridge.exposeInMainWorld('trayMenu', {
  query: () => ipcRenderer.invoke('tray-menu:query'),
  add: (newMenu) => ipcRenderer.invoke('tray-menu:add', newMenu),
  edit: (newMenu, target) => ipcRenderer.invoke('tray-menu:edit', newMenu, target),
  delete: (menuLabel) => ipcRenderer.invoke('tray-menu:delete', menuLabel),
  sort: (from, to) => ipcRenderer.invoke('tray-menu:sort', {
    from,
    to
  }),
  toggleHidden: (menuLabel) => ipcRenderer.invoke('tray-menu:toggleHidden', menuLabel),
  selectFile: () => ipcRenderer.invoke('tray-menu:selectFile'),
});

contextBridge.exposeInMainWorld('appMenu', {
  bindClickAddTrayMenu: (fn) => ipcRenderer.on('clickAddTrayMenu', fn),
  bindClickDeleteTrayMenu: (fn) => ipcRenderer.on('clickDeleteTrayMenu', fn),
  bindClickEditTrayMenu: (fn) => ipcRenderer.on('clickEditTrayMenu', fn),
  bindClickAbout: (fn) => ipcRenderer.on('clickAbout', fn),
});

contextBridge.exposeInMainWorld('happyCopy', {
  getVersion: () => ipcRenderer.invoke('app:version'),
})

// 绑定右键
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  ipcRenderer.send('show-context-menu', !!document.querySelector('.pattern-checks-sm'))
})

ipcRenderer.on('context-menu-command', (e, command) => {
  console.log(e, command);
})