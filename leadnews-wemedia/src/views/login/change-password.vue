<template>
  <div class="change-password">
    <div class="container">
      <div class="title">修改密码</div>
      <el-form :model="form" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="验证码">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="请输入验证码"></el-input>
            <el-button :disabled="countdown > 0 || sending" @click="sendCode">
              <span v-if="countdown > 0">{{ countdown }}s</span>
              <span v-else>发送验证码</span>
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input type="password" v-model="form.password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item class="action-row">
          <el-button type="primary" @click="confirm">确认</el-button>
          <el-button @click="goLogin">返回登入</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { sendMessage, upDatePasswd } from '@/api/user'
export default {
  data() {
    return {
      form: {
        phone: '',
        code: '',
        password: ''
      },
      countdown: 0,
      timer: null,
      sending: false
    }
  },
  methods: {
    async sendCode() {
      if (!this.form.phone) {
        this.$message({ type: 'warning', message: '请输入手机号' })
        return
      }
      this.sending = true
      try {
        await sendMessage(this.form.phone)
        this.$message({ type: 'success', message: '验证码已发送' })
        this.startCountdown()
      } finally {
        this.sending = false
      }
    },
    startCountdown() {
      this.countdown = 60
      this.clearTimer()
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          this.clearTimer()
        }
      }, 1000)
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    async confirm() {
      const { phone, password, code } = this.form
      if (!phone || !password || !code) {
        this.$message({ type: 'warning', message: '请填写完整信息' })
        return
      }
      const res = await upDatePasswd(phone, password, code)
      if (res && (res.code === 0 || res.code === 200)) {
        this.$message({ type: 'success', message: '修改成功' })
        this.$router.replace('/login')
      } else {
        const msg = (res && (res.error_message || res.errorMessage)) || '修改失败'
        this.$message({ type: 'error', message: msg })
      }
    },
    goLogin() {
      this.$router.replace('/login')
    }
  },
  beforeDestroy() {
    this.clearTimer()
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.change-password {
  background-image: url('../../assets/login_bg.jpg');
  background-size: 100% 100%;
  background-position: center;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .container {
    background-color: rgba(255, 255, 255, 0.95);
    width: 420px;
    padding: 40px 35px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    text-align: center;
  }
  .title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
  }
  .code-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .action-row {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}
</style>
