import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Table,
  Modal,
  Select,
  Space,
  message,
  Tabs,
  Row,
  Col,
  Divider,
  Tag,
  InputNumber,
  Popconfirm,
  Typography,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  MailOutlined,
  SettingOutlined,
  UserOutlined,
  SendOutlined,
  CheckCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { 
  systemApi, 
  userApi, 
  emailApi, 
  SystemConfig, 
  User, 
  UserCreateRequest, 
  UserUpdateRequest,
  TestEmailRequest,
  EmailStatistics
} from '../services/system';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

/**
 * 系统设置页面组件
 * 提供系统配置和用户管理功能，仅管理员可访问
 */
const Settings: React.FC = () => {
  const { user } = useAuth();
  const [configForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [, setConfigs] = useState<SystemConfig[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStatistics | null>(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('system');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [saving, setSaving] = useState(false);

  /**
   * 加载系统配置
   */
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await systemApi.getConfigs();
      setConfigs(response.data);
      
      // 将配置转换为表单数据
      const formData: Record<string, any> = {};
      response.data.forEach((config: SystemConfig) => {
        formData[config.configKey] = config.configValue;
      });
      configForm.setFieldsValue(formData);
    } catch (error) {
      message.error('加载系统配置失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载用户列表
   */
  const loadUsers = async (page = 1, size = 10, keyword = '') => {
    try {
      setLoading(true);
      const response = await userApi.getUsers({
        page: page - 1,
        size,
        keyword
      });
      setUsers(response.data.content);
      setPagination({
        current: page,
        pageSize: size,
        total: response.data.totalElements
      });
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载邮件统计信息
   */
  const loadEmailStats = async () => {
    try {
      const response = await emailApi.getEmailStatistics();
      setEmailStats(response.data);
    } catch (error) {
      message.error('加载邮件统计失败');
    }
  };

  /**
   * 保存系统配置
   */
  const saveConfigs = async (values: Record<string, any>) => {
    try {
      setSaving(true);
      await systemApi.updateConfigs(values);
      message.success('系统配置保存成功');
      loadConfigs();
    } catch (error) {
      message.error('保存系统配置失败');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 处理用户保存
   */
  const handleUserSave = async (values: UserCreateRequest | UserUpdateRequest) => {
    try {
      setSaving(true);
      if (editingUser) {
        await userApi.updateUser(editingUser.id, values as UserUpdateRequest);
        message.success('用户更新成功');
      } else {
        await userApi.createUser(values as UserCreateRequest);
        message.success('用户创建成功');
      }
      setIsUserModalVisible(false);
      setEditingUser(null);
      userForm.resetFields();
      loadUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(editingUser ? '更新用户失败' : '创建用户失败');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 处理用户删除
   */
  const handleUserDelete = async (userId: number) => {
    try {
      await userApi.deleteUser(userId);
      message.success('用户删除成功');
      loadUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  /**
   * 发送测试邮件
   */
  const handleSendTestEmail = async (values: TestEmailRequest) => {
    try {
      setSaving(true);
      await emailApi.sendTestEmail(values);
      message.success('测试邮件发送成功');
      setIsEmailModalVisible(false);
      emailForm.resetFields();
    } catch (error) {
      message.error('测试邮件发送失败');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 手动执行到期检查
   */
  const handleManualCheck = async () => {
    try {
      setSaving(true);
      const response = await emailApi.manualCheckExpiration();
      message.success(response.data);
      loadEmailStats();
    } catch (error) {
      message.error('执行到期检查失败');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 批量发送提醒邮件
   */
  const handleBatchReminder = async (days: number) => {
    try {
      setSaving(true);
      const response = await emailApi.sendBatchReminders(days);
      message.success(response.data.message);
      loadEmailStats();
    } catch (error) {
      message.error('批量发送提醒失败');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 处理编辑用户
   */
  const handleEditUser = (user: User | null = null) => {
    setEditingUser(user);
    setIsUserModalVisible(true);
    
    if (user) {
      userForm.setFieldsValue({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        enabled: user.enabled,
      });
    } else {
      userForm.resetFields();
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadConfigs();
      loadUsers();
      loadEmailStats();
    }
  }, [user]);

  // 如果不是管理员，显示无权限提示
  if (user?.role !== 'ADMIN') {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={3}>访问被拒绝</Title>
        <p>您没有权限访问此页面。</p>
      </div>
    );
  }

  // 用户表格列定义
  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '姓名',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
          {role === 'ADMIN' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleUserDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SettingOutlined /> 系统设置
        </Title>
        <Text type="secondary">管理系统配置、用户和邮件提醒</Text>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 系统配置选项卡 */}
        <TabPane tab={<span><SettingOutlined />系统配置</span>} key="system">
          <Card>
            <Form
              form={configForm}
              layout="vertical"
              onFinish={saveConfigs}
              style={{ maxWidth: 800 }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Title level={4}>邮件提醒设置</Title>
                  <Form.Item
                    name="email.reminder.days"
                    label="提醒天数"
                    help="合同到期前多少天发送提醒邮件，多个天数用逗号分隔"
                    rules={[{ required: true, message: '请输入提醒天数' }]}
                  >
                    <Input placeholder="例如：30,15,7,3" />
                  </Form.Item>
                  
                  <Form.Item
                    name="email.smtp.host"
                    label="SMTP服务器"
                    rules={[{ required: true, message: '请输入SMTP服务器地址' }]}
                  >
                    <Input placeholder="例如：smtp.company.com" />
                  </Form.Item>
                  
                  <Form.Item
                     name="email.smtp.port"
                     label="SMTP端口"
                     rules={[{ required: true, message: '请输入SMTP端口' }]}
                   >
                     <InputNumber placeholder="587" style={{ width: '100%' }} />
                   </Form.Item>
                  
                  <Form.Item
                    name="email.smtp.username"
                    label="SMTP用户名"
                    rules={[{ required: true, message: '请输入SMTP用户名' }]}
                  >
                    <Input placeholder="例如：system@company.com" />
                  </Form.Item>
                  
                  <Form.Item
                    name="email.smtp.password"
                    label="SMTP密码"
                    rules={[{ required: true, message: '请输入SMTP密码' }]}
                  >
                    <Input.Password placeholder="请输入SMTP密码" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Title level={4}>文件上传设置</Title>
                  <Form.Item
                    name="file.upload.path"
                    label="文件上传路径"
                    rules={[{ required: true, message: '请输入文件上传路径' }]}
                  >
                    <Input placeholder="例如：./uploads/" />
                  </Form.Item>
                  
                  <Form.Item
                     name="file.max.size"
                     label="文件最大大小（MB）"
                     rules={[{ required: true, message: '请输入文件最大大小' }]}
                   >
                     <InputNumber 
                       placeholder="10" 
                       style={{ width: '100%' }}
                       min={1}
                       max={100}
                     />
                   </Form.Item>
                  
                  <Form.Item
                    name="file.allowed.types"
                    label="允许的文件类型"
                    help="多个类型用逗号分隔"
                  >
                    <Input placeholder="例如：pdf,doc,docx,jpg,png" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider />
              
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving}
                  >
                    保存配置
                  </Button>
                  <Button onClick={() => configForm.resetFields()}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* 用户管理选项卡 */}
        <TabPane tab={<span><UserOutlined />用户管理</span>} key="users">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleEditUser()}
                >
                  新增用户
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => loadUsers(pagination.current, pagination.pageSize)}
                  loading={loading}
                >
                  刷新
                </Button>
              </Space>
            </div>
            
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                onChange: (page, size) => loadUsers(page, size),
                onShowSizeChange: (current, size) => loadUsers(current, size),
              }}
            />
          </Card>
        </TabPane>

        {/* 邮件管理选项卡 */}
        <TabPane tab={<span><MailOutlined />邮件管理</span>} key="email">
          <Row gutter={24}>
            <Col span={24}>
              <Card title="邮件统计" style={{ marginBottom: 24 }}>
                {emailStats && (
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic title="3天内到期" value={emailStats.expiring3Days} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="7天内到期" value={emailStats.expiring7Days} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="15天内到期" value={emailStats.expiring15Days} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="30天内到期" value={emailStats.expiring30Days} />
                    </Col>
                  </Row>
                )}
              </Card>
            </Col>
            
            <Col span={24}>
              <Card title="邮件操作">
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => setIsEmailModalVisible(true)}
                  >
                    发送测试邮件
                  </Button>
                  <Button
                    icon={<CheckCircleOutlined />}
                    onClick={handleManualCheck}
                    loading={saving}
                  >
                    手动执行到期检查
                  </Button>
                  <Button
                    icon={<MailOutlined />}
                    onClick={() => handleBatchReminder(7)}
                    loading={saving}
                  >
                    批量发送7天提醒
                  </Button>
                  <Button
                    icon={<MailOutlined />}
                    onClick={() => handleBatchReminder(30)}
                    loading={saving}
                  >
                    批量发送30天提醒
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadEmailStats}
                  >
                    刷新统计
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 用户编辑模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={isUserModalVisible}
        onCancel={() => {
          setIsUserModalVisible(false);
          setEditingUser(null);
          userForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSave}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>
          
          <Form.Item
            name="fullName"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="USER">用户</Option>
              <Option value="ADMIN">管理员</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="enabled"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                保存
              </Button>
              <Button onClick={() => {
                setIsUserModalVisible(false);
                setEditingUser(null);
                userForm.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试邮件模态框 */}
      <Modal
        title="发送测试邮件"
        open={isEmailModalVisible}
        onCancel={() => {
          setIsEmailModalVisible(false);
          emailForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={emailForm}
          layout="vertical"
          onFinish={handleSendTestEmail}
        >
          <Form.Item
            name="to"
            label="收件人"
            rules={[
              { required: true, message: '请输入收件人邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入收件人邮箱" />
          </Form.Item>
          
          <Form.Item
            name="subject"
            label="主题"
            rules={[{ required: true, message: '请输入邮件主题' }]}
            initialValue="测试邮件"
          >
            <Input placeholder="请输入邮件主题" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入邮件内容' }]}
            initialValue="这是一封测试邮件，用于验证邮件服务配置是否正确。"
          >
            <TextArea rows={4} placeholder="请输入邮件内容" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                发送
              </Button>
              <Button onClick={() => {
                setIsEmailModalVisible(false);
                emailForm.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;