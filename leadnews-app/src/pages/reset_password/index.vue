<template>
    <div class="login-wapper">
        <div class="log-top"><TopBar :text="'修改密码'"/></div>
        <div class="bg-wapper">
            <div class="title-section">
                <text class="page-title">修改密码</text>
                <text class="page-subtitle">Reset Password</text>
            </div>
            <div class="reset-card">
                <div class="input-wapper">
                    <text class="icon">{{userIcon}}</text>
                    <input v-model="params.phone" type="tel" maxlength="11" @input="onPhoneInput" return-key-type="defalut" autocomplete="off" placeholder="请输入手机号" class="input"/>
                </div>
                <div class="input-wapper sms-row">
                    <text class="icon">{{passIcon}}</text>
                    <input v-model="params.code" return-key-type="go" autocomplete="off" placeholder="请输入验证码" class="input"/>
                    <text class="sms-button" :style="{ backgroundColor: (smsCountdown > 0 || smsSending) ? '#d9d9d9' : '#3194ff', color: (smsCountdown > 0 || smsSending) ? '#999999' : '#ffffff' }" @click="sendSmsCode">{{ smsCountdown > 0 ? smsCountdown + 's' : '发送验证码' }}</text>
                </div>
                <div class="input-wapper">
                    <text class="icon">{{passIcon}}</text>
                    <input v-model="params.password" return-key-type="go" autocomplete="off" type="password" placeholder="请输入新密码" class="input"/>
                </div>
                <text class="button" @click="confirmReset">确认修改</text>
                <div class="more">
                    <text class="go-login" @click="goLogin">去登录</text>
                </div>
            </div>
        </div>
        <div class="empty"> </div>
    </div>
</template>

<script>
    import Api from '@/apis/login/api'
    import TopBar from '@/compoents/bars/login_top_bar'
    const modal = weex.requireModule('modal')
    export default {
        name: "reset_password",
        components:{TopBar},
        data(){
            return{
                userIcon : '\uf007',
                passIcon : '\uf023',
                params:{
                    phone:'',
                    password:'',
                    code:''
                },
                smsCountdown: 0,
                smsSending: false,
                smsTimer: null
            }
        },
        created(){
            Api.setVue(this);
        },
        destroyed(){
            if (this.smsTimer) {
                clearInterval(this.smsTimer)
                this.smsTimer = null
            }
        },
        methods:{
            normalizePhone(value){
                return String(value || '').replace(/\D/g, '').slice(0, 11)
            },
            onPhoneInput(e){
                const v = e && e.value !== undefined ? e.value : this.params.phone
                this.params.phone = this.normalizePhone(v)
            },
            isValidPhone(value){
                const v = this.normalizePhone(value)
                if (v.length !== 11) return false
                if (!/^1[3-9]\d{9}$/.test(v)) return false
                if (/^(\d)\1{10}$/.test(v)) return false
                return true
            },
            startSmsCountdown(seconds){
                if (this.smsTimer) {
                    clearInterval(this.smsTimer)
                    this.smsTimer = null
                }
                this.smsCountdown = seconds
                this.smsTimer = setInterval(() => {
                    if (this.smsCountdown <= 1) {
                        this.smsCountdown = 0
                        clearInterval(this.smsTimer)
                        this.smsTimer = null
                        return
                    }
                    this.smsCountdown -= 1
                }, 1000)
            },
            sendSmsCode(){
                if (this.smsCountdown > 0 || this.smsSending) return
                const phone = this.normalizePhone(this.params.phone)
                if (!this.isValidPhone(phone)) {
                    modal.toast({ message:'请输入有效的手机号', duration:3 })
                    return
                }
                this.smsSending = true
                const url = `http://127.0.0.1:51601/user/api/v1/login/sendMessage/${phone}`
                this.$request.post(url, {}).then(d => {
                    if (d && d.code === 200) {
                        this.startSmsCountdown(60)
                        modal.toast({ message:'验证码已发送', duration:2 })
                    } else {
                        modal.toast({ message: (d && d.errorMessage) ? d.errorMessage : '发送失败，请稍后重试', duration:3 })
                    }
                }).catch(() => {
                    modal.toast({ message:'网络错误，请稍后重试', duration:3 })
                }).finally(() => {
                    this.smsSending = false
                })
            },
            confirmReset(){
                this.params.phone = this.normalizePhone(this.params.phone)
                if(!this.params.phone || String(this.params.phone).replace(/\s/g, '') === ''){
                    modal.toast({ message:'请输入手机号', duration:3 })
                    return;
                }
                if(!this.isValidPhone(this.params.phone)){
                    modal.toast({ message:'请输入有效的手机号', duration:3 })
                    return;
                }
                if(!this.params.code || String(this.params.code).replace(/\s/g, '') === ''){
                    modal.toast({ message:'请输入验证码', duration:3 })
                    return;
                }
                if(!this.params.password || String(this.params.password).replace(/\s/g, '') === ''){
                    modal.toast({ message:'请输入新密码', duration:3 })
                    return;
                }
                Api.updatePassword({ phone: this.params.phone, password: this.params.password, verificationMessage: this.params.code }).then(d=>{
                    if(d && d.code === 200){
                        modal.toast({ message:'修改成功', duration:2 })
                        this.$router.push('/login')
                        return
                    }
                    modal.toast({ message: (d && d.errorMessage) ? d.errorMessage : '修改失败，请稍后重试', duration:3 })
                }).catch(() => {
                    modal.toast({ message:'网络错误，请稍后重试', duration:3 })
                })
            },
            goLogin(){
                this.$router.push('/login')
            }
        }
    }
