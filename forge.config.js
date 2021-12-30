const path = require("path");
console.log(path.join(__dirname, "static/image/icon.png"));
module.exports = {
  packagerConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        iconUrl:
          "https://6465-dev-9g0suwuw61afb9f3-1252108641.tcb.qcloud.la/enobj/favicon.ico",
        setupIcon: path.join(__dirname, "/static/image/favicon.ico"),
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        background: "./assets/dmg-background.png",
        format: "ULFO",
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
};
