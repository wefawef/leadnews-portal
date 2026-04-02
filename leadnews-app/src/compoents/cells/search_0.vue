<template>
    <div :class="isChip ? 'chip-body' : 'cell-body'">
        <text v-if="!isChip" class="icon">{{icon}}</text>
        <text v-if="isChip" class="chip-title" lines="1" @click="onClickText">{{title}}</text>
        <text v-else class="title" @click="onClickText">{{title}}</text>
        <text v-if="showDelete" class="icon" :class="isChip ? 'chip-del' : ''" @click="onDeleteHistory">&#xf00d;</text>
    </div>
</template>

<script>
    export default {
        name: "search_0",
        props:{
            id:{
                type:String,
                default:''
            },
            title:{
                type:String,
                default:'显示字'
            },
            icon:{
                type:String,
                default:'\uf017'
            },
            mode:{
                type:String,
                default:'list'
            },
            showDelete:{
                type:Boolean,
                default:true
            }
        },
        computed:{
            isChip(){
                return this.mode === 'chip'
            }
        },
        methods : {
            onDeleteHistory : function(){
                this.$emit("onDeleteHistory",this.id)
            },
            onClickText :function(){
                this.$emit("onClickText",this.title)
            }
        }
    }
</script>

<style lang="less" scoped>
    @import '../../styles/common';
    .cell-body{
       flex-direction: row;
        font-size: 36px;
        align-items: center;
        border-bottom-color: #e8e8e8;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        padding: 17px 20px;
        background-color: #ffffff;
    }
    .title{
        flex: 1;
        color: #333333;
    }
    .icon{
        font-size: 40px;
        color: #ebebeb;
        width: 45px;
        margin-right: 10px;
    }
    .chip-body{
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 14px 18px;
        margin-right: 12px;
        background-color: #f7f8fa;
        border-radius: 40px;
        min-width: 120px;
        max-width: 520px;
    }
    .chip-title{
        flex: 1;
        font-size: 28px;
        color: #333333;
    }
    .chip-del{
        width: 28px;
        margin-left: 12px;
        margin-right: 0px;
        font-size: 30px;
        color: #999999;
    }
</style>
