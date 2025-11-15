function Api(){
    this.vue;
}
Api.prototype = {
    setVue : function(vue){
        this.vue = vue;
    },
    register: function(data){
        let url = 'http://127.0.0.1:8081/login/user/api/v1/login/register'
        return this.vue.$request.postByEquipmentId(url,data)
    }
}

export default new Api()