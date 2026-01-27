<template>
  <div class="fans-container">
    <header>粉丝列表</header>
    <List
      :fanList="fansList"
      :total="total"
      :pageSize="params.size"
      :changePage="getFollowers"
    />
  </div>
</template>

<script>
import List from './components/list/List.vue'
import { getFollowers } from '@/api/fans'
import { getUser } from '@/utils/store'
export default {
  name: 'FansList',
  data() {
    return {
        fansList:[],
        params:{
          page:1,
          size:10
        },
        total: 0
    }
  },
  created () {
     this.getFollowers() //粉丝列表数据
  },
  components: {
    List
  },
  computed: {

  },
  methods: {
      //获取粉丝列表
      async getFollowers (newParams) {
       const user = getUser() || {}
       const userId = user.id || user.userId || user.uid
       if (!userId) {
         this.fansList = []
         this.total = 0
         return
       }
       let result = await getFollowers(userId,{...this.params, ...newParams})
       const datas = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : [])
       this.total = result.total || datas.length
       this.fansList = datas
      }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.fans-container {
  background-color: #ffffff;
  text-align: left;
  border: 1px solid #e7e7e9;
  header {
    color: #323745;
    font-size: 14px;
    height: 55px;
    line-height: 55px;
    padding: 0 15px;
    background-color: #fbfbfb;
    border-bottom: 1px solid #e8e8e8;
  }
  .tabBar {
    font-size: 14px;
    padding: 0 15px;
    height: 55px;
    line-height: 55px;
    border-bottom: 1px dashed #cccccc;
    a {
      margin-right: 35px;
      color: #323745;
      &.active {
        color: #3296fa;
      }
    }
  }
}
</style>

