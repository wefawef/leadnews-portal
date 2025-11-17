<template>
  <div>
    <Editor ref="editor" :fileds="fileds" title="敏感词" :table="this.params.name" submitApiType="sensitive" :submitSuccess="submitSuccess"/>
    <search-tool :changeParam="changeParam" :addData="addData" />
    <search-result
      ref='mySearchResult'
      :list="list"
      :host="host"
      :total="total"
      :table="this.params.name"
      :editData="editData"
      :changePage="changePage"
      :deleteData="deleteData"
      :pageSize="params.size"/>
  </div>
</template>

<script>
  import SearchTool from './components/SearchTool.vue'
  import SearchResult from './components/SearchResult.vue'
  import Editor from '@/components/CommEditor.vue'
  import { listSensitive } from '@/api/sensitive'
  import DateUtil from '@/utils/date'
  export default {
    name: "ChannelManager",
    data() {
      return {
        params:{
          name:'all',
          page:1,
          size:10
        },
        total:0,
        host:'',
        list:[],
        fileds:[
          {label:'敏感词',name:'sensitives',type:'input',placeholder:'请输入敏感词',rule:[
            { required: true, message: '请输入敏感词', trigger: 'blur' },
              { min: 2, max:8,message: '敏感词在2~8个字符', trigger: 'blur' }
            ]}
        ]
      }
    },
    mounted() {
      this.loadData()
    },
    components: {SearchTool,SearchResult,Editor},
    methods: {
      // 编辑数据
      editData : function(item){
        this.$refs['editor'].edit(item)
      },
      // 新增数据
      addData : function(item){
        this.$refs['editor'].add()
      },
      // 新增或者修改后的操作方法
      submitSuccess:function(){
        this.loadData()
      },
      deleteData:function(id){
        this.loadData()
      },
      changeParam :function(e){
        this.params.page=1
        this.params.name = e && e.length ? e : 'all'
        this.loadData()
      },
      changePage :function(e){
        this.params.page=e.page
        this.loadData()
      },
      async loadData() {
        let res = await listSensitive({ ...this.params });
        const code = Number(res && res.code)
        if (code === 200) {
          this.list = res.data || []
          this.host = res.host
          this.total = res.total || 0 //总记录数
        } else if (code === 404) {
          // 未找到，清空数据但不弹错误
          this.list = []
          this.total = 0
        } else {
          this.$message({type: 'error', message: res.error_message})
        }
      }
    }
  }
</script>

<style scoped>

</style>
