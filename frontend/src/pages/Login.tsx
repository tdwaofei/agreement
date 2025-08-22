import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text } = Typography

/**
 * 登录表单数据接口
 */
interface LoginFormData {
  username: string
  password: string
}

/**
 * 登录页面组件
 * 提供用户登录功能
 */
const Login: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // 获取重定向路径
  const from = (location.state as any)?.from?.pathname || '/dashboard'

  /**
   * 如果用户已登录，重定向到目标页面
   */
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  /**
   * 处理登录表单提交
   * @param values 表单数据
   */
  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true)
    try {
      const success = await login(values.username, values.password)
      if (success) {
        navigate(from, { replace: true })
      }
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理登录失败
   */
  const handleSubmitFailed = (errorInfo: any) => {
    console.error('表单验证失败:', errorInfo)
  }

  return (
    <div className="login-container">
      <Card className="login-form" bordered={false}>
        {/* 登录标题 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} className="login-title">
            合同管理系统
          </Title>
          <Text type="secondary">请输入您的账号和密码</Text>
        </div>

        {/* 默认账号提示 */}
        <Alert
          message="默认账号信息"
          description={
            <div>
              <div>管理员: admin / 123456</div>
              <div>普通用户: user1 / 123456</div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* 登录表单 */}
        <Form
          form={form}
          name="login"
          size="large"
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
          autoComplete="off"
        >
          {/* 用户名输入框 */}
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          {/* 密码输入框 */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 48 }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        {/* 页脚信息 */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            合同管理系统 v1.0.0
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login