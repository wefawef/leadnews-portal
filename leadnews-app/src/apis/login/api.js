function Api(){
    this.vue;
}
Api.prototype = {
    setVue : function(vue){
        this.vue = vue;
    },
    // 登录
    login: function(data){
        let url = this.vue.$config.urls.get('user_login')
        return this.vue.$request.postByEquipmentId(url,data)
    },
    updatePassword: function(data){
        let url = 'http://127.0.0.1:51601/user/api/v1/login/updatePassWord'
        return this.vue.$request.post(url,data || {})
    }
}

export default new Api()
