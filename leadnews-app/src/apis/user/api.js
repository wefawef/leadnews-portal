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
    },
    upUserImage : function(userId, image){
        let url = 'http://127.0.0.1:51601/user/api/v1/personal/upUserImage';
        const formData = {
            apUser: JSON.stringify({ id: userId }),
            id: String(userId || ''),
            Image: image
        };
        return new Promise((resolve, reject) => {
            this.vue.$request.postMultipart(url, formData).then((d)=>{
                resolve(d);
            }).catch((e)=>{
                reject(e);
            })
        })
    },
    upDateUserInform : function(apUser){
        let url = 'http://127.0.0.1:51601/user/api/v1/personal/upDateUserInform';
        return new Promise((resolve, reject) => {
            this.vue.$request.post(url, apUser || {}).then((d)=>{
                resolve(d);
            }).catch((e)=>{
                reject(e);
            })
        })
    }
}

export default new Api();
