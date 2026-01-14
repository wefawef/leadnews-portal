<template>
  <div>
    <Editor ref="editor" :fileds="fileds" title="用户" :table="this.params.name" :submitSuccess="submitSuccess"/>
    <search-tool :changeParam="changeParam" :addData="addData" />
    <search-result
      ref='mySearchResult'
      :list="list"
      :host="host"
      :total="total"
      :table="this.params.name"
      :viewData="viewData"
      :changePage="changePage"
      :changeStatus="changeStatus"
      :fileds="fileds"
      :pageSize="params.size"/>
  </div>
</template>

<script>
  import SearchTool from './components/SearchTool.vue'
  import SearchResult from './components/SearchResult.vue'
  import Editor from '@/components/CommEditor.vue'
  import {authLoadList} from '@/api/user'
  import {API_USER_LIST} from '@/constants/api'
  import DateUtil from '@/utils/date'
  export default {
    name: "ChannelManager",
    data() {
      return {
        params:{
          name:API_USER_LIST,
          page:1,
          size:10,
          where:[]
        },
        total:0,
        host:'',
        list:[],
        fileds:[
          {list:true,label:'用户名',name:'name',type:'input',placeholder:'请输入用户名',rule:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
              { min: 5, max:20,message: '用户名在5~20个字符', trigger: 'blur' }
            ]},
          {list:false,label:'密码',name:'password',type:'input',placeholder:'请输入密码'},
          {list:true,label:'手机号',name:'phone',type:'input',placeholder:'请输入手机号'},
          {list:true,label:'性别',name:'sex',type:'radio',value:1,radios:[{value:0,label:'男'},{value:1,label:'女'},{value:2,label:'未知'}]},
          {list:true,label:'身份认证',name:'identityAuthentication',type:'radio',value:0,radios:[{value:0,label:'否'},{value:1,label:'是'}]},
          {list:true,label:'账号状态',name:'status',type:'radio',value:0,radios:[{value:0,label:'正常'},{value:1,label:'锁定'}]},
          {list:true,label:'用户标识',name:'flag',type:'radio',value:0,radios:[{value:0,label:'普通用户'},{value:1,label:'自媒体人'},{value:2,label:'大V'}]},
          {list:true,label:'注册时间',name:'createdTime',type:'hidden',value:DateUtil.format13HH(new Date().getTime())}
        ]
      }
    },
    mounted() {
      this.loadData()
    },
    components: {SearchTool,SearchResult,Editor},
    methods: {
      // 编辑数据
      viewData : function(item){
        this.$refs['editor'].view(item)
      },
      // 新增数据
      addData : function(item){
        this.$refs['editor'].add()
      },
      // 新增或者修改后的操作方法
      submitSuccess:function(){
        this.loadData()
      },
      changeStatus:function(index,status){
        this.$set(this.list[index],'status',status)
      },
      changeParam :function(e){
        this.params.page=1
        this.params.keyWord=e
        this.loadData()
      },
      changePage :function(e){
        this.params.page=e.page
        this.loadData()
      },
      async loadData() {
        let res = await authLoadList(this.params.keyWord);
        if (res.code == 200) {
          this.list = res.data
          this.host = res.host
          // 如果 data 是数组，total 使用数组长度；如果 data 有 total 字段，使用该字段
          this.total = res.data.total ? res.data.total : (Array.isArray(res.data) ? res.data.length : 0)
        } else {
          this.$message({type: 'error', message: res.errorMessage || '请求失败'})
        }
      }
    }
  }
</script>

<style scoped>

</style>
