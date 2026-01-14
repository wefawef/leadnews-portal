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
                <image class="avatar" :src="userInfo.image || defaultAvatar" placeholder="http://192.168.3.133:9000/leadnews/2025/12/17/2c98fd9bfda44e6bb40f9ea356c7e5bd.jpg" @click="onAvatarClick"></image>
                <text class="username">{{userInfo.name || '未知用户'}}</text>
                <text class="edit-info-btn" @click="goEditUserInfo">修改个人信息</text>
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
            <div class="info-cell" @click="goToRealNameAuth">
                <text class="label">实名认证</text>
                <text class="value">{{userInfo.identityAuthentication ? '√初始账号姓名 密码123456' : '×未认证'}}</text>
            </div>
             <div class="info-cell">
                <text class="label">创建时间</text>
                <text class="value">{{formatDate(userInfo.createdTime)}}</text>
            </div>
            
            <div class="btn-group" v-if="!userInfo.identityAuthentication">
                <text class="btn" @click="goToRealNameAuth">去实名认证</text>
            </div>
        </scroller>
        <input type="file" ref="avatarInput" style="display:none" @change="handleAvatarFileChange" accept="image/*" />
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
        activated() {
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
                        if(this.$store && this.$store.setUser){
                            this.$store.setUser(d.data).catch(() => {});
                        }
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
            },
            goToRealNameAuth() {
                if (!this.userInfo.identityAuthentication) {
                    this.$router.push('/user/realname_auth');
                } else {
                    modal.toast({ message: '您已通过实名认证', duration: 2 });
                }
            },
            goEditUserInfo() {
                this.$router.push({
                    name: 'user_edit_info',
                    params: {
                        id: this.userInfo.id,
                        name: this.userInfo.name,
                        phone: this.userInfo.phone,
                        sex: this.userInfo.sex
                    }
                });
            },
            onAvatarClick() {
                if (weex.config.env.platform === 'Web') {
                    if (this.$refs.avatarInput) {
                        this.$refs.avatarInput.click();
                    } else {
                        modal.toast({ message: '暂不支持此环境上传', duration: 2 });
                    }
                    return;
                }
                const imageModule = weex.requireModule('image');
                if (imageModule && imageModule.pickImage) {
                    imageModule.pickImage((res) => {
                        if (res && (res.url || res.path)) {
                            const fileUrl = res.url || ('file://' + res.path);
                            this.userInfo.image = fileUrl;
                            this.uploadAvatar(fileUrl);
                        }
                    });
                } else {
                    modal.toast({ message: 'Native模块未加载', duration: 2 });
                }
            },
            handleAvatarFileChange(event) {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    this.userInfo.image = e.target.result;
                };
                reader.readAsDataURL(file);

                this.uploadAvatar(file);

                event.target.value = '';
            },
            async uploadAvatar(image) {
                let userId = this.userInfo && this.userInfo.id;
                if (!userId && this.$store && this.$store.getUser) {
                    const cachedUser = await this.$store.getUser().catch(() => null);
                    userId = cachedUser ? cachedUser.id : null;
                }
                if (!userId) {
                    modal.toast({ message: '未获取到用户ID', duration: 2 });
                    return;
                }

                Api.upUserImage(userId, image).then((d) => {
                    if (d && (d.code === 200 || d.success === true)) {
                        let newImage = '';
                        if (d.data) {
                            if (typeof d.data === 'string') {
                                newImage = d.data;
                            } else if (d.data.image) {
                                newImage = d.data.image;
                            } else if (d.data.url) {
                                newImage = d.data.url;
                            }
                        }
                        if (newImage) {
                            this.userInfo.image = newImage;
                            if (this.$store && this.$store.setUser) {
                                this.$store.setUser(this.userInfo).catch(() => {});
                            }
                        }
                        modal.toast({ message: '头像更新成功', duration: 2 });
                    } else {
                        modal.toast({ message: (d && (d.errorMessage || d.message)) || '头像更新失败', duration: 2 });
                    }
                }).catch((e) => {
                    modal.toast({ message: (e && (e.errorMessage || e.message)) || '头像更新失败', duration: 2 });
                });
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
    .edit-info-btn{
        margin-top: 12px;
        font-size: 28px;
        color: #3194ff;
        padding: 10px 18px;
        border-width: 1px;
        border-color: #3194ff;
        border-radius: 26px;
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
    .btn-group {
        margin-top: 50px;
        padding: 0 30px;
        margin-bottom: 50px;
    }
    .btn {
        height: 90px;
        line-height: 90px;
        text-align: center;
        background-color: #3194ff;
        color: #ffffff;
        font-size: 36px;
        border-radius: 45px;
    }
</style>
