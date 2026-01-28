<template>
  <div class="fans-container">
    <header>粉丝画像</header>
    <div class="tabView">
      <Progress name="粉丝性别分布" :percentage="manPercent" :legend="['男', '女']"/>
      <Progress name="自媒体账号认证" :percentage="unauthPercent" :legend="['未认证', '已认证']"/>
    </div>
  </div>
</template>

<script>
import Progress from './components/info/Progress.vue'
import { getFollowers }  from '@/api/fans'
import { getUser } from '@/utils/store'

export default {
  name: 'ContentManage',
  data() {
    return {
      gender: {
        male:0,
        female:0
      },
      auth: {
        unauth: 0,
        auth: 0
      }
    }
  },
  components: {
    Progress
  },
  created () {
    this.getFansPortrait();
  },
  computed: {
     manPercent () {
       if((this.gender.male + this.gender.female) > 0){
          return Math.round(parseFloat(this.gender.male / (this.gender.male + this.gender.female)) * 100)
       }
       //目前没有粉丝数据 所以 男粉丝+女粉丝是0  所以 模拟一下数据50
       return 50
     },
    unauthPercent () {
       if ((this.auth.unauth + this.auth.auth) > 0) {
         return Math.round(parseFloat(this.auth.unauth / (this.auth.unauth + this.auth.auth)) * 100)
       }
       return 50
    }
  },
  methods: {
    //获取粉丝性别分布
    async  getFansPortrait () {
       const user = getUser() || {}
       const userId = user.id || user.userId || user.uid
       if (!userId) {
         this.gender.male = 0
         this.gender.female = 0
         this.auth.unauth = 0
         this.auth.auth = 0
         return
       }
       let result = await getFollowers(userId, {page:1,size:1000})
       if (result.code == 0 || result.code == 200) {
         const list = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : [])
         let male = 0
         let female = 0
         let unauth = 0
         let auth = 0
         list.forEach((item) => {
           const sex = item.sex
           if (sex === 0 || sex === '0' || sex === false) {
             male += 1
           } else if (sex === 1 || sex === '1' || sex === true) {
             female += 1
           }
           const identityAuthentication = item.identityAuthentication
           if (identityAuthentication === true || identityAuthentication === 1 || identityAuthentication === '1') {
             auth += 1
           } else {
             unauth += 1
           }
         })
         this.gender.male = male
         this.gender.female = female
         this.auth.unauth = unauth
         this.auth.auth = auth
       } else {
         this.$message({type: "error", message: result.errorMessage || result.error_message})
       }
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
  .tabView {
    padding: 0 30px;
  }
}
</style>

