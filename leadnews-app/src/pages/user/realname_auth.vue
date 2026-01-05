<template>
    <div class="auth-wrapper">
        <wxc-minibar title="实名认证"
                     background-color="#3194ff"
                     text-color="#FFFFFF"
                     :useDefaultReturn="true"
                     @wxcMinibarLeftButtonClicked="minibarLeftButtonClick">
        </wxc-minibar>
        <scroller class="scroller">
            <div class="form-group">
                <text class="label">姓名</text>
                <input class="input" type="text" placeholder="请输入真实姓名" v-model="name" />
            </div>
            <div class="form-group">
                <text class="label">身份证号</text>
                <input class="input" type="text" placeholder="请输入身份证号码" v-model="idno" />
            </div>
            
            <div class="image-section">
                <text class="section-title">请上传身份证照片（必填）</text>
                <div class="image-row">
                    <div class="image-item" @click="pickImage('frontImage')">
                        <div class="upload-box" v-if="!frontImagePreview">
                            <text class="upload-icon">+</text>
                        </div>
                        <image v-else class="upload-img" :src="frontImagePreview" resize="cover"></image>
                        <text class="img-label">身份证正面</text>
                    </div>
                    <div class="image-item" @click="pickImage('backImage')">
                         <div class="upload-box" v-if="!backImagePreview">
                            <text class="upload-icon">+</text>
                        </div>
                        <image v-else class="upload-img" :src="backImagePreview" resize="cover"></image>
                        <text class="img-label">身份证背面</text>
                    </div>
                </div>
                <div class="image-row">
                    <div class="image-item" @click="pickImage('handheldImage')">
                         <div class="upload-box" v-if="!handheldImagePreview">
                            <text class="upload-icon">+</text>
                        </div>
                        <image v-else class="upload-img" :src="handheldImagePreview" resize="cover"></image>
                        <text class="img-label">手持身份证</text>
                    </div>
                    <div class="image-item" @click="pickImage('liveImage')">
                         <div class="upload-box" v-if="!liveImagePreview">
                            <text class="upload-icon">+</text>
                        </div>
                        <image v-else class="upload-img" :src="liveImagePreview" resize="cover"></image>
                        <text class="img-label">活体照片</text>
                    </div>
                </div>
            </div>

            <div class="btn-group">
                <text class="btn" @click="submit">提交认证</text>
            </div>
        </scroller>
        
        <!-- Hidden file input for web -->
        <input type="file" ref="fileInput" style="display:none" @change="handleFileChange" accept="image/*" />
    </div>
</template>

<script>
    import { WxcMinibar } from 'weex-ui';
    import Api from '@/apis/user/api';
    const modal = weex.requireModule('modal');

    export default {
        name: 'RealNameAuth',
        components: { WxcMinibar },
        data() {
            return {
                name: '',
                idno: '',
                frontImage: null,
                backImage: null,
                handheldImage: null,
                liveImage: null,
                
                frontImagePreview: '',
                backImagePreview: '',
                handheldImagePreview: '',
                liveImagePreview: '',
                
                defaultImage: 'https://via.placeholder.com/300x200?text=Upload',
                currentUploadType: ''
            }
        },
        created() {
            Api.setVue(this);
        },
        methods: {
            minibarLeftButtonClick() {
                this.$router.back();
            },
            pickImage(type) {
                this.currentUploadType = type;
                if (weex.config.env.platform === 'Web') {
                    if (this.$refs.fileInput) {
                        this.$refs.fileInput.click();
                    } else {
                        modal.toast({ message: '暂不支持此环境上传', duration: 2 });
                    }
                } else {
                    const imageModule = weex.requireModule('image');
                    if (imageModule && imageModule.pickImage) {
                         imageModule.pickImage((res) => {
                             if (res && res.path) {
                                 this[this.currentUploadType + 'Preview'] = res.url || ('file://' + res.path);
                                 this[this.currentUploadType] = res.url || ('file://' + res.path);
                             }
                         });
                    } else {
                        modal.toast({ message: 'Native模块未加载', duration: 2 });
                    }
                }
            },
            handleFileChange(event) {
                const file = event.target.files[0];
                if (!file) return;
                
                // Create preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    this[this.currentUploadType + 'Preview'] = e.target.result;
                };
                reader.readAsDataURL(file);
                
                // Store file object
                this[this.currentUploadType] = file;
                
                // Reset input
                event.target.value = '';
            },
            submit() {
                if (!this.name || !this.idno) {
                    modal.toast({ message: '请填写姓名和身份证号', duration: 2 });
                    return;
                }
                if (!this.frontImage || !this.backImage || !this.handheldImage || !this.liveImage) {
                    modal.toast({ message: '请上传所有四张照片', duration: 2 });
                    return;
                }

                let params = {
                    name: this.name,
                    idno: this.idno,
                    frontImage: this.frontImage,
                    backImage: this.backImage,
                    handheldImage: this.handheldImage,
                    liveImage: this.liveImage
                };

                modal.toast({ message: '正在提交...', duration: 1 });
                
                Api.applyForRealName(params).then(d => {
                    if (d.code == 200 || d.code == 0) { // Assuming 0 or 200 is success
                        modal.toast({ message: '提交成功', duration: 2 });
                        setTimeout(() => {
                            this.$router.back();
                        }, 2000);
                    } else {
                        modal.toast({ message: d.errorMessage || '提交失败', duration: 2 });
                    }
                }).catch(e => {
                    console.error(e);
                    modal.toast({ message: '网络错误', duration: 2 });
                });
            }
        }
    }
</script>

<style lang="less" scoped>
    .auth-wrapper {
        flex: 1;
        background-color: #f5f7fa;
    }
    .scroller {
        flex: 1;
    }
    .form-group {
        background-color: #ffffff;
        padding: 30px;
        border-bottom-width: 1px;
        border-bottom-color: #eeeeee;
        flex-direction: row;
        align-items: center;
    }
    .label {
        width: 180px;
        font-size: 32px;
        color: #333333;
    }
    .input {
        flex: 1;
        height: 60px;
        font-size: 32px;
        color: #333333;
        placeholder-color: #999999;
        border: none;
        outline: none;
    }
    .image-section {
        background-color: #ffffff;
        margin-top: 20px;
        padding: 30px;
    }
    .section-title {
        font-size: 30px;
        color: #666666;
        margin-bottom: 20px;
    }
    .image-row {
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    .image-item {
        width: 330px;
        align-items: center;
    }
    .upload-box {
        width: 330px;
        height: 220px;
        background-color: #f0f0f0;
        border-radius: 10px;
        margin-bottom: 10px;
        justify-content: center;
        align-items: center;
        border-width: 2px;
        border-style: dashed;
        border-color: #cccccc;
    }
    .upload-icon {
        font-size: 80px;
        color: #cccccc;
    }
    .upload-img {
        width: 330px;
        height: 220px;
        background-color: #f0f0f0;
        border-radius: 10px;
        margin-bottom: 10px;
    }
    .img-label {
        font-size: 28px;
        color: #666666;
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
