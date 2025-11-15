<template>
  <div class="wrapper">
    <div class="top-body"><Home_Bar/></div>
    <div class="content-body">
      <wxc-tab-page ref="wxc-tab-page" :tab-titles="tabTitles" :tab-styles="tabStyles" title-type="text" :tab-page-height="tabPageHeight" @wxcTabPageCurrentTabSelected="wxcTabPageCurrentTabSelected">
        <list v-for="(v,index) in tabList"  :key="index" class="item-container" :ref="'list-container'" :style="{ height: (tabPageHeight - tabStyles.height) + 'px' }">
          <!-- 下拉刷新最新 -->
          <refresh @refresh='loadnew'  :display="shownew?'show':'hide'" class="loading">
            <loading-indicator class="loading-icon"></loading-indicator>
            <text class="loading-text">{{load_new_text}}</text>
          </refresh>
          <!-- 列表项，并绑定显示事件 -->
          <cell v-for="(item,key) in v" class="cell" @appear="show(item.id)" :key="key" :id="'item-' + index + '-' + key" :ref="'itemref-' + index + '-' + key">
            <wxc-pan-item :ext-id="'1-' + index + '-' + key" @wxcPanItemClicked="wxcPanItemClicked(item, index, key)" @wxcPanItemPan="wxcPanItemPan">
              <Item0 v-if="item.type==0" :data="item"/>
              <Item1 v-if="item.type==1" :data="item"/>
              <Item3 v-if="item.type==2" :data="item"/>
              <Item3 v-if="item.type==3" :data="item"/>
            </wxc-pan-item>
          </cell>
          <!-- 上拉加载更多 -->
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
        maxBehotTime:0, // 最大时间戳，用于分页，数字类型
        minBehotTime:20000000000000 // 最小时间戳，用于分页，数字类型
      },//列表数据请求参数
      ashow : {},//列表展示行为记录表
      timer : null,//定时函数
      loadingChannels: false,//是否正在加载频道
      needRestoreScroll: false, // 是否需要恢复滚动位置
      savedScrollPosition: 0, // 保存的滚动位置
      savedArticleId: null,
      savedItemIndex: null,
      restoreAttempts: 0
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
      console.log('首页初始化，开始加载数据...');
      
      // 检查是否需要恢复滚动位置（从文章详情页返回）
      if (typeof sessionStorage !== 'undefined') {
        const itemIndexStr = sessionStorage.getItem('listItemIndex');
        const scrollPosition = sessionStorage.getItem('listScrollPosition');
        const lastChannelIndex = sessionStorage.getItem('lastChannelIndex');
        const lastChannelTag = sessionStorage.getItem('lastChannelTag');
        const lastArticleId = sessionStorage.getItem('lastArticleId');

        if ((itemIndexStr !== null || scrollPosition || lastArticleId) && lastChannelIndex !== null) {
          this.needRestoreScroll = true;
          this.savedItemIndex = itemIndexStr !== null ? parseInt(itemIndexStr) : null;
          this.savedScrollPosition = scrollPosition ? parseInt(scrollPosition) : 0;
          this.savedArticleId = lastArticleId || null;
          this.params.index = parseInt(lastChannelIndex);
          this.params.tag = lastChannelTag || '__all__';
          console.log('检测到需要恢复浏览位置: itemIndex=', this.savedItemIndex, 'px=', this.savedScrollPosition, '频道索引=', this.params.index, '文章ID=', this.savedArticleId);

          sessionStorage.removeItem('listItemIndex');
          sessionStorage.removeItem('listScrollPosition');
          sessionStorage.removeItem('lastChannelIndex');
          sessionStorage.removeItem('lastChannelTag');
          sessionStorage.removeItem('lastArticleId');
        }
      }
      
      // 如果不需要恢复滚动位置，使用正常的频道恢复逻辑
      if (!this.needRestoreScroll) {
        // 优先从lastChannelIndex获取频道信息（这是点击文章时保存的频道）
        const lastChannelIndex = sessionStorage.getItem('lastChannelIndex');
        const lastChannelTag = sessionStorage.getItem('lastChannelTag');
        
        if (lastChannelIndex !== null) {
          this.params.index = parseInt(lastChannelIndex);
          this.params.tag = lastChannelTag || '__all__';
          console.log('从lastChannelIndex恢复频道索引:', this.params.index, '标签:', this.params.tag);
          
          // 清除保存的频道信息，避免重复使用
          sessionStorage.removeItem('lastChannelIndex');
          sessionStorage.removeItem('lastChannelTag');
        } else {
          // 如果lastChannelIndex不存在，再尝试从路由参数获取
          const routeChannelIndex = this.$route.query.channelIndex;
          const routeChannelTag = this.$route.query.channelTag;
          
          if (routeChannelIndex !== undefined) {
            this.params.index = parseInt(routeChannelIndex);
            console.log('从路由参数恢复频道索引:', this.params.index);
            if (routeChannelTag) {
              this.params.tag = routeChannelTag;
              console.log('从路由参数恢复频道标签:', this.params.tag);
            }
            
            // 清除URL参数，避免重复使用
            this.$router.replace({ name: 'Home' });
          }
        }
      }
      
      // 先设置空数组，等API加载频道数据后再初始化
      this.tabTitles = [];
      this.tabList = [];
      this.hasMoreData = {};
      
      // 初始化高度，顶部菜单高度120+顶部bar 90
      this.tabPageHeight = Utils.env.getPageHeight()-110;
      Api.setVue(this);
      
      // 现在params.index已设置好，加载频道列表
      this.loadChannels();
      
      // 设置定时器，每5秒提交一次数据
      this.timer = setInterval(() => {
          this.submit();
      }, 5000);
    },

    methods: {
      destroyed() {
        // 确保清除定时器，防止内存泄漏
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      },
      // 加载频道列表
      loadChannels:function(){
          this.loadingChannels = true;
          Api.loadChannels().then((d)=>{
              if(d.code==200){
                  // 转换频道数据格式
                  let arr = d.data;
                  let temp = [];
                  for(let i=0;i<arr.length;i++){
                      temp.push({
                          title:arr[i].name,
                          id:arr[i].id
                      })
                  }
                  // 添加默认的推荐频道
                  temp.unshift({title:'推荐',id:'__all__'});
                  this.tabTitles = temp;
                  this.tabList = [...Array(this.tabTitles.length).keys()].map(i => []);
                  this.hasMoreData = {};
                  this.tabTitles.forEach((ch, idx) => {
                      this.hasMoreData[idx] = true;
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
              }
              this.loadingChannels = false;
              
              // 统一在最后调用一次load，避免重复加载
              this.$nextTick(() => {
                  if(this.$refs['wxc-tab-page']){                       
                      // 避免使用可选链操作符，使用传统条件检查
                      const channelTitle = this.tabTitles[this.params.index] ? this.tabTitles[this.params.index].title : '未知';
                      console.log('准备设置频道索引:', this.params.index, '对应频道:', channelTitle);
                      // 设置到指定的频道索引，禁用动画效果避免闪烁
                      this.$refs['wxc-tab-page'].setPage(this.params.index, null, false);
                      
                      // 确保当前频道的标签正确设置
                      this.params.tag = this.tabTitles[this.params.index] ? this.tabTitles[this.params.index].id : '__all__';
                      console.log('频道标签设置为:', this.params.tag);
                      
                      // 加载数据
                      this.load();
                    } else {
                      console.error('wxc-tab-page组件未找到，无法设置频道');
                    }
                  
                  // 如果需要恢复滚动位置，在数据加载完成后执行
                  if (this.needRestoreScroll) {
                    console.log('执行滚动位置恢复');
                    setTimeout(() => {
                      this.restoreScrollPosition();
                    }, 500);
                  }
              });
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
              
              // 统一在最后调用一次load，避免重复加载
              this.$nextTick(() => {
                  if(this.$refs['wxc-tab-page']){                        
                      console.log('准备设置频道索引(异常情况):', this.params.index, '对应频道:', this.tabTitles[this.params.index] ? this.tabTitles[this.params.index].title : '未知');
                      // 设置到指定的频道索引，禁用动画效果避免闪烁
                      this.$refs['wxc-tab-page'].setPage(this.params.index, null, false);
                      
                      // 确保当前频道的标签正确设置
                      this.params.tag = this.tabTitles[this.params.index] ? this.tabTitles[this.params.index].id : '__all__';
                      console.log('频道标签设置为(异常情况):', this.params.tag);
                      
                      // 加载数据
                      this.load();
                  } else {
                      console.error('wxc-tab-page组件未找到，无法设置频道(异常情况)');
                  }
              });
          });
      },
      // 恢复滚动位置的方法
      restoreScrollPosition() {
        if (!this.needRestoreScroll) {
          return;
        }
        console.log('开始恢复浏览位置: itemIndex=', this.savedItemIndex, 'px=', this.savedScrollPosition);
        setTimeout(() => {
          try {
            const currentList = this.tabList[this.params.index];
            if (currentList && currentList.length > 0) {
              if (this.savedArticleId) {
                const idx = this.findItemIndexById(this.savedArticleId);
                if (idx !== -1) {
                  this.scrollToItemIndex(idx);
                } else {
                  this.loadMoreUntilFound();
                  return;
                }
              } else if (this.savedItemIndex !== null) {
                this.scrollToItemIndex(this.savedItemIndex);
              } else if (this.savedScrollPosition > 0) {
                this.setScrollPosition(this.savedScrollPosition);
              }
              modal.toast({ message: '已恢复到之前的浏览位置', duration: 2 });
              console.log('浏览位置恢复完成');
            }
          } catch (error) {
            console.error('恢复滚动位置时出错:', error);
          }
          this.needRestoreScroll = false;
          this.savedScrollPosition = 0;
          this.savedItemIndex = null;
          this.savedArticleId = null;
          this.restoreAttempts = 0;
        }, 1000);
      },
      findItemIndexById(id) {
        try {
          const list = this.tabList[this.params.index] || [];
          for (let i = 0; i < list.length; i++) {
            const it = list[i];
            if (it && (it.id === id || (it.id + '') === (id + ''))) {
              return i;
            }
          }
        } catch (e) {}
        return -1;
      },
      loadMoreUntilFound(maxAttempts = 5) {
        const tryFind = () => {
          const idx = this.findItemIndexById(this.savedArticleId);
          if (idx !== -1) {
            this.scrollToItemIndex(idx);
            modal.toast({ message: '已恢复到之前的浏览位置', duration: 2 });
            this.needRestoreScroll = false;
            this.savedArticleId = null;
            this.restoreAttempts = 0;
            return;
          }
          if (this.restoreAttempts >= maxAttempts) {
            if (this.savedItemIndex !== null) {
              this.scrollToItemIndex(this.savedItemIndex);
            } else if (this.savedScrollPosition > 0) {
              this.setScrollPosition(this.savedScrollPosition);
            }
            this.needRestoreScroll = false;
            this.savedArticleId = null;
            this.restoreAttempts = 0;
            return;
          }
          this.restoreAttempts++;
          this.params.loaddir = 1;
          this.load();
          setTimeout(tryFind, 600);
        };
        tryFind();
      },
      scrollToItemIndex(targetIndex) {
        try {
          if (typeof weex !== 'undefined' && weex.requireModule) {
            const domModule = weex.requireModule('dom');
            if (domModule && domModule.scrollToElement) {
              const targetRef = 'itemref-' + this.params.index + '-' + targetIndex;
              const elArr = this.$refs[targetRef];
              const el = elArr && elArr[0] ? elArr[0] : null;
              if (el) {
                domModule.scrollToElement(el, { offset: 0, animated: false });
                return;
              }
            }
          }
        } catch (error) {}
      },
      
      // 设置滚动位置的方法
      setScrollPosition(position) {
        try {
          console.log('尝试设置滚动位置到:', position, 'px');
          
          // 方案1：使用Weex的dom模块进行精确滚动控制
          if (typeof weex !== 'undefined' && weex.requireModule) {
            try {
              const domModule = weex.requireModule('dom');
              if (domModule && domModule.scrollToElement) {
                const currentList = this.tabList[this.params.index];
                if (currentList && currentList.length > 0) {
                  // 计算接近目标位置的元素
                  const averageItemHeight = 250; // 平均列表项高度
                  let targetIndex = Math.max(0, Math.floor(position / averageItemHeight));
                  targetIndex = Math.min(targetIndex, currentList.length - 1);
                  
                  const targetRef = 'itemref-' + this.params.index + '-' + targetIndex;
                  console.log('尝试滚动到元素ref:', targetRef, '目标位置:', position);
                  const elArr = this.$refs[targetRef];
                  const el = elArr && elArr[0] ? elArr[0] : null;
                  if (el) {
                    domModule.scrollToElement(el, {
                      offset: position - (targetIndex * averageItemHeight),
                      animated: false
                    });
                    modal.toast({ message: '已恢复浏览位置', duration: 1 });
                    return;
                  }
                }
              }
            } catch (error) {
              console.warn('使用dom模块滚动失败:', error);
            }
          }
          
          // 方案2：如果无法精确滚动，至少确保频道正确切换
          console.log('滚动位置恢复完成（频道已切换）');
          
        } catch (error) {
          console.warn('设置滚动位置失败:', error);
        }
      },
      // 列表项在可见区域展示后的事件处理
      show:function(id){
        if(this.ashow[id]==undefined){
          this.ashow[id]=true;
        }
      },
      // 上拉加载更多
      loadmore:function(){
          this.showmore=true;
          this.params.loaddir=1;
          this.load();
      },
      // 下拉刷新数据
      loadnew:function(){
        this.shownew=true;
        this.params.loaddir=2;
        // this.params.maxBehotTime=0; // 重置最大时间戳
        // this.params.minBehotTime=20000000000000; // 重置最小时间戳
        this.load();
      },
      // 正常加载数据
      load : function(){
        // 避免重复加载
        if (this.loading) {
          console.log('数据正在加载中，取消重复请求');
          return;
        }
        
        // 根据不同的加载方式设置特定的动画
        if(this.params.loaddir == 1){//加载更多
          this.showmore=true;
        }else if(this.params.loaddir == 2){//下拉刷新
          this.shownew=true;
        }else{//首次加载或频道切换
          this.shownew=false;
          this.showmore=false;
        }
        
        // 设置加载中状态
        this.loading = true;
        
        console.log('加载数据，频道索引:', this.params.index, '标签:', this.params.tag);
        Api.loaddata(this.params).then((d)=>{
          try {
            if(d.code === 200 && d.data){
              this.tanfer(d.data);
            } else {
              modal.toast({
                message: d.errorMessage || '加载失败',
                duration: 2
              });
            }
          } catch (error) {
            console.error('数据处理异常:', error);
            modal.toast({
              message: '数据处理错误',
              duration: 2
            });
          } finally {
            // 无论成功失败都重置加载状态
            this.showmore=false;
            this.shownew=false;
            this.loading = false;
          }
        }).catch((e)=>{
          console.error('加载数据失败:', e);
          modal.toast({
            message: '网络错误，请稍后重试',
            duration: 2
          });
          // 无论成功失败都重置加载状态
          this.showmore=false;
          this.shownew=false;
          this.loading = false;
        });
      },
      // 列表数据转换成View需要的Model对象
      tanfer : function(data){
        try {
          // 处理数据为空的情况
          if(!data || data.length==0){
            // 如果是加载更多且没有数据，标记为没有更多数据
            if(this.params.loaddir == 1){
              this.hasMoreData[this.params.index] = false;
              console.log('已加载完所有数据，频道:', this.params.index);
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
            return;
          }
          
          // 确保当前频道有数据数组
          if(!this.tabList[this.params.index]){
            this.tabList[this.params.index] = [];
          }
          
          // 如果返回的数据少于请求的size，说明没有更多数据了（仅在加载更多时判断）
          if(this.params.loaddir == 1 && data.length < this.params.size){
            this.hasMoreData[this.params.index] = false;
          }
          
          let arr = [];
          for(let i=0;i<data.length;i++){
            let ims = [];
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
            // 获取发布时间，优先使用publishTime字段
            let publishTime = data[i].publishTime || data[i].publish_time;
            
            // 转换为数字时间戳进行比较
            let time = publishTime ? new Date(publishTime).getTime() : 0;
            
            // 添加调试日志
            console.log('文章时间信息:', {
              publishTime: publishTime,
              timestamp: time,
              currentMax: this.params.maxBehotTime,
              currentMin: this.params.minBehotTime
            });
            
            // 更新时间戳用于分页
            if(time > 0) {
              if(this.params.maxBehotTime < time){
                console.log('更新maxBehotTime:', this.params.maxBehotTime, '->', time);
                this.params.maxBehotTime = time;
              }
              if(this.params.minBehotTime > time){
                console.log('更新minBehotTime:', this.params.minBehotTime, '->', time);
                this.params.minBehotTime = time;
              }
            }
            arr.push(tmp);
          }
          
          // 更新列表数据
          let newList = [...this.tabList];
          
          if(this.params.loaddir == 1){
            // 加载更多：追加到列表末尾
            newList[this.params.index] = this.tabList[this.params.index].concat(arr);
          } else if(this.params.loaddir == 2){
            // 下拉刷新：新数据放在前面
            newList[this.params.index] = arr.concat(this.tabList[this.params.index]);
          } else {
            // 首次加载：直接替换
            newList[this.params.index] = arr;
          }
          
          // 数据更新完成
          this.tabList = newList;
        } catch (error) {
          console.error('数据转换异常:', error);
          modal.toast({
            message: '数据处理失败',
            duration: 2
          });
        } finally {
          // 无论成功失败都重置所有加载状态
          this.showmore=false;
          this.shownew=false;
          this.loading = false;
        }
      },
      // 频道页切换事件
      wxcTabPageCurrentTabSelected (e) {
        console.log('切换到频道:', e.page, this.tabTitles[e.page] && this.tabTitles[e.page]['title'] || '未知');
        
        // 如果点击的是当前已选中的频道，不执行任何操作
        if (e.page === this.params.index && !this.loadingChannels) {
          console.log('点击的是当前已选中的频道，不重新加载');
          return;
        }
        
        // 重置参数
        this.params.loaddir = 0;
        this.params.index = e.page;
        this.params.tag = this.tabTitles[e.page] ? this.tabTitles[e.page]['id'] : '__all__';
        this.params.maxBehotTime = 0; // 重置最大时间戳
        this.params.minBehotTime = 20000000000000; // 重置最小时间戳
        
        // 清空当前频道的数据
        this.tabList[this.params.index] = [];
        
        // 重置加载状态
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
      wxcPanItemClicked(item, index, key){
      console.log('点击文章，文章ID:', item.id);
      console.log('当前频道索引:', this.params.index);
      console.log('当前频道标签:', this.params.tag);

      // 简化实现：只保存必要的频道信息
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('lastChannelIndex', this.params.index.toString());
        sessionStorage.setItem('lastChannelTag', this.params.tag || '');
        sessionStorage.setItem('listItemIndex', (key || 0).toString());
        sessionStorage.setItem('lastArticleId', (item.id || '').toString());
        console.log('已保存当前频道信息，索引:', this.params.index, '标签:', this.params.tag);
      }

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
