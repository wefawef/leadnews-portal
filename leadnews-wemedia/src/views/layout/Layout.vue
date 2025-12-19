<template>
  <div class="app-wrapper" :class="{hideSidebar: collapse}">
    <sidebar :collapse="collapse" class="sidebar-container"/>
    <div class="main-container">
      <navbar />
      <app-main/>
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from "./components";
import emitter from  '@/utils/event'

export default {
  name: "Layout",
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  data () {
    return {
      collapse:false
    }
  },
  created () {
     emitter.$on('changeCollapse',() => {
         this.collapse = !this.collapse
     })  
    }
};
</script>
<style lang="scss" scoped>

</style>

