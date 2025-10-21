<template>
  <section class="result">
    <header>{{`共找到${total}条符合条件的内容`}}</header>
    <ul class="result-container">
      <li v-for="(item,index) in  articleList" :key='index' class='articles-item'>
        <img class="article-img" :src="getImage(item)"/>
        <dl class="article-content">
          <dd class="article-time">{{ formatTime(item.publishTime) }}</dd>
          <dt>
            <a @click="noAction" href="#" class="">{{item.title}}</a>
            <div  @click="operateBtn(item.id,$event)">
              <i data-type='up'  v-if="item.status == '9'&&item.enable=='0'" class="el-icon-upload2">上架</i>
              <i data-type='down'  v-if="item.status == '9'&&item.enable=='1'" class="el-icon-download">下架</i>
              <i data-type='modify'  v-if="item.enable != '1' && item.status!='100'" class="el-icon-edit">修改</i>
              <i v-if="item.enable != '1' && item.status!='100'" data-type='del' class="el-icon-delete">删除</i>
            </div>
          </dt>
          <dd>
            <el-tag class="draft" v-if="item.status == '0'">草稿</el-tag>
            <el-tag class="audit" v-if="item.status == '1'">待审核</el-tag>
            <el-tag class="audit" v-if="item.status == '3'">待人工审核</el-tag>
            <el-tag class="audit" v-if="item.status == '4'">待发布</el-tag>
            <el-tag class="publish" v-if="item.status == '8'">待发布</el-tag>
            <el-tag class="publish" v-if="item.status == '9'">已发表</el-tag>
            <el-tag class="unaudit" v-if="item.status == '2'">未通过审核:{item.reason}</el-tag>
            <el-tag class="delete" v-if="item.status == '100'">已删除</el-tag>
            <template v-if="item.status == '9'">
              <el-tag class="draft" v-if="item.enable == '0'">已下架</el-tag>
              <el-tag class="audit" v-if="item.enable == '1'">已上架</el-tag>
            </template>
          </dd>
          <dd class="time">{{dateFormat(item.publish_time)}}</dd>
        </dl>
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
  </section>
</template>

