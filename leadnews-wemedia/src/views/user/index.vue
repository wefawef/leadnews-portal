<template>
  <div class="user-container">
    <header>
      账号信息
      <el-button type="primary" size="small" style="float:right; margin-top: 10px;" @click="openEditDialog">修改个人信息</el-button>
    </header>
    <div class="wrap">
      <div class="form-item username">
        <label>
          <div>
          <img :src="headImg" class="user-avatar" /><br />
          <a @click="showHead" style="color:#3296fa"  href="javascript:;">更换头像</a>
          </div>
        </label>
        <div class="rightContent">
          <dl>
            <dt>{{user.name}}</dt>
          </dl>
        </div>
      </div>
      <div class="form-item userinfo">
        <label>账号信息</label>
        <div class="rightContent">
          <div class="clause">
            <span>头条号类型</span>{{typeName}}
          </div>
          <div class="clause">
            <span>运营评分</span>{{user.score}}
          </div>
          <div class="clause">
            <span>归属地</span>{{user.location}}
          </div>
          <div class="clause">
            <span>状态</span>{{statusName}}
          </div>
          <div class="clause">
            <span>创建时间</span>{{dateFormat(user.createdTime)}}
          </div>
        </div>
      </div>
      <div class="form-item userinfo">
        <label>登录方式</label>
        <div class="rightContent">
          <div  class="clause">
            <span>绑定手机</span>{{user.phone}}
          </div>
        </div>
      </div>
      <div class='form-item userinfo'>
          <label>邮箱</label>
          <div class="rightContent">
          <div class="clause">
             <span>{{user.email}}</span>
          </div>
        </div>
      </div>
    </div>
    <el-dialog   
      :visible.sync="showHeadUpload"
       title="上传头像"
      >
      <el-upload  :on-change="fileChange" ref="myUpload" class="avatar-uploader" :auto-upload="false" :limit="1">
         <img  class='localimg' v-if="showLocalImg" :src="localImg" alt="">
         <i v-else class="el-icon-plus avatar-uploader-icon"></i>
       </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showHeadUpload = false">取 消</el-button>
        <el-button type="primary" @click="uploadHead">确 定</el-button>
     </span>
    </el-dialog>
    <el-dialog title="修改个人信息" :visible.sync="showEditDialog">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input class="phone-readonly" :value="maskedPhone" disabled></el-input>
        </el-form-item>
        <el-form-item label="归属地">
          <el-input v-model="editForm.location"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveUserInfo">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserInform , updateUserHead, updateUserInform } from '@/api/user' 
import { setUser, getUser } from '@/utils/store'
import DateUtil from '@/utils/date'

