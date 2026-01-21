<template>
  <div class="wrapper">
    <div class="top-body">
      <div class="title-bar">
        <text class="title-text">标记</text>
      </div>
    </div>
    <div class="content-body">
      <wxc-tab-page
        ref="wxc-tab-page"
        :tab-titles="tabTitles"
        :tab-styles="tabStyles"
        title-type="text"
        :tab-page-height="tabPageHeight"
        @wxcTabPageCurrentTabSelected="onTabSelected"
      >
        <list
          v-for="(list,index) in tabList"
          :key="index"
          class="item-container"
          :style="{ height: (tabPageHeight - tabStyles.height) + 'px' }"
        >
          <cell v-for="(item,key) in list" class="cell" :key="key">
            <wxc-pan-item :ext-id="'mark-' + index + '-' + key" @wxcPanItemClicked="onItemClick(item)">
              <Item0 v-if="item.type==0" :data="item"/>
              <Item1 v-if="item.type==1" :data="item"/>
              <Item3 v-if="item.type==2" :data="item"/>
              <Item3 v-if="item.type==3" :data="item"/>
            </wxc-pan-item>
          </cell>
          <cell v-if="list.length === 0 && !loading && currentTab === index" class="cell no-data-cell">
            <text class="no-data-text">暂无数据</text>
          </cell>
          <cell v-if="loading && currentTab === index" class="cell loading-cell">
            <text class="loading-text">加载中...</text>
          </cell>
        </list>
      </wxc-tab-page>
    </div>
  </div>
</template>

<script>
import WxcTabPage from "@/compoents/tabs/home_tabs"
import { Utils, WxcPanItem } from 'weex-ui'
import Item0 from '../../compoents/cells/article_0.vue'
import Item1 from '../../compoents/cells/article_1.vue'
import Item3 from '../../compoents/cells/article_3.vue'
import Config from '@/pages/home/config'

const modal = weex.requireModule("modal")

export default {
  name: 'HeiMa-Mark',
  components: { WxcTabPage, Item0, Item1, Item3, WxcPanItem },
  data: () => ({
    tabTitles: [
      { title: '                我的点赞                ', id: 'like' },
      { title: '                我的收藏                ', id: 'collect' }
    ],
    tabStyles: Config.tabStyles,
    tabList: [[], []],
    tabPageHeight: 1334,
    currentTab: 0,
    loading: false
  }),
  created () {
    this.tabPageHeight = Utils.env.getPageHeight() - 110
    this.loadTab(0)
  },
  methods: {
    onTabSelected (e) {
      if (e.page === this.currentTab) {
        return
      }
      this.currentTab = e.page
      if (this.tabList[e.page] && this.tabList[e.page].length > 0) {
        return
      }
      this.loadTab(e.page)
    },
    loadTab (index) {
      if (this.loading) return
      this.loading = true
      this.getUserId()
        .then(id => {
          const url = index === 0
            ? `http://127.0.0.1:51601/article/api/v1/article/loadLike/${id}`
            : `http://127.0.0.1:51601/article/api/v1/article/loadCollect/${id}`
          return this.$request.post(url, {})
        })
        .then(d => {
          if (d && d.code === 200) {
            const list = this.transformArticles(Array.isArray(d.data) ? d.data : [])
            const next = [...this.tabList]
            next[index] = list
            this.tabList = next
          } else {
            modal.toast({ message: (d && d.errorMessage) ? d.errorMessage : '加载失败', duration: 2 })
          }
        })
        .catch(e => {
          modal.toast({ message: '网络错误，请稍后重试', duration: 2 })
          console.error('标记列表加载失败', e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getUserId () {
      return this.$store.getUser().then(user => {
        if (!user || user.id === undefined || user.id === null) {
          modal.toast({ message: '请先登录', duration: 2 })
          return Promise.reject(new Error('no user'))
        }
        return user.id
      })
    },
    transformArticles (data) {
      const arr = []
      for (let i = 0; i < data.length; i++) {
        const item = data[i] || {}
        let ims = []
        if (item.images) {
          let rawImages = String(item.images).trim()
          try {
            if (rawImages.charAt(0) === '[') {
              let parsed = JSON.parse(rawImages)
              if (Array.isArray(parsed)) {
                ims = parsed.map(s => String(s).replace(/[`'"\s]/g, '').trim()).filter(Boolean)
              }
            }
          } catch (e) {
            ims = []
          }
          if (!ims || ims.length === 0) {
            let imgStr = rawImages.replace(/[\[\]]/ig, '').trim()
            if (imgStr) {
              ims = imgStr
                .split(',')
                .map(img => String(img).replace(/[`'"\s]/g, '').trim())
                .filter(Boolean)
            }
          }
        }
        let type = 0
        if (ims.length === 1) {
          type = 1
        } else if (ims.length >= 2) {
          type = ims.length > 3 ? 3 : ims.length
        }
        let tmp = { ...item }
        tmp.title = String(tmp.title || '').replace(/\s+/g, '').trim()
        tmp.comment = tmp.comment || 0
        tmp.source = tmp.authorName || '未知'
        tmp.date = tmp.publishTime
        tmp.type = type
        tmp.image = ims.slice(0, 3)
        tmp.icon = '\uf06d'
        if (tmp.staticUrl) {
          tmp.staticUrl = String(tmp.staticUrl).replace(/[`'"\s]/g, '').trim()
        }
        arr.push(tmp)
      }
      return arr
    },
    onItemClick (item) {
      Promise.all([
        this.$store.getToken(),
        this.$store.getEquipmentId(),
        this.$store.getUser()
      ]).then(([token, equipmentId, user]) => {
        let url = item.staticUrl
        if (url) {
          const separator = url.indexOf('?') !== -1 ? '&' : '?'
          let pubTime = item.publishTime || item.createdTime || ''
          if (pubTime) {
            let date = new Date(pubTime)
            if (isNaN(date.getTime()) && typeof pubTime === 'string') {
              date = new Date(pubTime.replace(/-/g, '/'))
            }
            if (!isNaN(date.getTime())) {
              pubTime = date.getTime()
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
          }
          const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
          url = `${url}${separator}${queryString}`
        }
        this.$router.push({
          name: 'article-info',
          params: {
            id: item.id,
            staticUrl: url,
            title: item.title,
            createdTime: item.createdTime,
            authorId: item.authorId
          },
          query: {}
        })
      }).catch(e => {
        console.error('跳转文章详情失败', e)
        this.$router.push({
          name: 'article-info',
          params: {
            id: item.id,
            staticUrl: item.staticUrl,
            title: item.title,
            createdTime: item.createdTime,
            authorId: item.authorId
          },
          query: {}
        })
      })
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
  flex-direction: column;
  flex-wrap: wrap;
}
.top-body{
  position: fixed;
  left: 0;
  top: 0;
  width: 750px;
  height: 90px;
  background-color: #ffffff;
  border-bottom-width: 1px;
  border-bottom-color: rgba(0,0,0,0.06);
  border-bottom-style: solid;
}
.title-bar{
  height: 90px;
  align-items: center;
  justify-content: center;
}
.title-text{
  font-size: 32px;
  color: #333333;
}
.content-body{
  flex: 1;
  flex-direction: column;
  margin-top: 90px;
}
.item-container{
  width: 750px;
  background-color: transparent;
}
.cell{
  background-color: transparent;
}
.no-data-cell{
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
.no-data-text{
  color: #999999;
  font-size: 24px;
  text-align: center;
}
.loading-cell{
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}
.loading-text{
  color: #999999;
  font-size: 24px;
  text-align: center;
}
</style>
