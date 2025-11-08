<template>
    <div class="list-item">
        <text class="title">{{formatTitle(data.title)}}</text>
        <div class="image-container">
            <image class="image" :src="data.image[0]" :key="data.image[0]" @load="onImageLoad"/>
        </div>
        <div class="tags">
            <text class="tags-text tags-icon">{{data.icon}}</text>
            <text class="tags-text">{{data.source}}</text>
            <text class="tags-text">评论 {{data.commit}}</text>
            <text class="tags-text date">{{formatDate(data.date)}}</text>
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
        height: auto;
        min-height: @list-1-height;
    }
    .image-container{
        width: calc(33.33% - 6px);
        margin: 10px 9px 15px 0;
        padding-left: 10px;
        box-sizing: border-box;
    }
    .image{
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        overflow: hidden;
    }
</style>
