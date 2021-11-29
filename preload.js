const { ipcRenderer } = require('electron')

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }

  // 绑定点击事件
  const btn = document.getElementById('submit-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      const label = {
        label: document.querySelector('input[name="label"]').value,
        value: document.querySelector('input[name="value"]').value,
      };
      ipcRenderer.send("addLabel", label);
    })
  }
});