export default {
  name: 'ContentManage',
  data() {
    return {
       user:{},
       showHeadUpload:false,
       showLocalImg:false, //显示本地图片
       localImg:null,
       showEditDialog: false,
       editForm: {
        email: '',
        phone: '',
        location: ''
       }
    }
  },
  created () {
     this.getUser() //获取用户个人资料
  },
  computed: {
     headImg () {
        if(this.user.image) return this.user.image
        return  this.user.photo ? this.user.photo : require('@/assets/avatar.jpg')
     },
     typeName() {
        // 0 个人 1 企业 2 子账号
        const map = {0:'个人', 1:'企业', 2:'子账号'}
        return map[this.user.type] || '个人'
     },
     statusName() {
         // 0 暂时不可用 1 永久不可用 9 正常可用
         const map = {0:'暂时不可用', 1:'永久不可用', 9:'正常可用'}
         return map[this.user.status] || ''
     },
     maskedPhone() {
        return this.maskPhone(this.editForm.phone)
     }
  },
  methods: {
    maskPhone(value) {
      const phone = value ? String(value) : ''
      if (phone.length < 7) {
        return phone
      }
      return `${phone.slice(0, 3)}****${phone.slice(-4)}`
    },
    dateFormat(time) {
        return DateUtil.format13HH(time)
    },
    fileChange () {
         let file = document.querySelector('.el-upload .el-upload__input').files[0] ;
         this.localImg = URL.createObjectURL(file)
         this.showLocalImg = true //显示图片
    },
    /***
     * 显示上传头像的图层
     * ***/
    showHead () {
      this.showLocalImg = false
      this.localImg = null
      this.$refs.myUpload && this.$refs.myUpload.clearFiles()  //清除垃圾数据
      this.showHeadUpload = true //显示弹层
    },
    async getUser () {
      let currentUser = getUser()
      if(currentUser && currentUser.id) {
          let res = await getUserInform(currentUser.id)  //获取用户数据
          if(res.code === 0 || res.code === 200 || res.code === undefined) { // accommodate various success codes
             let newData = res.data || res; // if no data wrapper, use res
             let mergedUser = {...currentUser, ...newData}
             setUser(mergedUser) //更新数据到缓存中
             this.user = mergedUser;  //设置用户数据
          }
      }
    },

    //修改头像
   async uploadHead () {
        let files = document.querySelector('.el-upload .el-upload__input').files ;
        if(files && files.length) {
          let fd = new FormData();
          fd.append('image', files[0], files[0].name);
          fd.append('id', this.user.id);
           await updateUserHead(fd)
          this.$message({message:'上传成功',type:'success'})
          this.getUser () //重新加载数据
          this.showHeadUpload = false
        }else{
           this.$message({message:"请选择一张图片",type:"warning"})
        }   
    },
    openEditDialog() {
      this.editForm = {
        email: this.user.email,
        phone: this.user.phone,
        location: this.user.location
      }
      this.showEditDialog = true
    },
    async saveUserInfo() {
      const data = {
        id: this.user.id,
        ...this.editForm
      }
      await updateUserInform(data)
      this.$message.success('修改成功')
      this.showEditDialog = false
      this.getUser()
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.user-container {
  background-color: #ffffff;
  text-align: left;
  border: 1px solid #e7e7e9;
  font-size: 14px;
  .avatar-uploader  {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    width: 178px;
    height: 178px;
    margin: 0 auto;
  }
  .localimg {
    width: 178px;
    height: 178px;
    border-radius: 4px;
  }
  .avatar-uploader:hover {
    border-color: #409EFF;
  }
   .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  header {
    color: #323745;
    height: 55px;
    line-height: 55px;
    padding: 0 15px;
    background-color: #fbfbfb;
    border-bottom: 1px solid #e8e8e8;
  }
  .wrap {
    padding: 0 30px 80px;
    .form-item {
      overflow: hidden;
      border-bottom: 1px solid #e8e8e8;
      padding: 25px 0;
      &:last-child {
        border: none;
      }
      label {
        float: left;
        width: 80px;
        text-align: right;
        font-weight: normal;
        color: #323745;
        img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
        }
      }
      .rightContent {
        margin-left: 120px;
        overflow: hidden;
      }
    } 
  }
  .username {
     .edituser {
        margin-left:100px; 
        .btn-group {
          margin-left: 120px;
          margin-top: 20px;
        }
      }
    .rightContent {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      dl {
        dt {
          font-size: 16px;
        }
        dd {
          color: #999999;
          font-size: 12px;
          margin-top: 7px;
        }
      }
    }
  }
  .userinfo {
    padding-bottom: 0 !important;
    .rightContent {
      margin-top: -20px;
    }
    
    .clause {

      color: #666666;
      border-bottom: 1px solid #e8e8e8;
      line-height: 60px;
      .btn-group {
        margin-left: 120px;
        line-height: 40px;
        margin-bottom: 10px;
      }
      &:last-child {
        border: none;
      }
      a {
        float: right;
        color: #3296fa;
      }
      span {
        color: #333333;
        width: 120px;
        display: inline-block;
      }
    }
  }
  .el-input {
    width: auto;
  }
  ::v-deep .phone-readonly .el-input__inner {
    color: #999999;
    background-color: #f5f7fa;
  }
}

</style>
