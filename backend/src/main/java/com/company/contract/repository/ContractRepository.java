package com.company.contract.repository;

import com.company.contract.entity.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 合同数据访问接口
 * 提供合同相关的数据库操作方法
 */
@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    /**
     * 根据负责人ID查找合同列表
     * @param responsibleUserId 负责人ID
     * @param pageable 分页参数
     * @return 合同分页列表
     */
    Page<Contract> findByResponsibleUserId(Long responsibleUserId, Pageable pageable);

    /**
     * 根据合同状态查找合同列表
     * @param status 合同状态
     * @param pageable 分页参数
     * @return 合同分页列表
     */
    Page<Contract> findByStatus(Contract.ContractStatus status, Pageable pageable);

    /**
     * 根据合同名称模糊查询
     * @param contractName 合同名称关键字
     * @param pageable 分页参数
     * @return 合同分页列表
     */
    Page<Contract> findByContractNameContainingIgnoreCase(String contractName, Pageable pageable);

    /**
     * 根据合同类型查找合同列表
     * @param contractType 合同类型
     * @param pageable 分页参数
     * @return 合同分页列表
     */
    Page<Contract> findByContractType(String contractType, Pageable pageable);

    /**
     * 查找即将到期的合同（指定天数内）
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 合同列表
     */
    @Query("SELECT c FROM Contract c WHERE c.endDate BETWEEN :startDate AND :endDate AND c.status = 'ACTIVE'")
    List<Contract> findContractsExpiringBetween(@Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);

    /**
     * 查找已过期但状态仍为ACTIVE的合同
     * @param currentDate 当前日期
     * @return 合同列表
     */
    @Query("SELECT c FROM Contract c WHERE c.endDate < :currentDate AND c.status = 'ACTIVE'")
    List<Contract> findExpiredActiveContracts(@Param("currentDate") LocalDate currentDate);

    /**
     * 根据负责人ID和合同状态查找合同
     * @param responsibleUserId 负责人ID
     * @param status 合同状态
     * @param pageable 分页参数
     * @return 合同分页列表
     */
    Page<Contract> findByResponsibleUserIdAndStatus(Long responsibleUserId, 
                                                   Contract.ContractStatus status, 
                                                   Pageable pageable);

    /**
     * 复合查询：根据多个条件查找合同
     * @param contractName 合同名称（可为空）
     * @param contractType 合同类型（可为空）
     * @param status 合同状态（可为空）
     * @param responsibleUserId 负责人ID（可为空）
     * @param pageable 分页参数
     * @return 合同分页列表
     */
    @Query("SELECT c FROM Contract c WHERE " +
           "(:contractName IS NULL OR LOWER(c.contractName) LIKE LOWER(CONCAT('%', :contractName, '%'))) AND " +
           "(:contractType IS NULL OR c.contractType = :contractType) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:responsibleUserId IS NULL OR c.responsibleUserId = :responsibleUserId)")
    Page<Contract> findContractsByConditions(@Param("contractName") String contractName,
                                           @Param("contractType") String contractType,
                                           @Param("status") Contract.ContractStatus status,
                                           @Param("responsibleUserId") Long responsibleUserId,
                                           Pageable pageable);

    /**
     * 统计各状态合同数量
     * @param status 合同状态
     * @return 合同数量
     */
    long countByStatus(Contract.ContractStatus status);

    /**
     * 查找指定日期范围内到期且状态为指定状态的合同
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param status 合同状态
     * @return 合同列表
     */
    List<Contract> findByEndDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, Contract.ContractStatus status);

    /**
     * 查找指定日期之前到期且状态为指定状态的合同
     * @param date 日期
     * @param status 合同状态
     * @return 合同列表
     */
    List<Contract> findByEndDateBeforeAndStatus(LocalDate date, Contract.ContractStatus status);

    /**
     * 统计指定用户的合同数量
     * @param responsibleUserId 负责人ID
     * @return 合同数量
     */
    long countByResponsibleUserId(Long responsibleUserId);

    /**
     * 检查合同编号是否存在
     * @param contractNumber 合同编号
     * @return 是否存在
     */
    boolean existsByContractNumber(String contractNumber);
}