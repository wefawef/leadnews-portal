<template>
  <section class="result">
    <header>{{`共找到${total}条符合条件的内容`}}</header>
    <el-table
      :data="authList"
      style="width: 100%">
      <el-table-column
        label="姓名">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="身份证号">
        <template slot-scope="scope">
          <span>{{ scope.row.idno }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="状态">
        <template slot-scope="scope">
          <span>
             <el-tag type="info" v-if="scope.row.status == '0'">创建中</el-tag>
             <el-tag v-if="scope.row.status == '1'">待审核</el-tag>
             <el-tag type="danger" v-if="scope.row.status == '2'">审核失败</el-tag>
             <el-tag type="success" v-if="scope.row.status == '9'">审核通过</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="正面照">
        <template slot-scope="scope">
          <span><img class="article-img" :src="getImage(scope.row.fontImage)" @error="imageError"/></span>
        </template>
      </el-table-column>
      <el-table-column
        label="背面照">
        <template slot-scope="scope">
          <span><img class="article-img" :src="getImage(scope.row.backImage)" @error="imageError"/></span>
        </template>
      </el-table-column>
      <el-table-column
        label="手持照">
        <template slot-scope="scope">
          <span><img class="article-img" :src="getImage(scope.row.holdImage)" @error="imageError"/></span>
        </template>
      </el-table-column>
      <el-table-column
        label="活体照">
        <template slot-scope="scope">
          <span><img class="article-img" :src="getImage(scope.row.liveImage)" @error="imageError"/></span>
        </template>
      </el-table-column>
      <el-table-column
        label="原因">
        <template slot-scope="scope">
          <span>{{ scope.row.reason }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="提交时间">
        <template slot-scope="scope">
          <span><dd class="time">{{dateFormat(scope.row.submitedTime)}}</dd></span>
        </template>
      </el-table-column>
      <el-table-column label="操作"
         width="200"
        >
        <template slot-scope="scope">
          <el-button
            size="mini"
            v-if="scope.row.status == 1"
            @click="operateForPass(scope.row.id)">通过</el-button>
          <el-button
            size="mini"
            type="danger"
            v-if="scope.row.status == 1"
            @click="operateForFail(scope.row.id)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        layout="total,prev, pager, next"
        @current-change='pageChange'
        :current-page.sync='listPage.currentPage'
        :page-size="pageSize"
        :total="total">
      </el-pagination>
    </div>
  </section>
</template>

<script>
import DateUtil from '@/utils/date'
const avatar = require('@/assets/avatar.jpg')
const emptyImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
export default {
  props: ['host','authList','pageSize','total','changePage','authPassRealName', 'authFailRealName'],
  data() {
    return {
       listPage:{
          currentPage:1
       },
       params: {
         id: '',
         msg: ''
       }
    }
  },
  methods: {
    getImage (url){
      if(url){
        // 去除首尾空格和可能存在的反引号
        url = url.trim().replace(/`/g, '');
        if (url.indexOf("http") === 0) return url;
        // 如果是相对路径但没有 host，返回 avatar 避免裂图
        if (!this.host) return emptyImage;
        return this.host + url;
      }
      return emptyImage
    },
    imageError(e) {
      e.target.src = emptyImage
    },
    //页码变化 调用上层组件的方法
    pageChange (newPage) {
        this.changePage && this.changePage({page:newPage})
    },
    resetPage(){

    },
    //重新设置页码
    dateFormat (time) {
      return DateUtil.format13HH(time)
    },
    operateForPass(id) {
      this.params.id = id;
      this.authPassRealName(this.params)
    },
    operateForFail(id) {
      this.params.id = id;
      this.open('请输入驳回审核原因')
    },
    open(msg) {
      this.$prompt(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        this.params.msg = value;
        this.authFailRealName(this.params)
      }).catch(() => {

      });
    }
  }
}
</script>
<style lang="scss" scoped>
  .result {
    background-color: #ffffff;
    text-align: left;
    border: 1px solid #e7e7e9;
    margin-top: 10px;
    header {
      border-bottom: 1px dashed #cccccc;
      margin: 0 5px;
      padding: 0 10px;
      font-size: 14px;
      height: 55px;
      line-height: 55px;
      color: #323745;
    }
    li {
      overflow: hidden;
      padding: 15px 5px;
      margin: 0 10px;
      border-bottom: 1px solid #f2f3f5;
       .draft {
           color:#FDC2A9;
           border-color: #FDC2A9;
           background: #FFFFFF;
        }
        .delete {
           color:rgb(243, 24, 8);
           border-color: rgb(243, 24, 8);
           background: #FFFFFF;
        }
        .audit {
           color:rgb(53, 160, 17);
           border-color: rgb(53, 160, 17);
           background: #FFFFFF;
        }
        .unaudit {
           color:#FFAEAE;
           border:none;
        }
    }
    .article-img {
      float: left;
      width: 150px;
      height: 100px;
    }
    .article-content {
      margin-left: 160px;
      text-align: left;
      dt {
        color: #333333;
        font-size: 14px;
        margin: 0 0 7px;
        div {
          float: right;
          i {
            margin-left: 20px;
            font-size: 12px;
            cursor: pointer;
          }
        }
      }
      .time {
        margin-bottom: 10px;
        span {
          color:#3296fa;
          margin-right: 8px;
        }
      }
      dd {
        font-size: 12px;
        margin: 5px 0;
        color: #999999;
        b {
          color: #333333;
        }
        span {
          margin-right: 10px;
        }
      }
    }
  }
  .el-pagination {
    text-align: center;
    margin: 20px 0 40px;
  }
</style>
