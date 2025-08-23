import React, { Component, ReactNode } from 'react'
import { Result, Button } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

/**
 * 错误边界组件的Props接口
 */
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * 错误边界组件的State接口
 */
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

/**
 * 错误边界组件
 * 用于捕获子组件中的JavaScript错误，防止整个应用崩溃
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  /**
   * 捕获错误时调用
   * @param error 错误对象
   * @param errorInfo 错误信息
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新state以显示错误UI
    return { hasError: true, error }
  }

  /**
   * 错误被捕获后调用
   * @param error 错误对象
   * @param errorInfo 错误信息
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  /**
   * 重置错误状态
   */
  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  /**
   * 刷新页面
   */
  handleRefresh = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // 如果有自定义的fallback UI，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认的错误UI
      return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <Result
            status="error"
            icon={<ExclamationCircleOutlined />}
            title="页面出现错误"
            subTitle="抱歉，页面加载时出现了错误。请尝试刷新页面或联系管理员。"
            extra={[
              <Button type="primary" key="refresh" onClick={this.handleRefresh}>
                刷新页面
              </Button>,
              <Button key="retry" onClick={this.handleReset}>
                重试
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{ textAlign: 'left', marginTop: 20 }}>
                <details>
                  <summary>错误详情（开发模式）</summary>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#666' }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack || ''}
                  </pre>
                </details>
              </div>
            )}
          </Result>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary