package com.company.contract.entity;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 合同文件实体类
 * 表示合同相关的文件信息
 */
@Entity
@Table(name = "contract_files")
@EntityListeners(AuditingEntityListener.class)
public class ContractFile {

    /**
     * 文件ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 关联的合同ID
     */
    @Column(name = "contract_id", nullable = false)
    @NotNull(message = "合同ID不能为空")
    private Long contractId;

    /**
     * 文件名
     */
    @Column(name = "file_name", nullable = false)
    @NotBlank(message = "文件名不能为空")
    private String fileName;

    /**
     * 文件存储路径
     */
    @Column(name = "file_path", nullable = false, length = 500)
    @NotBlank(message = "文件路径不能为空")
    private String filePath;

    /**
     * 文件类型
     */
    @Column(name = "file_type", nullable = false, length = 50)
    @NotBlank(message = "文件类型不能为空")
    private String fileType;

    /**
     * 文件大小（字节）
     */
    @Column(name = "file_size", nullable = false)
    @NotNull(message = "文件大小不能为空")
    private Long fileSize;

    /**
     * 文件上传时间
     */
    @CreatedDate
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    // 构造函数
    public ContractFile() {}

    public ContractFile(Long contractId, String fileName, String filePath, String fileType, Long fileSize) {
        this.contractId = contractId;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getContractId() {
        return contractId;
    }

    public void setContractId(Long contractId) {
        this.contractId = contractId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}