<template>
    <div class="list-item">
        <text class="title" :lines="2" :style="titleStyle">{{data.title}}</text>
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
        name: "article_0",
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
            }
        }
    }
</script>

<style lang="less" scoped>
    @import '../../styles/article';
    .list-item{
    }
</style>
