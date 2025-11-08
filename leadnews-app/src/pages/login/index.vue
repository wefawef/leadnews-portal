<template>
    <div class="login-wapper">
        <div class="log-top"><TopBar/></div>
        <div class="bg-wapper">
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
                       placeholder="请输密码"
                       class="input"
                />
            </div>
            <text class="button" @click="login"> 登 录 </text>
            <div class="more">
                <text class="go-register" @click="tip">没有账号，去注册</text>
                <router-link to="/home">
                    <text class="go-home" @click="see">先看看，稍后登录</text>
                </router-link>
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
            tip : function(){
                modal.toast({ message:'该功能暂未实现！',duration:3})
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
    .title{
        font-size: 52px;
        color: @title-color;
        margin: 55px 0px;
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
    .go-register{
        font-size: 24px;
        color: @placeholder-color;
        text-decoration: underline;
        margin-right: 35px;
    }
    .go-home{
        font-size: 24px;
        color: @placeholder-color;
        text-decoration: underline;
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
    .input :active,.input :hover{
        background-color: transparent;
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
</style>
