/**
 * 合同相关类型定义
 */

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