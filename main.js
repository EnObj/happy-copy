const {
  app,
  Tray,
  Menu,
  nativeImage,
  clipboard,
  BrowserWindow,
  ipcMain,
  Notification,
} = require("electron");

const path = require("path");
const _ = require('lodash');
const dayjs = require('dayjs');

const settingService = require('./service/settingService');
const userMenuService = require('./service/userMenuService');

// 安装过程中避免多次启动程序
if (require('electron-squirrel-startup')) return app.quit();

// 程序图标
const icon = nativeImage.createFromPath(path.join(__dirname, "./static/image/icon.png"));

// 初始化用户设置
const settings = settingService.loadSettings();

// 创建主页window
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon,
  });
  win.loadFile("index.html");
}

function showWindow() {
  if (win.isDestroyed()) {
    createWindow();
  } else {
    win.show();
  }
}

function copy(value) {
  clipboard.writeText(value);
  new Notification({
    title: '操作成功',
    body: "内容已拷贝！",
    icon: nativeImage.createFromPath(path.join(__dirname, "./static/image/check.png"))
  }).show()
}

// 刷新tray菜单
function genTrayMenu(tray, menus) {
  // 用户的菜单项
  const userMenuItems = menus.map((arg) => ({
    label: arg.label,
    click() {
      copy(arg.value);
    },
  }))
  // 系统菜单项1
  const sysMenuItems1 = [{
    label: '显示主页面',
    click: showWindow
  }, {
    type: 'separator'
  }];
  // 日期时间
  let dataTimeItems = [];
  if (settings.showDateTime) {
    dataTimeItems = [{
      label: '系统日期',
      click() {
        copy(dayjs().format('YYYY-MM-DD'));
      }
    }, {
      label: '系统时间',
      click() {
        copy(dayjs().format('HH:mm:ss'));
      }
    }, {
      label: '系统日期时间',
      click() {
        copy(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      }
    }, {
      type: 'separator'
    }];
  }
  // 系统菜单项2
  const sysMenuItems2 = [{
    type: 'separator'
  }, {
    label: '退出',
    click() {
      app.quit();
    }
  }]
  const contextMenu = Menu.buildFromTemplate(_.concat(sysMenuItems1, dataTimeItems, userMenuItems, sysMenuItems2));
  tray.setContextMenu(contextMenu);
}

// 程序已初始化完成
app.whenReady().then(() => {
  // 角标快捷入口

  let tray = new Tray(icon);
  // 点击角标弹出主页面
  tray.on('click', showWindow)

  // 初始化菜单
  const menus = userMenuService.loadMenus();
  genTrayMenu(tray, menus);

  // 添加标签
  ipcMain.handle('tray-menu:add', async (event, newMenu) => {
    menus.push(newMenu)

    // 生成tray菜单
    genTrayMenu(tray, menus);

    // 持久化
    userMenuService.saveMenus(menus);

    // 发送最新的列表
    return menus;
  })

  // 删除标签
  ipcMain.handle('tray-menu:delete', async (event, menuLabel) => {
    menus.splice(menus.findIndex(({
      label
    }) => label == menuLabel), 1);

    // 生成tray菜单
    genTrayMenu(tray, menus);

    // 持久化
    userMenuService.saveMenus(menus);

    // 发送最新的列表
    return menus;
  })

  // 查询标签
  ipcMain.handle('tray-menu:query', async () => {
    return menus
  })

  // 设置窗口顶部菜单
  const appMenu = Menu.buildFromTemplate([{
    label: '标签',
    submenu: [{
        label: '新建',
        click: async () => {
          win.webContents.send('clickAddTrayMenu', 'whoooooooh!')
        }
      },
      {
        label: '删除',
        click: async () => {
          win.webContents.send('clickDeleteTrayMenu', 'whoooooooh!')
        }
      }
    ]
  }, {
    role: 'help',
    submenu: [{
      label: '切换开发人员工具',
      click: async () => {
        if (win.webContents.isDevToolsOpened()) {
          win.webContents.closeDevTools();
        } else {
          win.webContents.openDevTools();
        }
      }
    }, {
      label: '显示/隐藏系统时间',
      click: async () => {
        settings.showDateTime = !settings.showDateTime;
        settingService.saveSettings(settings);
        genTrayMenu(tray, menus);
      }
    }]
  }]);
  Menu.setApplicationMenu(appMenu)

  // 程序入口：创建窗口
  createWindow();

  // 激活程序时如果没有窗口则新建窗口
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 所有窗口都关闭了，此时退出程序
  app.on("window-all-closed", () => {
    // if (process.platform !== "darwin") {
    //   app.quit();
    // }
  });
});