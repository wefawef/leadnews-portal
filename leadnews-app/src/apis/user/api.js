function Api(){
    this.vue;
}
Api.prototype = {
    setVue : function(vue){
        this.vue = vue;
    },
    getUserInfo : function(params){
        let url = '/user/user/api/v1/personal/user_self';
        return new Promise((resolve, reject) => {
            this.vue.$request.get(url,params).then((d)=>{
                resolve(d);
            }).catch((e)=>{
                reject(e);
            })
        })
    },
    applyForRealName : function(formData){
        let url = '/user/user/api/v1/auth/applyForRealName';
        return new Promise((resolve, reject) => {
            this.vue.$request.postMultipart(url,formData).then((d)=>{
                resolve(d);
            }).catch((e)=>{
                reject(e);
            })
        })
    }
}

export default new Api();
