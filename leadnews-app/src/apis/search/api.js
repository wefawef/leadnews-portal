function Api(){
    this.vue;
}
Api.prototype = {
    setVue : function(vue){
        this.vue = vue;
    },
    // 加载搜索历史
    load_search_history: function(){
        let url = this.vue.$config.urls.get('load_search_history')
        return this.vue.$request.post(url,{})
    },
    // 删除搜索词
    del_search: function(id){
        let url = this.vue.$config.urls.get('del_search')
        return this.vue.$request.post(url,{searchId:id})
    },
    // 输入联想
    associate_search: function(searchWords){
        let url = this.vue.$config.urls.get('associate_search')
        let minBehotTime = new Date()
        if (minBehotTime instanceof Date) {
            minBehotTime = minBehotTime.getTime()
        }
        return this.vue.$request.post(url,{
            searchWords: searchWords,
            pageNum: 1,
            pageSize: 10,
            minBehotTime: minBehotTime
        })
    },
    // 加载热词
    load_hot_keywords: function(){
        let url = this.vue.$config.urls.get('load_hot_keywords')
        return this.vue.$request.postByEquipmentId(url,{page_size:6})
    },
    // 加载热点文章
    load_hot_articles: function(){
        let url = this.vue.$config.urls.get('hot_articles')
        return this.vue.$request.get(url)
    }
}

export default new Api()
