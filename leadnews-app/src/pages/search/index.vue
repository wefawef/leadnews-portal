<template>
    <div class="art-page">
        <div class="art-top"><TopBar @onBlur="onBlur" @onInput="onInput"/></div>
        <scroller class="scroller" :style="{'height':scrollerHeight}" show-scrollbar="true">
            <div class="history-wrap">
                <scroller class="history-scroller" scroll-direction="horizontal" show-scrollbar="false">
                    <div class="history-row">
                        <template v-for="item in data.history">
                            <SearchHistory mode="chip" @onClickText="doSearch" @onDeleteHistory="onDeleteHistory" :id="item.id" :title="item.keyword"/>
                        </template>
                    </div>
                </scroller>
            </div>
            <Title title="" :icon="icon.hot"/>
            <div class="hot-body">
                <template v-for="item in data.hot">
                    <div class="item">
                        <template v-for="k in item">
                            <HotCell @onClick="doSearch" :title="k.hot_words" type="k.type"/>
                        </template>
                    </div>
                </template>
            </div>
            <Title title="热点文章" :icon="icon.hotArticle"/>
            <div class="hot-articles-body">
                <template v-for="(article, index) in data.hotArticles">
                    <div class="hot-article-item" @click="doHotArticle(article)">
                        <text class="hot-article-rank" :class="['rank-' + (index+1)]">{{index+1}}</text>
                        <text class="hot-article-title">{{article.title}}</text>
                        <text class="hot-article-score">{{article.score}}热度</text>
                    </div>
                </template>
            </div>
        </scroller>
        <div class="art-tip" v-if="showTip" ref="tip"><SearchTip @onSelect="doSearch" :search="data.keyword" :data="data.tip"/></div>
    </div>
</template>

<script>
    import TopBar from '@/compoents/bars/search_top'
    import SearchHistory from '@/compoents/cells/search_0'
    import SearchTip from '@/compoents/inputs/search_tip'
    import HotCell from '@/compoents/cells/search_1'
    import Title from '@/compoents/titles/title'
    import Api from '@/apis/search/api'
    import { Utils } from 'weex-ui'
    const modal = weex.requireModule("modal")
    export default {
        name: "index",
        components:{TopBar,SearchHistory,Title,HotCell,SearchTip},
        data(){
            return {
                scrollerHeight:'500px',
                showTip:false,
                icon : {
                    hot : '\uf06d',
                    other:'\uf17d',
                    hotArticle:''
                },
                data : {
                    keyword:'',//当前输入的关键字
                    history : [],//搜索历史
                    tip : [],// 联想词
                    hot : [],//热搜关键字
                    hotArticles : []//热点文章
                }
            }
        },
        created(){
            Api.setVue(this)
        },
        mounted(){
            this.scrollerHeight=(Utils.env.getPageHeight()-180)+'px';
            this.load_search_history()
            this.load_hot_keywords()
            this.load_hot_articles()
        },
        methods:{
            doSearch : function(val){
                this.$router.push({name:'search_result',params:{'keyword':val}})
            },
            // 加载搜索历史
            load_search_history : function(){
                Api.load_search_history().then(data=>{
                    if(data.code==0 || data.code==200){
                        this.data.history = Array.isArray(data.data) ? data.data : []
                    }else{
                        modal.toast({message: data.errorMessage || data.error_message,duration: 3})
                    }
                }).catch((e)=>{
                    console.log(e)
                })
            },
            // 删除历史搜搜关键字
            onDeleteHistory : function(id){
                let _this = this;
                modal.confirm({message:'确认要删除吗？'},function(button) {
                    if(button=='OK') {
                        Api.del_search(id).then(data => {
                            if (data.code == 0 || data.code == 200) {
                                modal.toast({message: '删除成功', duration: 3})
                                _this.load_search_history()
                            } else {
                                modal.toast({message: data.errorMessage || data.error_message, duration: 3})
                            }
                        }).catch((e) => {
                            console.log(e)
                        })
                    }
                })
            },
            //用户输入时，提示联想词
            onInput : function(val){
                Api.associate_search(val).then(data => {
                    if (data.code == 0 || data.code == 200) {
                        this.data.keyword=val
                        this.showTip = true
                        this.data.tip = Array.isArray(data.data) ? data.data : []
                    }
                }).catch(e=>{
                    console.log(e)
                })
            },
            // 加载热搜关键字
            load_hot_keywords : function(){
                Api.load_hot_keywords().then(data=>{
                    if(data.code==0){
                        // 需要转换数据格式
                        let newData=[]
                        let temp = []
                        for(var i=0;i<data.data.length;i++){
                            if(i>0&&i%2==0){
                                newData.push(temp)
                                temp = []
                            }
                            temp.push(data.data[i])
                        }
                        this.data.hot = newData
                    }else{
                        modal.toast({message: data.error_message,duration: 3})
                    }
                }).catch((e)=>{
                    console.log(e)
                })
            },
            // 加载热点文章
            load_hot_articles : function(){
                Api.load_hot_articles().then(data=>{
                    if((data.code==0 || data.code==200) && Array.isArray(data.data)){
                        this.data.hotArticles = data.data.slice(0, 10)
                    }
                }).catch((e)=>{
                    console.log(e)
                })
            },
            // 点击热点文章跳转详情
            doHotArticle : function(item){
                let _this = this;
                Promise.all([
                    this.$store.getToken(),
                    this.$store.getEquipmentId(),
                    this.$store.getUser()
                ]).then(([token, equipmentId, user]) => {
                    let url = item.staticUrl;
                    if (url) {
                        const separator = url.indexOf('?') !== -1 ? '&' : '?';
                        let pubTime = item.publishTime || item.createdTime || '';
                        if (pubTime) {
                            let date = new Date(pubTime);
                            if (isNaN(date.getTime()) && typeof pubTime === 'string') {
                                date = new Date(pubTime.replace(/-/g, '/'));
                            }
                            if (!isNaN(date.getTime())) {
                                pubTime = date.getTime();
                            }
                        }
                        const params = {
                            token: token || '',
                            equipmentId: equipmentId || '',
                            uid: user ? user.id : '',
                            userName: encodeURIComponent(user ? user.name || '' : ''),
                            userImage: decodeURIComponent(user ? user.image || '' : ''),
                            articleId: item.id || '',
                            title: encodeURIComponent(item.title || ''),
                            authorId: item.authorId || 0,
                            authorName: encodeURIComponent(item.authorName || ''),
                            publishTime: pubTime
                        };
                        const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
                        url = `${url}${separator}${queryString}`;
                    }
                    _this.$router.push({
                        name:'article-info',
                        params:{
                            id: item.id,
                            staticUrl: url,
                            title: item.title,
                            createdTime: item.publishTime || item.createdTime,
                            authorId: item.authorId
                        }
                    });
                }).catch(e => {
                    _this.$router.push({
                        name:'article-info',
                        params:{
                            id: item.id,
                            staticUrl: item.staticUrl,
                            title: item.title,
                            createdTime: item.publishTime || item.createdTime,
                            authorId: item.authorId
                        }
                    });
                });
            },
            // 失去焦点，关闭联想词
            onBlur : function(){
                this.showTip=false
            }
        }
    }
