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
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined, ReloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import * as contractApi from '../services/contract'
import type { User } from '../services/contract'

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

  /**
   * 加载用户列表
   */
  const loadUsers = async () => {
    try {
      setLoading(true)
       const usersData = await contractApi.getUsers()
       setUsers(usersData.data)
    } catch (error) {
      console.error('加载用户列表失败:', error)
      message.error('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 初始化页面数据
   */
  useEffect(() => {
    loadUsers()
    
    // 设置默认值
    form.setFieldsValue({
      contractType: '服务合同',
      startDate: dayjs(),
      endDate: dayjs().add(1, 'year'),
    })
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
          await contractApi.uploadContractFiles(newContract.data.id, formData)
          message.success('合同创建成功，文件上传完成')
        } catch (fileError) {
          console.error('文件上传失败:', fileError)
          message.warning('合同创建成功，但文件上传失败，请稍后在合同详情页面重新上传')
        }
      } else {
        message.success('合同创建成功')
      }
      
      navigate(`/contracts/${newContract.data.id}`)
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

  return (
    <div>
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
  )
}

export default ContractCreate