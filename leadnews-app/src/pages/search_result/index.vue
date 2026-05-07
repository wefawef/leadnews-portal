<template>
    <div class="wrapper">
        <div class="top-body">
            <Home_Bar
                @onSubmit="onSubmit"
                @onInput="onInput"
                @onFocus="onFocus"
                @onBlur="onBlur"
                :value="searchValue"
            />
        </div>
        <div class="overlay" v-if="overlay.visible">
            <scroller class="overlay-scroller" :style="{'height':(tabPageHeight)+'px'}" show-scrollbar="true">
                <template v-if="overlay.mode==='history'">
                    <div class="history-wrap">
                        <scroller class="history-scroller" scroll-direction="horizontal" show-scrollbar="false">
                            <div class="history-row">
                                <template v-for="item in overlay.history">
                                    <SearchHistory
                                        mode="chip"
                                        @onClickText="onSelectHistory"
                                        @onDeleteHistory="onDeleteHistory"
                                        :id="item.id"
                                        :title="item.keyword"
                                    />
                                </template>
                            </div>
                        </scroller>
                    </div>
                    <div class="empty-cell" v-if="!overlay.history || overlay.history.length===0">
                        <text class="empty-text">暂无搜索记录</text>
                    </div>
                </template>
                <template v-else>
                    <SearchTip @onSelect="onSelectSuggestion" :search="searchValue" :data="overlay.tip"/>
                    <div class="empty-cell" v-if="!overlay.tip || overlay.tip.length===0">
                        <text class="empty-text">暂无联想词</text>
                    </div>
                </template>
            </scroller>
        </div>
        <div class="content-body">
            <list class="item-container" :style="{ height: (tabPageHeight) + 'px' }">
                <!-- 列表项，并绑定显示事件 -->
                <cell v-for="(item,key) in resultList" class="cell" :key="key">
                    <wxc-pan-item :ext-id="'1-' + (key)" @wxcPanItemClicked="wxcPanItemClicked(item)">
                        <Item0 v-if="item.type==0" :data="item"/>
                        <Item1 v-if="item.type==1" :data="item"/>
                        <Item3 v-if="item.type==2" :data="item"/>
                        <Item3 v-if="item.type==3" :data="item"/>
                    </wxc-pan-item>
                </cell>
                <!-- 上来加载更多 -->
                <loading @loading="loadmore" :display="showmore?'show':'hide'" class="loading">
                    <loading-indicator class="loading-icon"></loading-indicator>
                    <text class="loading-text">{{load_more_text}}</text>
                </loading>
            </list>
        </div>
    </div>
</template>

