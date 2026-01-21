<template>
  <div>
    <Editor ref="editor" :fileds="fileds" title="内容" :table="this.params.name" :submitSuccess="submitSuccess"/>
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
    <el-dialog title="查看 - 内容" :visible.sync="viewDialogVisible" width="60%">
      <div class="detail-item">
        <div class="detail-label">标题</div>
        <div class="detail-value">{{viewItem.title}}</div>
      </div>
      <div class="detail-item" v-if="coverImages && coverImages.length">
        <div class="detail-label">封面</div>
        <div class="detail-value">
          <img v-for="(img, idx) in coverImages" :key="idx" :src="img" class="detail-image" style="margin-right: 10px; margin-bottom: 10px; display: inline-block;" />
        </div>
      </div>
      <div class="detail-item">
        <div class="detail-label">内容</div>
        <div class="detail-content">
          <template v-for="(segment, index) in viewSegments">
            <div v-if="segment.type === 'image'" :key="'img-' + index" class="detail-image-wrap">
              <img :src="segment.value" class="detail-image" />
            </div>
            <span v-else :key="'text-' + index" class="detail-text">{{segment.value}}</span>
          </template>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import SearchTool from './components/SearchTool.vue'
  import SearchResult from './components/SearchResult.vue'
  import Editor from '@/components/CommEditor.vue'
  import {searchArticleVo, getArticleVoById} from '@/api/content'
  import DateUtil from '@/utils/date'
  export default {
    name: "ChannelManager",
    data() {
      return {
        params:{
          page:1,
          size:10,
          title:''
        },
        total:0,
        host:'',
        list:[],
        viewDialogVisible:false,
        viewItem:{},
        viewSegments:[],
        coverImages:[],
        fileds:[
          {list:true,label:'标题',name:'title',type:'input',placeholder:'请输入标题',rule:[
            { required: true, message: '请输入标题', trigger: 'blur' },
              { min: 10, max:20,message: '标题在10~50个字符', trigger: 'blur' }
            ]},
          {list:true,label:'作者',name:'authName',type:'input'},
          {list:true,label:'频道',name:'channel',type:'input'},
          {list:true,label:'点赞数',name:'goodCount',type:'input'},
          {list:true,label:'收藏数',name:'collectCount',type:'input'},
          {list:true,label:'评论数',name:'commentCount',type:'input'},
          {list:true,label:'阅读数',name:'readCount',type:'input'},
          {list:true,label:'创建时间',name:'creatTime',type:'hidden',value:DateUtil.format13HH(new Date().getTime())},
          {list:true,label:'发布时间',name:'pushTime',type:'hidden',value:DateUtil.format13HH(new Date().getTime())}
        ]
      }
    },
    mounted() {
      this.loadData()
    },
    components: {SearchTool,SearchResult,Editor},
    methods: {
      viewData : async function(item){
        if (!item) {
          return
        }
        let detail = item
        if (item.id) {
          let res = await getArticleVoById(item.id)
          if (res && res.code == 200) {
            detail = res.data && res.data.data ? res.data.data : res.data
          } else {
            this.$message({type: 'error', message: res.errorMessage || '请求失败'})
            return
          }
        }
        this.viewItem = detail || {}
        this.coverImages = this.getCoverImages(this.viewItem.images)
        this.viewSegments = this.buildContentSegments(this.viewItem.content)
        this.viewDialogVisible = true
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
        this.params.title=e || ''
        this.loadData()
      },
      changePage :function(e){
        this.params.page=e.page
        this.loadData()
      },
      async loadData() {
        let params = {
          page: this.params.page,
          size: this.params.size
        }
        if (this.params.title) {
          params.title = this.params.title
        }
        let res = await searchArticleVo(params);
        if (res.code == 200) {
          this.list = res.data || []
          if (res.host) {
            this.host = res.host
          }
          this.total = res.total ? res.total : this.list.length
        } else {
          this.$message({type: 'error', message: res.errorMessage || '请求失败'})
        }
      },
      getCoverImages(images) {
        let imageList = []
        if (Array.isArray(images)) {
          imageList = images
        } else if (typeof images === 'string') {
          imageList = images.split(',').map(item => item.trim()).filter(item => item)
        }
        return imageList.map(img => this.normalizeUrl(img))
      },
      normalizeUrl(url) {
        if (!url) return ''
        if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
          return url
        }
        if (this.host) {
          return this.host + url
        }
        return url
      },
      buildContentSegments(content) {
        let text = ''
        if (content === undefined || content === null) {
          text = ''
        } else if (typeof content === 'string') {
          let raw = content.trim()
          if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('{') && raw.endsWith('}'))) {
            try {
              let parsed = JSON.parse(raw)
              if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(p => p && (p.type === 'image' || p.type === 'text') && p.value !== undefined)) {
                return parsed.map(p => ({
                  type: p.type,
                  value: p.type === 'image' ? this.normalizeUrl(p.value) : p.value
                }))
              }
              text = this.extractTextFromContent(parsed)
            } catch (e) {
              text = raw
            }
          } else {
            text = raw
          }
        } else {
          if (Array.isArray(content) && content.length > 0 && content.every(p => p && (p.type === 'image' || p.type === 'text') && p.value !== undefined)) {
            return content.map(p => ({
              type: p.type,
              value: p.type === 'image' ? this.normalizeUrl(p.value) : p.value
            }))
          }
          text = this.extractTextFromContent(content)
        }
        let urlReg = /(https?:\/\/[^\s"'<>]+)/g
        let result = []
        let lastIndex = 0
        let match
        while ((match = urlReg.exec(text)) !== null) {
          let start = match.index
          if (start > lastIndex) {
            result.push({type: 'text', value: text.slice(lastIndex, start)})
          }
          result.push({type: 'image', value: this.normalizeUrl(match[0])})
          lastIndex = start + match[0].length
        }
        if (lastIndex < text.length) {
          result.push({type: 'text', value: text.slice(lastIndex)})
        }
        return result.length ? result : [{type: 'text', value: text}]
      },
      extractTextFromContent(content) {
        if (content === undefined || content === null) return ''
        if (typeof content === 'string') return content
        if (Array.isArray(content)) {
          return content.map(item => this.extractTextFromContent(item)).filter(item => item).join('')
        }
        if (typeof content === 'object') {
          if (content.type === 'text' && content.value !== undefined) {
            return String(content.value)
          }
          if (content.value !== undefined) {
            return String(content.value)
          }
          return ''
        }
        return String(content)
      }
    }
  }
</script>

<style scoped>
.detail-item {
  margin-bottom: 16px;
  text-align: left;
}
.detail-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}
.detail-value {
  color: #606266;
  word-break: break-all;
}
.detail-content {
  color: #606266;
  white-space: pre-wrap;
  word-break: break-all;
}
.detail-image-wrap {
  margin: 8px 0;
}
.detail-image {
  max-width: 260px;
  max-height: 200px;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
}
.detail-text {
  white-space: pre-wrap;
}
</style>
