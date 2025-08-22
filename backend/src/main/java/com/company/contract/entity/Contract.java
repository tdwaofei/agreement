package com.company.contract.entity;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 合同实体类
 * 表示系统中的合同信息
 */
@Entity
@Table(name = "contracts")
@EntityListeners(AuditingEntityListener.class)
public class Contract {

    /**
     * 合同状态枚举
     */
    public enum ContractStatus {
        ACTIVE("正常"),
        EXPIRED("已到期"),
        TERMINATED("已终止");
        
        private final String description;
        
        ContractStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }

    /**
     * 合同ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 合同名称
     */
    @Column(name = "contract_name", nullable = false, length = 200)
    @NotBlank(message = "合同名称不能为空")
    private String contractName;

    /**
     * 合同类型
     */
    @Column(name = "contract_type", nullable = false, length = 50)
    @NotBlank(message = "合同类型不能为空")
    private String contractType;

    /**
     * 合同编号
     */
    @Column(name = "contract_number", unique = true, length = 100)
    private String contractNumber;

    /**
     * 负责人ID
     */
    @Column(name = "responsible_user_id", nullable = false)
    @NotNull(message = "负责人不能为空")
    private Long responsibleUserId;

    /**
     * 合同开始日期
     */
    @Column(name = "start_date", nullable = false)
    @NotNull(message = "合同开始日期不能为空")
    private LocalDate startDate;

    /**
     * 合同截止日期
     */
    @Column(name = "end_date", nullable = false)
    @NotNull(message = "合同截止日期不能为空")
    private LocalDate endDate;

    /**
     * 合同状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContractStatus status = ContractStatus.ACTIVE;

    /**
     * 合同描述
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 创建时间
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 构造函数
    public Contract() {}

    public Contract(String contractName, String contractType, String contractNumber,
                   Long responsibleUserId, LocalDate startDate, LocalDate endDate) {
        this.contractName = contractName;
        this.contractType = contractType;
        this.contractNumber = contractNumber;
        this.responsibleUserId = responsibleUserId;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public ContractStatus getStatus() {
        return status;
    }

    public void setStatus(ContractStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * 获取负责人信息（兼容旧代码）
     * @return 负责人用户对象
     */
    public User getManager() {
        // 这里返回null，实际使用时需要通过Service层查询
        return null;
    }

    @Override
    public String toString() {
        return "Contract{" +
                "id=" + id +
                ", contractName='" + contractName + '\'' +
                ", contractType='" + contractType + '\'' +
                ", contractNumber='" + contractNumber + '\'' +
                ", responsibleUserId=" + responsibleUserId +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", status=" + status +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}