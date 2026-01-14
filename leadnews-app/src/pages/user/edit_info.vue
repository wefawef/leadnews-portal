<template>
    <div class="edit-wrapper">
        <wxc-minibar title="修改个人信息"
                     background-color="#3194ff"
                     text-color="#FFFFFF"
                     :useDefaultReturn="true"
                     @wxcMinibarLeftButtonClicked="minibarLeftButtonClick">
        </wxc-minibar>
        <scroller class="scroller">
            <div class="form-group">
                <text class="label">姓名</text>
                <input class="input" type="text" placeholder="请输入姓名" v-model="form.name" />
            </div>
            <div class="form-group">
                <text class="label">手机号</text>
                <input class="input" type="tel" maxlength="11" @input="onPhoneInput" placeholder="请输入手机号" v-model="form.phone" />
            </div>
            <div class="form-group">
                <text class="label">性别</text>
                <div class="sex-row">
                    <text class="sex-btn" :class="[form.sex === 0 ? 'sex-btn-active' : '']" @click="setSex(0)">男</text>
                    <text class="sex-btn" :class="[form.sex === 1 ? 'sex-btn-active' : '']" @click="setSex(1)">女</text>
                </div>
            </div>
            <div class="btn-group">
                <text class="btn" @click="submit">保存</text>
            </div>
        </scroller>
    </div>
</template>

<script>
    import { WxcMinibar } from 'weex-ui';
    import Api from '@/apis/user/api';
    const modal = weex.requireModule('modal');

    export default {
        name: 'EditUserInfo',
        components: { WxcMinibar },
        data() {
            return {
                form: {
                    id: '',
                    name: '',
                    phone: '',
                    sex: 0
                }
            }
        },
        created() {
            Api.setVue(this);
            this.initForm();
        },
        methods: {
            minibarLeftButtonClick() {
                this.$router.back();
            },
            normalizePhone(value){
                return String(value || '').replace(/\D/g, '').slice(0, 11)
            },
            onPhoneInput(e){
                const v = e && e.value !== undefined ? e.value : this.form.phone
                this.form.phone = this.normalizePhone(v)
            },
            initForm() {
                const p = (this.$route && this.$route.params) ? this.$route.params : {};
                if (p && (p.id || p.name || p.phone || p.sex !== undefined)) {
                    this.form.id = p.id || '';
                    this.form.name = p.name || '';
                    this.form.phone = this.normalizePhone(p.phone || '');
                    this.form.sex = (p.sex === 1 || p.sex === '1' || p.sex === true) ? 1 : 0;
                    return;
                }
                if (this.$store && this.$store.getUser) {
                    this.$store.getUser().then((user) => {
                        if (!user) return;
                        this.form.id = user.id || '';
                        this.form.name = user.name || '';
                        this.form.phone = this.normalizePhone(user.phone || '');
                        this.form.sex = (user.sex === 1 || user.sex === '1' || user.sex === true) ? 1 : 0;
                    }).catch(() => {});
                }
            },
            setSex(sex) {
                this.form.sex = sex;
            },
            submit() {
                this.form.phone = this.normalizePhone(this.form.phone)
                if (!this.form.id) {
                    modal.toast({ message: '未获取到用户ID', duration: 2 });
                    return;
                }
                if (!this.form.name || String(this.form.name).replace(/\s/g, '') === '') {
                    modal.toast({ message: '请输入姓名', duration: 2 });
                    return;
                }
                if (!this.form.phone || String(this.form.phone).replace(/\s/g, '') === '') {
                    modal.toast({ message: '请输入手机号', duration: 2 });
                    return;
                }
                if (String(this.form.phone).length !== 11) {
                    modal.toast({ message: '手机号应为11位数字', duration: 2 });
                    return;
                }

                const payload = {
                    id: this.form.id,
                    name: this.form.name,
                    phone: this.form.phone,
                    sex: this.form.sex
                };

                Api.upDateUserInform(payload).then((d) => {
                    if (d && (d.code === 200 || d.success === true)) {
                        const nextUser = Object.assign({}, payload);
                        if (this.$store && this.$store.getUser && this.$store.setUser) {
                            this.$store.getUser().then((cur) => {
                                const merged = Object.assign({}, cur || {}, nextUser);
                                return this.$store.setUser(merged);
                            }).catch(() => {});
                        }
                        modal.toast({ message: '保存成功', duration: 2 });
                        setTimeout(() => {
                            this.$router.back();
                        }, 300);
                        return;
                    }
                    modal.toast({ message: (d && (d.errorMessage || d.message)) || '保存失败', duration: 2 });
                }).catch((e) => {
                    modal.toast({ message: (e && (e.errorMessage || e.message)) || '保存失败', duration: 2 });
                });
            }
        }
    }
</script>

<style lang="less" scoped>
    .edit-wrapper {
        flex: 1;
        background-color: #f5f7fa;
    }
    .scroller {
        flex: 1;
        padding: 20px;
    }
    .form-group {
        background-color: #ffffff;
        border-radius: 12px;
        padding: 24px 20px;
        margin-bottom: 20px;
    }
    .label {
        font-size: 28px;
        color: #666666;
        margin-bottom: 16px;
    }
    .input {
        height: 80px;
        line-height: 80px;
        font-size: 30px;
        padding: 0 16px;
        border-width: 1px;
        border-color: #eeeeee;
        border-radius: 10px;
        background-color: #ffffff;
    }
    .sex-row {
        flex-direction: row;
        align-items: center;
    }
    .sex-btn {
        height: 70px;
        line-height: 70px;
        padding: 0 26px;
        border-width: 1px;
        border-color: #dddddd;
        border-radius: 35px;
        font-size: 28px;
        color: #333333;
        margin-right: 16px;
        text-align: center;
        background-color: #ffffff;
    }
    .sex-btn-active {
        border-color: #3194ff;
        color: #3194ff;
    }
    .btn-group {
        margin-top: 40px;
        padding: 0 10px;
    }
    .btn {
        height: 90px;
        line-height: 90px;
        text-align: center;
        background-color: #3194ff;
        color: #ffffff;
        font-size: 34px;
        border-radius: 45px;
    }
</style>
