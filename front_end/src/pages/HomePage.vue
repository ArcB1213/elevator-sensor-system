<template>
  <h1>Welcome to the Home Page</h1>
  <div v-if="useUser.isAuthenticated">
    <h2>欢迎，{{ useUser.user?.username }}！</h2>
  </div>
  <div v-else>
    <h2>请先登录！</h2>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/store/user";

const useUser = useUserStore();
</script>

<style scoped>
h1 {
  color: rgb(206, 244, 167);
}
h2 {
  color: #f43333;
}
</style>
