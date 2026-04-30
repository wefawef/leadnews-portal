<template>
  <div>
    <Editor ref="editor" :fileds="fileds" title="频道" :table="'AD_CHANNEL'" submitApiType="channel" :submitSuccess="submitSuccess"/>
    <search-tool :changeParam="changeParam" :addData="addData" />
    <div v-loading="listLoading">
      <search-result
        ref='mySearchResult'
        :list="list"
        :host="host"
        :total="total"
        :table="this.params.name"
        :editData="editData"
        :deleteData="deleteData"
        :changePage="changePage"
        :changeStatus="changeStatus"
        :pageSize="params.size"/>
    </div>
  </div>
</template>

<script>
  import SearchTool from './components/SearchTool.vue'
  import SearchResult from './components/SearchResult.vue'
  import Editor from '@/components/CommEditor.vue'
  import { getAllChannels, listChannels } from '@/api/channel'
  import DateUtil from '@/utils/date'
  export default {
    name: "ChannelManager",
    data() {
      return {
        params:{
          page:1,
          size:10,
          where:[]
        },
        searchName:'',
        listLoading:false,
        total:0,
        host:'',
        list:[],
        fileds:[
          {label:'频道名称',name:'name',type:'input',placeholder:'请输入频道名称',rule:[
            { required: true, message: '请输入频道名称', trigger: 'blur' },
              { min: 2, max:4,message: '频道名称在2~4个字符', trigger: 'blur' }
            ]},
          {label:'频道描述',name:'description',type:'input',placeholder:'请输入描述信息'},
          {label:'默认频道',name:'is_default',type:'radio',value:0,radios:[{value:0,label:'否'},{value:1,label:'是'}]},
          {label:'是否有效',name:'status',type:'radio',value:1,radios:[{value:0,label:'否'},{value:1,label:'是'}]},
          {label:'排序',name:'ord',type:'number',value:0},
          {label:'创建时间',name:'created_time',type:'hidden',value:DateUtil.format13HH(new Date().getTime())}
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
      changeStatus:function(index,status){
        this.$set(this.list[index],'status',status)
      },
      changeParam :function(e){
        this.params.page=1
        if(e && e.filed==='name'){
          this.searchName = e.value || ''
        }else{
          this.searchName = ''
        }
        this.loadData()
      },
      changePage :function(e){
        this.params.page=e.page
        this.loadData()
      },
      async loadData() {
        this.listLoading = true
        let res
        if(this.searchName && this.searchName.length){
          res = await this.withTimeout(listChannels({ page: this.params.page, size: this.params.size, name: this.searchName }), null)
        }else{
          res = await this.withTimeout(getAllChannels(), null)
        }
        const code = Number(res && res.code)
        if(code===200){
          let data = res.data || []
          if(Array.isArray(data)){
            this.list = data.map(this.normalizeChannel)
            this.total = data.length
          }else if(Array.isArray(data.list)){
            this.list = data.list.map(this.normalizeChannel)
            this.total = Number(data.total || data.list.length)
          }else{
            this.list = []
            this.total = 0
          }
        }else if(code===404){
          this.list = []
          this.total = 0
        }else if(code===201){
          let data = res.data || []
          if(Array.isArray(data)){
            this.list = data.map(this.normalizeChannel)
            this.total = data.length
          }else{
            this.list = []
            this.total = 0
          }
        }else{
          this.$message({type: 'error', message: (res && res.error_message) || '请求失败'})
        }
        this.listLoading = false
      },
      withTimeout(promise, fallback, wait) {
        const timeout = wait || 4000
        return new Promise((resolve) => {
          let settled = false
          const timer = setTimeout(() => {
            if (settled) return
            settled = true
            resolve(fallback)
          }, timeout)

          Promise.resolve(promise).then((result) => {
            if (settled) return
            settled = true
            clearTimeout(timer)
            resolve(result)
          }, () => {
            if (settled) return
            settled = true
            clearTimeout(timer)
            resolve(fallback)
          })
        })
      },
      normalizeChannel(item){
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          is_default: item.isDefault ? 1 : 0,
          status: item.status ? 1 : 0,
          ord: item.ord,
          created_time: item.createdTime ? new Date(item.createdTime).getTime() : new Date().getTime()
        }
      }
    }
  }
</script>

<style scoped>

</style>
