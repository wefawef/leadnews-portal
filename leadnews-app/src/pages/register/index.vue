<template>
    <div class="login-wapper">
        <div class="log-top"><TopBar :text="'注 册'"/></div>
        <div class="bg-wapper">
            <div class="title-section">
                <text class="page-title">创建账号</text>
                <text class="page-subtitle">Create Account</text>
            </div>
            
            <div class="register-card">
                <div class="input-wapper">
                    <text class="icon">{{userIcon}}</text>
                    <input v-model="params.name" return-key-type="defalut" autocomplete="off" placeholder="请输入用户名" class="input"/>
                </div>
                <div class="input-wapper">
                    <text class="icon">{{userIcon}}</text>
                    <input v-model="params.phone" return-key-type="defalut" autocomplete="off" placeholder="请输入手机号" class="input"/>
                </div>
                <div class="input-wapper">
                    <text class="icon">{{passIcon}}</text>
                    <input v-model="params.password" return-key-type="go" autocomplete="off" type="password" placeholder="请输入密码" class="input"/>
                </div>
                <div class="input-wapper">
                    <text class="icon">{{passIcon}}</text>
                    <input v-model="params.confirm" return-key-type="go" autocomplete="off" type="password" placeholder="请再次输入密码" class="input"/>
                </div>
                <div class="input-wapper captcha-row">
                    <input v-model="params.code" return-key-type="go" autocomplete="off" placeholder="请输入验证码" class="input"/>
                    <div class="captcha" @click="refreshCaptcha">
                        <image v-if="captchaSrc" class="captcha-img" :src="captchaSrc"></image>
                        <text v-else class="captcha-text">{{captchaText}}</text>
                    </div>
                </div>
                <text class="captcha-refresh" @click="refreshCaptcha">看不清，换一个</text>
                <text class="button" @click="register">立即注册</text>
                <div class="more">
                    <router-link to="/login">
                        <text class="go-home" @click="goLogin">已有账号，去登录</text>
                    </router-link>
                </div>
            </div>
        </div>
        <div class="empty"> </div>
    </div>
</template>

<script>
    import Api from '@/apis/register/api'
    import TopBar from '@/compoents/bars/login_top_bar'
    const modal = weex.requireModule('modal')
    const platform = weex && weex.config && weex.config.env ? weex.config.env.platform : 'Web'
    export default {
        name: "register",
        components:{TopBar},
        data(){
            return{
                userIcon : '\uf007',
                passIcon : '\uf023',
                params:{
                    name:'',
                    phone:'',
                    password:'',
                    confirm:'',
                    code:''
                },
                captchaText:'',
                captchaSrc:''
            }
        },
        created(){
            Api.setVue(this);
            this.refreshCaptcha();
        },
        methods:{
            goLogin(){
                this.$router.push('/login')
            },
            register(){
                if(!this.params.name || String(this.params.name).replace(/\s/g, '') === ''){
                    modal.toast({ message:'请输入用户名', duration:3 })
                    return;
                }
                if(!this.params.phone || String(this.params.phone).replace(/\s/g, '') === ''){
                    modal.toast({ message:'请输入手机号', duration:3 })
                    return;
                }
                if(!this.params.password || String(this.params.password).replace(/\s/g, '') === ''){
                    modal.toast({ message:'请输入密码', duration:3 })
                    return;
                }
                if(this.params.password !== this.params.confirm){
                    modal.toast({ message:'两次输入的密码不一致', duration:3 })
                    return;
                }
                if(!this.params.code || String(this.params.code).replace(/\s/g, '') === ''){
                    modal.toast({ message:'请输入验证码', duration:3 })
                    return;
                }
                if(String(this.params.code).toLowerCase() !== String(this.captchaText).toLowerCase()){
                    modal.toast({ message:'验证码不正确', duration:3 })
                    return;
                }
                Api.register({ phone: this.params.phone, password: this.params.password, name: this.params.name }).then(d=>{
                    if(d.code === 501){
                        modal.toast({ message:'参数无效', duration:3 })
                        return;
                    }
                    if(d.code === 1000){
                        modal.toast({ message:'用户名已经被注册', duration:3 })
                        return;
                    }
                    if(d.code === 1001){
                        modal.toast({ message:'手机号已经被注册', duration:3 })
                        return;
                    }
                    if(d.code === 200){
                        modal.toast({ message:'注册成功', duration:2 })
                        this.$router.push('/login')
                        return;
                    }
                    modal.toast({ message: d.errorMessage || '注册失败，请稍后重试', duration:3 })
                }).catch(() => {
                    modal.toast({ message: '网络错误，请稍后重试', duration:3 })
                })
            },
            refreshCaptcha(){
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
                let s = ''
                for(let i=0;i<4;i++){
                    s += chars.charAt(Math.floor(Math.random()*chars.length))
                }
                this.captchaText = s
                if(platform === 'Web'){
                    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><rect width="120" height="40" fill="#F5F5F5"/><text x="15" y="28" font-size="22" font-family="Arial" fill="#333">'+s+'</text></svg>'
                    this.captchaSrc = 'data:image/svg+xml;utf8,'+encodeURIComponent(svg)
                }else{
                    this.captchaSrc = ''
                }
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
        padding-bottom: 50px;
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
    .register-card {
        width: 690px;
        padding: 40px 30px;
        background-color: rgba(255, 255, 255, 0.8);
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
    .more{
        width: 630px;
        margin-top: 50px;
        flex-direction: row;
        justify-content: center;
        padding: 0 20px;
    }
    .go-home{
        font-size: 28px;
        color: #3194ff;
        text-decoration: none;
        font-weight: bold;
    }
    .captcha-row{
        align-items: center;
    }
    .captcha{
        width: 160px;
        height: 60px;
        background-color: #f5f7f9;
        margin-left: 20px;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
    }
    .captcha-img{
        width: 160px;
        height: 60px;
    }
    .captcha-text{
        font-size: 26px;
        color: #333333;
        letter-spacing: 4px;
    }
    .captcha-refresh{
        font-size: 24px;
        color: #999999;
        text-decoration: none;
        margin-top: 15px;
        margin-bottom: 20px;
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
    .input{
        border: none;
        flex: 1;
        height: 90px;
        line-height: 90px;
        font-size: 30px;
        color: #333333;
        background-color: transparent;
        margin-left: 20px;
        placeholder-color: #bbbbbb;
    }
    .input:active, .input:hover{
        background-color: transparent;
    }
</style>