import api from './api'

/**
 * 合同状态枚举
 */
export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED'

/**
 * 合同接口
 */
export interface Contract {
  id: number
  contractName: string
  contractType: string
  contractNumber: string
  responsibleUserId: number
  responsibleUser?: {
    id: number
    realName: string
    email: string
  }
  startDate: string
  endDate: string
  status: ContractStatus
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * 合同创建请求
 */
export interface ContractCreateRequest {
  contractName: string
  contractType: string
  contractNumber?: string
  responsibleUserId: number
  startDate: string
  endDate: string
  description?: string
}

/**
 * 合同更新请求
 */
export interface ContractUpdateRequest {
  contractName?: string
  contractType?: string
  contractNumber?: string
  responsibleUserId?: number
  startDate?: string
  endDate?: string
  status?: ContractStatus
  description?: string
}

/**
 * 分页查询参数
 */
export interface ContractQueryParams {
  contractName?: string
  contractType?: string
  status?: ContractStatus
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

/**
 * 合同统计信息
 */
export interface ContractStatistics {
  activeCount: number
  expiredCount: number
  terminatedCount: number
}

/**
 * 用户信息
 */
export interface User {
  id: number
  username: string
  realName: string
  email: string
  role: string
}

/**
 * 合同API服务
 */
export const contractApi = {
  /**
   * 获取合同列表
   */
  getContracts: (params: ContractQueryParams = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
    
    return api.get<PageResponse<Contract>>(`/api/contracts?${queryParams.toString()}`)
  },

  /**
   * 根据ID获取合同详情
   */
  getContractById: (id: number) => 
    api.get<Contract>(`/api/contracts/${id}`),

  /**
   * 创建新合同
   */
  createContract: (data: ContractCreateRequest) => 
    api.post<Contract>('/api/contracts', data),

  /**
   * 更新合同
   */
  updateContract: (id: number, data: ContractUpdateRequest) => 
    api.put<Contract>(`/api/contracts/${id}`, data),

  /**
   * 删除合同
   */
  deleteContract: (id: number) => 
    api.delete<string>(`/api/contracts/${id}`),

  /**
   * 获取合同统计信息
   */
  getContractStatistics: () => 
    api.get<ContractStatistics>('/api/contracts/statistics'),

  /**
   * 获取即将到期的合同
   */
  getExpiringContracts: (days: number = 30) => 
    api.get<Contract[]>(`/api/contracts/expiring?days=${days}`),

  /**
   * 获取用户列表（用于选择负责人）
   */
  getUsers: () => 
    api.get<User[]>('/api/users'),

  /**
   * 上传合同文件
   */
  uploadContractFiles: (contractId: number, formData: FormData) => 
    api.post<any>(`/api/files/batch-upload/${contractId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  /**
   * 获取合同文件列表
   */
  getContractFiles: (contractId: number) => 
    api.get<any[]>(`/api/files/contract/${contractId}`),

  /**
   * 删除合同文件
   */
  deleteContractFile: (contractId: number, fileId: number) => 
    api.delete<string>(`/api/files/${fileId}`)
};

// 兼容性导出
export const getContracts = contractApi.getContracts;
export const getContractById = contractApi.getContractById;
export const createContract = contractApi.createContract;
export const updateContract = contractApi.updateContract;
export const deleteContract = contractApi.deleteContract;
export const getContractStatistics = contractApi.getContractStatistics;
export const getExpiringContracts = contractApi.getExpiringContracts;
export const getUsers = contractApi.getUsers;
export const uploadContractFiles = contractApi.uploadContractFiles;
export const getContractFiles = contractApi.getContractFiles;
export const deleteContractFile = contractApi.deleteContractFile;