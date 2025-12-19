<template>
  <div class="tinymce-container">
    <header>发表文章</header>
    <el-form ref="form" label-width="120px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="FormData.title"
          placeholder="文章名称"
          style="width: 400px;"
          class="filter-item"
        />
      </el-form-item>
      <el-form-item label="标签" prop="labels">
        <el-input
          v-model="FormData.labels"
          placeholder="内容标签"
          style="width: 400px;"
          class="filter-item"
        />
      </el-form-item>
      <el-form-item label="频道：" prop="channel_id">
        <el-select v-model="FormData.channel_id" size="small" style="width: 400px;">
          <el-option
            v-for="item in channel_list"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="定时：" prop="publish_time">
        <el-date-picker
          v-model="FormData.publish_time"
          type="datetime"
          style="width: 400px;"
          placeholder="选择日期时间"
          default-time="12:00:00">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="内容">
        <Heima ref="heima" @addImg="selectHeiMaImg"/>
      </el-form-item>
      <el-form-item label="封面">
        <el-radio-group v-model="FormData.type">
          <el-radio label="1">单图</el-radio>
          <el-radio label="3">三图</el-radio>
          <el-radio label="0">无图</el-radio>
          <el-radio label="-1">自动</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="FormData.type == '1' || FormData.type == '3'">
        <div v-if="FormData.type == '1'" class="single_pic" @click="selectSinglePic">
          <div class="title">点击图标选择图片</div>
          <img :src="parseImage(singlePic)">
        </div>
        <div v-if="FormData.type == '3'" class="three_pic">
          <div
            class="three_pic_item"
            v-for="(item,index) in threePicList"
            :key="index"
            @click="selectThreePic(index)"
          >
            <div class="title">点击图标选择图片</div>
            <img :src="parseImage(item)">
          </div>
        </div>
      </el-form-item>
      <el-form-item class="btn">
        <el-button @click="publish(false)" class="filter-item" type="primary">提交审核</el-button>
        <el-button @click="publish(true)" class="filter-item">存入草稿</el-button>
      </el-form-item>
    </el-form>
    <el-dialog
      :visible.sync="showPicDialog"
      width="50%"
      :close-on-click-modal="false"
      :show-close="false"
      :center="true"
    >
      <el-tabs type="card" v-model="activeName">
        <el-tab-pane label="素材库" name="first">
          <el-radio-group @change="getImgData" v-model="activeName2" style="margin-bottom: 30px;">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="collect">收藏</el-radio-button>
          </el-radio-group>
          <div class="img_list_con">
            <div
              class="img_list"
              v-for="item in imgData"
              :key="item.id "
              @click="selectPic(item.id , item.url )"
            >
              <img :src="item.url ">
              <img v-if="(item.id ) == selectedImg.id" :src="selected_img_url" class="selected">
            </div>
          </div>
          <div class="pagination">
            <el-pagination
              background
              layout="total, prev, pager, next, jumper"
              :page-size="imgPage.pageSize"
              :total="imgPage.total"
              :page-count="imgPage.pageCount"
              :current-page.sync="imgPage.currentPage"
              @current-change="getImgData"
            ></el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="上传图片" name="second">
          <upload :imgChange="uploadSuccess"/>
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancleImg">取 消</el-button>
        <el-button type="primary" @click="btnOKImg">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import Heima from "@/components/editor/heima.vue";
  import Upload from "@/components/Upload/upload.vue";
  import { getArticleById } from "@/api/content";
  import {
    getAllImgData,
    getChannels,
    publishArticles,
    modifyArticles
  } from "@/api/publish";
  export default {
    name: "HeiMa",
    components: { Upload,Heima },
    data() {
      return {
        FormData: {
          id:"",
          title: "", //标题
          type: "3",
          labels:"",
          publish_time:"",
          channel_id: null,//频道ID
          // publishTime:"",
          // channelId: null//频道ID
        },
        host:'',//图片host
        singlePic: null, //单图模式
        threePicList: [null, null, null], //三图模式
        pubForm: {},
        channel_list: [],
        showPicDialog: false, //显示图片上传提示框
        activeName: "first",
        activeName2: "all",
        selected_img_url: require("@/assets/selected.png"),
        upload_img_url: require("@/assets/pic_bg.png"),
        imgPage: {
          /***用来存储页面的页码及行数信息*****/
          total: 0, //总页数
          currentPage: 1, //第几页
          pageSize: 8, //每页多少条
          pageCount: 1 //共多少页
        },
        imgData: [], //存储图片的数据
        selectedImg: {}, //已经选择的图片
        currentType: {
          key:0,//编辑序列
          type: "" //存储弹层的操作类型  single three insert  之所以用对象是因为要存放三张图的索引
        }
      };
    },
    beforeMount() {
      let { articleId } = this.$route.query;
      if (articleId) {
        //如果id存在 则拉取新数据
        this.getArticle(articleId);
      }
      this.getChannels(); //拉取文章频道
    },
    methods: {
      parseImage : function(item){
        if(item){
          if(item.indexOf('http')>-1){
            return item;
          }else{
            return this.host+item;
          }
        }else{
          return this.upload_img_url
        }
      },
      //获取文章频道
      async getChannels() {
        let result = await getChannels();
        this.channel_list = result.data;
      },
      //获取文章
      async getArticle(id) {
        let result = await getArticleById(id);
        this.FormData = {
          id:result.data.id,
          title: result.data.title,
          channel_id: result.data.channelId,
          labels:result.data.labels,
          type: ""+result.data.type,
          publish_time:result.data.publishTime
        }
        let conts = [];
        if(result.data.content){
          try{
            conts = eval("("+result.data.content+")")
          }catch (e) {
            console.error(e)
          }
        }
        this.$refs.heima.setContent(conts)
        this.host = result.host
        this.transImages(this.FormData.type, result.data.images); //还原数据
      },
      //选择一张图片
      selectPic(id, url) {
        this.selectedImg = {id,url };
      },
      //上传成功后
      uploadSuccess(url) {
        this.selectedImg = { url }; //将上传的图片认为是新组件
      },
      selectHeiMaImg(key){
        this.currentType.key = key;
        this.currentType.type="insert"
        this.uploadPic();
      },
      //点击图片上传图标
      uploadPic() {
        this.imgPage.currentPage=1
        this.showPicDialog = true; //显示弹层
        this.getImgData(); //拉取图片数据
      },
      //插入图片 或者替换封面图片
      btnOKImg() {
        if (this.selectedImg.url) {
          if(this.selectedImg.url.indexOf('http')>0){
            this.selectedImg.url=this.host+this.selectedImg.url;
          }
          if (this.currentType.type == "single") {
            this.singlePic = this.selectedImg.url;
          } else if (this.currentType.type == "three") {
            //三张图时  需要找到数组中存储的对象
            this.threePicList[this.currentType.index] = this.selectedImg.url; //找到那条记录更新
            this.$forceUpdate(); //由于直接改变的对象 所以这里强制更新下
          } else if (this.currentType.type == "insert") {
            this.$refs['heima'].saveImage(this.currentType.key,this.selectedImg.url)
          }
        }
        this.currentType = {}; //清空类型缓存
        this.selectedImg = {}; //首先清空选择的缓存
        this.showPicDialog = false; //关闭弹层
      },
      //取消插入
      cancleImg() {
        this.showPicDialog = false; //关闭弹层
      },
      //点击三图中的图片
      selectThreePic(index) {
        this.currentType.type = "three";
        this.currentType.index = index; //这里需要记录图片的索引 因为要按照顺序 不能乱
        this.uploadPic(); //打开弹层
      },
      //选择单张图片
      selectSinglePic() {
        this.currentType.type = "single";
        this.uploadPic(); //打开弹层
      },
      //拉取所有的图片数据
      async getImgData(page) {
        let temp = page==undefined?this.imgPage.currentPage:page
        try{
          temp = parseInt(temp)
        }catch (e) {
          temp=1
        }
        let isCollect = this.activeName2 == "collect"; //是否是收藏的列表
        let result = await getAllImgData({
          size: this.imgPage.pageSize,
          page: temp,
          is_collected: isCollect?1:0 //是否是收藏
        });
        this.imgData = result.data;
        this.imgPage.total = result.total;
        this.imgPage.pageCount = Math.ceil(
          this.imgPage.total / this.imgPage.pageSize
        );
      },
      //转换图片
      transImages(type, images) {
        images=images.split(",")
        if (type == "1") {
          this.singlePic = images[0];
        } else if (type == "3") {
          this.threePicList = [...images];
        }
      },
      //获取图片列表
      getImages() {
        if (
          this.FormData.type == "1" ||
          this.FormData.type == "3"
        ) {
          if (this.FormData.type == "1") {
            return this.singlePic ? [this.singlePic] : [];
          } else {
            return this.threePicList.map(item => item);
          }
        }
        return [];
      },
      //发布文章
      async publish(draft) {
        let { articleId } = this.$route.query;
        let params = {draft}; //路径参数
        let images = this.getImages();
        let data = {
          ...this.FormData,
          images: images,
          status:draft?0:1,
          content:this.$refs.heima.getContent()
        }; //请求参数
        if (!draft) {
          //非草稿需要校验
          if (!data.title || data.title.length < 5||data.title.length>32) {
            this.$message({
              type: "warning",
              message: "文章标题不能小于5个字符或大于32个字符"
            });
            return;
          }
          if (!data.labels||data.title.length>20) {
            this.$message({ type: "warning", message: "内容标签不能为或超过20字符" });
            return;
          }
          if (!data.content) {
            this.$message({ type: "warning", message: "文章内容不能为空" });
            return;
          }
          if (!data.channel_id) {
            this.$message({ type: "warning", message: "文章频道不能为空" });
            return;
          }
          if (!data.publish_time) {
            this.$message({ type: "warning", message: "定时发布时间不能为空" });
            return;
          }
          if (
            (data.type == "1" && data.images.length != 1) ||
            (data.type == "3" && data.images.length != 3)
          ) {
            this.$message({ type: "warning", message: "文章封面未设置" });
            return;
          }
        }
        // 在发送前将字段统一为 publishedTime 和 channelId
        if (data.publish_time !== undefined) {
          data.publishTime = data.publish_time;
          delete data.publish_time;
        }
        if (data.channel_id !== undefined) {
          data.channelId = data.channel_id;
          delete data.channel_id;
        }
        //编辑或者发布文章
        let res = !articleId
          ? await publishArticles(params, data)
          : await modifyArticles(articleId, params, data);
        if(res.code === 200){
          this.$message({
            type: "success",
            message: articleId ? "编辑文章成功" : "新增文章成功"
          });
          this.$router.replace({ path: "/article/list" });
        } else if(res.code === 3501){
          this.$message({
            type: "error",
            message: "素材引用失效，请选用其他素材"
          });
        } else {
          this.$message({
            type: "error",
            message: res.message || "操作失败"
          });
        }
      }
    }
  };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .tinymce-container {
    background-color: #ffffff;
    text-align: left;
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    margin-bottom: 30px;
    
  header {
    color: #303133;
    font-size: 16px;
    font-weight: 600;
    height: 60px;
    line-height: 60px;
    padding: 0 24px;
    background-color: #fff;
    border-bottom: 1px solid #f0f2f5;
    border-radius: 8px 8px 0 0;
  }
  .el-form {
    padding: 30px;
  .el-form-item {
    margin: 24px 0;
  }
  .btn {
    border-top: 1px solid #f0f2f5;
    margin: 0 -30px;
    padding: 24px 30px 0;
    text-align: center;
  }
  }
  }
  .editor-content {
    margin-top: 20px;
  }
  .img_list {
    width: 140px;
    height: 140px;
    float: left;
    margin: 0px auto;
    border: 1px solid #eee;
    overflow: hidden;
    border-radius: 6px;
    margin: 0px 20px 20px 0;
    position: relative;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
      transform: translateY(-2px);
    }
  }
  .img_list_con {
    overflow: hidden;
    margin-left: 20px;
    height: 400px;
    padding-top: 10px;
  }
  .selected {
    width: 40px !important;
    height: 40px !important;
    position: absolute;
    bottom: 0;
    right: 0;
    left: auto;
    margin: 0;
    transform: none;
    background: rgba(255,255,255,0.8);
    border-radius: 20px 0 0 0;
  }
  .img_list img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    cursor: pointer;
  }
  .pagination {
    text-align: center;
    margin-top: 20px;
  }
  .upload_pic_show {
    display: block;
    width: 240px;
    height: 180px;
    margin: 15px auto 10px;
    border-radius: 6px;
  }
  .single_pic {
    border: 1px dashed #d9d9d9;
    width: 280px;
    height: 280px;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color .3s;
    background: #fafafa;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    &:hover {
      border-color: #409EFF;
    }
    
  .title {
    text-align: center;
    color: #909399;
    margin-bottom: 10px;
  }
  img {
    width: 220px;
    height: 220px;
    margin: 0 auto;
    display: block;
    object-fit: contain;
  }
  }
  .three_pic {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 20px;
    
  .three_pic_item {
    flex: 1;
    max-width: 280px;
    height: 280px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    background: #fafafa;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: border-color .3s;

    &:hover {
      border-color: #409EFF;
    }

  .title {
    text-align: center;
    color: #909399;
    margin-bottom: 10px;
  }
  img {
    width: 220px;
    height: 220px;
    margin: 0 auto;
    display: block;
    object-fit: contain;
  }
  }
  }
</style>
