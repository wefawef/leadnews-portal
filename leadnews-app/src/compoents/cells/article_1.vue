<template>
    <div class="list-item">
        <div class="content-box">
            <text class="title" :lines="2" :style="titleStyle">{{formatTitle(data.title)}}</text>
            <div class="tags">
                <text class="tags-text tags-icon">{{data.icon}}</text>
                <text class="tags-text">{{data.source}}</text>
                <text class="tags-text">评论 {{data.commit}}</text>
                <text class="tags-text date">{{formatDate(data.date)}}</text>
            </div>
        </div>
        <div class="image-container">
            <image class="image" resize="cover" :src="data.image[0]" :key="data.image[0]" @load="onImageLoad"/>
        </div>
    </div>
</template>

<script>
    export default {
        name: "article_1",
        props:{
            data:{
                type:Object
            }
        },
        data () {
            return {
                platform: (typeof weex !== 'undefined' && weex.config && weex.config.env && weex.config.env.platform) ? weex.config.env.platform : 'Web'
            }
        },
        computed: {
            isWeb () {
                return String(this.platform).toLowerCase() === 'web'
            },
            titleStyle () {
                return this.isWeb ? {} : { fontSize: '28px', lineHeight: '40px', paddingBottom: '12px' }
            }
        },
        methods : {
            formatDate:function(time){
                return this.$date.format13(time);
            },
            formatTitle:function(title){
                if(title.length>50){
                    return title.substring(0,49);
                }
                return title;
            },
            onImageLoad: function() {
                // 图片加载完成后可以添加逻辑
                console.log('图片加载完成:', this.data.image[0]);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import '../../styles/article';
    .list-item{
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
    }
    .content-box {
        flex: 1;
        padding-right: 24px;
        flex-direction: column;
        justify-content: space-between;
        min-height: 160px;
    }
    .image-container{
        width: 220px;
        height: 160px;
        margin: 0;
    }
    .image{
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
        overflow: hidden;
        background-color: #f0f0f0;
    }
    .tags {
        margin: 0;
        margin-top: 10px;
    }
</style>
