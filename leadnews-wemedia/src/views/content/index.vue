  <template>
    <div class="">
      <search-tool
        v-if="!searchText"
        :changePage="searchArticle"
        :channel_list="channel_list"
      />
      <search-result
        ref='mySearchResult'
        :articleList="articleList"
        :host="host"
        :total="total"
        :changePage="searchArticle"
        :pageSize="params.size"
        :deleteArticlesById="deleteArticlesById"
        :upOrDown="upOrDown"
      />
    </div>
  </template>

  <script>
    import SearchTool from './components/SearchTool.vue'
    import SearchResult from './components/SearchResult.vue'
    import { deleteArticles , searchArticle,upDownArticle} from  '@/api/content'
    import { getChannels } from  '@/api/publish'
    export default {
      name: 'ContentManage',
      data() {
        return {
          channel_list:[],
          articleList:[],
          total:0,
          host:'',
          searchText:null,
          params:{
            page:1,
            size:10
          }, //查询参数  用于全局存储 因为分页时 需要在查询条件基础上分页
          tempParams : {}
        }
      },
      created () {
        let { searchText } = this.$route.query //从路由中查找关键字参数
        this.searchText = searchText //存储当前值
        this.getChannels() //拉取频道列表数据
        // 如果搜索关键字有值 则直接调用搜索接口 否则 调用默认接口
        this.searchArticle();
      },
      components: {
        SearchTool,
        SearchResult
      },
      computed: {

      },
      methods: {
        //搜索文章
        async searchArticle (newParams) {
          this.tempParams = newParams
          let result = await searchArticle({...this.params,keyword:this.searchText,...this.tempParams})
          /****需要重新将分页器的页码设置为1******/
          if(this.$refs.mySearchResult){
            this.$refs.mySearchResult.resetPage(); //重置
          }
          this.host = result.host
          this.total = result.total //总记录数
          this.articleList = result.data //当前的数组
        },
        // 根据Id删除文章：仅返回 Promise，成功 resolve，失败抛出错误；提示与刷新由子组件统一处理
        async deleteArticlesById (Id) {
          const resp = await deleteArticles(Id)
          if (resp && resp.code == 200) {
            return resp;
          }
          throw new Error((resp && resp.error_message) || '删除失败');
        },
        // 上下架：仅返回 Promise，成功 resolve，失败抛出错误；提示与刷新由子组件统一处理
        async upOrDown (Id, enable) {
          const resp = await upDownArticle({ id: Id, enable });
          if (resp && resp.code == 200) {
            return resp; // 让子组件 then 中提示并刷新
          }
          throw new Error((resp && resp.error_message) || '操作失败');
        },
        //拉取频道数据
        async getChannels () {
          let result = await getChannels()
          this.channel_list = result.data  //赋值数据
        }
      }
    }
  </script>
