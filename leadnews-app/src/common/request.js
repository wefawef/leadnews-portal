var crypto =require('crypto-js')
function stringifyQuery(parms){
    if(!parms) return ''
    let arr = []
    for (var key in parms) {
        if(!Object.prototype.hasOwnProperty.call(parms, key)) continue
        let value = parms[key]
        if(value === undefined) continue
        if(value === null) value = ''
        if(Array.isArray(value)){
            for (var i = 0; i < value.length; i++) {
                let v = value[i]
                if(v === undefined) continue
                if(v === null) v = ''
                arr.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(v)))
            }
        }else{
            arr.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)))
        }
    }
    return arr.join("&")
}
function isWebPlatform(){
    try{
        return weex && weex.config && weex.config.env && weex.config.env.platform === 'Web'
    }catch(e){
        return false
    }
}
var __nativeOriginCache = null
function getNativeOrigin(){
    if(__nativeOriginCache) return __nativeOriginCache
    let platform = ''
    try{
        platform = (weex && weex.config && weex.config.env && weex.config.env.platform) ? String(weex.config.env.platform).toLowerCase() : ''
    }catch(e){
        platform = ''
    }
    let bundleUrl = ''
    try{
        bundleUrl = (weex && weex.config && weex.config.bundleUrl) ? String(weex.config.bundleUrl) : ''
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
        __nativeOriginCache = protocol + '//' + (port ? (host + ':' + port) : host)
        return __nativeOriginCache
    }
    __nativeOriginCache = platform === 'android' ? 'http://10.0.2.2:8080' : 'http://127.0.0.1:8080'
    return __nativeOriginCache
}
function getNativeHost(){
    let origin = getNativeOrigin()
    let match = origin.match(/^https?:\/\/([^\/?#]+)(?=\/|\?|#|$)/i)
    if(!match) return '10.0.2.2'
    let hostPort = match[1]
    let idx = hostPort.indexOf(':')
    return idx === -1 ? hostPort : hostPort.substring(0, idx)
}
function normalizeUrl(url){
    if(isWebPlatform()) return url
    if(!url) return url
    if(/^file:\/\//i.test(url)) return url
    if(/^https?:\/\//i.test(url)){
        let platform = ''
        try{
            platform = (weex && weex.config && weex.config.env && weex.config.env.platform) ? String(weex.config.env.platform).toLowerCase() : ''
        }catch(e){
            platform = ''
        }
        if(platform === 'android'){
            let match = url.match(/^(https?:\/\/)([^\/?#]+)([\s\S]*)$/i)
            if(match){
                let prefix = match[1]
                let hostPort = match[2]
                let rest = match[3]
                let host = hostPort
                let port = ''
                if(hostPort.indexOf(':') !== -1){
                    let parts = hostPort.split(':')
                    host = parts[0]
                    port = parts.slice(1).join(':')
                }
                if(host === '127.0.0.1' || host === 'localhost'){
                    host = getNativeHost()
                    return prefix + (port ? (host + ':' + port) : host) + rest
                }
            }
        }
        return url
    }
    if(/^\/\//.test(url)) return 'http:' + url
    if(url.charAt(0) !== '/') url = '/' + url
    if(url.indexOf('/server_85') === 0){
        return 'http://heima-app-java.research.itcast.cn' + url
    }
    if(url.indexOf('/article') === 0 || url.indexOf('/behavior') === 0 || url.indexOf('/user') === 0 || url.indexOf('/login') === 0){
        let host = getNativeHost()
        let rewritten = url.replace(/^\/(article|behavior|user|login)/, '')
        return 'http://' + host + ':51601' + rewritten
    }
    return getNativeOrigin() + url
}
function Request() {
    this.stream=null;
    this.store = null;
}
Request.prototype={
    setStore : function(store){
        this.store = store
    },
    __check : function(){
        if(!this.stream){
            this.stream = weex.requireModule("stream");
            // // user=1
            // this.store.setToken("eyJhbGciOiJIUzUxMiIsInppcCI6IkdaSVAifQ.H4sIAAAAAAAAADWLQQqEMAwA_5KzPcQ2LfU3iWbZCkIhFVyW_fvGg7cZhvnCPhosIBXzq2gKlYlDypsE0RVDwiI0C9FaIkzQeMCClCNSzDVNYKf4bR8betzdzPWt7WA3Pjc37t1Zr_6cZb7P5g1_fxA93U6AAAAA.vWYfL-u7d2no6iVdqS-DzlD4WcQrSsx_U8gLjvZJQ9Itmlw1zeQLCl4sVZ_4EeU33ExCNCHjuCTPoGay4OYEcw")
        }
        return this.stream;
    },
    // 自动设置设备主键
    postByEquipmentId : function(url,body){
        return this.store.getEquipmentId().then(equipmentId=>{
            body['equipment_id']=equipmentId
            return new Promise((resolve, reject) => {
                this.post(url,body).then((d)=>{
                    resolve(d);
                }).catch((e)=>{
                    reject(e);
                })
            })
        }).catch(e=>{
            return new Promise((resolve, reject) => {
                reject(e);
            })
        })
    },
    // 自动设置设备主键
    getByEquipmentId : function(url,body){
        return this.store.getEquipmentId().then(equipmentId=>{
            body['equipmentId']=equipmentId
            return new Promise((resolve, reject) => {
                this.get(url,body).then((d)=>{
                    resolve(d);
                }).catch((e)=>{
                    reject(e);
                })
            })
        }).catch(e=>{
            return new Promise((resolve, reject) => {
                reject(e);
            })
        })
    },
    __fetch : function(type,path,token,time,parms,body){
        let stream = this.__check()
        return new Promise((resolve, reject) => {
            let temp = {
                method: type,
                url: normalizeUrl(path),
                type: 'json',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'token': token,
                    't': '' + time,
                    'md': this.sign(parms)
                }
            }
            if(body){
                temp['body'] = JSON.stringify(body)
            }
            stream.fetch(temp, (response) => {
                if (response.status == 200) {
                    resolve(response.data)
                } else {
                    reject(response)
                }
            })
        });
    },
    post : function(path,body,parms){
        let time = new Date().getTime()
        if(parms==undefined)parms={}
        else{
            path = path+"?"+stringifyQuery(parms)
        }
        parms['t']=time
        return this.store.getToken().then(token=>{
            return  this.__fetch('POST',path,token,time,parms,body)
        }).catch(e=>{
            if(e.status){
                return new Promise((resolve, reject) => {
                    reject(e)
                });
            }else{
                return  this.__fetch('POST',path,'',time,parms,body)
            }
        })
    },
    postMultipart : function(path,params){
        return this.store.getToken().then(token=>{
             if (weex.config.env.platform === 'Web') {
                 let formData = new FormData();
                 for (let key in params) {
                     formData.append(key, params[key]);
                 }
                 let stream = this.__check()
                 return new Promise((resolve, reject) => {
                    stream.fetch({
                        method: 'POST',
                        url: path,
                        type: 'json',
                        headers: {
                            'token': token
                        },
                        body: formData
                    }, (response) => {
                        if (response.status == 200) {
                            resolve(response.data)
                        } else {
                            reject(response)
                        }
                    })
                });
             } else {
                 const imageModule = weex.requireModule('image');
                 return new Promise((resolve, reject) => {
                     if (imageModule && imageModule.uploadImage) {
                         imageModule.uploadImage(normalizeUrl(path), params, { 'token': token }, (res) => {
                             if (res.success) {
                                 try {
                                     let data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                                     resolve(data);
                                 } catch(e) {
                                     resolve(res.data);
                                 }
                             } else {
                                 reject({ errorMessage: res.message || 'Upload failed' });
                             }
                         });
                     } else {
                         reject({ errorMessage: 'Native upload not supported' });
                     }
                 });
             }
        })
    },
    get : function(path,parms){
        console.log('执行GET请求:', path);
        // 确保parms存在
        if(!parms) parms = {};
        
        if(Object.keys(parms).length > 0){
            let tmp = stringifyQuery(parms)
            if(path.indexOf("?")==-1){
                tmp="?"+tmp;
            }else{
                tmp="&"+tmp;
            }
            path+=tmp;
        }
        let time = new Date().getTime()
        parms['t']=time
        return this.store.getToken().then(token=>{
            console.log('使用token发送GET请求:', path);
            return  this.__fetch('GET',path,token,time,parms)
        }).catch(e=>{
            if(e.status){
                console.error('获取token失败，请求被拒绝:', e);
                return new Promise((resolve, reject) => {
                    reject(e)
                });
            }else{
                console.log('无token，使用空token发送GET请求:', path);
                return  this.__fetch('GET',path,'',time,parms)
            }
        })
    },
    sign : function(parms){
        let arr = [];
        for (var key in parms) {
            arr.push(key)
        }
        arr.sort();
        let str = '';
        for (var i in arr) {
            if(str!=''){
                str+="&"
            }
            str += arr[i] + "=" + parms[arr[i]]
        }
        return crypto.MD5(str).toString()
    }
}
export  default new Request()
