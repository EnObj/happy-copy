const {
  app,
  Tray,
  Menu,
  nativeImage,
  clipboard,
  BrowserWindow,
  ipcMain,
  Notification,
  dialog,
} = require("electron");

const path = require("path");
const _ = require('lodash');
const dayjs = require('dayjs');
const fs = require('fs');

const settingService = require('./service/settingService');
const userMenuService = require('./service/userMenuService');

// 安装过程中避免多次启动程序
if (require('electron-squirrel-startup')) return app.quit();

// 程序图标
const icon = nativeImage.createFromPath(path.join(__dirname, "./assets/image/icon.png"));

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
  win.webContents.on('before-input-event', (event, input) => {
    // 在主页面绑定ctrl+v快速创建项目
    if (input.control && input.key.toLowerCase() === 'v') {
      // 图片
      const img = clipboard.readImage();
      if (!img.isEmpty()) {
        const imgPath = path.resolve(app.getPath("userData"), `userimg-${Date.now()}.png`)
        fs.writeFileSync(imgPath, img.toPNG())
        win.webContents.send('clickAddTrayMenu', {
          value: imgPath,
          type: 'img'
        })
      } else { // 默认是文本
        win.webContents.send('clickAddTrayMenu', {
          value: clipboard.readText() || ''
        })
      }
      // event.preventDefault()
    }
  })
}

function showWindow() {
  if (win.isDestroyed()) {
    createWindow();
  } else {
    win.show();
  }
}

function copy(value, type) {
  // 如果是图片
  if (type == 'img') {
    console.log(clipboard.availableFormats);
    clipboard.writeImage(nativeImage.createFromPath(value))
  } else {
    clipboard.writeText(value);
  }
  new Notification({
    title: '操作成功',
    body: "内容已拷贝！",
    icon: nativeImage.createFromPath(path.join(__dirname, "./assets/image/check.png"))
  }).show()
}

// 刷新tray菜单
function genTrayMenu(tray, menus) {
  // 用户的菜单项
  const userMenuItems = menus.map((arg) => ({
    label: arg.label,
    icon: nativeImage.createFromPath(path.join(__dirname, `./assets/image/${arg.type || 'text'}.png`)),
    click() {
      copy(arg.value, arg.type);
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

  // 编辑标签
  ipcMain.handle('tray-menu:edit', async (event, newMenu, target) => {
    menus.splice(menus.findIndex(({
      label
    }) => label == target), 1, newMenu);

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

  // 切换隐藏/显示
  ipcMain.handle('tray-menu:toggleHidden', async (event, menuLabel) => {
    const target = menus.find(({
      label
    }) => label == menuLabel);
    target.hidden = !target.hidden;

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

  // 拖拽排序
  ipcMain.handle('tray-menu:sort', async (event, {
    from,
    to
  }) => {
    if (from == to) {
      return menus;
    }

    // 抹掉原来的
    const [item] = menus.splice(from, 1);
    // 新增新位置的
    menus.splice(from > to ? to : to - 1, 0, item)

    // 生成tray菜单
    genTrayMenu(tray, menus);

    // 持久化
    userMenuService.saveMenus(menus);

    // 发送最新的列表
    return menus;
  })

  // 选择文件
  ipcMain.handle('tray-menu:selectFile', async () => {
    const {
      filePaths
    } = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{
        name: 'Images',
        extensions: ['jpg', 'png', 'gif']
      }, ]
    });
    console.log(filePaths);
    return filePaths[0]
  })

  ipcMain.handle('app:version', async () => {
    return app.getVersion();
  })

  // 右键菜单
  ipcMain.on('show-context-menu', (event, haveSelected) => {
    let template = [{
      label: '新建',
      click: () => {
        win.webContents.send('clickAddTrayMenu')
      }
    }]
    const templateWhenSelected = [{
      label: '编辑',
      click: () => {
        win.webContents.send('clickEditTrayMenu')
      }
    }, {
      label: '删除',
      click: () => {
        win.webContents.send('clickDeleteTrayMenu', 'whoooooooh!')
      }
    }]
    if (haveSelected) {
      template = _.concat(template, templateWhenSelected)
    }
    const menu = Menu.buildFromTemplate(template)
    menu.popup(BrowserWindow.fromWebContents(event.sender))
  })

  // 设置窗口顶部菜单
  const appMenu = Menu.buildFromTemplate([{
    label: '标签',
    submenu: [{
        label: '新建',
        click: async () => {
          // 如果剪切板内有值，那么发给页面上直接使用
          win.webContents.send('clickAddTrayMenu')
        }
      },
      {
        label: '编辑',
        click: async () => {
          win.webContents.send('clickEditTrayMenu')
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
    label: '设置',
    submenu: [{
      label: '开机启动',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: async () => {
        if (app.getLoginItemSettings().openAtLogin) {
          app.setLoginItemSettings({
            openAtLogin: false,
          })
        } else {
          app.setLoginItemSettings({
            openAtLogin: true,
          })
        }
      }
    }, {
      label: '显示开发人员工具',
      type: 'checkbox',
      accelerator: 'F12',
      checked: false,
      click: async () => {
        if (win.webContents.isDevToolsOpened()) {
          win.webContents.closeDevTools();
        } else {
          win.webContents.openDevTools();
        }
      }
    }, {
      label: '显示系统时间',
      type: 'checkbox',
      checked: settings.showDateTime,
      click: async () => {
        settings.showDateTime = !settings.showDateTime;
        settingService.saveSettings(settings);
        genTrayMenu(tray, menus);
      }
    }]
  }, {
    role: 'help',
    submenu: [{
      label: '关于',
      click: async () => {
        win.webContents.send('clickAbout', 'whoooooooh!')
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