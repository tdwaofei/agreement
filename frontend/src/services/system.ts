import api from './api';

/**
 * 系统配置接口
 */
export interface SystemConfig {
  id?: number;
  configKey: string;
  configValue: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 用户接口
 */
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户创建请求
 */
export interface UserCreateRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
  enabled?: boolean;
}

/**
 * 用户更新请求
 */
export interface UserUpdateRequest {
  email?: string;
  fullName?: string;
  role?: 'ADMIN' | 'USER';
  enabled?: boolean;
  password?: string;
}

/**
 * 测试邮件请求
 */
export interface TestEmailRequest {
  to: string;
  subject: string;
  content: string;
}

/**
 * 邮件统计信息
 */
export interface EmailStatistics {
  expiring3Days: number;
  expiring7Days: number;
  expiring15Days: number;
  expiring30Days: number;
  activeContracts: number;
  expiredContracts: number;
  terminatedContracts: number;
}

/**
 * 系统配置API
 */
export const systemApi = {
  /**
   * 获取所有系统配置
   */
  getConfigs: () => api.get<SystemConfig[]>('/api/system/configs'),

  /**
   * 获取指定配置
   */
  getConfig: (key: string) => api.get<SystemConfig>(`/api/system/configs/${key}`),

  /**
   * 更新系统配置
   */
  updateConfig: (key: string, value: string) => 
    api.put<SystemConfig>(`/api/system/configs/${key}`, { configValue: value }),

  /**
   * 批量更新系统配置
   */
  updateConfigs: (configs: Record<string, string>) => 
    api.put<SystemConfig[]>('/api/system/configs/batch', configs),

  /**
   * 创建系统配置
   */
  createConfig: (config: Omit<SystemConfig, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<SystemConfig>('/api/system/configs', config),

  /**
   * 删除系统配置
   */
  deleteConfig: (key: string) => api.delete(`/api/system/configs/${key}`),
};

/**
 * 用户管理API
 */
export const userApi = {
  /**
   * 获取用户列表
   */
  getUsers: (params?: {
    page?: number;
    size?: number;
    keyword?: string;
    role?: string;
    enabled?: boolean;
  }) => api.get<{
    content: User[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>('/api/users', { params }),

  /**
   * 获取用户详情
   */
  getUser: (id: number) => api.get<User>(`/api/users/${id}`),

  /**
   * 创建用户
   */
  createUser: (user: UserCreateRequest) => api.post<User>('/api/users', user),

  /**
   * 更新用户
   */
  updateUser: (id: number, user: UserUpdateRequest) => 
    api.put<User>(`/api/users/${id}`, user),

  /**
   * 删除用户
   */
  deleteUser: (id: number) => api.delete(`/api/users/${id}`),

  /**
   * 启用/禁用用户
   */
  toggleUserStatus: (id: number, enabled: boolean) => 
    api.put<User>(`/api/users/${id}/status`, { enabled }),

  /**
   * 重置用户密码
   */
  resetPassword: (id: number, newPassword: string) => 
    api.put<void>(`/api/users/${id}/password`, { password: newPassword }),
};

/**
 * 邮件API
 */
export const emailApi = {
  /**
   * 发送测试邮件
   */
  sendTestEmail: (request: TestEmailRequest) => 
    api.post<string>('/api/email/test', request),

  /**
   * 发送合同提醒邮件
   */
  sendContractReminder: (contractId: number) => 
    api.post<string>(`/api/email/reminder/${contractId}`),

  /**
   * 批量发送提醒邮件
   */
  sendBatchReminders: (days: number = 7) => 
    api.post<{
      totalContracts: number;
      successCount: number;
      failCount: number;
      message: string;
    }>('/api/email/batch-reminder', null, { params: { days } }),

  /**
   * 手动执行到期检查
   */
  manualCheckExpiration: () => api.post<string>('/api/email/manual-check'),

  /**
   * 手动更新过期合同状态
   */
  manualUpdateExpired: () => api.post<string>('/api/email/manual-update-expired'),

  /**
   * 获取即将到期的合同
   */
  getExpiringContracts: (days: number = 30) => 
    api.get<any[]>('/api/email/expiring-contracts', { params: { days } }),

  /**
   * 获取邮件统计信息
   */
  getEmailStatistics: () => api.get<EmailStatistics>('/api/email/statistics'),
};