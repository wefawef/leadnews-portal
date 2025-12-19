<template>
    <div class="user-wrapper">
        <wxc-minibar title="个人信息"
                     background-color="#3194ff"
                     text-color="#FFFFFF"
                     :useDefaultReturn="false"
                     @wxcMinibarLeftButtonClicked="minibarLeftButtonClick">
            <text class="icon" slot="left" style="text-align: left">&#xf104;</text>
        </wxc-minibar>
        <scroller class="scroller">
            <div class="header">
                <image class="avatar" :src="userInfo.image || defaultAvatar" placeholder="http://192.168.3.133:9000/leadnews/2025/12/17/2c98fd9bfda44e6bb40f9ea356c7e5bd.jpg"></image>
                <text class="username">{{userInfo.name || '未知用户'}}</text>
            </div>
            <div class="info-cell">
                <text class="label">手机号码</text>
                <text class="value">{{userInfo.phone || '未绑定'}}</text>
            </div>
            <div class="info-cell">
                <text class="label">性别</text>
                <text class="value">{{getSex(userInfo.sex)}}</text>
            </div>
            <div class="info-cell">
                <text class="label">用户身份</text>
                <text class="value">{{getFlag(userInfo.flag)}}</text>
            </div>
            <div class="info-cell">
                <text class="label">实名认证</text>
                <text class="value">{{userInfo.identityAuthentication ? '已认证' : '未认证'}}</text>
            </div>
             <div class="info-cell">
                <text class="label">创建时间</text>
                <text class="value">{{formatDate(userInfo.createdTime)}}</text>
            </div>
        </scroller>
    </div>
</template>

<script>
    import { WxcMinibar } from 'weex-ui';
    import Api from '@/apis/user/api';
    const modal = weex.requireModule('modal');

    export default {
        name: 'UserInfo',
        components: { WxcMinibar },
        data() {
            return {
                userInfo: {},
                defaultAvatar: 'http://192.168.3.133:9000/leadnews/2025/12/17/2c98fd9bfda44e6bb40f9ea356c7e5bd.jpg'
            }
        },
        created() {
            Api.setVue(this);
            this.loadUserInfo();
        },
        methods: {
            minibarLeftButtonClick() {
                this.$router.back();
            },
            loadUserInfo() {
                Api.getUserInfo({}).then(d => {
                    if(d.code == 200){
                        this.userInfo = d.data;
                    }else{
                        modal.toast({
                            message: d.errorMessage || '获取用户信息失败',
                            duration: 2
                        });
                    }
                }).catch(err => {
                    console.error('获取用户信息失败', err);
                    modal.toast({
                        message: '获取用户信息失败',
                        duration: 2
                    });
                });
            },
            getSex(sex) {
                if (sex === false || sex === 0) return '男'; 
                if (sex === true || sex === 1) return '女';
                return '未知';
            },
            getFlag(flag) {
                const flags = {
                    0: '普通用户',
                    1: '自媒体人',
                    2: '大V'
                };
                return flags[flag] || '普通用户';
            },
            formatDate(time) {
                if (!time) return '';
                const date = new Date(time);
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            }
        }
    }
</script>

<style lang="less" scoped>
    .user-wrapper {
        flex: 1;
        background-color: #f5f7fa;
    }
    .scroller {
        flex: 1;
    }
    .header {
        background-color: #ffffff;
        align-items: center;
        padding: 50px 0;
        margin-bottom: 20px;
    }
    .avatar {
        width: 150px;
        height: 150px;
        border-radius: 75px;
        margin-bottom: 20px;
    }
    .username {
        font-size: 36px;
        color: #333333;
        font-weight: bold;
    }
    .info-cell {
        background-color: #ffffff;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 30px 20px;
        border-bottom-width: 1px;
        border-bottom-color: #eeeeee;
    }
    .label {
        font-size: 30px;
        color: #666666;
    }
    .value {
        font-size: 30px;
        color: #333333;
    }
    .icon {
        font-family: fontawesome;
        color: #ffffff;
        font-size: 36px;
    }
</style>
