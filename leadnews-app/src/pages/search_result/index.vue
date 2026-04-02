<template>
    <div class="wrapper">
        <div class="top-body"><Home_Bar @onSubmit="onSubmit" :value="keyword"/></div>
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

    export default {
        name: 'HeiMa-Home',
        components: {Home_Bar, Item0,Item1,Item3,WxcPanItem},
        props:{
            keyword:''//当前搜索的关键字
        },
        data: () => ({
            api:null,// API
            showmore:true,//是否显示loadmore动画
            resultList: [],//列表数据集合
            tabPageHeight: 1334,//列表总高度
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
            Api.setVue(this);
            this.load();
        },
        methods: {
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
                    sessionStorage.setItem('searchKeyword', this.keyword || '');
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
