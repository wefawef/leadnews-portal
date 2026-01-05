<template>
    <div class="art-page" :style="pageStyle">
        <div class="top-bar" :style="topBarStyle">
            <text class="back-home" @click="goHome">&lt;</text>
        </div>
        <div class="news-container" :style="containerStyle">
            <iframe
                v-if="isWeb"
                ref="articleIframe"
                :src="resolvedStaticUrl"
                frameborder="0"
                :style="iframeStyle"
                sandbox="allow-same-origin allow-scripts allow-forms"
                @load="onIframeLoad"
            ></iframe>
            <web
                v-else
                ref="articleWeb"
                :src="resolvedStaticUrl"
                :style="iframeStyle"
                @pagestart="onNativePageStart"
                @pagefinish="onNativePageFinish"
                @error="onNativeError"
            ></web>
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
                iframeStyle: { flex: 1, height: '600px', width: '100%', border: 'none', overflow: 'hidden' },
                platform: 'Web',
                topBarHeight: 90,
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
        computed: {
            isWeb () {
                return String(this.platform).toLowerCase() === 'web'
            },
            pageStyle () {
                return this.isWeb ? { width: '100%' } : { width: 750 }
            },
            topBarStyle () {
                return this.isWeb ? { width: '100%' } : { width: 750 }
            },
            containerStyle () {
                return this.isWeb ? { width: '100%' } : { width: 750 }
            },
            resolvedStaticUrl () {
                const url = String(this.staticUrl || '').trim()
                if(!url) return url
                if(this.isWeb) return url
                if(/^https?:\/\//i.test(url)){
                    return this.normalizeAbsoluteUrl(url)
                }
                if(/^\/\//.test(url)) return 'http:' + url
                if(url.charAt(0) === '/'){
                    const rewritten = this.rewriteNativeProxyUrl(url)
                    if(rewritten) return rewritten
                }
                const origin = this.getNativeOrigin()
                if(url.charAt(0) === '/') return origin + url
                return origin + '/' + url
            }
        },
        created(){
            Api.setVue(this);
            this.platform = (typeof weex !== 'undefined' && weex.config && weex.config.env && weex.config.env.platform) ? weex.config.env.platform : 'Web'
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
            if (this.isWeb && typeof window !== 'undefined') {
                window.removeEventListener('resize', this.updateIframeSize);
            }
        },
        mounted(){
            // 初始化iframe高度
            this.updateIframeSize();
            // 监听窗口大小变化
            if (this.isWeb && typeof window !== 'undefined') {
                window.addEventListener('resize', this.updateIframeSize);
            }
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
                    const availableHeight = Math.max(0, pageHeight - this.topBarHeight);
                    if(this.isWeb){
                        this.iframeStyle = {
                            flex: 1,
                            height: availableHeight + 'px',
                            width: '100%',
                            border: 'none',
                            overflow: 'hidden'
                        };
                    }else{
                        this.iframeStyle = {
                            flex: 1,
                            height: availableHeight,
                            width: 750,
                            border: 'none',
                            overflow: 'hidden'
                        };
                    }
                } catch (error) {
                    console.error('更新iframe高度时出错:', error);
                }
            },
            goHome () {
                this.$router.replace({ name: 'Home' })
            },
            onIframeLoad() {
                this.time.loadOff = false;
                this.updateIframeSize();
            },
            onNativePageFinish () {
                this.time.loadOff = false;
                this.updateIframeSize();
            },
            onNativePageStart () {
                this.time.loadOff = true;
            },
            onNativeError (e) {
                this.time.loadOff = false;
                console.error('文章详情加载失败', e, this.resolvedStaticUrl)
                modal.toast({ message: '文章详情加载失败', duration: 2 })
            },
            getNativeOrigin () {
                let platform = ''
                try{
                    platform = (typeof weex !== 'undefined' && weex.config && weex.config.env && weex.config.env.platform) ? String(weex.config.env.platform).toLowerCase() : ''
                }catch(e){
                    platform = ''
                }
                let bundleUrl = ''
                try{
                    bundleUrl = (typeof weex !== 'undefined' && weex.config && weex.config.bundleUrl) ? String(weex.config.bundleUrl) : ''
                }catch(e){
                    bundleUrl = ''
                }
                let target = bundleUrl
                let tplIndex = target.indexOf('_wx_tpl=')
                if(tplIndex !== -1){
                    let encoded = target.substring(tplIndex + 8)
                    try{
                        target = decodeURIComponent(encoded)
                    }catch(e){
                        target = encoded
                    }
                }
                let match = target.match(/^(https?:)\/\/([^\/?#]+)(?=\/|\?|#|$)/i)
                if(match){
                    let protocol = match[1]
                    let hostPort = match[2]
                    let host = hostPort
                    let port = ''
                    if(hostPort.indexOf(':') !== -1){
                        let parts = hostPort.split(':')
                        host = parts[0]
                        port = parts.slice(1).join(':')
                    }
                    if(platform === 'android' && (host === '127.0.0.1' || host === 'localhost')){
                        host = '10.0.2.2'
                    }
                    return protocol + '//' + (port ? (host + ':' + port) : host)
                }
                return platform === 'android' ? 'http://10.0.2.2:8080' : 'http://127.0.0.1:8080'
            },
            getNativeHost () {
                const origin = this.getNativeOrigin()
                const match = String(origin).match(/^https?:\/\/([^\/?#]+)(?=\/|\?|#|$)/i)
                if(!match) return '10.0.2.2'
                const hostPort = match[1]
                const idx = hostPort.indexOf(':')
                return idx === -1 ? hostPort : hostPort.substring(0, idx)
            },
            rewriteNativeProxyUrl (url) {
                const u = String(url || '')
                if(!u) return u
                if(u.indexOf('/server_85') === 0){
                    return 'http://heima-app-java.research.itcast.cn' + u
                }
                if(u.indexOf('/article') === 0 || u.indexOf('/behavior') === 0 || u.indexOf('/user') === 0 || u.indexOf('/login') === 0){
                    const host = this.getNativeHost()
                    const rewritten = u.replace(/^\/(article|behavior|user|login)/, '')
                    return 'http://' + host + ':51601' + rewritten
                }
                return null
            },
            isPrivateIpv4 (host) {
                const h = String(host || '').trim()
                if(!/^\d+\.\d+\.\d+\.\d+$/.test(h)) return false
                const parts = h.split('.').map(n => parseInt(n, 10))
                if(parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return false
                const a = parts[0]
                const b = parts[1]
                if(a === 10) return true
                if(a === 172 && b >= 16 && b <= 31) return true
                if(a === 192 && b === 168) return true
                return false
            },
            normalizeAbsoluteUrl (url) {
                let platform = ''
                try{
                    platform = (typeof weex !== 'undefined' && weex.config && weex.config.env && weex.config.env.platform) ? String(weex.config.env.platform).toLowerCase() : ''
                }catch(e){
                    platform = ''
                }
                if(platform !== 'android') return url
                const match = String(url).match(/^(https?:\/\/)([^\/?#]+)([\s\S]*)$/i)
                if(!match) return url
                const prefix = match[1]
                const hostPort = match[2]
                const rest = match[3]
                let host = hostPort
                let port = ''
                if(hostPort.indexOf(':') !== -1){
                    const parts = hostPort.split(':')
                    host = parts[0]
                    port = parts.slice(1).join(':')
                }
                if(host === 'heima-app-java.research.itcast.cn' && rest.indexOf('/leadnews/') === 0){
                    host = this.getNativeHost()
                    if(!port) port = '9000'
                }
                if((port === '8081' || port === '8080') && (rest.indexOf('/server_85') === 0 || rest.indexOf('/article') === 0 || rest.indexOf('/behavior') === 0 || rest.indexOf('/user') === 0 || rest.indexOf('/login') === 0)){
                    const rewritten = this.rewriteNativeProxyUrl(rest)
                    if(rewritten) return rewritten
                }
                if(host === '127.0.0.1' || host === 'localhost'){
                    host = this.getNativeHost()
                }
                return prefix + (port ? (host + ':' + port) : host) + rest
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
    .top-bar{
        width: 750px;
        height: 90px;
        flex-direction: row;
        align-items: center;
        background-color: #ffffff;
        border-bottom-width: 1px;
        border-bottom-color: rgba(0,0,0,0.06);
        border-bottom-style: solid;
    }
    .back-home{
        font-size: 44px;
        padding-left: 24px;
        padding-right: 24px;
        color: #333333;
        height: 90px;
        line-height: 90px;
    }
    .news-container {
        flex: 1;
        width: 750px;
    }
</style>
