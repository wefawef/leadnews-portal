function Api(){
    this.vue;
}
Api.prototype = {
    setVue : function(vue){
        this.vue = vue;
    },
    // 加载数据
    loaddata : function(params){
        let dir = params.loaddir
        let url = this.getLoadUrl(dir)
        return this.vue.$store.getEquipmentId().then(equipmentId=> {
            return new Promise((resolve, reject) => {
                this.vue.$request.post(url,params,{}).then((d)=>{
                    resolve(d);
                }).catch((e)=>{
                    reject(e);
                })
            })
        }).catch(e=>{
            return new Promise((resolve, reject) => {
                reject(e);
            })
        })
    },
    // 保存展现行为数据
    saveShowBehavior : function(params){
        let ids = [];
        for(let k in params){
            if(params[k]){
                ids.push({id:k});
            }
        }
        if(ids.length>0){
            let url = this.vue.$config.urls.get('show_behavior')
            return this.vue.$store.getEquipmentId().then(equipmentId=> {
                return new Promise((resolve, reject) => {
                    this.vue.$request.post(url, {
                        equipment_id: equipmentId,
                        article_ids: ids
                    }).then((d) => {
                        d.data = ids
                        resolve(d);
                    }).catch((e) => {
                        reject(e);
                    })
                })
            }).catch(e=>{
                return new Promise((resolve, reject) => {
                    reject(e);
                })
            })
        }
    },
    // 区别请求那个URL
    getLoadUrl : function(dir){
        let url = this.vue.$config.urls.get('load')
        if(dir==2)
            url = this.vue.$config.urls.get('loadnew')
        else if(dir==1)
            url = this.vue.$config.urls.get('loadmore')
        return url;
    },
    // 获取频道列表
    loadChannels : function(){
        // 直接使用完整的URL地址，避免路径拼接
        let url = 'http://127.0.0.1:8081/article/article/api/v1/article/channels'
        console.log('请求频道列表URL:', url);
        return new Promise((resolve, reject) => {
            this.vue.$request.get(url).then((d)=>{
                console.log('频道列表API返回:', d);
                resolve(d);
            }).catch((e)=>{
                console.error('频道列表API请求失败:', e);
                reject(e);
            })
        })
    }
}

export default new Api()
