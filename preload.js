const {
  ipcRenderer
} = require('electron')

window.addEventListener("DOMContentLoaded", () => {

  // 新增标签
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

  // 马上查询一次
  ipcRenderer.send("queryLabel", "")

  // 查询结果
  ipcRenderer.on('queryLabel-reply', (event, arg) => {
    const allInp = document.querySelector('input[name="all"]')
    // allInp.value = JSON.stringify(arg, null, 4);
  })
});