const path = require("path");
console.log(path.join(__dirname, "assets/image/icon.png"));
module.exports = {
  packagerConfig: {},
  makers: [{
      name: "@electron-forge/maker-squirrel",
      config: {
        iconUrl: "https://6465-dev-9g0suwuw61afb9f3-1252108641.tcb.qcloud.la/enobj/happy-copy/favicon.ico?sign=de377805eab80c4436e7f7f199780695&t=1640934872",
        setupIcon: path.join(__dirname, "assets/image/favicon.ico"),
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