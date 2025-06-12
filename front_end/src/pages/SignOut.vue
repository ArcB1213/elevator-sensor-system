<template>
  <h1>登出成功</h1>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/store/user";
import { useRouter } from "vue-router";
import {onMounted, reactive} from "vue";
// api/auth.js - 认证相关API

const userStore = useUserStore();
const router = useRouter();
const errors = reactive({
  username: '',
  password: '',
  general: ''
})

const handleSignOut = async () => {
  try {
    userStore.logout()
    router.push('/') // 跳转到主页
  } catch (error: any) {// eslint-disable-line @typescript-eslint/no-explicit-any
    errors.general = error.message || '登出失败，请检查网络连接'
    router.push('/') // 跳转到登录页面
  }
}

onMounted(() => {
  handleSignOut();
});
</script>
