<template>
    <div class="wrapper">
        <!-- 二级路由视图 -->
        <div class="router-body"><router-view/></div>
        <!-- 底部菜单 -->
        <div class="main-body"><Menu/></div>
    </div>
</template>

<script>
    // 引入底部菜单
    import Menu from "@/compoents/menus/menu";

    export default {
        name: 'HeiMa-Layout-Mian',
        components: {Menu}
    }
</script>

<style scoped>
    .wrapper{
        flex-direction : column;
        width: 750px;
    }
    .router-body{
        flex: 1;
        flex-direction : column;
        padding-bottom: 120px;
    }
    .main-body{
        position: fixed;
        left: 0;
        bottom: 0;
        width: 750px;
        z-index: 9999;
    }
</style>
