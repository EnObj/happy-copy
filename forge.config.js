const path = require('path');
console.log(path.join(__dirname, 'static/image/icon.png'));
module.exports = {
    "packagerConfig": {},
    "makers": [{
            "name": "@electron-forge/maker-squirrel",
            "config": {
                "setupIcon": path.join(__dirname, '/static/image/favicon.ico')
            }
        },
        {
            "name": "@electron-forge/maker-zip",
            "platforms": [
                "darwin"
            ]
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {}
        },
        {
            "name": "@electron-forge/maker-rpm",
            "config": {}
        }
    ]
}