<script>
import DateUtil from '@/utils/date'
const avatar = require('@/assets/avatar.jpg')
export default {
  props: ['host','articleList','pageSize','total','changePage','deleteArticlesById','upOrDown'],
  data() {
    return {
      listPage:{
        currentPage:1
      }
    }
  },
  methods: {
    noAction : function(){
      alert('该功能暂未实现');
    },
    formatTime(timestamp) {
      // 假设时间是一个时间戳或ISO格式字符串
      const date = new Date(timestamp);
      return date.toLocaleString(); // 或者使用其他格式化方式
      // 或者使用 moment.js 等库进行更复杂的格式化
    },
    getImage : function(item){
      if(item.images){
        let temp = item.images.split(",")
        if(temp.length>0){
          return temp[0];
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
      return DateUtil.format13HH(time)
    },
    //操作
    operateBtn (Id,event) {
      const actionType = event.target.dataset.type;

      switch(actionType){
        case 'modify':
          this.$router.push({path:'/article/publish',query:{articleId:Id}})
          break;
        case 'down':
          this.handleUpDownAction(Id, 0, '下架');
          break;
        case 'up':
          this.handleUpDownAction(Id, 1, '上架');
          break;
        case 'del':
          this.$confirm('此操作将永久删除该文章, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            const result = this.deleteArticlesById && this.deleteArticlesById(Id);

            if (result && typeof result.then === 'function') {
              result.then(() => {
                this.$message.success('删除成功');
                this.changePage && this.changePage({ page: this.listPage.currentPage });
              }).catch(err => {
                console.error('删除操作失败:', err);
                this.$message.error(`删除失败: ${err && err.message ? err.message : '未知错误'}`);
              });
            } else {
              this.$message.success('删除成功');
              this.changePage && this.changePage({ page: this.listPage.currentPage });
            }
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
          break;
        default :
      }
    },

    // 处理上下架操作
    handleUpDownAction(Id, action, actionName) {
      this.$confirm(`确定要${actionName}该文章吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 确保 upOrDown 方法返回 Promise
        const result = this.upOrDown(Id, action);

        if (result && typeof result.then === 'function') {
          // 如果返回的是 Promise
          result.then(() => {
            this.$message.success(`${actionName}成功`);
            this.changePage && this.changePage({page: this.listPage.currentPage});
          }).catch(err => {
            console.error('上下架操作失败:', err);
            this.$message.error(`${actionName}失败: ${err.message || '未知错误'}`);
          });
        } else {
          // 如果没有返回 Promise，直接认为是成功的
          this.$message.success(`${actionName}成功`);
          this.changePage && this.changePage({page: this.listPage.currentPage});
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: `已取消${actionName}`
        });
      });
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.result {
  background-color: #ffffff;
  text-align: left;
  border: 1px solid #e7e7e9;
  margin-top: 10px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  header {
    border-bottom: 1px dashed #e7e7e9;
    margin: 0;
    padding: 0 20px;
    font-size: 14px;
    height: 55px;
    line-height: 55px;
    color: #323745;
    background: #fafafa;
  }

  .result-container {
    padding: 0 15px;
  }

  li {
    display: flex;
    align-items: center;
    padding: 20px 15px;
    margin: 0;
    border-bottom: 1px solid #f5f5f7;
    transition: all 0.3s ease;

    &:hover {
      background-color: #fafafa;
    }

    .draft {
      color: #FF9500;
      border-color: rgba(255, 149, 0, 0.2);
      background: rgba(255, 149, 0, 0.1);
    }
    .delete {
      color: #FF3B30;
      border-color: rgba(255, 59, 48, 0.2);
      background: rgba(255, 59, 48, 0.1);
    }
    .audit {
      color: #34C759;
      border-color: rgba(52, 199, 89, 0.2);
      background: rgba(52, 199, 89, 0.1);
    }
    .publish {
      color: #007AFF;
      border-color: rgba(0, 122, 255, 0.2);
      background: rgba(0, 122, 255, 0.1);
    }
    .unaudit {
      color: #FF9500;
      border: none;
      background: rgba(255, 149, 0, 0.1);
    }
  }

  .article-img {
    width: 120px;
    height: 80px;
    border-radius: 4px;
    object-fit: cover;
    margin-right: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .article-content {
    flex: 1;
    min-width: 0;

    dt {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      a {
        color: #333;
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        margin-right: 20px;
        text-decoration: none;

        &:hover {
          color: #007AFF;
        }
      }

      div {
        display: flex;
        gap: 12px;

        i {
          font-size: 13px;
          cursor: pointer;
          padding: 4px 10px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;

          &:before {
            margin-right: 4px;
          }

          &[data-type='up'] {
            color: #34C759;
            border: 1px solid rgba(52, 199, 89, 0.3);
            background: rgba(52, 199, 89, 0.1);

            &:hover {
              background: rgba(52, 199, 89, 0.2);
            }
          }

          &[data-type='down'] {
            color: #FF9500;
            border: 1px solid rgba(255, 149, 0, 0.3);
            background: rgba(255, 149, 0, 0.1);

            &:hover {
              background: rgba(255, 149, 0, 0.2);
            }
          }

          &[data-type='modify'] {
            color: #007AFF;
            border: 1px solid rgba(0, 122, 255, 0.3);
            background: rgba(0, 122, 255, 0.1);

            &:hover {
              background: rgba(0, 122, 255, 0.2);
            }
          }

          &[data-type='del'] {
            color: #FF3B30;
            border: 1px solid rgba(255, 59, 48, 0.3);
            background: rgba(255, 59, 48, 0.1);

            &:hover {
              background: rgba(255, 59, 48, 0.2);
            }
          }
        }
      }
    }

    dd {
      display: flex;
      align-items: center;
      font-size: 12px;
      margin: 6px 0;
      color: #999;

      .el-tag {
        margin-right: 8px;
        height: 24px;
        line-height: 22px;
        padding: 0 8px;
        font-size: 12px;
      }
    }

    .time {
      color: #888;
      font-size: 12px;
    }
  }

  .pagination {
    padding: 20px;
    display: flex;
    justify-content: center;

    .el-pagination {
      margin: 0;
    }
  }
}
</style>