</script>

<style scoped>
    .art-page{
        width: 750px;
        flex-direction: column;
        background-color: #ececec;
    }
    .art-tip{
        position: absolute;
        top: 100px;
        width: 750px;
        z-index: 999;
    }
    .art-top{
        top: 0px;
        z-index: 999;
        position: fixed;
        height: 120px;
        background-color: #ffffff;
    }
    .scroller{
        flex: 1;
        flex-direction: column;
        width: 750px;
        margin-top: 120px;
    }
    .history-wrap{
        background-color: #ffffff;
        padding: 10px 20px;
    }
    .history-scroller{
        width: 710px;
    }
    .history-row{
        flex-direction: row;
        align-items: center;
        flex-wrap: nowrap;
    }
    .all-search{
        font-size: 36px;
        align-items: center;
        padding: 18px 20px;
        background-color: #ffffff;
    }
    .all-search-text{
        color: #bdbdbd;
    }
    .item{
        flex-direction: row;
    }
    .hot-articles-body{
        background-color: #ffffff;
    }
    .hot-article-item{
        flex-direction: row;
        align-items: center;
        padding: 18px 20px;
        border-bottom-color: #ebebeb;
        border-bottom-width: 1px;
        border-bottom-style: solid;
    }
    .hot-article-rank{
        width: 40px;
        font-size: 28px;
        color: #999999;
        text-align: center;
        margin-right: 15px;
    }
    .rank-1{
        color: #ff1111;
    }
    .rank-2{
        color: #ff6600;
    }
    .rank-3{
        color: #ff9900;
    }
    .hot-article-title{
        flex: 1;
        font-size: 28px;
        color: #222222;
        lines: 1;
        text-overflow: ellipsis;
    }
    .hot-article-score{
        font-size: 22px;
        color: #999999;
        margin-left: 10px;
    }
</style>
