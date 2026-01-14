<template>
  <section class="result">
    <header>{{`共找到${total}条符合条件的内容`}}</header>
    <el-table
      :data="list"
      style="width: 100%">
      <template v-for="item in fileds">
        <template v-if="item.list">
          <el-table-column :label="item.label" v-if="item.type=='radio'">
            <template slot-scope="scope">
              <template v-for="rs in  item.radios">
                <!-- 处理布尔值 -->
                <template v-if="typeof scope.row[item.name] === 'boolean'">
                  <el-tag effect="plain" type="info"  v-if="scope.row[item.name]==false && rs.value===0">{{rs.label}}</el-tag>
                  <el-tag effect="plain" type="success"  v-else-if="scope.row[item.name]==true && rs.value===1">{{rs.label}}</el-tag>
                </template>
                <!-- 处理数字值 -->
                <template v-else-if="rs.value==scope.row[item.name]">
                  <el-tag effect="plain" type="info"  v-if="scope.row[item.name]==0">{{rs.label}}</el-tag>
                  <el-tag effect="plain" type="success"  v-else-if="scope.row[item.name]==1">{{rs.label}}</el-tag>
                  <el-tag effect="plain" type="warning"  v-else-if="scope.row[item.name]==2">{{rs.label}}</el-tag>
                  <el-tag effect="plain" type="danger"  v-else-if="scope.row[item.name]==3">{{rs.label}}</el-tag>
                  <el-tag effect="plain" type=""  v-else-if="scope.row[item.name]==4">{{rs.label}}</el-tag>
                  <el-tag effect="plain" type="info"  v-else-if="scope.row[item.name]==rs.value">{{rs.label}}</el-tag>
                </template>
              </template>
            </template>
          </el-table-column>
          <el-table-column :label="item.label" v-else-if="item.name === 'sex'">
             <template slot-scope="scope">
               <span v-if="scope.row.sex === false || scope.row.sex === 0">男</span>
               <span v-else-if="scope.row.sex === true || scope.row.sex === 1">女</span>
               <span v-else>未知</span>
             </template>
          </el-table-column>
          <el-table-column :label="item.label" v-else-if="item.name === 'identityAuthentication'">
            <template slot-scope="scope">
              <span v-if="scope.row.identityAuthentication === false || scope.row.identityAuthentication === 0 || scope.row.identityAuthentication === null">未认证</span>
              <span v-else-if="scope.row.identityAuthentication === true || scope.row.identityAuthentication === 1">已认证</span>
              <span v-else>未知</span>
            </template>
          </el-table-column>
          <el-table-column :label="item.label" v-else-if="item.name === 'flag'">
            <template slot-scope="scope">
              <span v-if="scope.row.flag === 0">普通用户</span>
              <span v-else-if="scope.row.flag === 1">自媒体人</span>
              <span v-else-if="scope.row.flag === 2">大V</span>
              <span v-else>未知</span>
            </template>
          </el-table-column>
          <el-table-column :label="item.label" v-else-if="item.name.indexOf('_time')>-1 || item.name.indexOf('Time')>-1">
            <template slot-scope="scope">
              <span>{{ dateFormat(scope.row[item.name]) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="item.label" v-else-if="item.name === 'status'">
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.status === false || scope.row.status === 0">正常</el-tag>
              <el-tag type="danger" v-else>锁定</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="item.label" v-else>
            <template slot-scope="scope">
              <span>{{ scope.row[item.name] }}</span>
            </template>
          </el-table-column>
        </template>
      </template>
      <el-table-column label="操作"
         width="200" >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            v-if="scope.row.status == 1"
            @click="operateForDisable(scope.row.id,0,scope.$index )">启用</el-button>
          <el-button
            size="mini"
            v-else
            @click="operateForDisable(scope.row.id,1,scope.$index )">用户锁定</el-button>
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
import {updateUserStatus, updateWmUserStatus} from '@/api/user'
const avatar = require('@/assets/avatar.jpg')
export default {
  props: ['host','list','fileds','table','pageSize','total','changePage','changeStatus','editData','viewData'],
  data() {
    return {
       listPage:{
          currentPage:1
       },
       id: {
         filed: 'id',
         type:'eq',
         value:''
       },
      setForStatus: {
        status: ''
      }
    }
  },
  methods: {
    getImage : function(item, key){
      if(item[key]){
        let url = item[key];
        if (url.indexOf("http") === 0) {
          return url;
        }
        if (this.host) {
          return this.host + url;
        }
      }
      return avatar
    },
    //页码变化 调用上层组件的方法
    pageChange (newPage) {
        this.changePage && this.changePage({page:newPage})
    },
    resetPage(){

    },
    //重新设置页码
    dateFormat (time) {
      return DateUtil.format13(time)
    },
    async operateForDisable(id,status,index) {
      // 1. Prepare params for updateUserStatus
      let userParams = {
        id: id
      }
      
      // 2. Prepare params for updateWmUserStatus
      let wmUserParams = {
        apUserId: id
      }

      // 3. Execute both requests in parallel
      try {
        let [userRes, wmUserRes] = await Promise.all([
          updateUserStatus(userParams),
          updateWmUserStatus(wmUserParams)
        ]);

        // 4. Check results. Assume success if BOTH succeed.
        // Or should we consider it partial success? 
        // Usually, if one fails, we should probably warn the user.
        // But for UI update, if the main user update succeeds, we toggle the UI.
        
        if(userRes.code==200 && wmUserRes.code==200){
           this.changeStatus(index,status);
           this.$message({type:'success',message:'操作成功！'});
        } else {
           // Aggregate error messages
           let errorMsg = '';
           if (userRes.code != 200) errorMsg += `用户状态更新失败: ${userRes.errorMessage} `;
           if (wmUserRes.code != 200) errorMsg += `自媒体状态更新失败: ${wmUserRes.errorMessage}`;
           this.$message({type:'error',message: errorMsg});
        }
      } catch (error) {
         console.error("Update failed", error);
         this.$message({type:'error',message: '操作失败，请重试'});
      }
    },
    open(msg) {
      this.$prompt(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        this.params.msg = value;
        this.updateData(this.params)
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
