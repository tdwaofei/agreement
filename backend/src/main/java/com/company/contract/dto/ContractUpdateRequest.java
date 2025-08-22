package com.company.contract.dto;

import com.company.contract.entity.Contract;

import java.time.LocalDate;

/**
 * 合同更新请求数据传输对象
 * 用于接收更新合同的请求参数
 */
public class ContractUpdateRequest {

    /**
     * 合同名称
     */
    private String contractName;

    /**
     * 合同类型
     */
    private String contractType;

    /**
     * 合同编号
     */
    private String contractNumber;

    /**
     * 负责人ID
     */
    private Long responsibleUserId;

    /**
     * 合同开始日期
     */
    private LocalDate startDate;

    /**
     * 合同截止日期
     */
    private LocalDate endDate;

    /**
     * 合同状态
     */
    private Contract.ContractStatus status;

    /**
     * 合同描述
     */
    private String description;

    // 构造函数
    public ContractUpdateRequest() {}

    public ContractUpdateRequest(String contractName, String contractType, String contractNumber,
                               Long responsibleUserId, LocalDate startDate, LocalDate endDate,
                               Contract.ContractStatus status, String description) {
        this.contractName = contractName;
        this.contractType = contractType;
        this.contractNumber = contractNumber;
        this.responsibleUserId = responsibleUserId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.description = description;
    }

    // Getter和Setter方法
    public String getContractName() {
        return contractName;
    }

    public void setContractName(String contractName) {
        this.contractName = contractName;
    }

    public String getContractType() {
        return contractType;
    }

    public void setContractType(String contractType) {
        this.contractType = contractType;
    }

    public String getContractNumber() {
        return contractNumber;
    }

    public void setContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
    }

    public Long getResponsibleUserId() {
        return responsibleUserId;
    }

    public void setResponsibleUserId(Long responsibleUserId) {
        this.responsibleUserId = responsibleUserId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Contract.ContractStatus getStatus() {
        return status;
    }

    public void setStatus(Contract.ContractStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "ContractUpdateRequest{" +
                "contractName='" + contractName + '\'' +
                ", contractType='" + contractType + '\'' +
                ", contractNumber='" + contractNumber + '\'' +
                ", responsibleUserId=" + responsibleUserId +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", status=" + status +
                ", description='" + description + '\'' +
                '}';
    }
}