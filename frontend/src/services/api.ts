import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'

/**
 * API响应接口
 */
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

/**
 * 创建axios实例
 */
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器
 * 自动添加认证token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 统一处理错误和认证失效
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    console.error('API请求错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 认证失效，清除本地存储并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          message.error('登录已过期，请重新登录')
          window.location.href = '/login'
          break
        case 403:
          message.error('没有权限访问该资源')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器内部错误')
          break
        default:
          message.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络设置')
    } else {
      message.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

/**
 * GET请求
 * @param url 请求URL
 * @param config 请求配置
 * @returns Promise<T>
 */
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return api.get(url, config).then(response => response.data)
}

/**
 * POST请求
 * @param url 请求URL
 * @param data 请求数据
 * @param config 请求配置
 * @returns Promise<T>
 */
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.post(url, data, config).then(response => response.data)
}

/**
 * PUT请求
 * @param url 请求URL
 * @param data 请求数据
 * @param config 请求配置
 * @returns Promise<T>
 */
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.put(url, data, config).then(response => response.data)
}

/**
 * DELETE请求
 * @param url 请求URL
 * @param config 请求配置
 * @returns Promise<T>
 */
export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return api.delete(url, config).then(response => response.data)
}

/**
 * 文件上传请求
 * @param url 请求URL
 * @param formData 表单数据
 * @param config 请求配置
 * @returns Promise<T>
 */
export const upload = <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> => {
  return api.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
  }).then(response => response.data)
}

// 导出API实例和响应类型
export { api };
export type { ApiResponse };
export default api;