import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { message } from 'antd'
import * as authApi from '../services/auth'

/**
 * 用户信息接口
 */
export interface User {
  id: number
  username: string
  realName: string
  email: string
  role: string
}

/**
 * 认证上下文接口
 */
interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  isAdmin: boolean
}

/**
 * 认证上下文
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * 认证提供者组件属性
 */
interface AuthProviderProps {
  children: ReactNode
}

/**
 * 认证提供者组件
 * 管理用户登录状态和认证相关操作
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * 初始化认证状态
   * 从localStorage恢复用户登录状态
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')
        
        if (savedToken && savedUser) {
          setToken(savedToken)
          setUser(JSON.parse(savedUser))
          
          // 验证token是否仍然有效
          try {
            const currentUser = await authApi.getCurrentUser()
            setUser(currentUser)
          } catch (error) {
            // token无效，清除本地存储
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
          }
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns 登录是否成功
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await authApi.login(username, password)
      
      if (response.success) {
        setToken(response.token)
        setUser(response.userInfo)
        
        // 保存到localStorage
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.userInfo))
        
        message.success('登录成功')
        return true
      } else {
        message.error(response.message || '登录失败')
        return false
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      message.error(error.response?.data?.message || '登录失败，请检查网络连接')
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * 用户登出
   */
  const logout = () => {
    setUser(null)
    setToken(null)
    
    // 清除localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    message.success('已退出登录')
  }

  /**
   * 判断当前用户是否为管理员
   */
  const isAdmin = user?.role === 'ADMIN'

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    isAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * 使用认证上下文的Hook
 * @returns 认证上下文
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用')
  }
  return context
}