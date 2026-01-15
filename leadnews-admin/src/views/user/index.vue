<template>
  <div class="user-container">
    <header>个人信息</header>
    <div class="wrap">
      <div class="form-item username">
        <div class="left-label">
          <dl>
            <dt>{{user.name}}</dt>
            <dd>{{user.nickname || '暂无昵称'}}</dd>
          </dl>
          <div>
            <img :src="headImg" class="user-avatar" @click="chooseAvatar" /><br />
            <input ref="avatarInput" class="avatar-input" type="file" accept="image/*" @change="onAvatarChange">
          </div>
          <div style="margin-top: 15px; margin-left: 30px;">
            <el-button 
              type="primary" 
              size="small" 
              icon="el-icon-edit" 
              round 
              plain
              @click="openEditDialog"
              style="box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);"
            >
              修改个人信息
            </el-button>
          </div>
        </div>
        <div class="rightContent">
        </div>
      </div>
      <div class="form-item userinfo">
        <label>基本信息</label>
        <div class="rightContent">
          <div class="clause">
            <span>用户ID</span>{{user.id}}
          </div>
          <div class="clause">
            <span>手机号</span>{{user.phone}}
          </div>
          <div class="clause">
            <span>邮箱</span>{{user.email || '暂无'}}
          </div>
           <div class="clause">
            <span>注册时间</span>{{dateFormat(user.createdTime)}}
          </div>
          <div class="clause">
            <span>状态</span>
            <el-tag v-if="user.status === 9" type="success">正常可用</el-tag>
            <el-tag v-else-if="user.status === 0" type="warning">暂时不可用</el-tag>
            <el-tag v-else-if="user.status === 1" type="danger">永久不可用</el-tag>
            <el-tag v-else>未知状态</el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改个人信息弹窗 -->
    <el-dialog title="修改个人信息" :visible.sync="dialogVisible" width="30%">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEdit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAdminInfo, upAdminImage, upAdminInform } from '@/api/user' 
import DateUtil from '@/utils/date'
import { getUser, setUser } from '@/utils/store'

export default {
  name: 'UserInfo',
  data() {
    return {
       user:{},
       dialogVisible: false,
       editForm: {
         id: '',
         name: '',
         phone: '',
         email: ''
       }
    }
  },
  computed: {
     headImg () {
       return this.user.image ? this.user.image : require('@/assets/avatar.jpg')
     }
  },
  created() {
     this.loadUserInfo()
  },
  methods:{
    chooseAvatar() {
      const input = this.$refs.avatarInput
      if (!input) return
      input.value = ''
      input.click()
    },
    async onAvatarChange(e) {
      const files = e && e.target ? e.target.files : null
      const file = files && files.length ? files[0] : null
      if (!file) return
      if (!this.user || !this.user.id) {
        this.$message.error('未获取到登录信息')
        return
      }

      const formData = new FormData()
      formData.append('image', file)
      formData.append('id', this.user.id)

      let res = await upAdminImage(formData)
      if (res && res.code === 200) {
        let newImage = ''
        if (res.data) {
          if (typeof res.data === 'string') newImage = res.data
          else if (res.data.image) newImage = res.data.image
          else if (res.data.url) newImage = res.data.url
          else if (res.data.imageUrl) newImage = res.data.imageUrl
        }
        if (newImage) {
          this.$set(this.user, 'image', newImage)
        }
        setUser(this.user)
        this.$message.success('头像更新成功')
        // 重新拉取用户信息
        this.loadUserInfo()
      } else {
        this.$message.error((res && res.errorMessage) || '头像更新失败')
      }
    },
    async loadUserInfo() {
      // 从本地存储获取当前登录用户信息
      const currentUser = getUser()
      if (currentUser && currentUser.id) {
        let res = await getAdminInfo(currentUser.id)
        if(res.code === 200 && res.data) {
          this.user = res.data
          // 更新store中的用户信息，保持头像同步，同时保留token
          if (currentUser.token) {
             this.user.token = currentUser.token
          }
          setUser(this.user)
        } else {
          this.$message.error(res.errorMessage || '获取用户信息失败')
        }
      } else {
        this.$message.error('未获取到登录信息')
      }
    },
    dateFormat(time) {
      return time ? DateUtil.format13HH(time) : ''
    },
    openEditDialog() {
      this.editForm = {
        id: this.user.id,
        name: this.user.name,
        phone: this.user.phone,
        email: this.user.email
      }
      this.dialogVisible = true
    },
    async submitEdit() {
      let res = await upAdminInform(this.editForm)
      if (res && res.code === 200) {
        this.$message.success('信息更新成功')
        this.dialogVisible = false
        this.loadUserInfo()
      } else {
        this.$message.error((res && res.errorMessage) || '信息更新失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-container {
    font-size: 14px;
    color: #606266;
  header {
    color: #323745;
    font-size: 14px;
    height: 55px;
    line-height: 55px;
    padding: 0 15px;
    background-color: #fbfbfb;
    border-bottom: 1px solid #e8e8e8;
  }
  .wrap {
    padding: 20px;
  }
  .form-item {
    margin-bottom: 20px;
    overflow: hidden;
    label, .left-label {
      width: 120px;
      float: left;
      text-align: right;
      margin-right: 20px;
      line-height: 40px;
    }
    .rightContent {
      overflow: hidden;
      .clause {
        line-height: 40px;
        span {
          margin-right: 20px;
          color: #909399;
          display: inline-block;
          width: 80px;
          text-align: right;
        }
      }
      dl {
        margin: 0;
        dt {
          font-size: 16px;
          color: #303133;
          margin-bottom: 10px;
        }
        dd {
          margin: 0;
          color: #909399;
        }
      }
    }
  }
  .userinfo {
    label {
      width: 125px;
      padding-right: 10px;
    }
  }
  .username {
    label, .left-label {
      line-height: normal;
    }
    dl {
      margin: 0 10px 10px 0;
      dt {
        font-size: 16px;
        color: #303133;
        margin-bottom: 5px;
      }
      dd {
        margin: 0 10px 0 0;
        color: #909399;
      }
    }
    .user-avatar {
      width: 65px;
      height: 65px;
      border-radius: 50%;
      object-fit: cover;
      display: inline-block;
      cursor: pointer;
    }
    .avatar-input {
      display: none;
    }
  }
}
</style>
