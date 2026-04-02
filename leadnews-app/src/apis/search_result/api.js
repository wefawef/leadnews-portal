function Api(){
    this.vue;
}
Api.prototype = {
    setVue : function(vue){
        this.vue = vue;
    },
    // 加载
    article_search: function(parms){
        let url = this.vue.$config.urls.get('article_search')
        let minBehotTime = parms.minBehotTime || new Date();
        if (minBehotTime instanceof Date) {
            minBehotTime = minBehotTime.getTime();
        }
        return this.vue.$request.postByEquipmentId(url,{
            searchWords:parms.keyword,
            pageNum:parms.pageNum,
            pageSize:parms.pageSize || 20,
            minBehotTime:minBehotTime
        })
    }
}

export default new Api()
