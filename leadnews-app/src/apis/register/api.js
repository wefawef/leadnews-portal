function Api(){
    this.vue;
}
Api.prototype = {
    setVue : function(vue){
        this.vue = vue;
    },
    register: function(data){
        let url = this.vue.$config.urls.get('user_register')
        return this.vue.$request.postByEquipmentId(url,data)
    }
}

export default new Api()