</script>

<style lang="less" scoped>
    @import '../../styles/common';
    .login-wapper {
        flex: 1;
        width: 750px;
        flex-direction: column;
        background-image: linear-gradient(to bottom, #e0f2ff, #ffffff);
    }
    .log-top{
        width: 750px;
        height: 90px;
    }
    .bg-wapper{
        flex: 1;
        width: 750px;
        justify-content: center;
        align-items: center;
        padding-bottom: 120px;
    }
    .empty{
        height: 0;
    }
    .title-section {
        margin-bottom: 40px;
        align-items: center;
    }
    .page-title{
        font-size: 60px;
        color: #333333;
        font-weight: bold;
        margin-bottom: 15px;
        font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
    }
    .page-subtitle{
        font-size: 28px;
        color: #888888;
        letter-spacing: 2px;
    }
    .reset-card {
        width: 690px;
        padding: 40px 30px;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        align-items: center;
    }
    .icon{
        color: #3194ff;
        font-size: 38px;
        margin-left: 10px;
    }
    .input-wapper {
        flex-direction: row;
        width: 630px;
        height: 100px;
        background-color: #ffffff;
        border-radius: 50px;
        padding: 0 30px;
        align-items: center;
        margin: 15px 0px;
        border-width: 2px;
        border-style: solid;
        border-color: #f0f0f0;
    }
    .sms-row{
        align-items: center;
    }
    .sms-button{
        width: 180px;
        height: 64px;
        line-height: 64px;
        text-align: center;
        border-radius: 32px;
        font-size: 24px;
        margin-left: 20px;
    }
    .input{
        border: none;
        outline: none;
        flex: 1;
        height: 90px;
        line-height: 90px;
        font-size: 30px;
        color: #333333;
        background-color: transparent;
        margin-left: 20px;
        placeholder-color: #bbbbbb;
    }
    .input:focus {
        outline: none;
    }
    .input:active, .input:hover{
        background-color: transparent;
    }
    .button{
        margin-top: 20px;
        background-image: linear-gradient(to right, #3194ff, #50b5ff);
        width: 630px;
        height: 100px;
        line-height: 100px;
        border-radius: 50px;
        color: #ffffff;
        text-align: center;
        font-size: 36px;
        font-weight: bold;
        box-shadow: 0 10px 25px rgba(49, 148, 255, 0.4);
    }
    .more{
        width: 630px;
        margin-top: 30px;
        flex-direction: row;
        justify-content: center;
        padding: 0 20px;
    }
    .go-login{
        font-size: 28px;
        color: #3194ff;
        text-decoration: none;
        font-weight: bold;
    }
</style>
