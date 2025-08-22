import React, { useState, useEffect } from 'react'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Typography,
  Divider,
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAuth } from '../contexts/AuthContext'
import * as contractApi from '../services/contract'
import type { Contract, ContractUpdateRequest, User } from '../services/contract'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

/**
 * 合同详情页面组件
 * 提供合同详情查看和编辑功能
 */
const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAdmin, user: currentUser } = useAuth()
  const [form] = Form.useForm()
  
  const [contract, setContract] = useState<Contract | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // 检查是否从URL参数中获取编辑模式
  const isEditMode = searchParams.get('mode') === 'edit'

  /**
   * 加载合同详情和用户列表
   */
  const loadData = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const contractId = Number(id)
      const [contractResponse, usersResponse] = await Promise.all([
        contractApi.getContractById(contractId),
        contractApi.getUsers()
      ])
      setContract(contractResponse.data)
      setUsers(usersResponse.data)
      
      // 如果是编辑模式，设置表单值
      if (isEditMode || editing) {
        form.setFieldsValue({
          contractName: contractResponse.data.contractName,
          contractType: contractResponse.data.contractType,
          contractNumber: contractResponse.data.contractNumber,
          responsibleUserId: contractResponse.data.responsibleUserId,
          startDate: dayjs(contractResponse.data.startDate),
          endDate: dayjs(contractResponse.data.endDate),
          status: contractResponse.data.status,
          description: contractResponse.data.description,
        })
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 初始化页面数据
   */
  useEffect(() => {
    loadData()
    
    // 如果URL参数中有编辑模式，自动进入编辑状态
    if (isEditMode) {
      setEditing(true)
    }
  }, [id, isEditMode])

  /**
   * 检查是否有编辑权限
   */
  const canEdit = () => {
    if (!contract || !currentUser) return false
    return isAdmin || contract.responsibleUserId === currentUser.id
  }

  /**
   * 开始编辑
   */
  const handleEdit = () => {
    if (!canEdit()) {
      message.error('您没有权限编辑此合同')
      return
    }
    setEditing(true)
  }

  /**
   * 取消编辑
   */
  const handleCancelEdit = () => {
    setEditing(false)
    form.resetFields()
    // 移除URL中的编辑模式参数
    navigate(`/contracts/${id}`, { replace: true })
  }

  /**
   * 保存编辑
   */
  const handleSave = async () => {
    if (!contract) return
    
    try {
      const values = await form.validateFields()
      setSaving(true)
      
      const updateData: ContractUpdateRequest = {
        contractName: values.contractName,
        contractType: values.contractType,
        contractNumber: values.contractNumber,
        responsibleUserId: values.responsibleUserId,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        status: values.status,
        description: values.description,
      }
      
      const updatedContract = await contractApi.updateContract(contract.id, updateData)
      setContract(updatedContract.data)
      setEditing(false)
      message.success('保存成功')
      
      // 移除URL中的编辑模式参数
      navigate(`/contracts/${id}`, { replace: true })
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  /**
   * 删除合同
   */
  const handleDelete = () => {
    if (!contract) return
    
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个合同吗？删除后无法恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await contractApi.deleteContract(contract.id)
          message.success(response.data || '合同删除成功')
          navigate('/contracts')
        } catch (error) {
          console.error('删除失败:', error)
          message.error('删除失败')
        }
      },
    })
  }

  /**
   * 获取合同状态标签
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载中...</div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>合同不存在或已被删除</div>
        <Button type="primary" onClick={() => navigate('/contracts')} style={{ marginTop: 16 }}>
          返回列表
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* 页面标题和操作按钮 */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/contracts')}
              style={{ marginRight: 16 }}
            >
              返回列表
            </Button>
            <Title level={3} style={{ display: 'inline', margin: 0 }}>
              {editing ? '编辑合同' : '合同详情'}
            </Title>
          </div>
          
          {!editing && (
            <Space>
              {canEdit() && (
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                  编辑
                </Button>
              )}
              {canEdit() && (
                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                  删除
                </Button>
              )}
            </Space>
          )}
          
          {editing && (
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
              >
                保存
              </Button>
              <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>
                取消
              </Button>
            </Space>
          )}
        </div>
      </div>

      {/* 合同详情内容 */}
      <Card>
        {!editing ? (
          // 查看模式
          <Descriptions title="基本信息" bordered column={2}>
            <Descriptions.Item label="合同名称" span={2}>
              {contract.contractName}
            </Descriptions.Item>
            <Descriptions.Item label="合同编号">
              {contract.contractNumber || '无'}
            </Descriptions.Item>
            <Descriptions.Item label="合同类型">
              {contract.contractType}
            </Descriptions.Item>
            <Descriptions.Item label="负责人">
              {contract.responsibleUser?.realName}
            </Descriptions.Item>
            <Descriptions.Item label="负责人邮箱">
              {contract.responsibleUser?.email}
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">
              {contract.startDate}
            </Descriptions.Item>
            <Descriptions.Item label="截止日期">
              {contract.endDate}
            </Descriptions.Item>
            <Descriptions.Item label="合同状态">
              {getStatusTag(contract.status)}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(contract.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(contract.updatedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="合同描述" span={2}>
              {contract.description || '无'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          // 编辑模式
          <Form
            form={form}
            layout="vertical"
            style={{ maxWidth: 800 }}
          >
            <Title level={4}>基本信息</Title>
            <Divider />
            
            <Form.Item
              name="contractName"
              label="合同名称"
              rules={[{ required: true, message: '请输入合同名称' }]}
            >
              <Input placeholder="请输入合同名称" />
            </Form.Item>
            
            <Form.Item
              name="contractNumber"
              label="合同编号"
            >
              <Input placeholder="请输入合同编号" />
            </Form.Item>
            
            <Form.Item
              name="contractType"
              label="合同类型"
              rules={[{ required: true, message: '请选择合同类型' }]}
            >
              <Select placeholder="请选择合同类型">
                <Option value="服务合同">服务合同</Option>
                <Option value="采购合同">采购合同</Option>
                <Option value="租赁合同">租赁合同</Option>
                <Option value="销售合同">销售合同</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="responsibleUserId"
              label="负责人"
              rules={[{ required: true, message: '请选择负责人' }]}
            >
              <Select placeholder="请选择负责人">
                {users.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.realName} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="startDate"
              label="开始日期"
              rules={[{ required: true, message: '请选择开始日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="endDate"
              label="截止日期"
              rules={[{ required: true, message: '请选择截止日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="status"
              label="合同状态"
              rules={[{ required: true, message: '请选择合同状态' }]}
            >
              <Select placeholder="请选择合同状态">
                <Option value="ACTIVE">有效</Option>
                <Option value="EXPIRED">已过期</Option>
                <Option value="TERMINATED">已终止</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="description"
              label="合同描述"
            >
              <TextArea
                rows={4}
                placeholder="请输入合同描述"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  )
}

export default ContractDetail