<script>
    import Home_Bar from "@/compoents/bars/search_result_top"
    import { Utils, BindEnv,WxcPanItem } from 'weex-ui'
    import Item0 from '../../compoents/cells/article_0.vue'
    import Item1 from '../../compoents/cells/article_1.vue'
    import Item3 from '../../compoents/cells/article_3.vue'
    import Api from '@/apis/search_result/api'
    import ArticleApi from '@/apis/article/api'
    import SearchApi from '@/apis/search/api'
    import SearchHistory from '@/compoents/cells/search_0'
    import SearchTip from '@/compoents/inputs/search_tip'

    export default {
        name: 'HeiMa-Home',
        components: {Home_Bar, Item0,Item1,Item3,WxcPanItem,SearchHistory,SearchTip},
        props:{
            keyword:''//当前搜索的关键字
        },
        data: () => ({
            api:null,// API
            showmore:true,//是否显示loadmore动画
            resultList: [],//列表数据集合
            tabPageHeight: 1334,//列表总高度
            searchValue:'',
            overlay:{
                visible:false,
                mode:'history',
                history:[],
                tip:[]
            },
            params:{
                tag:"__all__",
                keyword:'',
                pageNum:1,
                pageSize:20
            }
        }),
        computed:{
            // 渲染加载最新和更多的国际化语言
            load_new_text:function(){return this.$lang.load_new_text},
            load_more_text:function(){return this.$lang.load_more_text}
        },
        created () {
            // 初始化高度，顶部菜单高度120+顶部bar 90
            this.tabPageHeight = Utils.env.getPageHeight()-110;
            this.params.keyword = this.keyword;
            this.searchValue = this.keyword;
            Api.setVue(this);
            SearchApi.setVue(this);
            this.load();
            this.load_search_history();
        },
        methods: {
            load_search_history : function(){
                SearchApi.load_search_history().then(data=>{
                    if(data.code==0 || data.code==200){
                        this.overlay.history = Array.isArray(data.data) ? data.data : []
                    }
                }).catch(e=>{
                    console.log(e)
                })
            },
            onInput : function(val){
                this.searchValue = val;
                if(!val){
                    this.overlay.mode = 'history';
                    this.overlay.tip = [];
                    this.overlay.visible = true;
                    this.load_search_history();
                    return;
                }
                SearchApi.associate_search(val).then(data=>{
                    if(data.code==0 || data.code==200){
                        this.overlay.mode = 'tip';
                        this.overlay.tip = Array.isArray(data.data) ? data.data : [];
                        this.overlay.visible = true;
                    }
                }).catch(e=>{
                    console.log(e)
                })
            },
            onFocus : function(){
                if(!this.searchValue){
                    this.overlay.mode = 'history';
                    this.overlay.tip = [];
                    this.overlay.visible = true;
                    this.load_search_history();
                }
            },
            onBlur : function(){
                this.overlay.visible = false;
            },
            onSelectSuggestion : function(val){
                this.onSubmit(val);
            },
            onSelectHistory : function(val){
                this.onSubmit(val);
            },
            onDeleteHistory : function(id){
                const modal = weex.requireModule("modal")
                modal.confirm({message:'确认要删除吗？'},(button)=>{
                    if(button==='OK') {
                        SearchApi.del_search(id).then(data => {
                            if (data.code == 0 || data.code == 200) {
                                modal.toast({message: '删除成功', duration: 3})
                                this.load_search_history()
                            } else {
                                modal.toast({message: data.errorMessage || '删除失败', duration: 3})
                            }
                        }).catch((e) => {
                            console.log(e)
                            modal.toast({message: '删除失败，请检查网络', duration: 3})
                        })
                    }
                })
            },
            // 上拉加载更多
            loadmore:function(){
                this.showmore=true;
                this.params.pageNum=this.params.pageNum+1
                this.load();
            },
            // 正常加载数据
            load : function(){
                Api.article_search(this.params).then((d)=>{
                    this.tanfer(d.data);
                }).catch((e)=>{
                    console.log(e)
                    const modal = weex.requireModule('modal')
                    modal.toast({message:'搜索失败，请检查网络',duration:2})
                })
            },
            // 列表数据转换成View需要的Model对象
            tanfer : function(data){
                const modal = weex.requireModule('modal');
                if(!data || data.length==0){
                    this.showmore=false;
                    if(this.params.pageNum == 1) {
                        modal.toast({message:'没有数据了...',duration:3})
                    }
                    return ;
                }
                let arr = []
                for(let i=0;i<data.length;i++){
                    let ims = []
                    if(data[i].images){
                        let rawImages = String(data[i].images).trim();
                        try{
                            if(rawImages.charAt(0) === '['){
                                let parsed = JSON.parse(rawImages);
                                if(Array.isArray(parsed)){
                                    ims = parsed.map(s => String(s).replace(/[`'"\s]/g, '').trim()).filter(Boolean);
                                }
                            }
                        }catch(e){
                            ims = [];
                        }
                        if(!ims || ims.length === 0){
                            let imgStr = rawImages.replace(/[\[\]]/ig,'').trim();
                            if(imgStr){
                                ims = imgStr.split(',').map(img => String(img).replace(/[`'"\s]/g, '').trim()).filter(Boolean);
                            }
                        }
                    }
                    
                    // 复制所有原始字段
                    let tmp = {...data[i]};
                    
                    // 同步字段名，适配详情页期望
                    tmp.id = data[i].id;
                    tmp.title = data[i].title;
                    tmp.authorId = data[i].author_id || data[i].authorId;
                    tmp.authorName = data[i].author_name || data[i].authorName;
                    tmp.publishTime = data[i].publish_time || data[i].publishTime;
                    tmp.staticUrl = data[i].static_url || data[i].staticUrl;
                    
                    // 视图需要的字段
                    tmp.source = tmp.authorName || '未知';
                    tmp.date = tmp.publishTime;
                    tmp.type = ims.length > 3 ? 3 : ims.length;
                    tmp.image = ims.slice(0, 3);
                    tmp.icon = '\uf06d';
                    
                    if(tmp.staticUrl){
                        tmp.staticUrl = String(tmp.staticUrl).replace(/[`'"\s]/g, '').trim();
                    }
                    
                    arr.push(tmp);
                }
                if(this.params.pageNum!=1){
                    this.resultList = this.resultList.concat(arr);
                }else{
                    this.resultList = arr;
                }
                this.showmore=false;
            },
            // 列表项点击事件
            wxcPanItemClicked(item){
                console.log('搜索结果页：点击文章，文章ID:', item.id);
                
                // 1. 发送行为与详情请求 (仿照详情页需求)
                ArticleApi.setVue(this);
                ArticleApi.loadinfo(item.id);
                ArticleApi.loadbehavior(item.id, item.authorId);

                // 2. 简化实现：只保存必要的频道信息
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem('lastArticleId', (item.id || '').toString());
                    sessionStorage.setItem('fromPage', 'search-result');
                    sessionStorage.setItem('searchKeyword', this.params.keyword || this.keyword || '');
                }

                // 3. 获取token和equipmentId并拼接到url
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
                            // 尝试转换为毫秒值
                            let date = new Date(pubTime);
                            // 兼容iOS等环境，尝试将 - 替换为 /
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

                    // 4. 只传递必要的参数，避免URL过长
                    this.$router.push({
                        name:'article-info',
                        params:{
                            id: item.id,
                            staticUrl: url,
                            title: item.title,
                            createdTime: item.publishTime || item.createdTime,
                            authorId: item.authorId
                        },
                        // 不再将整个对象放入query参数
                        query: {}
                    });
                    
                    console.log('路由跳转已执行');
                }).catch(e => {
                    console.error('获取Token或设备ID失败', e);
                    // 降级处理：直接跳转
                    this.$router.push({
                        name:'article-info',
                        params:item
                    });
                });
            },
            onSubmit : function(val){
                this.searchValue = val;
                this.overlay.visible = false;
                this.params.keyword = val;
                this.params.pageNum = 1;
                this.resultList = [];
                this.load();
            }
        }
    }
</script>

<style lang="less" scoped>
    @import '../../styles/article';
    .wrapper{
        background-color: @body-background;
        font-size: @font-size;
        font-family: @font-family;
        flex-direction : column;
        flex-wrap:wrap;
    }
    .top-body{
        position: fixed;
        left: 0;
        top: 0;
    }
    .overlay{
        position: absolute;
        top: 90px;
        width: 750px;
        z-index: 999;
        background-color: #ffffff;
    }
    .overlay-scroller{
        width: 750px;
        background-color: #ffffff;
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
    .empty-cell{
        align-items: center;
        justify-content: center;
        padding: 30px 0;
    }
    .empty-text{
        color: #999999;
        font-size: 24px;
    }
    .content-body{
        flex: 1;
        flex-direction : column;
        margin-top: 90px;
    }
    .item-container {
        width: 750px;
        background-color: #ffffff;
    }
    .cell {
        background-color: #ffffff;
    }
</style>
