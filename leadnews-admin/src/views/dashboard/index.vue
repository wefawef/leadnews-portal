<template>
  <div class="dashboard-container">
    <img src="@/assets/login_bg.jpg" alt="Welcome" class="welcome-image">
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
.welcome-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
