function Cache(){
    this.storage=null;
    this.tokenKey = "TOKEN_KEY"
    this.equipmentidKey = "EQUIPMENTID_KEY"
    this.userKey = "USER_KEY"
}
Cache.prototype={
    setToken : function(token){
        return this.__setItem(this.tokenKey,token);
    },
    getToken : function(){
        return this.__getItem(this.tokenKey);
    },
    setEquipmentId : function(equipmentId){
        return this.__setItem(this.equipmentidKey,equipmentId);
    },
    getEquipmentId : function(){
        return this.__getItem(this.equipmentidKey);
    },
    clearToken : function(){
        return this.__removeItem(this.tokenKey);
    },
    setUser : function(user){
        return this.__setItem(this.userKey, JSON.stringify(user));
    },
    getUser : function(){
        return this.__getItem(this.userKey).then(data => {
            if(data) {
                return JSON.parse(data);
            }
            return null;
        });
    },
    clearUser : function(){
        return this.__removeItem(this.userKey);
    },
    __check : function(){
        if(this.storage==null){
            this.storage = weex.requireModule("storage");
            this.setEquipmentId("8D3E8E0CF883C4E99329AF8A29300AB6")
        }
        return this.storage;
    },
    __setItem : function(key,value){
        let storage = this.__check();
        return new Promise((resolve, reject)=>{
            storage.setItem(key, value, function(e){
                if(e.result=='success'){
                    resolve(true)
                }else{
                    reject(false)
                }
            });
        });
    },
    __getItem : function(key){
        let storage = this.__check();
        return new Promise((resolve, reject)=>{
            storage.getItem(key, function(e){
                if(e.result=='success'){
                    resolve(e.data)
                }else{
                    reject(e)
                }
            });
        });
    },
    __removeItem : function(key){
        let storage = this.__check();
        return new Promise((resolve, reject)=>{
            storage.removeItem(key, function(e){
                if(e.result=='success'){
                    resolve(true)
                }else{
                    reject(false)
                }
            });
        });
    }
}
const  che = new Cache();
export  default che
