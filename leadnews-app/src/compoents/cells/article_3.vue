<template>
    <div class="list-item">
        <text class="title" :lines="2" :style="titleStyle">{{formatTitle(data.title)}}</text>
        <div class="item-image">
            <image
                class="image"
                resize="cover"
                v-for="(img, index) in displayImages"
                :key="img + index"
                :src="img"
                :style="{ marginRight: index === displayImages.length - 1 ? '0px' : '9px' }"
                @load="onImageLoad(img)"
            ></image>
        </div>
        <div class="tags">
            <text class="tags-text tags-icon">{{data.icon}}</text>
            <text class="tags-text">{{data.source}}</text>
            <text class="tags-text">评论 {{data.comment || data.commit}}</text>
            <text class="tags-text date">{{formatDate(data.date)}}</text>
        </div>
    </div>
</template>

<script>
    export default {
        name: "article_3",
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
            },
            // 限制最多显示3张图片
            displayImages: function() {
                if (!this.data.image || !Array.isArray(this.data.image)) {
                    return [];
                }
                return this.data.image.slice(0, 3);
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
            onImageLoad: function(img) {
                // 图片加载完成后可以添加逻辑
                console.log('多图模式图片加载完成:', img);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import '../../styles/article';
    .list-item{
        height: auto;
        min-height: @list-2-height;
    }
    .item-image{
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        width: 100%;
        margin: 20px 0;
        box-sizing: border-box;
    }
    .image{
        flex: 1;
        height: 150px;
        border-radius: 8px;
        overflow: hidden;
        background-color: #f0f0f0;
    }
</style>
