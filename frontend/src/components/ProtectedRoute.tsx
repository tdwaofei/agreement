import React, { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '../contexts/AuthContext'

/**
 * 受保护路由组件属性
 */
interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * 受保护路由组件
 * 检查用户是否已登录，未登录则重定向到登录页
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // 显示加载状态
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <div>正在加载...</div>
      </div>
    )
  }

  // 未登录则重定向到登录页，并保存当前路径
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 已登录则渲染子组件
  return <>{children}</>
}

export default ProtectedRoute