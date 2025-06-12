<template>
  <div class="sign-in">
    <div class="form-container">
      <h1>{{ isLoginMode ? '登录' : '注册' }}</h1>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="username">用户名:</label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
            :class="{ 'error': errors.username }"
            placeholder="请输入用户名"
            required
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="password">密码:</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            :class="{ 'error': errors.password }"
            placeholder="请输入密码"
            required
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div v-if="!isLoginMode" class="form-group">
          <label for="role">角色:</label>
          <select id="role" v-model="formData.role">
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            :disabled="loading"
            class="submit-btn"
          >
            {{ loading ? '处理中...' : (isLoginMode ? '登录' : '注册') }}
          </button>
        </div>

        <div class="switch-mode">
          <span>
            {{ isLoginMode ? '还没有账号？' : '已有账号？' }}
            <a href="#" @click.prevent="switchMode">
              {{ isLoginMode ? '立即注册' : '立即登录' }}
            </a>
          </span>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SignIn"
}
</script>

<script setup lang="ts">

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { authApi } from '@/api/auth'
import type {ApiResponse} from '@/interface'
//import { authApi, tokenManager } from '@/api/auth'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const isLoginMode = ref(true)
const loading = ref(false)

const formData = reactive({
  username: '',
  password: '',
  role: 'user'
})

const errors = reactive({
  username: '',
  password: '',
  general: ''
})

// 验证表单
const validateForm = () => {
  // 清除之前的错误
  errors.username = ''
  errors.password = ''
  errors.general = ''

  let isValid = true

  // 验证用户名
  if (!formData.username.trim()) {
    errors.username = '用户名不能为空'
    isValid = false
  }

  // 验证密码
  if (!formData.password) {
    errors.password = '密码不能为空'
    isValid = false
  }

  return isValid
}

// 处理登录
const handleLogin = async () => {
  try {
    const response = await authApi.login({
      username: formData.username,
      password: formData.password,
      role: formData.role
    })

    if (response.success) {
      // 更新用户状态
      userStore.login(response.data.user, response.data.token)

      // 显示成功消息
      alert('登录成功！')

      // 跳转到主页
      router.push('/')
    } else {
      errors.general = response.message || '登录失败'
      alert(errors.general)
    }
  } catch (error:any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    errors.general = error.message || '登录失败，请检查网络连接'
    alert(errors.general)
  }
}

// 处理注册
const handleRegister = async () => {
  try {
    const response:ApiResponse = await authApi.register({
      username: formData.username,
      password: formData.password,
      role: formData.role
    })

    if (response.success) {
      alert('注册成功！请登录')
      // 切换到登录模式
      isLoginMode.value = true
      // 清空表单
      formData.password = ''
    } else {
      errors.general = response.message || '注册失败'
    }
  } catch (error:any) {// eslint-disable-line @typescript-eslint/no-explicit-any
    errors.general = error.message || '注册失败，请检查网络连接'
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  errors.general = ''

  try {
    if (isLoginMode.value) {
      await handleLogin()
    } else {
      await handleRegister()
    }
  } finally {
    loading.value = false
  }
}

// 切换登录/注册模式
const switchMode = () => {
  isLoginMode.value = !isLoginMode.value
  // 清空错误信息
  errors.username = ''
  errors.password = ''
  errors.general = ''
  // 重置角色选择
  formData.role = 'user'
}
</script>

<style scoped>
.sign-in {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background-color: #78ecb4;
  padding: 20px;
}

.form-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.auth-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: #4CAF50;
}

input.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}

.form-actions {
  margin: 30px 0 20px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
}

.switch-mode a {
  color: #4CAF50;
  text-decoration: none;
}

.switch-mode a:hover {
  text-decoration: underline;
}

.test-accounts {
  margin-top: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid #4CAF50;
}

.test-accounts h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.test-accounts p {
  margin: 5px 0;
  font-size: 12px;
  color: #666;
}

/* 错误提示样式 */
.error-general {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}
</style>
