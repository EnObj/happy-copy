const path = require("path");
const fs = require('fs');
const {
    app,
} = require("electron");

const settingsPath = path.join(app.getPath("userData"), "settings.json");

module.exports = {
    loadSettings() {
        // 如果不存在，保存空集合以创建出data文件
        if (!fs.existsSync(settingsPath)) {
            this.saveSettings({})
        }
        return JSON.parse(fs.readFileSync(settingsPath));
    },
    // 保存用户配置
    saveSettings(settings) {
        fs.writeFileSync(settingsPath, JSON.stringify(settings));
    }
}