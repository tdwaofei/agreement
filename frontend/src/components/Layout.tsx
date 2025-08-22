import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout as AntLayout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Space,
  MenuProps,
} from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Header, Sider, Content } = AntLayout

/**
 * 主布局组件
 * 提供应用的整体布局结构，包括导航菜单、头部和内容区域
 */
const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * 菜单项配置
   */
  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/contracts',
      icon: <FileTextOutlined />,
      label: '合同管理',
      children: [
        {
          key: '/contracts',
          label: '合同列表',
        },
        {
          key: '/contracts/new',
          label: '新增合同',
        },
      ],
    },
    // 只有管理员才能看到系统设置
    ...(isAdmin ? [{
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    }] : []),
  ]

  /**
   * 处理菜单点击事件
   * @param key 菜单项key
   */
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  /**
   * 用户下拉菜单项
   */
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => {
        // TODO: 实现个人信息页面
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ]

  /**
   * 获取当前选中的菜单项
   */
  const getSelectedKeys = () => {
    const pathname = location.pathname
    if (pathname.startsWith('/contracts/') && pathname !== '/contracts/new') {
      return ['/contracts']
    }
    return [pathname]
  }

  /**
   * 获取当前展开的菜单项
   */
  const getOpenKeys = () => {
    const pathname = location.pathname
    if (pathname.startsWith('/contracts')) {
      return ['/contracts']
    }
    return []
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: '#fff',
          boxShadow: '2px 0 6px rgba(0,21,41,.35)',
        }}
      >
        {/* Logo区域 */}
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          fontSize: collapsed ? '16px' : '18px',
          fontWeight: 'bold',
          color: '#1890ff',
        }}>
          {collapsed ? '合同' : '合同管理系统'}
        </div>

        {/* 导航菜单 */}
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            height: 'calc(100vh - 64px)',
          }}
        />
      </Sider>

      <AntLayout>
        {/* 头部 */}
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        }}>
          {/* 折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          {/* 用户信息 */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.realName}</span>
              <span style={{ color: '#999', fontSize: '12px' }}>({user?.role === 'ADMIN' ? '管理员' : '用户'})</span>
            </Space>
          </Dropdown>
        </Header>

        {/* 内容区域 */}
        <Content style={{
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '6px',
          minHeight: 'calc(100vh - 112px)',
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout