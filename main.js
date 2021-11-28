const {
  app,
  Tray,
  Menu,
  nativeImage,
  clipboard,
  BrowserWindow,
  ipcMain,
} = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  // 顶栏快捷方式
  const icon = nativeImage.createFromPath("path/to/icon.png");
  let tray = new Tray(icon);

  const menus = [];
  ipcMain.on('synchronous-message', (event, arg) => {
    menus.push({
      label: arg.label,
      click() {
        clipboard.writeText(arg.value);
      },
    })
    const contextMenu = Menu.buildFromTemplate(menus);
    tray.setContextMenu(contextMenu);
  })

  // 页面
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
});
