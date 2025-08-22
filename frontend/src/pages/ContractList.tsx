import React, { useState, useEffect } from 'react'
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
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { contractApi, Contract, ContractQueryParams, ContractStatus } from '../services/contract';

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
  const [searchParams, setSearchParams] = useSearchParams()

  /**
   * 加载合同列表
   * @param params 查询参数
   */
  const loadContracts = async (params: ContractQueryParams = {}) => {
    try {
      setLoading(true)
      const response = await contractApi.getContracts({
        page: pagination.current - 1,
        size: pagination.pageSize,
        ...params,
      })
      
      setContracts(response.data.content)
      setPagination({
        current: response.data.number + 1,
        pageSize: response.data.size,
        total: response.data.totalElements
      })
    } catch (error) {
      console.error('加载合同列表失败:', error)
      message.error('加载合同列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 初始化页面数据
   */
  useEffect(() => {
    // 从URL参数中恢复搜索条件
    const initialValues = {
      contractName: searchParams.get('contractName') || '',
      contractType: searchParams.get('contractType') || '',
      status: (searchParams.get('status') as ContractStatus) || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      size: parseInt(searchParams.get('size') || '10')
    }
    
    // setQueryParams(initialValues) // 暂时注释掉，因为没有定义这个状态
    form.setFieldsValue(initialValues)
    loadContracts(initialValues)
  }, [])

  /**
   * 处理搜索
   * @param values 搜索表单值
   */
  const handleSearch = (values: any) => {
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
    loadContracts(params)
  }

  /**
   * 重置搜索条件
   */
  const handleReset = () => {
    form.resetFields()
    setSearchParams({})
    setPagination(prev => ({ ...prev, current: 1 }))
    loadContracts()
  }

  /**
   * 处理分页变化
   * @param page 页码
   * @param pageSize 每页大小
   */
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize,
    }))
    
    const searchValues = form.getFieldsValue()
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
      await contractApi.deleteContract(id)
      message.success('删除成功')
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