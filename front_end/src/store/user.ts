// store/user.js - 用户状态管理
import { defineStore } from 'pinia'
import type { User, UserState,ApiResponse} from '@/interface'
import { authApi, tokenManager } from '@/api/auth'
/*import axios from 'axios'

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

const tokenManager = {
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
      window.location.href = '/login'
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
const authApi = {
  // 验证token
  async verifyToken() {
    try {
      const response:ApiResponse= await auth.get('/auth/verify')
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
*/

export const useUserStore = defineStore('user', {
  state: ():UserState => ({
    // 登录状态
    isAuthenticated: false,
    // 用户信息
    user: null,
    // JWT token
    token: null,
    // 加载状态
    loading: false
  }),

  getters: {
    // 获取用户名
    username: (state) => state.user?.username || '',

    // 获取用户角色
    userRole: (state) => state.user?.role || 'user',

    // 是否为管理员
    isAdmin: (state) => state.user?.role === 'admin',

    // 获取用户ID
    userId: (state) => state.user?.id || null,

    // 是否已登录
    signStatus: (state) => state.isAuthenticated
  },

  actions: {
    // 用户登录
    login(user:User | null, token:string) {
      this.isAuthenticated = true
      this.user = user
      this.token = token

      // 保存到本地存储
      tokenManager.setToken(token)
      tokenManager.setUser(user)
    },

    // 用户登出
    async logout() {
      try {
        // 调用后端登出API
        await authApi.logout()
      } catch (error) {
        console.error('登出请求失败:', error)
      } finally {
        // 无论请求成功与否，都清除本地状态
        this.clearUserState()
      }
    },

    // 清除用户状态
    clearUserState() {
      this.isAuthenticated = false
      this.user = null
      this.token = null

      // 清除本地存储
      tokenManager.clearAuth()
    },

    // 初始化用户状态（从本地存储恢复）
    initializeAuth() {
      const token = tokenManager.getToken()
      const user = tokenManager.getUser()

      if (token && user) {
        this.isAuthenticated = true
        this.user = user
        this.token = token
      }
    },

    // 验证token有效性
    async verifyToken() {
      if (!this.token) {
        return false
      }

      try {
        this.loading = true
        const response:ApiResponse = await authApi.verifyToken()

        if (response.success) {
          // 更新用户信息
          this.user = response.data.user
          return true
        } else {
          // token无效，清除状态
          this.clearUserState()
          return false
        }
      } catch (error) {
        console.error('Token验证失败:', error)
        this.clearUserState()
        return false
      } finally {
        this.loading = false
      }
    },

    // 检查是否需要重新登录
    async checkAuthStatus() {
      if (!this.isAuthenticated) {
        return false
      }

      // 验证token是否还有效
      return await this.verifyToken()
    }
  }
})

// 在应用启动时初始化认证状态的工具函数
export const initializeUserAuth = () => {
  const userStore = useUserStore()
  userStore.initializeAuth()

  // 如果有token，验证其有效性
  if (userStore.token) {
    userStore.verifyToken()
  }
}
