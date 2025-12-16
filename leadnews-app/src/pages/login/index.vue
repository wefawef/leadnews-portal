<template>
    <div class="login-wapper">
        <div class="log-top"><TopBar/></div>
        <div class="bg-wapper">
            <div class="title-section">
                <text class="page-title">校园头条</text>
                <text class="page-subtitle">Campus Headlines</text>
            </div>
            
            <div class="login-card">
                <div class="input-wapper">
                    <text class="icon">{{userIcon}}</text>
                    <input v-model="params.phone" return-key-type="defalut"
                           autocomplete="off"
                           placeholder="请输入手机号"
                           class="input"
                    />
                </div>
                <div class="input-wapper">
                    <text class="icon">{{passIcon}}</text>
                    <input v-model="params.password" return-key-type="go"
                           autocomplete="off"
                           type="password"
                           placeholder="请输入密码"
                           class="input"
                    />
                </div>
                <text class="button" @click="login">立即登录</text>
                <div class="more">
                    <router-link to="/register">
                        <text class="go-register" @click="goRegister">注册新账号</text>
                    </router-link>
                    <router-link to="/home">
                        <text class="go-home" @click="see">游客试用 ></text>
                    </router-link>
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
        name: "login",
        components:{TopBar},
        data(){
            return{
                userIcon : '\uf007',
                passIcon : '\uf023',
                params:{
                    phone:'',
                    password:''
                }
            }
        },
        created(){
            Api.setVue(this);
        },
        methods:{
            goRegister : function(){
                this.$router.push('/register')
            },
            see : function(){
                // 直接跳转到首页，不进行登录
                this.$router.push("/home")
            },
            login:function(){
                // 验证输入
                if(!this.params.phone || String(this.params.phone).replace(/\s/g, '') === ''){
                    modal.toast({
                        message:'请输入手机号',
                        duration:3
                    })
                    return;
                }
                if(!this.params.password || String(this.params.password).replace(/\s/g, '') === ''){
                    modal.toast({
                        message:'请输入密码',
                        duration:3
                    })
                    return;
                }
                
                // 调用登录接口
                Api.login(this.params).then(d=>{
                    // 根据返回的数据结构，code为200表示成功
                    if(d.code === 200 && d.data){
                        // 保存token
                        this.$store.setToken(d.data.token).then(() => {
                            // 保存用户信息
                            if(d.data.user){
                                return this.$store.setUser(d.data.user);
                            }
                            return Promise.resolve();
                        }).then(() => {
                            // 登录成功，跳转到首页
                            modal.toast({
                                message: d.errorMessage || '登录成功',
                                duration: 2
                            });
                            this.$router.push("/home");
                        }).catch(err => {
                            console.error('保存登录信息失败:', err);
                            modal.toast({
                                message:'登录信息保存失败，请重试',
                                duration:3
                            });
                        });
                    }else{
                        // 登录失败
                        modal.toast({ 
                            message: d.errorMessage || '登录失败，请检查用户名和密码', 
                            duration:3
                        });
                    }
                }).catch(e=>{
                    console.error('登录请求失败:', e);
                    modal.toast({ 
                        message: '网络错误，请稍后重试', 
                        duration:3
                    });
                })
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
        padding-bottom: 350px;
    }
    .empty{
        height: 0;
    }
    .title-section {
        margin-bottom: 60px;
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
    .login-card {
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
        margin: 20px 0px;
        border-width: 2px;
        border-style: solid;
        border-color: #f0f0f0;
    }
    .more{
        width: 630px;
        margin-top: 50px;
        flex-direction: row;
        justify-content: space-between;
        padding: 0 20px;
    }
    .go-register{
        font-size: 28px;
        color: #3194ff;
        text-decoration: none;
        font-weight: bold;
    }
    .go-home{
        font-size: 28px;
        color: #999999;
        text-decoration: none;
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
    .button{
        margin-top: 60px;
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
</style>
