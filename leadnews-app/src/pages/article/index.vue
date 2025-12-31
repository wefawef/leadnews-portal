<template>
    <div class="art-page">
        <div class="news-container">
            <iframe
                ref="articleIframe"
                :src="staticUrl"
                frameborder="0"
                :style="iframeStyle"
                sandbox="allow-same-origin allow-scripts allow-forms"
                @load="onIframeLoad"
            ></iframe>
        </div>
    </div>
</template>

<script>
    import { Utils } from 'weex-ui'
    import Api from '@/apis/article/api'

    const modal = weex.requireModule("modal")

    export default {
        name: "index",
        props:['id','title','staticUrl','createdTime','authorId'],
        data(){
            return {
                iframeStyle: { height: '600px', width: '100%', border: 'none', overflow: 'hidden' },
                time : {
                    timer:null,//定时器
                    timerStep:100,//定时器步长
                    readDuration:0,//阅读时长
                    percentage:0,//阅读比例
                    loadDuration:0,//加载时长
                    loadOff:true//加载完成控制
                }
            }
        },
        created(){
            Api.setVue(this);
            // 保持阅读行为记录逻辑
            let _this = this;
            this.time.timer = setInterval(function(){
                _this.time.readDuration+=_this.time.timerStep
                if(_this.time.loadOff){
                    _this.time.loadDuration+=_this.time.timerStep
                }
            },this.time.timerStep)
        },
        destroyed(){
            this.read();
            // 移除事件监听
            window.removeEventListener('resize', this.updateIframeSize);
        },
        mounted(){
            // 初始化iframe高度
            this.updateIframeSize();
            // 监听窗口大小变化
            window.addEventListener('resize', this.updateIframeSize);
        },
        methods : {
            // 阅读行为
            read : function(){
                clearInterval( this.time.timer)
                // 由于移除了scroller，percentage可能无法准确计算，这里设为100或者保持0
                this.time.percentage = 100; 
                Api.read({articleId:this.id,readDuration:this.time.readDuration,percentage:this.time.percentage,loadDuration:this.time.loadDuration});
            },
            updateIframeSize() {
                try {
                    const pageHeight = Utils.env.getPageHeight();
                    this.iframeStyle = {
                        height: pageHeight + 'px',
                        width: '100%',
                        border: 'none',
                        overflow: 'hidden'
                    };
                } catch (error) {
                    console.error('更新iframe高度时出错:', error);
                }
            },
            onIframeLoad() {
                this.time.loadOff = false;
                this.updateIframeSize();
            }
        }
    }
</script>

<style scoped>
    .art-page{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 750px;
        flex-direction: column;
    }
    .news-container {
        flex: 1;
        width: 750px;
    }
</style>
