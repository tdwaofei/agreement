import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  Table,
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Typography,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { contractApi } from '../services/contract'
// 定义合同状态枚举
export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED'
}

// 定义合同查询参数接口
export interface ContractQueryParams {
  contractName?: string;
  contractType?: string;
  status?: ContractStatus;
  page?: number;
  size?: number;
}

// 定义合同接口
export interface Contract {
  id: number;
  contractName: string;
  contractNumber: string;
  contractType: string;
  responsibleUser: {
    realName: string;
  };
  startDate: string;
  endDate: string;
  status: ContractStatus;
  createdAt: string;
}
import { useAuth } from '../contexts/AuthContext'

const { Title } = Typography
const { Option } = Select

/**
 * 合同列表页面组件
 * 提供合同的查询、展示、编辑和删除功能
 */
const ContractList: React.FC = () => {
  const [form] = Form.useForm()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const { } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  /**
   * 加载合同列表
   * @param params 查询参数
   */
  const loadContracts = useCallback(async (params: ContractQueryParams = {}) => {
    try {
      setLoading(true)
      console.log('=== 开始加载合同列表 ===')
      console.log('📋 [LOAD] 调用来源:', new Error().stack?.split('\n')[2]?.trim())
      
      // 分页参数处理：传入的参数优先，否则使用默认值
      const requestPage = params.page !== undefined ? params.page : 0 // 默认第一页
      const requestSize = params.size !== undefined ? params.size : 10 // 默认每页10条
      
      console.log('📋 [LOAD] 分页参数处理结果:')
      console.log('  - 传入的params:', params)
      console.log('  - 计算后的requestPage:', requestPage)
      console.log('  - 计算后的requestSize:', requestSize)
      
      const requestParams = {
        ...params,
        page: requestPage,
        size: requestSize,
      }
      
      console.log('=== 分页参数详情 ===')
      console.log('当前pagination状态:', pagination)
      console.log('传入的params:', params)
      console.log('计算后的page:', requestPage)
      console.log('计算后的size:', requestSize)
      console.log('最终请求参数:', requestParams)
      
      const response = await contractApi.getContracts(requestParams)
      
      console.log('API响应原始数据:', response)
      console.log('响应数据类型:', typeof response)
      console.log('是否为对象:', typeof response === 'object')
      console.log('响应对象keys:', response ? Object.keys(response) : 'null')
      
      // 检查响应数据结构，处理可能的Axios响应对象
      let contractData
      if (response && typeof response === 'object' && 'data' in response) {
        console.log('检测到Axios响应对象，提取data属性')
        contractData = response.data
      } else {
        console.log('直接使用响应数据')
        contractData = response
      }
      
      console.log('处理后的合同数据:', contractData)
      console.log('合同数据类型:', typeof contractData)
      console.log('合同数据content:', contractData?.content)
      console.log('合同数据长度:', contractData?.content?.length)
      
      // 更新合同列表数据
      const contractList = contractData?.content || []
      console.log('=== 准备更新contracts状态 ===')
      console.log('提取的合同列表数据:', contractList)
      console.log('合同列表长度:', contractList.length)
      console.log('合同列表是否为数组:', Array.isArray(contractList))
      console.log('合同列表第一项:', contractList[0])
      // 移除可能导致循环的状态引用调试日志
      
      // 使用函数式更新确保状态正确设置
      setContracts(prevContracts => {
        console.log('=== setContracts函数式更新 ===')
        console.log('之前的contracts状态:', prevContracts)
        console.log('新的contracts数据:', contractList)
        console.log('新数据长度:', contractList.length)
        return contractList
      })
      
      console.log('=== contracts状态更新调用完成 ===')
      
      // 更新分页状态
      const newPagination = {
        current: (contractData?.number || 0) + 1,
        pageSize: contractData?.size || 10,
        total: contractData?.totalElements || 0
      }
      
      setPagination(prevPagination => {
        console.log('=== setPagination函数式更新 ===')
        console.log('之前的pagination状态:', prevPagination)
        console.log('新的pagination状态:', newPagination)
        return newPagination
      })
      
      console.log('=== 分页状态更新详情 ===')
      console.log('设置的合同列表长度:', contractList.length)
      console.log('API返回的分页信息:')
      console.log('  - number (当前页-从0开始):', contractData?.number)
      console.log('  - size (每页大小):', contractData?.size)
      console.log('  - totalElements (总记录数):', contractData?.totalElements)
      console.log('  - totalPages (总页数):', contractData?.totalPages)
      console.log('=== 合同列表加载完成 ===')
      
      // 移除可能导致循环的延迟状态检查
    } catch (error) {
      console.error('加载合同列表失败 - 详细错误:', error)
      console.error('错误类型:', typeof error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any
        console.error('HTTP状态码:', axiosError.response?.status)
        console.error('响应数据:', axiosError.response?.data)
      }
      message.error('加载合同列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 添加防抖状态，防止重复调用
  const [isInitialized, setIsInitialized] = useState(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 防抖的loadContracts函数
   * @param params 查询参数
   * @param delay 延迟时间（毫秒）
   */
  const debouncedLoadContracts = useCallback((params: ContractQueryParams = {}, delay: number = 300) => {
    // 防止在loading状态下重复调用
    if (loading) {
      console.log('=== 防抖调用被阻止：正在加载中 ===')
      return
    }
    
    // 清除之前的定时器
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    
    // 设置新的定时器
    loadingTimeoutRef.current = setTimeout(() => {
      console.log('=== 防抖调用loadContracts ===', params)
      loadContracts(params)
    }, delay)
  }, [loading, loadContracts])

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  /**
   * 组件挂载时立即初始化数据
   * 确保每次进入页面都能自动加载数据
   */
  useEffect(() => {
    console.log('🚀 [MOUNT] 组件挂载：立即初始化数据加载')
    console.log('🚀 [MOUNT] 调用栈跟踪:', new Error().stack?.split('\n').slice(0, 3))
    
    // 从URL参数中恢复搜索条件
    const initialValues = {
      contractName: searchParams.get('contractName') || '',
      contractType: searchParams.get('contractType') || '',
      status: (searchParams.get('status') as ContractStatus) || undefined,
      page: parseInt(searchParams.get('page') || '1') - 1, // 转换为后端需要的从0开始的页码
      size: parseInt(searchParams.get('size') || '10')
    }
    
    console.log('🚀 [MOUNT] 初始化参数:', initialValues)
    console.log('🚀 [MOUNT] 转换后的page参数 (后端格式):', initialValues.page)
    form.setFieldsValue({
      ...initialValues,
      page: initialValues.page + 1 // 表单显示用前端格式（从1开始）
    })
    
    // 立即加载数据，直接传入完整参数，避免依赖状态
    console.log('🚀 [MOUNT] 直接调用loadContracts - 传入完整分页参数')
    loadContracts(initialValues)
    setIsInitialized(true)
    
    console.log('🚀 [MOUNT] 组件挂载初始化完成')
  }, []) // 移除loadContracts依赖项，避免循环

  /**
   * URL参数变化时更新数据
   * 处理浏览器前进后退等场景
   */
  useEffect(() => {
    if (isInitialized) {
      console.log('🔄 [URL] URL参数变化：更新数据')
      console.log('🔄 [URL] 调用栈跟踪:', new Error().stack?.split('\n').slice(0, 3))
      
      const updatedValues = {
        contractName: searchParams.get('contractName') || '',
        contractType: searchParams.get('contractType') || '',
        status: (searchParams.get('status') as ContractStatus) || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        size: parseInt(searchParams.get('size') || '10')
      }
      
      console.log('🔄 [URL] 更新的参数:', updatedValues)
      form.setFieldsValue(updatedValues)
      // 使用防抖调用避免死循环
      console.log('🔄 [URL] 使用防抖调用debouncedLoadContracts')
      debouncedLoadContracts(updatedValues, 200)
    } else {
      console.log('🔄 [URL] 跳过：组件未初始化')
    }
  }, [searchParams, isInitialized]) // 移除loadContracts依赖项，避免循环

  /**
   * 页面可见性变化监听
   * 当页面重新变为可见时自动刷新数据
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isInitialized) {
        console.log('=== 页面可见性变化：页面变为可见，防抖刷新数据 ===')
        // 页面变为可见时，刷新合同列表
        const currentValues = form.getFieldsValue()
        debouncedLoadContracts(currentValues, 200)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isInitialized]) // 移除debouncedLoadContracts依赖项，避免循环

  /**
   * 路由变化监听
   * 当路由变化时检查是否需要刷新数据
   */
  useEffect(() => {
    console.log('=== 路由变化监听：当前路径 ===', location.pathname)
    console.log('=== 初始化状态 ===', isInitialized)
    
    // 只有在已初始化且当前在合同列表页面时才刷新数据
    if (isInitialized && location.pathname === '/contracts') {
      console.log('=== 路由变化：检测到返回合同列表页面，防抖刷新数据 ===')
      const currentValues = form.getFieldsValue()
      console.log('=== 路由变化：当前表单值 ===', currentValues)
      debouncedLoadContracts(currentValues, 100) // 使用较短的延迟
    }
  }, [location.pathname, isInitialized]) // 移除debouncedLoadContracts依赖项，避免循环

  /**
   * 组件焦点监听
   * 当组件重新获得焦点时刷新数据
   */
  useEffect(() => {
    const handleFocus = () => {
      if (isInitialized) {
        console.log('=== 窗口焦点变化：窗口获得焦点，防抖刷新数据 ===')
        const currentValues = form.getFieldsValue()
        debouncedLoadContracts(currentValues, 500) // 焦点变化使用较长延迟
      }
    }

    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [isInitialized]) // 移除debouncedLoadContracts依赖项，避免循环

  /**
   * 处理搜索
   * @param values 搜索表单值
   */
  const handleSearch = (values: any) => {
    console.log('=== 处理搜索 ===', values)
    const params = {
      ...values,
      contractName: values.contractName?.trim(),
      contractType: values.contractType,
      status: values.status,
    }
    
    // 更新URL参数
    const newSearchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, String(value))
      }
    })
    setSearchParams(newSearchParams)
    
    // 重置分页并搜索
    setPagination(prev => ({ ...prev, current: 1 }))
    // 使用防抖机制，但搜索操作使用较短延迟
    debouncedLoadContracts(params, 100)
  }

  /**
   * 重置搜索条件
   */
  const handleReset = () => {
    console.log('=== 重置搜索条件 ===')
    form.resetFields()
    setSearchParams({})
    setPagination(prev => ({ ...prev, current: 1 }))
    // 使用防抖机制
    debouncedLoadContracts({}, 100)
  }

  /**
   * 处理分页变化
   * @param page 页码
   * @param pageSize 每页大小
   */
  const handleTableChange = (page: number, pageSize: number) => {
    console.log('=== 处理分页变化 ===', { page, pageSize })
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize,
    }))
    
    const searchValues = form.getFieldsValue()
    // 分页变化立即执行，不使用防抖
    loadContracts({
      ...searchValues,
      page: page - 1,
      size: pageSize,
    })
  }

  /**
   * 删除合同
   * @param id 合同ID
   */
  const handleDelete = async (id: number) => {
    try {
      console.log('=== 删除合同 ===', id)
      await contractApi.deleteContract(id)
      message.success('删除成功')
      // 删除后立即刷新，不使用防抖
      loadContracts(form.getFieldsValue())
    } catch (error) {
      console.error('删除合同失败:', error)
      message.error('删除失败')
    }
  }

  /**
   * 获取合同状态标签
   * @param status 合同状态
   * @returns 状态标签
   */
  const getStatusTag = (status: ContractStatus) => {
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
   * 表格列配置
   */
  const columns = [
    {
      title: '合同名称',
      dataIndex: 'contractName',
      key: 'contractName',
      ellipsis: true,
      width: 200,
    },
    {
      title: '合同编号',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      width: 150,
    },
    {
      title: '合同类型',
      dataIndex: 'contractType',
      key: 'contractType',
      width: 120,
    },
    {
      title: '负责人',
      dataIndex: ['responsibleUser', 'realName'],
      key: 'responsibleUser',
      width: 100,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: '截止日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: ContractStatus) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Contract) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/contracts/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/contracts/${record.id}?mode=edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个合同吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 组件渲染调试信息
  console.log('=== ContractList组件渲染 ===')
  console.log('当前时间:', new Date().toLocaleTimeString())
  console.log('路由路径:', location.pathname)
  console.log('contracts状态:', {
    length: contracts?.length,
    isArray: Array.isArray(contracts),
    data: contracts
  })
  console.log('pagination状态:', pagination)
  console.log('loading状态:', loading)
  console.log('=== 组件渲染调试结束 ===')

  return (
    <div>
      {/* 页面标题 */}
      <div className="page-header">
        <Title level={3} className="page-title">
          合同列表
        </Title>
        <p>管理和查看所有合同信息</p>
      </div>

      {/* 搜索表单 */}
      <Card className="search-form" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ width: '100%' }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="contractName" label="合同名称">
                <Input placeholder="请输入合同名称" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="contractType" label="合同类型">
                <Select placeholder="请选择合同类型" allowClear>
                  <Option value="服务合同">服务合同</Option>
                  <Option value="采购合同">采购合同</Option>
                  <Option value="租赁合同">租赁合同</Option>
                  <Option value="销售合同">销售合同</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="status" label="合同状态">
                <Select placeholder="请选择合同状态" allowClear>
                  <Option value="ACTIVE">有效</Option>
                  <Option value="EXPIRED">已过期</Option>
                  <Option value="TERMINATED">已终止</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    loading={loading}
                  >
                    搜索
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 操作按钮 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/contracts/new')}
          >
            新增合同
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadContracts(form.getFieldsValue())}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      </Card>

      {/* 合同表格 */}
      <Card className="content-card">
        {/* 渲染前调试信息 */}
        {console.log('=== Table组件渲染调试 ===')}
        {console.log('Table dataSource (contracts):', contracts)}
        {console.log('contracts长度:', contracts?.length)}
        {console.log('contracts是否为数组:', Array.isArray(contracts))}
        {console.log('loading状态:', loading)}
        {console.log('pagination状态:', pagination)}
        
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  )
}

export default ContractList