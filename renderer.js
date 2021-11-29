var app = new Vue({
    el: '#app',
    data: {
        listJson: '3',
        list: [],
        message: 'ceded'
    },
    created(){
        setInterval(function(){
            console.log(this.list, this.listJson)
        }.bind(this), 3000)
    },
    watch: {
        listJson(val) {
            console.log(val)
            this.list = JSON.parse(val)
        }
    }
})