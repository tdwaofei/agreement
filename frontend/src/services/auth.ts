import { get, post } from './api'
import { User } from '../contexts/AuthContext'

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  success: boolean
  token: string
  userInfo: User
  message: string
}

/**
 * 用户登录
 * @param username 用户名
 * @param password 密码
 * @returns 登录响应
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await post<LoginResponse>('/auth/login', {
    username,
    password,
  })
  return response
}

/**
 * 用户登出
 * @returns 登出响应
 */
export const logout = async (): Promise<string> => {
  const response = await post<string>('/auth/logout')
  return response
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await get<User>('/auth/me')
  return response
}