const {
    app,
} = require("electron");
const path = require("path");
const fs = require('fs');
const menusPath = path.join(app.getPath("userData"), "menu.json");

module.exports = {
    // 读取用户数据
    loadMenus() {
        // 如果不存在，保存空集合以创建出data文件
        if (!fs.existsSync(menusPath)) {
            saveMenus([])
        }
        return JSON.parse(fs.readFileSync(menusPath));
    },

    // 保存用户数据
    saveMenus(menus) {
        fs.writeFileSync(menusPath, JSON.stringify(menus));
    }
}