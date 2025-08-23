import React, { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Alert, Spin } from 'antd'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { contractApi, Contract, ContractStatistics } from '../services/contract';
import ErrorBoundary from '../components/ErrorBoundary'

const { Title } = Typography

/**
 * 仪表板页面组件
 * 显示合同概览和统计信息
 */
const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<ContractStatistics>({
    activeCount: 0,
    expiredCount: 0,
    terminatedCount: 0,
  })
  const [recentContracts, setRecentContracts] = useState<Contract[]>([])
  const [expiringContracts, setExpiringContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  /**
   * 加载仪表板数据
   */
  const loadDashboardData = useCallback(async (isRetry = false) => {
    try {
      setLoading(true)
      setError(null)
      
      if (isRetry) {
        setRetryCount(prev => prev + 1)
      }
      
      console.log('开始加载仪表板数据...', isRetry ? `(重试第${retryCount + 1}次)` : '')
      
      // 添加超时控制
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('请求超时')), 10000)
      )
      
      const dataPromises = Promise.all([
        contractApi.getContractStatistics(),
        contractApi.getContracts({ page: 0, size: 5, sort: 'createdAt', direction: 'desc' }),
        contractApi.getExpiringContracts(30)
      ])
      
      const [statsResponse, contractsResponse, expiringResponse] = await Promise.race([
        dataPromises,
        timeout
      ]) as [ContractStatistics, any, Contract[]]
      
      console.log('API响应数据:', {
        statsResponse,
        contractsResponse,
        expiringResponse
      })
      
      // 验证数据完整性
      if (!statsResponse || typeof statsResponse !== 'object') {
        throw new Error('统计数据格式错误')
      }
      
      setStatistics(statsResponse)
      setRecentContracts(contractsResponse?.content || [])
      setExpiringContracts(Array.isArray(expiringResponse) ? expiringResponse : [])
      
      console.log('仪表板数据加载完成')
      setRetryCount(0) // 成功后重置重试计数
    } catch (error: any) {
      console.error('加载仪表板数据失败:', error)
      
      let errorMessage = '加载数据失败'
      if (error.message === '请求超时') {
        errorMessage = '请求超时，请检查网络连接'
      } else if (error.response?.status === 401) {
        errorMessage = '登录已过期，请重新登录'
      } else if (error.response?.status >= 500) {
        errorMessage = '服务器错误，请稍后重试'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      
      // 设置默认值避免白屏
      setStatistics({
        activeCount: 0,
        expiredCount: 0,
        terminatedCount: 0,
      })
      setRecentContracts([])
      setExpiringContracts([])
    } finally {
      setLoading(false)
    }
  }, [retryCount])

  /**
   * 组件挂载时加载数据
   */
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  /**
   * 重试加载数据
   */
  const handleRetry = useCallback(() => {
    loadDashboardData(true)
  }, [loadDashboardData])

  /**
   * 清理副作用，防止内存泄漏
   */
  useEffect(() => {
    return () => {
      // 组件卸载时清理状态
      setLoading(false)
      setError(null)
    }
  }, [])

  /**
   * 获取合同状态标签
   * @param status 合同状态
   * @returns 状态标签
   */
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="green">有效</Tag>
      case 'EXPIRED':
        return <Tag color="red">已过期</Tag>
      case 'TERMINATED':
        return <Tag color="orange">已终止</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  /**
   * 计算距离到期天数
   * @param endDate 到期日期
   * @returns 天数
   */
  const getDaysToExpire = (endDate: string) => {
    const today = new Date()
    const expireDate = new Date(endDate)
    const diffTime = expireDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  /**
   * 最近合同表格列配置
   */
  const recentContractsColumns = [
    {
      title: '合同名称',
      dataIndex: 'contractName',
      key: 'contractName',
      ellipsis: true,
    },
    {
      title: '合同类型',
      dataIndex: 'contractType',
      key: 'contractType',
    },
    {
      title: '负责人',
      dataIndex: ['responsibleUser', 'realName'],
      key: 'responsibleUser',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Contract) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/contracts/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ]

  /**
   * 即将到期合同表格列配置
   */
  const expiringContractsColumns = [
    {
      title: '合同名称',
      dataIndex: 'contractName',
      key: 'contractName',
      ellipsis: true,
    },
    {
      title: '到期日期',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: '剩余天数',
      dataIndex: 'endDate',
      key: 'daysToExpire',
      render: (endDate: string) => {
        const days = getDaysToExpire(endDate)
        const color = days <= 7 ? 'red' : days <= 15 ? 'orange' : 'blue'
        return <Tag color={color}>{days}天</Tag>
      },
    },
    {
      title: '负责人',
      dataIndex: ['responsibleUser', 'realName'],
      key: 'responsibleUser',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Contract) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/contracts/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <ErrorBoundary>
      <div>
        {/* 页面标题 */}
        <div className="page-header">
          <Title level={3} className="page-title">
            仪表板
          </Title>
          <p>欢迎回来，{user?.realName}！这里是您的合同管理概览。</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert
            message="数据加载失败"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            action={
              <Button size="small" danger onClick={handleRetry} loading={loading}>
                <ReloadOutlined /> 重试 {retryCount > 0 && `(${retryCount})`}
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 加载状态 */}
        {loading && !error && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#666' }}>正在加载数据...</p>
          </div>
        )}

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="有效合同"
              value={statistics.activeCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已过期合同"
              value={statistics.expiredCount}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已终止合同"
              value={statistics.terminatedCount}
              prefix={<CloseCircleOutlined style={{ color: '#faad14' }} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="合同总数"
              value={statistics.activeCount + statistics.expiredCount + statistics.terminatedCount}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最近合同 */}
        <Col xs={24} lg={12}>
          <Card
            title="最近合同"
            extra={
              <Button type="link" onClick={() => navigate('/contracts')}>
                查看全部
              </Button>
            }
          >
            <Table
              columns={recentContractsColumns}
              dataSource={recentContracts}
              rowKey="id"
              pagination={false}
              loading={loading}
              size="small"
            />
          </Card>
        </Col>

        {/* 即将到期合同 */}
        <Col xs={24} lg={12}>
          <Card
            title="即将到期合同"
            extra={
              <Button type="link" onClick={() => navigate('/contracts?status=ACTIVE')}>
                查看全部
              </Button>
            }
          >
            <Table
              columns={expiringContractsColumns}
              dataSource={expiringContracts}
              rowKey="id"
              pagination={false}
              loading={loading}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作 */}
      <Card title="快捷操作" style={{ marginTop: 16 }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate('/contracts/new')}
          >
            新增合同
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => navigate('/contracts')}
          >
            合同列表
          </Button>
          {isAdmin && (
            <Button
              icon={<ExclamationCircleOutlined />}
              onClick={() => navigate('/contracts?status=EXPIRED')}
            >
              过期合同
            </Button>
          )}
          {isAdmin && (
            <Button
              icon={<FileTextOutlined />}
              onClick={() => navigate('/settings')}
            >
              系统设置
            </Button>
          )}
        </Space>
      </Card>
      </div>
    </ErrorBoundary>
  )
}

export default Dashboard