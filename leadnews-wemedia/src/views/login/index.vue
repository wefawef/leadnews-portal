<template>
  <div class="login">
    <div class="container">
      <div class="login-title">校园头条</div>
      <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" class="login-ruleForm">
        <el-form-item prop="name">
          <el-input type="text" v-model="ruleForm.name" autocomplete="off" placeholder="请输入账户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="ruleForm.password" autocomplete="off" placeholder="请输入密码"></el-input>
        </el-form-item>
        <div class="allow">
          <div id="myCode"></div>
          <el-checkbox v-model="checked"></el-checkbox>我已阅读并同意<a @click.prevent="openAgreement">用户协议</a>和<a @click.prevent="openPrivacy">隐私条款</a>
        </div>
        <el-form-item class="loginBtn">
          <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 用户协议弹窗 -->
    <el-dialog
      title="用户协议"
      :visible.sync="agreementVisible"
      width="50%"
      :modal-append-to-body="false"
      center>
      <div style="height: 300px; overflow-y: auto; padding: 0 20px;">
        <p><strong>一、服务条款的确认和接纳</strong></p>
        <p>本网站的所有权和运营权归校园头条所有。用户在注册前务必仔细阅读本协议，一旦注册成功，即表示用户与校园头条达成协议并接受所有的服务条款。</p>
        <p><strong>二、用户隐私制度</strong></p>
        <p>尊重用户个人隐私是校园头条的一项基本政策。所以，作为对以上第二点个人注册资料分析的补充，校园头条一定不会在未经合法用户授权时公开、编辑或透露其注册资料及保存在校园头条中的非公开内容。</p>
        <p><strong>三、用户的账号，密码和安全性</strong></p>
        <p>用户一旦注册成功，成为校园头条的合法用户，将得到一个密码和用户名。用户将对用户名和密码安全负全部责任。另外，每个用户都要对以其用户名进行的所有活动和事件负全责。</p>
        <p><strong>四、免责条款</strong></p>
        <p>校园头条不保证服务一定能满足用户的要求，也不保证服务不会受中断，对服务的及时性，安全性，出错发生都不作保证。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="agreementVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 隐私条款弹窗 -->
    <el-dialog
      title="隐私条款"
      :visible.sync="privacyVisible"
      width="50%"
      :modal-append-to-body="false"
      center>
      <div style="height: 300px; overflow-y: auto; padding: 0 20px;">
        <p><strong>一、信息收集</strong></p>
        <p>当您注册校园头条账号时，我们会收集您的用户名、密码、邮箱等个人信息，以便为您提供更好的服务。</p>
        <p><strong>二、信息使用</strong></p>
        <p>我们会将收集到的信息用于身份验证、客户服务、安全防范、诈骗监测、存档和备份用途，确保我们向您提供的产品和服务的安全性。</p>
        <p><strong>三、信息披露</strong></p>
        <p>我们不会向任何无关第三方提供、出售、出租、分享或交易您的个人信息，除非事先得到您的许可，或该第三方和我们单独或共同为您提供服务，且在该服务结束后，其将被禁止访问包括其以前能够访问的所有这些资料。</p>
        <p><strong>四、信息安全</strong></p>
        <p>我们将通过加密技术、匿名化处理等手段来保护您的个人信息安全，防止信息泄露、丢失或被滥用。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="privacyVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import gt from  '@/components/gt' //人机交互验证码
import { loginByUsername , getMobileCode , getCaptchas } from '@/api/login'
import { getUser, setUser, clearUser } from '@/utils/store';
export default {
  data() {
    var validateName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入登录用户名'));
      } else {
        callback();
      }
    };
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        callback();
      }
    };
    return {
      agreementVisible: false,
      privacyVisible: false,
      checked: true,
      ruleForm: {
        name: '',
        password: '',
      },
      rules: {
        name: [
          { validator: validateName, trigger: 'blur' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
      }
    };
  },
  components: {
  },
  computed: {

  },
  methods: {
    openAgreement() {
      this.agreementVisible = true;
    },
    openPrivacy() {
      this.privacyVisible = true;
    },
    async submitForm () {
       let {password , name} = this.ruleForm;
       if(!name || !password){
           this.$message({
              message:'用户名和密码不能为空',
              type:'warning'
            })
            return
       }
       if(!this.checked){
           this.$message({
              message:'请勾选同意用户协议和隐私条款',
              type:'warning'
            })
            return
       }
       //登录
       let result = await loginByUsername(name,password) //登录
        if(result.code === 200 || result.code === 0){
          // 设置用户信息（登录成功后调用）
          this.$router.replace({path:'/index'}) //跳转
          // setUser由api/login.js处理，此处不再重复设置，避免覆盖关键信息
        }else{
          this.$message({
            message:result.errorMessage,
            type:'error'
          })
        }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.login {
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
    backdrop-filter: blur(10px);
    
    .login-title {
      font-size: 32px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 30px;
      letter-spacing: 2px;
      background: linear-gradient(120deg, #1890ff, #36cfc9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  }
  .login-ruleForm {
    padding: 0;
    
    .allow {
      text-align: left;
      font-size: 14px;
      margin-bottom: 24px;
      color: #909399;
      display: flex;
      align-items: center;
      
      a {
        color: #1890ff;
        margin: 0 4px;
        cursor: pointer;
        
        &:hover {
          text-decoration: underline;
        }
      }
      .el-checkbox {
        margin-right: 8px;
      }
    }
    .el-form-item {
      margin-bottom: 24px;
    }
    .checkCode {
      .el-input {
        width: 60%;
        float: left;
      }
      .el-button {
        width: 35%;
        float: right;
        span{
          width: 100%;
          display: inline-block;
        }
      }
    }
    .loginBtn {
      margin-top: 10px;
      .el-button {
        width: 100%;
        height: 44px;
        font-size: 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
        }
      }
    }
  }
}
</style>
