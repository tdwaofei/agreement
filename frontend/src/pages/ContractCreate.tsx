import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Typography,
  Divider,
  Space,
  Upload,
  Alert,
  Spin,
} from 'antd'
import { ArrowLeftOutlined, UploadOutlined, DeleteOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import * as contractApi from '../services/contract'
import type { User } from '../services/contract'
import ErrorBoundary from '../components/ErrorBoundary'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

/**
 * 合同创建页面组件
 * 提供创建新合同的表单
 */
const ContractCreate: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  /**
   * 加载用户列表
   */
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('=== 开始加载用户列表 ===')
      console.log('当前token:', localStorage.getItem('token'))
      console.log('API请求URL:', '/api/contracts/users')
      console.log('当前users状态:', users)
      
      // 添加超时控制
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), 10000)
      })
      
      console.log('正在发起API请求...')
      const apiResponse = await Promise.race([
        contractApi.getUsers(),
        timeoutPromise
      ])
      
      console.log('=== API响应详情 ===')
      console.log('原始响应:', apiResponse)
      console.log('响应类型:', typeof apiResponse)
      console.log('是否为数组:', Array.isArray(apiResponse))
      console.log('响应长度:', apiResponse?.length)
      console.log('响应内容:', JSON.stringify(apiResponse, null, 2))
      
      const usersData = apiResponse as User[]
      console.log('=== 处理后的用户数据 ===')
      console.log('用户数据:', usersData)
      console.log('用户数据类型:', typeof usersData)
      console.log('是否为数组:', Array.isArray(usersData))
      console.log('数据长度:', usersData?.length)
      
      console.log('正在设置users状态...')
      setUsers(usersData.data || [])
      console.log('users状态设置完成')
      setRetryCount(0)
    } catch (error) {
      console.error('=== 加载用户列表失败 ===')
      console.error('详细错误:', error)
      console.error('错误类型:', typeof error)
      console.error('错误构造函数:', error?.constructor?.name)
      
      if (error && typeof error === 'object') {
        console.error('错误对象keys:', Object.keys(error))
        if ('response' in error) {
          const axiosError = error as any
          console.error('HTTP状态码:', axiosError.response?.status)
          console.error('响应数据:', axiosError.response?.data)
          console.error('响应头:', axiosError.response?.headers)
          console.error('请求配置:', axiosError.config)
        }
        if ('message' in error) {
          console.error('错误消息:', (error as any).message)
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : '加载用户列表失败'
      setError(errorMessage)
      setUsers([]) // 确保在错误情况下users始终是数组
      message.error(errorMessage)
    } finally {
      console.log('=== loadUsers函数执行完成 ===')
      setLoading(false)
    }
  }

  /**
   * 重试加载用户列表
   */
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    loadUsers()
  }

  /**
   * 初始化页面数据
   */
  useEffect(() => {
    try {
      loadUsers()
      
      // 设置默认值
      form.setFieldsValue({
        contractType: '服务合同',
        startDate: dayjs(),
        endDate: dayjs().add(1, 'year'),
      })
    } catch (error) {
      console.error('初始化页面数据失败:', error)
      setError('页面初始化失败')
    }
  }, [])

  /**
   * 处理表单提交
   * @param values 表单值
   */
  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true)
      
      const contractData = {
        contractName: values.contractName,
        contractType: values.contractType,
        contractNumber: values.contractNumber,
        responsibleUserId: values.responsibleUserId,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        description: values.description,
      }
      
      // 创建合同
      const newContract = await contractApi.createContract(contractData)
      
      // 如果有文件需要上传
      if (fileList.length > 0) {
        try {
          const formData = new FormData()
          fileList.forEach((file) => {
            if (file.originFileObj) {
              formData.append('files', file.originFileObj)
            }
          })
          
          // 上传文件到合同
          await contractApi.uploadContractFiles(newContract.id, formData)
          message.success('合同创建成功，文件上传完成')
        } catch (fileError) {
          console.error('文件上传失败:', fileError)
          message.warning('合同创建成功，但文件上传失败，请稍后在合同详情页面重新上传')
        }
      } else {
        message.success('合同创建成功')
      }
      
      navigate(`/contracts/${newContract.id}`)
    } catch (error) {
      console.error('创建合同失败:', error)
      message.error('创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 重置表单
   */
  const handleReset = () => {
    form.resetFields()
    form.setFieldsValue({
      contractType: '服务合同',
      startDate: dayjs(),
      endDate: dayjs().add(1, 'year'),
    })
    setFileList([]) // 清空文件列表
  }

  // 如果正在加载且没有用户数据，显示加载状态
  if (loading && users.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <div>正在加载页面数据...</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div>
        {/* 错误提示 */}
        {error && (
          <Alert
            message="加载失败"
            description={`${error}${retryCount > 0 ? ` (重试次数: ${retryCount})` : ''}`}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            action={
              <Button size="small" onClick={handleRetry}>
                重试
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}        
        
        {/* 页面标题 */}
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
                新增合同
              </Title>
            </div>
          </div>
        </div>

        {/* 创建表单 */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
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
            <Input placeholder="请输入合同编号（可选）" />
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
            <Select
              placeholder="请选择负责人"
              loading={loading}
              showSearch
              optionFilterProp="children"
            >
              {(() => {
                console.log('渲染负责人下拉列表 - users状态:', users)
                console.log('users是否为数组:', Array.isArray(users))
                console.log('users长度:', users?.length)
                return Array.isArray(users) ? users.map(user => {
                  console.log('渲染用户选项:', user)
                  return (
                    <Option key={user.id} value={user.id}>
                      {user.realName} ({user.email})
                    </Option>
                  )
                }) : []
              })()}
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
            rules={[
              { required: true, message: '请选择截止日期' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('startDate') || 
                      value.isAfter(getFieldValue('startDate'))) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('截止日期必须晚于开始日期'))
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="合同描述"
          >
            <TextArea
              rows={4}
              placeholder="请输入合同描述（可选）"
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <Title level={4}>合同附件</Title>
          <Divider />
          
          <Form.Item
            name="files"
            label="上传附件"
            extra="支持上传PDF、Word、Excel、ZIP、PNG、JPG格式文件，单个文件不超过10MB"
          >
            <Upload
              multiple
              fileList={fileList}
              beforeUpload={(file) => {
                // 检查文件类型
                const allowedTypes = [
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'application/zip',
                  'image/png',
                  'image/jpeg',
                  'image/jpg'
                ]
                
                if (!allowedTypes.includes(file.type)) {
                  message.error('不支持的文件格式！请上传PDF、Word、Excel、ZIP、PNG或JPG文件')
                  return false
                }
                
                // 检查文件大小（10MB）
                const isLt10M = file.size / 1024 / 1024 < 10
                if (!isLt10M) {
                  message.error('文件大小不能超过10MB！')
                  return false
                }
                
                // 添加到文件列表
                const newFile: UploadFile = {
                  uid: file.uid,
                  name: file.name,
                  status: 'done',
                  originFileObj: file,
                }
                setFileList(prev => [...prev, newFile])
                return false // 阻止自动上传
              }}
              onRemove={(file) => {
                setFileList(prev => prev.filter(item => item.uid !== file.uid))
              }}
              showUploadList={{
                showRemoveIcon: true,
                removeIcon: <DeleteOutlined />,
              }}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
              >
                保存
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
              <Button
                onClick={() => navigate('/contracts')}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      </div>
    </ErrorBoundary>
  )
}

export default ContractCreate