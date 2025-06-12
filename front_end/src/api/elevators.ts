// api/elevator.js - 电梯相关API
import axios from 'axios'
import type {ApiResponse} from "@/interface.ts";
// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理响应
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

// 电梯相关API
export const elevatorApi = {
  // 获取所有电梯列表
  async getElevators() {
    try {
      const response:ApiResponse = await api.get('/elevators')
      return response
    } catch (error) {
      throw {
        success: false,
        message: error.message || '获取电梯列表失败',
        data: null
      }
    }
  },

  // 获取单个电梯详细信息
  async getElevatorInfo(id:string) {
    try {
      const response:ApiResponse = await api.get(`/elevators/${id}`)
      return response
    } catch (error) {
      if (error.status === 404) {
        throw {
          success: false,
          message: '电梯未找到',
          data: null
        }
      }
      throw {
        success: false,
        message: error.message || '获取电梯信息失败',
        data: null
      }
    }
  },

  // 获取电梯传感器信息
  async getElevatorSensors(id:string) {
    try {
      // 注意：Flask路由应该是 /api/elevators/<id>/sensors
      const response:ApiResponse = await api.get(`/elevators/${id}/sensors`)
      return response
    } catch (error) {
      if (error.status === 404) {
        throw {
          success: false,
          message: '传感器未找到',
          data: null
        }
      }
      throw {
        success: false,
        message: error.message || '获取传感器信息失败',
        data: null
      }
    }
  }
}
