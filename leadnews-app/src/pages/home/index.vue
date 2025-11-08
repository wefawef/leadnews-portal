<template>
  <div class="wrapper">
    <div class="top-body"><Home_Bar/></div>
    <div class="content-body">
      <wxc-tab-page ref="wxc-tab-page" :tab-titles="tabTitles" :tab-styles="tabStyles" title-type="text" :tab-page-height="tabPageHeight" @wxcTabPageCurrentTabSelected="wxcTabPageCurrentTabSelected">
        <list v-for="(v,index) in tabList"  :key="index" class="item-container" :style="{ height: (tabPageHeight - tabStyles.height) + 'px' }">
          <!-- 下来刷新最新 -->
          <refresh @refresh='loadnew'  :display="shownew?'show':'hide'" class="loading">
            <loading-indicator class="loading-icon"></loading-indicator>
            <text class="loading-text">{{load_new_text}}</text>
          </refresh>
          <!-- 列表项，并绑定显示事件 -->
          <cell v-for="(item,key) in v" class="cell" @appear="show(item.id)" :key="key">
            <wxc-pan-item :ext-id="'1-' + (v) + '-' + (key)" @wxcPanItemClicked="wxcPanItemClicked(item)" @wxcPanItemPan="wxcPanItemPan">
              <Item0 v-if="item.type==0" :data="item"/>
              <Item1 v-if="item.type==1" :data="item"/>
                <Item3 v-if="item.type==2" :data="item"/>
              <Item3 v-if="item.type==3" :data="item"/>
            </wxc-pan-item>
          </cell>
          <!-- 上来加载更多 -->
          <loading @loading="loadmore" style="background-color: white; height: 100px;" :display="showmore?'show':'hide'" class="loading">
            <loading-indicator class="loading-icon"></loading-indicator>
            <text class="loading-text">{{load_more_text}}</text>
          </loading>
        </list>
        <text slot="rightIcon">1212</text>
      </wxc-tab-page>
    </div>
  </div>
</template>

