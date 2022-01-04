var app = new Vue({
    el: '#app',
    data: {
        list: [],
        newMenu: {
            label: '',
            value: '',
            type: '', // 目前支持：''/'text'=文本，'img'=图片，
        },
        newMenuDialog: false,
        editMenuDialog: false,
        selected: '', // 记录选中的标签名称
        aboutDialog: false, // 关于
        version: '-.-.-',
    },
    async created() {
        this.version = await window.happyCopy.getVersion();
        // 加载哟用户设置的菜单
        this.list = await window.trayMenu.query();
        // 绑定点击“新增”
        window.appMenu.bindClickAddTrayMenu(function (event, init) {
            // 打开新增弹窗
            this.newMenuDialog = true;
            if (init) {
                this.newMenu = {
                    ...this.newMenu,
                    ...init,
                }
            }
        }.bind(this));

        // 绑定点击“编辑”
        window.appMenu.bindClickEditTrayMenu(function () {
            if (this.selected) {
                // 打开新增弹窗
                this.editMenuDialog = true;
                const selectedMenu = this.list.find(item => {
                    return item.label == this.selected;
                })
                this.newMenu = {
                    ...selectedMenu,
                }
            } else {
                this.$message({
                    showClose: true,
                    type: 'warning',
                    message: '请先选择一个标签',
                });
            }
        }.bind(this));

        // 绑定点击“删除”
        window.appMenu.bindClickDeleteTrayMenu(function () {
            // 删除
            if (this.selected) {
                this.deleteTrayMenu(this.selected);
            } else {
                this.$message({
                    showClose: true,
                    type: 'warning',
                    message: '请先选择一个标签',
                });
            }
        }.bind(this));

        // 绑定点击“关于”
        window.appMenu.bindClickAbout(function () {
            // 打开新增弹窗
            this.aboutDialog = true;
        }.bind(this));
    },
    methods: {
        async editTrayMenu() {
            // 标签名不能为空，也不能重复
            if (!!this.newMenu.label) {
                if (this.newMenu.label == this.selected || !this.list.find(({
                        label
                    }) => label == this.newMenu.label)) {
                    this.list = await window.trayMenu.edit(this.newMenu, this.selected);
                    // 更改选中的项目
                    this.selected = this.newMenu.label;
                    // 清空表单
                    this.newMenu = {
                        label: '',
                        value: '',
                        type: '',
                    }
                    // 关闭弹窗
                    this.editMenuDialog = false;
                    this.$message({
                        showClose: true,
                        type: 'success',
                        message: '已保存!'
                    });
                } else {
                    this.$message({
                        showClose: true,
                        type: 'warning',
                        message: '标签名称不能重复！'
                    });
                }
            } else {
                this.$message({
                    showClose: true,
                    type: 'warning',
                    message: '标签名称不能为空！'
                });
            }
        },
        closeEdit() {
            this.newMenu.type = '';
            this.editMenuDialog = false;
        },
        // 选择一个
        select(itemLabel) {
            this.selected = (this.selected == itemLabel ? '' : itemLabel)
        },
        closeAdd() {
            this.newMenu.type = '';
            this.newMenuDialog = false;
        },
        async addTrayMenu() {
            // 标签名不能为空，也不能重复
            if (!!this.newMenu.label && !this.list.find(({
                    label
                }) => label == this.newMenu.label)) {
                this.list = await window.trayMenu.add(this.newMenu);
                // 清空表单
                this.newMenu = {
                    label: '',
                    value: '',
                }
                // 关闭弹窗
                this.newMenuDialog = false;
            } else {
                this.$message({
                    showClose: true,
                    type: 'warning',
                    message: '标签名称不能为空或重复！'
                });
            }
        },
        async deleteTrayMenu(menuLabel) {
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                this.list = await window.trayMenu.delete(menuLabel);
                // 释放高亮选项
                this.selected = '';
                this.$message({
                    showClose: true,
                    type: 'success',
                    message: '删除成功!'
                });
            }).catch(() => {
                this.$message({
                    showClose: true,
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        async selectFile() {
            this.newMenu.value = await window.trayMenu.selectFile();
            this.newMenu.type = 'img';
        },
        async toggleHidden(menuLabel) {
            this.list = await window.trayMenu.toggleHidden(menuLabel);
        },
        // 拖拽开始
        dragStart(event, index) {
            console.log('开始', index);
            event.dataTransfer.setData("text/plain", index);
        },
        // 拖拽进入
        dropEnter(event) {
            event.target.style.background = "green";
        },
        // 拖拽离开
        dropLeave(event) {
            event.target.style.background = "";
        },
        // 拖拽结束
        async dropEnd(event, to) {
            const from = event.dataTransfer.getData("text/plain");
            event.target.style.background = "";
            console.log('结束', to, from);
            this.list = await window.trayMenu.sort(from, to);
        },
    }
})