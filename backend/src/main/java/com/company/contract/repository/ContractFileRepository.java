package com.company.contract.repository;

import com.company.contract.entity.ContractFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 合同文件数据访问接口
 * 提供合同文件相关的数据库操作方法
 */
@Repository
public interface ContractFileRepository extends JpaRepository<ContractFile, Long> {

    /**
     * 根据合同ID查找文件列表
     * @param contractId 合同ID
     * @return 文件列表
     */
    List<ContractFile> findByContractId(Long contractId);

    /**
     * 根据合同ID和文件名查找文件
     * @param contractId 合同ID
     * @param fileName 文件名
     * @return 文件信息
     */
    ContractFile findByContractIdAndFileName(Long contractId, String fileName);

    /**
     * 根据合同ID删除所有文件
     * @param contractId 合同ID
     */
    void deleteByContractId(Long contractId);

    /**
     * 统计合同的文件数量
     * @param contractId 合同ID
     * @return 文件数量
     */
    long countByContractId(Long contractId);

    /**
     * 根据文件类型查找文件
     * @param contractId 合同ID
     * @param fileType 文件类型
     * @return 文件列表
     */
    List<ContractFile> findByContractIdAndFileType(Long contractId, String fileType);

    /**
     * 查找指定大小范围内的文件
     * @param contractId 合同ID
     * @param minSize 最小大小
     * @param maxSize 最大大小
     * @return 文件列表
     */
    @Query("SELECT cf FROM ContractFile cf WHERE cf.contractId = :contractId AND cf.fileSize BETWEEN :minSize AND :maxSize")
    List<ContractFile> findByContractIdAndFileSizeBetween(@Param("contractId") Long contractId,
                                                         @Param("minSize") Long minSize,
                                                         @Param("maxSize") Long maxSize);
}