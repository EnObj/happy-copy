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
        }
    }
})