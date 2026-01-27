<template>
  <div class="detail-container">
    <header>详情分析</header>
    <div class="filter">
      <el-radio-group  @change="loadDataByButton" v-model="parms.type">
        <el-radio-button  label="0">今日</el-radio-button>
        <el-radio-button  label="1">本周</el-radio-button>
        <el-radio-button  label="7">近7天</el-radio-button>
        <el-radio-button  label="30">近30天</el-radio-button>
      </el-radio-group>
      <el-date-picker v-model="parms.time" type="datetimerange"
                      range-separator="-"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"  @change="loadDataByTimeRange" :picker-options="pickerOptions" format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期"/>
    </div>
    <Statist :article="all.article" :likes="all.likes" :collection="all.collection"/>
    <line-chart ref="lineChart"/>
    <div class="chart">
      <doughnut-chart :data="pie" height="520px"/>
    </div>
  </div>
</template>

<script>
import Statist from './components/Statist.vue'
import LineChart from './components/LineChart.vue'
import DoughnutChart from './components/DoughnutChart.vue'
import {getNewsStatistics} from '@/api/content'
import DateUtil from '@/utils/date'
export default {
  name: 'ContentManage',
  data() {
    return {
      parms:{
        type:'0',
        stime:'',
        etime:''
      },
      all:{},
      list:'',
      graph:'',
      pie:{},
      lineInfo : [
        {name:'发文量',type:'article'},
        {name:'阅读量',type:'read_count'},
        {name:'点赞量',type:'likes'},
        {name:'评论量',type:'comment'},
        {name:'收藏量',type:'collection'},
        {name:'转发量',type:'follow'},
        {name:'不喜欢',type:'unlikes'}
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  components: {
    Statist,
    LineChart,
    DoughnutChart
  },
  created(){
    this.setTimeByType(this.parms.type)
    this.getNewsStatistics()
  },
  methods : {
    setTimeByType:function(type){
      if(type === -1 || type === '-1'){
        return
      }
      if(type == '1'){// 本周
        this.parms.stime=DateUtil.getWeekSTime()
        this.parms.etime=DateUtil.getWeekETime()
      }else{
        this.parms.etime=DateUtil.getNearTime(0)
        this.parms.stime=DateUtil.getNearTime(Number(type))
      }
    },
    loadDataByTimeRange:function(e){
      this.parms.type=-1
      this.parms.stime=e[0].getTime()
      this.parms.etime=e[1].getTime()
      this.getNewsStatistics();
    },
    loadDataByButton:function(e){
      this.setTimeByType(e)
      this.getNewsStatistics();
    },
    async getNewsStatistics (){
      if((this.parms.type !== -1 && this.parms.type !== '-1') && (!this.parms.stime || !this.parms.etime)){
        this.setTimeByType(this.parms.type)
      }
      let result = await getNewsStatistics(this.parms)
      const list = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : [])
      this.list = list
      let all = {article:0,likes:0,collection:0,comment:0,read_count:0,follow:0,unlikes:0}
      let chats = {}
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        let tmp = {
          created_time: Number(item.created_time),
          article: Number(item.article) || 0,
          read_count: Number(item.read_count) || 0,
          likes: Number(item.likes) || 0,
          comment: Number(item.comment) || 0,
          collection: Number(item.collection) || 0,
          follow: Number(item.follow) || 0,
          unlikes: Number(item.unlikes) || 0
        }
        let time = DateUtil.format13(tmp.created_time)
        let data = chats[time]?chats[time]:{}
        for (let j = 0; j <this.lineInfo.length ; j++) {
          let k=this.lineInfo[j].type
          all[k]+=tmp[k]
          let val = data[k]?data[k]:0
          val +=tmp[k]
          data[k]=val
        }
        chats[time]=data
      }
      this.all = all
      this.graph = chats
      this.parseToLine(chats,all)
    },
    parseToLine : function(chats,all){
      // 排序
      var name = [];
      for (let k in chats) {
        name.push(k)
      }
      name.sort()
      let series = {}//折线图数据
      for (let i = 0; i <name.length ; i++) {
        for (let j = 0; j <this.lineInfo.length ; j++) {
          let k=this.lineInfo[j].type
          series[k] = series[k]?series[k]:[]
          series[k].push(Math.round(chats[name[i]][k] || 0))
        }
      }
      let data = []
      let legend=[]
      for (let i = 0; i <this.lineInfo.length ; i++) {
        data.push({
          name:this.lineInfo[i].name,
          type:'bar',
          //stack: '总量',
          areaStyle: {},
          data:series[this.lineInfo[i].type]
        })
        legend.push(this.lineInfo[i].name)
      }
      let lineOption = {
        title: {text: '明细数据'},
        tooltip: {trigger: 'axis',formatter: function(params){return params.map(function(p){return p.seriesName + ': ' + Math.round(p.value || 0)}).join('<br/>')}},
        legend: {data:legend},
        xAxis: {type: 'category',boundaryGap: true,data: name,axisLabel: {show: false},axisTick: {show: false},axisLine: {show: false}},
        yAxis: {type: 'value',axisLabel:{formatter:function(val){return Math.round(val)}},minInterval:1},
        series: data
      }
      this.pie = {
        title: '指标占比',
        legend: ['阅读量','点赞量','评论量','收藏量','转发量','不喜欢'],
        data: [
          {name:'阅读量',value:Math.round(all.read_count || 0)},
          {name:'点赞量',value:Math.round(all.likes || 0)},
          {name:'评论量',value:Math.round(all.comment || 0)},
          {name:'收藏量',value:Math.round(all.collection || 0)},
          {name:'转发量',value:Math.round(all.follow || 0)},
          {name:'不喜欢',value:Math.round(all.unlikes || 0)}
        ]
      }
      this.$refs['lineChart'].setOptions(lineOption)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.detail-container {
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
  .filter {
    font-size: 14px;
    padding: 20px 0 20px 20px;
    span {
      border: 1px solid #3296fa;
      color: #3296fa;
      padding: 5px 10px;
      cursor: pointer;
      &:nth-child(1){
        border-right: none;
      }
      &:nth-child(2){
        border-right: none;
      }
      &.active {
        background-color: #3296fa;
        color: #ffffff;
      }
    }
    .el-date-editor {
      margin-left: 20px;
    }
  }
  .chart {
    padding: 0 20px;
    overflow: hidden;
    margin-bottom: 30px;
  }
}
</style>
