<template>
    <div class="login-wapper">
        <div class="log-top"><TopBar :text="'注 册'"/></div>
        <div class="bg-wapper">
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
            <text class="button" @click="register"> 注 册 </text>
            <div class="more">
                <router-link to="/login">
                    <text class="go-home" @click="goLogin">已有账号，去登录</text>
                </router-link>
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
        background-color: #ffffff;
    }
    .bg-wapper{
        margin-top: 35px;
        margin-bottom: 35px;
        width: 750px;
        justify-content: center;
        align-items: center;
    }
    .log-top{
        width: 750px;
        height: 90px;
    }
    .empty{
        flex: 1;
        background-color: #f5f7f9;
    }
    .icon{
        color: @icon-color;
        font-size: 32px;
    }
    .input-wapper {
        flex-direction: row;
        width: 700px;
        border-bottom-width: 1px;
        border-bottom-color: #eeeeee;
        padding: 15px 0px;
        align-items: center;
        margin: 15px 0px;
    }
    .more{
        margin-top: 35px;
        flex-direction: row;
    }
    .go-home{
        font-size: 24px;
        color: @placeholder-color;
        text-decoration: underline;
        margin-right: 35px;
    }
    .captcha-row{
        align-items: center;
    }
    .captcha{
        width: 160px;
        height: 50px;
        background-color: #f5f7f9;
        margin-left: 20px;
        justify-content: center;
        align-items: center;
    }
    .captcha-img{
        width: 120px;
        height: 40px;
    }
    .captcha-text{
        font-size: 26px;
        color: #333333;
        letter-spacing: 4px;
    }
    .captcha-refresh{
        font-size: 22px;
        color: @placeholder-color;
        text-decoration: underline;
        margin-top: 15px;
    }
    .button{
        margin-top:60px;
        background-color: #6db4fb;
        width: 690px;
        height: 70px;
        border-radius: 10px;
        color: @bg-white;
        font-size: 32px;
        text-align: center;
        line-height: 70px;
    }
    .input{
        border: none;
        flex: 1;
        line-height: 30px;
        font-size: 28px;
        color: @title-color;
        background-color: transparent;
        margin-left: 20px;
        placeholder-color:@placeholder-color;
    }
</style>