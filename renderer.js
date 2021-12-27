var app = new Vue({
    el: '#app',
    data: {
        list: [],
        newMenu: {
            label: '',
            value: '',
        },
        newMenuDialog: false,
        selected: '', // 记录选中的标签名称
        aboutDialog: false, // 关于
    },
    async created() {
        // 加载哟用户设置的菜单
        this.list = await window.trayMenu.query();
        // 绑定点击菜单事件
        window.appMenu.bindClickAddTrayMenu(function () {
            // 打开新增弹窗
            this.newMenuDialog = true;
        }.bind(this));

        // 绑定点击菜单事件
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
        }
    }
})