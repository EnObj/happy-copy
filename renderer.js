var app = new Vue({
    el: '#app',
    data: {
        list: [],
        newMenu: {
            label: '',
            value: '',
        },
    },
    async created() {
        this.list = await window.trayMenu.query();
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
        }
    }
})