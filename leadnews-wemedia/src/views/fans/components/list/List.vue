<template>
  <div>
    <ul class="list">
      <li v-for="item in fanList" :key="item.id || item.name">
        <img class="article-img" :src="item.image ? item.image : require('@/assets/avatar.jpg') ">
        <div class="name">{{item.name}}</div>
        <div class="meta">性别：{{formatSex(item.sex)}}</div>
        <div class="meta">认证：{{formatAuth(item.identityAuthentication)}}</div>
        <div class="meta">状态：{{formatStatus(item.status)}}</div>
        <div class="meta">类型：{{formatFlag(item.flag)}}</div>
      </li>
    </ul>
    <div class="pagination">
      <el-pagination
        layout="total,prev, pager, next"
        @current-change='pageChange'
        :current-page.sync='listPage.currentPage'
        :page-size="pageSize"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
       listPage:{
         currentPage:1
       }
    }
  },
  props: ["name", "fanList", "total", "pageSize", "changePage"],
  components: {
  },
  computed: {

  },
  methods: {
    pageChange: function (newPage) {
      this.changePage && this.changePage({page: newPage})
    },
    formatSex: function (sex) {
      if (sex === 0 || sex === '0' || sex === false) return '男'
      if (sex === 1 || sex === '1' || sex === true) return '女'
      if (sex === 2 || sex === '2') return '未知'
      return '未知'
    },
    formatAuth: function (value) {
      return value ? '已认证' : '未认证'
    },
    formatStatus: function (value) {
      if (value === 0 || value === '0' || value === false) return '正常'
      if (value === 1 || value === '1' || value === true) return '锁定'
      return '正常'
    },
    formatFlag: function (value) {
      if (value === 0 || value === '0') return '普通用户'
      if (value === 1 || value === '1') return '自媒体人'
      if (value === 2 || value === '2') return '大V'
      return '普通用户'
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .list {
    padding: 15px;
    li {
      border: 1px solid #e7e7e9;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 20px;
      margin-bottom: 10px;
      background-color: #ffffff;
      img {
        border-radius: 50%;
        width: 50px;
        height: 50px;
        flex-shrink: 0;
      }
      div {
        font-size: 13px;
        color: #666666;
        margin: 0;
        white-space: nowrap;
      }
      .name {
        font-size: 14px;
        color: #333333;
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
        color: #999999;
      }
    }
  }
</style>

