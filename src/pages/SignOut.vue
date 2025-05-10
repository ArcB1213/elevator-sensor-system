<template>
  <h1>登出成功</h1>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/store/user";
import { useRouter } from "vue-router";
import { onMounted } from "vue";

const user = useUserStore();
const router = useRouter();

const handleSignOut = () => {
  user.signStatus = false; // Set signStatus to false
  user.username = ""; // Clear username
  user.password = ""; // Clear password
  alert("登出成功！"); // Show alert message
  router.push("/"); // Redirect to the main page after logout
};

onMounted(() => {
  handleSignOut();
});
</script>
