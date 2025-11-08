<template>
    <div class="list-item">
        <text class="title">{{formatTitle(data.title)}}</text>
        <div class="item-image">
            <image class="image" v-for="(img, index) in displayImages" :key="img + index" :src="img" @load="onImageLoad(img)"></image>
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
        computed: {
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
        padding: 0 10px 15px;
        justify-content: space-between;
        align-items: flex-start;
        width: 95%;
        margin: 10px auto;
        box-sizing: border-box;
    }
    .image{
        width: calc(33.33% - 6px);
        height: 150px;
        margin-right: 9px;
        border-radius: 8px;
        overflow: hidden;
    }
    /* 处理只有2张图片的情况 */
    .item-image .image:first-child:nth-last-child(2),
    .item-image .image:last-child:nth-child(2) {
        width: calc(50% - 5px);
        margin-right: 10px;
        /* 确保高度与默认样式一致 */
        height: 150px;
    }
    /* 最后一张图片去掉右外边距 */
    .image:last-child{
        margin-right: 0;
    }
</style>
