import axios from 'axios'
import type { User,UserData,ApiResponse} from '@/interface'
// 创建axios实例
const auth = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Token管理
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_info'

export const tokenManager = {
  // 获取token
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  // 设置token
  setToken(token:string) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  // 删除token
  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  // 获取用户信息
  getUser() {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },

  // 设置用户信息
  setUser(user:User|null) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  // 删除用户信息
  removeUser() {
    localStorage.removeItem(USER_KEY)
  },

  // 清除所有认证信息
  clearAuth() {
    this.removeToken()
    this.removeUser()
  }
}

// 请求拦截器 - 自动添加token
auth.interceptors.request.use(
  config => {
    const token = tokenManager.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 请求发送前的错误处理
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理token过期
auth.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地认证信息
      tokenManager.clearAuth()
      // 可以在这里触发重新登录
      window.location.href = '/SignIn'
    }

    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

// 认证相关API
export const authApi = {
  // 用户登录
  async login(credentials:UserData) {
    try {
      const response:ApiResponse = await auth.post('/auth/login', credentials)

      if (response.success && response.data) {
        // 保存token和用户信息
        tokenManager.setToken(response.data.token)
        tokenManager.setUser(response.data.user)
      }

      return response
    } catch (error) {
      throw error
    }
  },

  // 用户注册
  async register(userData:UserData) {
    try {
      const response:ApiResponse = await auth.post('/auth/register', userData)
      return response
    } catch (error) {
      throw error
    }
  },

  // 验证token
  async verifyToken() {
    try {
      const response:ApiResponse = await auth.get('/auth/verify')
      return response
    } catch (error) {
      throw error
    }
  },

  // 用户登出
  async logout() {
    try {
      const response:ApiResponse = await auth.post('/auth/logout')
      // 清除本地认证信息
      tokenManager.clearAuth()
      return response
    } catch (error) {
      // 即使请求失败，也要清除本地认证信息
      tokenManager.clearAuth()
      throw error
    }
  },

  // 检查是否已登录
  isLoggedIn() {
    const token = tokenManager.getToken()
    const user = tokenManager.getUser()
    return !!(token && user)
  },

  // 获取当前用户信息
  getCurrentUser() {
    return tokenManager.getUser()
  }
}
