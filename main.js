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
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  // 顶栏快捷方式
  const icon = nativeImage.createFromPath("path/to/icon.png");
  let tray = new Tray(icon);

  // 初始化菜单
  const menus = [];

  // 添加标签
  ipcMain.handle('tray-menu:add', async (event, arg) => {
    menus.push(arg)

    const contextMenu = Menu.buildFromTemplate(menus.map((arg) => ({
      label: arg.label,
      click() {
        clipboard.writeText(arg.value);
      },
    })));
    tray.setContextMenu(contextMenu);

    // 发送最新的列表
    return menus;
  })

  // 查询标签
  ipcMain.handle('tray-menu:query', async () => {
    return menus
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