<template>
  <div class="content">
    <el-row :gutter="40">
      <el-col :span="8">
        <div class="grid-content">
          <i class="fa fa-file-text-o icon-publish"></i>
          <div>
            <div>{{article}} 个</div>
            <span>图文发布量</span>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content">
          <i class="fa fa-thumbs-o-up icon-like"></i>
          <div>
            <div>{{likes}} 个</div>
            <span>点赞数量</span>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content">
          <i class="fa fa-star-o icon-collect"></i>
          <div>
            <div>{{collection}}</div>
            <span>收藏量</span>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props:["collection","likes","article"],
  components: {
  },
  computed: {

  },
  methods: {

  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.content {
  padding: 0 20px 20px;
}
.el-row {
  .el-col {
    .grid-content {
      background-color: #f8f8f8;
      padding: 30px 0;
      display: flex;
      justify-content: center;
      i {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        color: #ffffff;
      }
      .icon-publish {
        background-color: #409EFF;
      }
      .icon-like {
        background-color: #F56C6C;
      }
      .icon-collect {
        background-color: #E6A23C;
      }
      & > div {
        margin: 0px 0 0 10px;
        span {
          color: #444444;
          font-size: 14px;
        }
        div {
          font-size: 24px;
        }
      }
    }
  }
}

</style>

