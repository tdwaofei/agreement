package com.company.contract.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * 合同创建请求数据传输对象
 * 用于接收创建合同的请求参数
 */
public class ContractCreateRequest {

    /**
     * 合同名称
     */
    @NotBlank(message = "合同名称不能为空")
    private String contractName;

    /**
     * 合同类型
     */
    @NotBlank(message = "合同类型不能为空")
    private String contractType;

    /**
     * 合同编号
     */
    private String contractNumber;

    /**
     * 负责人ID
     */
    @NotNull(message = "负责人不能为空")
    private Long responsibleUserId;

    /**
     * 合同开始日期
     */
    @NotNull(message = "合同开始日期不能为空")
    private LocalDate startDate;

    /**
     * 合同截止日期
     */
    @NotNull(message = "合同截止日期不能为空")
    private LocalDate endDate;

    /**
     * 合同描述
     */
    private String description;

    // 构造函数
    public ContractCreateRequest() {}

    public ContractCreateRequest(String contractName, String contractType, String contractNumber,
                               Long responsibleUserId, LocalDate startDate, LocalDate endDate, String description) {
        this.contractName = contractName;
        this.contractType = contractType;
        this.contractNumber = contractNumber;
        this.responsibleUserId = responsibleUserId;
        this.startDate = startDate;
        this.endDate = endDate;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "ContractCreateRequest{" +
                "contractName='" + contractName + '\'' +
                ", contractType='" + contractType + '\'' +
                ", contractNumber='" + contractNumber + '\'' +
                ", responsibleUserId=" + responsibleUserId +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", description='" + description + '\'' +
                '}';
    }
}