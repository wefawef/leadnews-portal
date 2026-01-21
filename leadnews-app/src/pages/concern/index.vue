<template>
  <div class="wrapper">
    <div class="top-body">
      <div class="title-bar">
        <text class="title-text">关注</text>
      </div>
    </div>
    <div class="content-body">
      <list class="item-container" :style="{ height: listHeight + 'px' }">
        <cell v-for="(item,key) in list" class="cell" :key="key">
          <wxc-pan-item :ext-id="'concern-' + key" @wxcPanItemClicked="onItemClick(item)">
            <Item0 v-if="item.type==0" :data="item"/>
            <Item1 v-if="item.type==1" :data="item"/>
            <Item3 v-if="item.type==2" :data="item"/>
            <Item3 v-if="item.type==3" :data="item"/>
          </wxc-pan-item>
        </cell>
        <cell v-if="list.length === 0 && !loading" class="cell no-data-cell">
          <text class="no-data-text">暂无数据</text>
        </cell>
        <cell v-if="loading" class="cell loading-cell">
          <text class="loading-text">加载中...</text>
        </cell>
      </list>
    </div>
  </div>
</template>

<script>
import { Utils, WxcPanItem } from 'weex-ui'
import Item0 from '../../compoents/cells/article_0.vue'
import Item1 from '../../compoents/cells/article_1.vue'
import Item3 from '../../compoents/cells/article_3.vue'

const modal = weex.requireModule("modal")

export default {
  name: 'HeiMa-Concern',
  components: { Item0, Item1, Item3, WxcPanItem },
  data: () => ({
    list: [],
    loading: false,
    listHeight: 1334
  }),
  created () {
    this.listHeight = Utils.env.getPageHeight() - 110
    this.loadList()
  },
  methods: {
    loadList () {
      if (this.loading) return
      this.loading = true
      this.getUserId()
        .then(id => {
          const url = `http://127.0.0.1:51601/article/api/v1/article/loadConcern/${id}`
          return this.$request.get(url, {})
        })
        .then(d => {
          if (d && d.code === 200) {
            this.list = this.transformArticles(Array.isArray(d.data) ? d.data : [])
          } else {
            modal.toast({ message: (d && d.errorMessage) ? d.errorMessage : '加载失败', duration: 2 })
          }
        })
        .catch(e => {
          modal.toast({ message: '网络错误，请稍后重试', duration: 2 })
          console.error('关注列表加载失败', e)
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