<script>
  import Home_Bar from "@/compoents/bars/home_bar"
  import WxcTabPage from "@/compoents/tabs/home_tabs"
  import {Utils, BindEnv,WxcPanItem } from 'weex-ui'
  import Item0 from '../../compoents/cells/article_0.vue'
  import Item1 from '../../compoents/cells/article_1.vue'
  import Item3 from '../../compoents/cells/article_3.vue'
  import Config from './config'
  import Api from '@/apis/home/api'

  const modal = weex.requireModule("modal")

  export default {
    name: 'HeiMa-Home',
    components: {Home_Bar,WxcTabPage, Item0,Item1,Item3,WxcPanItem},
    data: () => ({
      api:null,// API
      shownew:false,//是否显示loadnew动画
      showmore:false,//是否显示loadmore动画
      loading: false, // 是否正在加载数据
      tabTitles: [],//频道配置，从接口加载
      tabStyles: Config.tabStyles,//频道样式
      tabList: [],//列表数据集合
      tabPageHeight: 1334,//列表总高度
      hasMoreData: {},//记录每个频道是否还有更多数据
      params:{
        loaddir:1,
        index:0,
        tag:"__all__",
        size:10,
        max_behot_time:0,
        min_behot_time:20000000000000
      },//列表数据请求参数
      ashow : {},//列表展示行为记录表
      timer : null,//定时函数
      loadingChannels: false//是否正在加载频道
    }),
    computed:{
      // 渲染加载最新和更多的国际化语言
      load_new_text:function(){return this.$lang.load_new_text},
      load_more_text:function(){return this.$lang.load_more_text}
    },
    mounted(){
      // 频道加载和页面激活已在created中的loadChannels方法处理
    },
    destroyed(){
      clearInterval(this.timer)
    },
    created () {
      // 初始化高度，顶部菜单高度120+顶部bar 90
      this.tabPageHeight = Utils.env.getPageHeight()-155;
      Api.setVue(this);
      let _this = this;
      // 加载频道列表
      this.loadChannels();
      // 每隔5秒提交一次数据
      this.timer = setInterval(function(){
        let result = Api.saveShowBehavior(_this.ashow);
        if(result){
          result.then((d)=>{
            // 标记已经处理完成
            let ids=d.data;
            for(let i=0;i<ids.length;i++){
              _this.ashow[ids[i].id]=false;
            }
          });
        }
      },5000);
    },
    methods: {
      // 加载频道列表
      loadChannels: function(){
        if(this.loadingChannels) return;
        this.loadingChannels = true;
        console.log('开始加载频道列表...');
        Api.loadChannels().then((d)=>{
          console.log('频道列表加载成功:', d);
          if(d.code === 200 && d.data && Array.isArray(d.data)){
            // 转换频道数据格式，根据返回的结构
            let channels = d.data.map(ch => ({
              title: ch.name,
              id: ch.id
            }));
            console.log('转换后的频道数据:', channels);
            // 添加默认的"推荐"频道到第一个位置
            this.tabTitles = [{title: '推荐', id: '__all__'}, ...channels];
            // 初始化列表数据和hasMoreData
            this.tabList = [...Array(this.tabTitles.length).keys()].map(i => []);
            this.hasMoreData = {};
            this.tabTitles.forEach((ch, idx) => {
              this.hasMoreData[idx] = true;
            });
            // 默认加载第一个频道（推荐）的数据
            this.$nextTick(() => {
              if(this.$refs['wxc-tab-page']){
                this.$refs['wxc-tab-page'].setPage(0, null, true);
                this.params.index = 0;
                this.params.tag = '__all__';
                this.load();
              }
            });
          } else {
            console.log('频道列表加载失败，使用默认配置:', d);
            // 如果接口失败，使用默认配置
            this.tabTitles = Config.tabTitles;
            this.tabList = [...Array(this.tabTitles.length).keys()].map(i => []);
            this.hasMoreData = {};
            this.tabTitles.forEach((ch, idx) => {
              this.hasMoreData[idx] = true;
            });
            this.$nextTick(() => {
                if(this.$refs['wxc-tab-page']){
                  this.$refs['wxc-tab-page'].setPage(1, null, true);
              }
            });
          }
          this.loadingChannels = false;
        }).catch((e)=>{
          console.error('加载频道异常:', e);
          // 如果接口失败，使用默认配置
          this.tabTitles = Config.tabTitles;
          this.tabList = [...Array(this.tabTitles.length).keys()].map(i => []);
          this.hasMoreData = {};
          this.tabTitles.forEach((ch, idx) => {
            this.hasMoreData[idx] = true;
          });
          this.loadingChannels = false;
        });
      },
      // 列表项在可见区域展示后的事件处理
      show:function(id){
        if(this.ashow[id]==undefined){
          this.ashow[id]=true;
        }
      },
      // 上拉加载更多
      loadmore:function(){
        // 如果该频道没有更多数据，不加载
        if(!this.hasMoreData[this.params.index]){
          this.showmore=false;
          return;
        }
        // 确保只在需要时设置加载状态，避免重复加载
        if(!this.showmore && !this.loading) {
          this.showmore=true;
          this.loading = true; // 添加加载标志
          this.params.loaddir=2;
          this.load();
        }
      },
      // 下来刷新数据
      loadnew:function(){
        this.shownew=true;
        this.params.loaddir=0
        this.load();
      },
      // 正常加载数据
      load : function(){      
      // 根据不同的加载方式设置特定的动画
      if(this.params.loaddir == 2){//加载更多
        this.showmore=true;
      }else if(this.params.loaddir == 0){//下拉刷新
        this.shownew=true;
      }else{//首次加载或频道切换
        this.shownew=false;
        this.showmore=false;
      }
      
      console.log('加载数据，频道索引:', this.params.index, '标签:', this.params.tag);
      Api.loaddata(this.params).then((d)=>{
        if(d.code === 200 && d.data){
          this.tanfer(d.data);
        } else {
          this.showmore=false;
          this.shownew=false;
          this.loading = false;
          modal.toast({
            message: d.errorMessage || '加载失败',
            duration: 2
          });
        }
      }).catch((e)=>{
        console.error('加载数据失败:', e);
        this.showmore=false;
        this.shownew=false;
        this.loading = false;
        modal.toast({
          message: '网络错误，请稍后重试',
          duration: 2
        });
      })
    },
      // 列表数据转换成View需要的Model对象
      tanfer : function(data){
        // 处理数据为空的情况
        if(!data || data.length==0){
          // 如果是加载更多且没有数据，标记为没有更多数据
          if(this.params.loaddir == 2){
            this.hasMoreData[this.params.index] = false;
            // 如果当前列表为空，才提示没有数据
            if(this.tabList[this.params.index].length === 0){
              modal.toast({message:'暂无数据',duration:2});
            }
          } else {
            // 下拉刷新时如果没有数据，提示
            if(this.tabList[this.params.index].length === 0){
              modal.toast({message:'暂无数据',duration:2});
            }
          }
          // 重置所有加载状态
          this.showmore=false;
          this.shownew=false;
          this.loading = false;
          return ;
        }
        
        // 如果返回的数据少于请求的size，说明没有更多数据了
        if(data.length < this.params.size){
          this.hasMoreData[this.params.index] = false;
        }
        
        let arr = []
        for(let i=0;i<data.length;i++){
          let ims = []
          if(data[i].images){
            // 处理图片字符串，移除方括号并分割
            let imgStr = String(data[i].images).replace(/[\[\]]/ig,'').trim();
            if(imgStr){
              ims = imgStr.split(',').filter(img => img.trim()).map(img => img.trim());
            }
          }
          
          // 根据图片数量确定类型：0=无图，1=单图，2或3=多图（最多3张）
          let type = 0;
          if(ims.length === 1){
            type = 1;
          } else if(ims.length >= 2){
            // 2张或3张都使用article_3组件，但限制最多3张
            type = ims.length > 3 ? 3 : ims.length;
          }
          
          // 先创建一个新对象，复制所有原始字段
          let tmp = {...data[i]};
          // 添加视图需要的额外字段
          tmp.comment = tmp.comment || 0;
          tmp.source = tmp.authorName || '未知';
          tmp.date = tmp.publishTime;
          tmp.type = type;
          tmp.image = ims.slice(0, 3); // 最多保留3张图片
          tmp.icon = '\uf06d';
          // 确保staticUrl字段被正确处理（移除可能的引号和空格）
          if(tmp.staticUrl){
            tmp.staticUrl = String(tmp.staticUrl).replace(/[`'"\s]/g, '').trim();
          }
          let time = data[i].publish_time;
          if(this.params.max_behot_time<time){
            this.params.max_behot_time=time;
          }
          if(this.params.min_behot_time>time){
            this.params.min_behot_time=time;
          }
          arr.push(tmp);
        }
        
        // 更新列表数据
        let newList = [...this.tabList];
        
        if(this.params.loaddir == 2){
          // 加载更多：追加到列表末尾
          newList[this.params.index] = this.tabList[this.params.index].concat(arr);
        } else if(this.params.loaddir == 0){
          // 下拉刷新：新数据放在前面
          newList[this.params.index] = arr.concat(this.tabList[this.params.index]);
        } else {
          // 首次加载：直接替换
          newList[this.params.index] = arr;
        }
        
        // 数据更新完成后再重置所有加载状态
        this.tabList = newList;
        this.showmore=false;
        this.shownew=false;
        this.loading = false;
      },
      // 频道页切换事件
    wxcTabPageCurrentTabSelected (e) {
      console.log('切换到频道:', e.page, this.tabTitles[e.page] && this.tabTitles[e.page]['title'] || '未知');
      this.params.loaddir=1
      this.params.index=e.page
      this.params.tag = this.tabTitles[e.page] ? this.tabTitles[e.page]['id'] : '__all__';
      this.params.max_behot_time=0
      this.params.min_behot_time=20000000000000
      // 清空当前频道的数据
      this.tabList[this.params.index] = [];
      // 重置加载状态，确保不显示加载提示
      this.showmore = false;
      this.shownew = false;
      this.hasMoreData[this.params.index] = true;
      // 使用setTimeout确保DOM更新后再加载数据
      setTimeout(() => {
        this.load();
      }, 50);
      },
      // 兼容回调
      wxcPanItemPan (e) {
        if (BindEnv.supportsEBForAndroid()) {
          this.$refs['wxc-tab-page'].bindExp(e.element);
        }
      },
      // 列表项点击事件
      wxcPanItemClicked(item){
        console.log('点击文章，文章ID:', item.id);

        // 只传递必要的参数，避免URL过长
        this.$router.push({
          name:'article-info',
          params:{
            id: item.id,
            staticUrl: item.staticUrl,
            title: item.title,
            createdTime: item.createdTime,
            authorId: item.authorId
          },
          // 不再将整个对象放入query参数
          query: {}
        });
        
        console.log('路由跳转已执行');
      }
    }
  };
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
