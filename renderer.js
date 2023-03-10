Vue.component('tray-menu-form', {
    template: '#tray-menu-form',
    props: ['trayMenu'],
    data() {
        return {
            rules: {
                label: [{
                    required: true,
                    message: '请输入标签名称',
                    trigger: 'change'
                }, ]
            }
        }
    },
    watch: {
        'trayMenu': {
            deep: true,
            handler(val) {
                this.$emit('update:trayMenu', val)
            }
        },
        'trayMenu.type'(now, old) {
            if (now == 'img' || old == 'img') {
                this.trayMenu.value = '';
            }
        }
    },
    methods: {
        async selectFile() {
            this.trayMenu.value = await window.trayMenu.selectFile();
            this.trayMenu.type = 'img';
        },
        validate(callback) {
            return this.$refs.tmform.validate(callback)
        }
    }
})
var app = new Vue({
    el: '#app',
    data: {
        list: [],
        newMenuDialog: false,
        editMenuDialog: false,
        selected: '', // 记录选中的标签名称
        aboutDialog: false, // 关于
        version: '-.-.-',
        // 正在编辑的项目
        touchedItem: {
            label: '',
            value: '',
            type: '', // 目前支持：''/'text'=文本，'img'=图片，
        }
    },
    async created() {
        this.version = await window.happyCopy.getVersion();
        // 加载哟用户设置的菜单
        this.list = await window.trayMenu.query();
        // 绑定点击“新增”
        window.appMenu.bindClickAddTrayMenu(function (event, init) {
            // 当前未在新增或编辑
            if (!this.newMenuDialog && !this.editMenuDialog) {
                // 打开新增弹窗
                this.newMenuDialog = true;
                console.log(init);
                if (init) {
                    this.touchedItem = {
                        ...this.touchedItem,
                        ...init,
                    }
                }
            }
        }.bind(this));

        // 绑定点击“编辑”
        window.appMenu.bindClickEditTrayMenu(function () {
            // 当前未在新增或编辑
            if (!this.newMenuDialog && !this.editMenuDialog) {
                if (this.selected) {
                    // 打开新增弹窗
                    this.editMenuDialog = true;
                    const selectedMenu = this.list.find(item => {
                        return item.label == this.selected;
                    })
                    this.touchedItem = {
                        ...selectedMenu,
                    }
                } else {
                    this.$message({
                        showClose: true,
                        type: 'warning',
                        message: '请先选择一个标签',
                    });
                }
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
        cleanTouch() {
            // 清空表单
            this.touchedItem = {
                label: '',
                value: '',
                type: '',
            }
            // 关闭弹窗
            this.newMenuDialog = false;
            this.editMenuDialog = false;
        },
        async editTrayMenu() {
            // 标签名不能重复
            await this.$refs.editTmform.validate()
            if (!!this.touchedItem.label) {
                if (this.touchedItem.label == this.selected || !this.list.find(({
                        label
                    }) => label == this.touchedItem.label)) {
                    this.list = await window.trayMenu.edit(this.touchedItem, this.selected);
                    // 更改选中的项目
                    this.selected = this.touchedItem.label;
                    this.cleanTouch();
                    // this.$message({
                    //     showClose: true,
                    //     type: 'success',
                    //     message: '已保存!'
                    // });
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
            this.cleanTouch();
        },
        // 选择一个
        select(itemLabel) {
            this.selected = (this.selected == itemLabel ? '' : itemLabel)
        },
        closeAdd() {
            this.cleanTouch();
        },
        async addTrayMenu() {
            // 标签名不能重复
            await this.$refs.addTmform.validate()
            if (!this.list.find(({
                    label
                }) => label == this.touchedItem.label)) {
                this.list = await window.trayMenu.add(this.touchedItem);
                // 更改选中的项目
                this.selected = this.touchedItem.label;
                this.$nextTick(this.cleanTouch)
                // this.$message({
                //     showClose: true,
                //     type: 'success',
                //     message: '已创建!'
                // });
            } else {
                this.$message({
                    showClose: true,
                    type: 'warning',
                    message: '标签名称不能重复！'
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
                // this.$message({
                //     showClose: true,
                //     type: 'success',
                //     message: '删除成功!'
                // });
            }).catch(() => {
                // this.$message({
                //     showClose: true,
                //     type: 'info',
                //     message: '已取消删除'
                // });
            });
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