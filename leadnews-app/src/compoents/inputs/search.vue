<template>
    <div class="body" :style="getBodyStyle">
        <text v-if="icon!=''" class="icon" :style="getIconStyle" @click="onSubmit">{{icon}}</text>
        <input @blur="onBlur"
               @focus="onFocus"
               @input="onInput"
               @return="onSubmit"
               @change="onChange"
               :return-key-type="returnType"
               :autofocus="autofocus"
               autocomplete="off"
               :type="type"
               :placeholder="placeholder"
               class="input"
               :value="value"
               :style="getInputStyle"
               />
        <text v-if="showButton" class="btn" :style="getButtonStyle" @click="onSubmit">{{buttonText}}</text>
        <text v-else class="skin">&nbsp;</text>
    </div>
</template>

<script>
    export default {
        props:{
            flex:{
                type:Number,
                default:1
            },
            height:{
                type:Number,
                default:70
            },
            autofocus:{
                type:Boolean,
                default:false
            },
            leftWidth:{
                type:String,
                default:"5"
            },
            icon:{
              type:String,
              default:'\uf044'
            },
            rightWidth:{
                type:String,
                default:"5"
            },
            type:{
              type:String,
              default:'text'
            },
            returnType:{
                type:String,
                default:'search'
            },
            color:{
              type:String,
              default:'#efefef'
            },
            iconColor:{
                type:String,
                default:'#a5a5a5'
            },
            borderWidth:{
                type:Number,
                default:0
            },
            backgroundColor:{
              type:String,
              default:'#f7f8fa'
            },
            placeholder:{
                type:String,
                default:'请输入...'
            },
            value:{
                type:String,
                default:''
            },
            radius:{
                type:Number,
                default:30
            },
            showButton:{
                type:Boolean,
                default:true
            },
            buttonText:{
                type:String,
                default:'搜索'
            },
            buttonBackgroundColor:{
                type:String,
                default:'#3296fa'
            },
            buttonTextColor:{
                type:String,
                default:'#ffffff'
            }
        },
        data(){
          return {
              inpValue: this.value
          }
        },
        watch: {
            value(newVal) {
                this.inpValue = newVal;
            }
        },
        computed:{
            getInputStyle:function(){
                return {
                    marginLeft:(this.icon==''?'20px':'1px'),
                    height: (this.height - 10) + "px",
                    lineHeight: (this.height - 10) + "px",
                    fontSize: (this.height / 70) * 32 + "px",
                    borderWidth: 0,
                    borderTopWidth: 0,
                    borderRightWidth: 0,
                    borderBottomWidth: 0,
                    borderLeftWidth: 0,
                    borderColor: "transparent",
                    backgroundColor: "transparent",
                    outlineWidth: 0,
                    outlineStyle: "solid",
                    outlineColor: "transparent",
                    boxShadow: "none"
                }
            },
            getBodyStyle:function(){
                return {
                    borderRadius:this.radius+"px",
                    marginLeft:this.leftWidth+'px',
                    marginRight:this.rightWidth+'px',
                    borderColor: this.borderWidth > 0 ? this.color : 'transparent',
                    borderWidth: (this.borderWidth > 0 ? this.borderWidth : 0) + "px",
                    backgroundColor: this.backgroundColor,
                    'flex':this.flex,
                    'height':this.height+'px'
                }
            },
            getIconStyle:function(){
                return {
                    color:this.iconColor,
                    width:(this.height-10)+"px",
                    height:(this.height-10)+"px",
                    lineHeight:(this.height-10)+"px",
                    fontSize:(this.height/70)*32+"px"
                }
            },
            getButtonStyle:function(){
                return {
                    backgroundColor: this.buttonBackgroundColor,
                    color: this.buttonTextColor,
                    height: (this.height - 18) + "px",
                    lineHeight: (this.height - 18) + "px",
                    fontSize: (this.height / 70) * 30 + "px",
                    paddingLeft: "18px",
                    paddingRight: "18px",
                    borderRadius: (this.height - 18) / 2 + "px"
                }
            }
        },
        methods:{
            onBlur() {
                const self = this;
                setTimeout(() => {
                    self.$emit('onBlur', { value: self.inpValue });
                }, 10);
            },
            onFocus : function(){
                this.$emit('onFocus', {});
            },
            onChange : function(){
                this.$emit('onChange', this.inpValue);
            },
            onSubmit : function(){
                if(this.inpValue!=''){
                    this.$emit('onSubmit', this.inpValue);
                }
            },
            onInput : function(e){
                this.inpValue = e.value;
                this.$emit('onInput', this.inpValue);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import '../../styles/common';
    .body{
        flex-direction: row;
        align-items: center;
        padding-left: 10px;
        padding-right: 10px;
    }
    .icon{
        font-size: 28px;
        text-align: center;
    }
    .input{
        flex:1;
        border-width: 0px;
        border-top-width: 0px;
        border-right-width: 0px;
        border-bottom-width: 0px;
        border-left-width: 0px;
        border-color: transparent;
        background-color: transparent;
        placeholder-color:'a5a5a5'
    }
    .skin{
        width: 20px;
    }
    .btn{
        text-align: center;
        margin-left: 10px;
    }
</style>
