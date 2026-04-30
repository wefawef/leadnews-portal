<template>
  <section class="filter">
    <div class="filter-container">
      <el-form ref="form">
        <el-form-item label="审核状态：" label-width="110px">
          <a
            v-for='item in stateList'
            :key="item.value"
            href="javascript:;"
            :class="['state_label',(item.value === selectState.value) ? 'active' : '']"
            @click="changeState(item)">{{item.label}}</a>
        </el-form-item>
      </el-form>
    </div>
  </section>
</template>

<script>
  export default {
    props: {
      changeParam: {
        type: Function,
        required: true
      },
      status: {
        type: [Number, String],
        default: 1
      }
    },
    data() {
      const stateList = [
        {label:'待审核',value:1},
        {label:'审核通过',value:9},
        {label:'审核失败',value:2},
      ]
      const defaultState = stateList.find((item) => Number(item.value) === Number(this.status)) || stateList[0]
      return {
        stateList,
        date:null,
        selectState: defaultState,
        userName: ''
      }
    },
    watch: {
      status(value) {
        const state = this.getStateByValue(value)
        if (state) {
          this.selectState = state
        }
      }
    },

    methods:{
      getStateByValue(value) {
        return this.stateList.find((item) => Number(item.value) === Number(value))
      },
      queryData() {
        let params = {
          status: this.selectState.value,
          page: 1
        }
        this.changeParam(params)
      },
      //切换状态
      changeState (state) {
        this.selectState = state //设置状态
        this.queryData() //查询数据
      }
    }
  }
</script>


<style lang="scss" scoped>
  .filter {
    background-color: #ffffff;
    text-align: left;
    border: 1px solid #e7e7e9;
    header {
      border-bottom: 1px dashed #cccccc;
      margin: 0 5px;
      padding: 0 10px;
      font-size: 14px;
      height: 55px;
      line-height: 55px;
      color: #323745;
    }
    .filter-container {
      overflow: hidden;
      .el-form {
        padding: 20px 20px 0;
        overflow: hidden;
        .el-form-item {
          margin: 20px 0
        }
      }
      .date-filter {
        padding: 25px 20px 20px;
        overflow: hidden;
        span {
          font-size: 14px;
          margin-right: 20px;
          height: 40px;
          line-height: 40px;
          float: left;
          cursor: pointer;
          &.active, &:hover {
            color: #3296fa;
          }
        }
        .time-container {
          float: left;
          position: relative;
        }
      }
    }
  }
  .state_label {
    float:left;
    padding-right:25px;
    font-size:14px;
    color:#333;
  }
  .active{
    color:#3296fa
  }
</style>
