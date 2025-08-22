package com.company.contract.service;

import com.company.contract.dto.ContractCreateRequest;
import com.company.contract.dto.ContractUpdateRequest;
import com.company.contract.entity.Contract;
import com.company.contract.entity.User;
import com.company.contract.repository.ContractRepository;
import com.company.contract.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 合同服务类
 * 提供合同相关的业务逻辑处理
 */
@Service
@Transactional
public class ContractService {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 创建新合同
     * @param request 合同创建请求
     * @param currentUserId 当前用户ID
     * @return 创建的合同
     */
    public Contract createContract(ContractCreateRequest request, Long currentUserId) {
        // 验证负责人是否存在
        if (!userRepository.existsById(request.getResponsibleUserId())) {
            throw new RuntimeException("指定的负责人不存在");
        }

        // 检查合同编号是否重复
        if (request.getContractNumber() != null && 
            contractRepository.existsByContractNumber(request.getContractNumber())) {
            throw new RuntimeException("合同编号已存在");
        }

        // 创建合同实体
        Contract contract = new Contract();
        contract.setContractName(request.getContractName());
        contract.setContractType(request.getContractType());
        contract.setContractNumber(request.getContractNumber());
        contract.setResponsibleUserId(request.getResponsibleUserId());
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setDescription(request.getDescription());
        contract.setStatus(Contract.ContractStatus.ACTIVE);

        return contractRepository.save(contract);
    }

    /**
     * 更新合同信息
     * @param contractId 合同ID
     * @param request 合同更新请求
     * @param currentUserId 当前用户ID
     * @param isAdmin 是否为管理员
     * @return 更新后的合同
     */
    public Contract updateContract(Long contractId, ContractUpdateRequest request, 
                                 Long currentUserId, boolean isAdmin) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("合同不存在"));

        // 权限检查：只有管理员或合同负责人可以修改
        if (!isAdmin && !contract.getResponsibleUserId().equals(currentUserId)) {
            throw new RuntimeException("无权限修改此合同");
        }

        // 验证负责人是否存在
        if (request.getResponsibleUserId() != null && 
            !userRepository.existsById(request.getResponsibleUserId())) {
            throw new RuntimeException("指定的负责人不存在");
        }

        // 检查合同编号是否重复（排除当前合同）
        if (request.getContractNumber() != null && 
            !request.getContractNumber().equals(contract.getContractNumber()) &&
            contractRepository.existsByContractNumber(request.getContractNumber())) {
            throw new RuntimeException("合同编号已存在");
        }

        // 更新合同信息
        if (request.getContractName() != null) {
            contract.setContractName(request.getContractName());
        }
        if (request.getContractType() != null) {
            contract.setContractType(request.getContractType());
        }
        if (request.getContractNumber() != null) {
            contract.setContractNumber(request.getContractNumber());
        }
        if (request.getResponsibleUserId() != null) {
            contract.setResponsibleUserId(request.getResponsibleUserId());
        }
        if (request.getStartDate() != null) {
            contract.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            contract.setEndDate(request.getEndDate());
        }
        if (request.getDescription() != null) {
            contract.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            contract.setStatus(request.getStatus());
        }

        return contractRepository.save(contract);
    }

    /**
     * 删除合同
     * @param contractId 合同ID
     * @param currentUserId 当前用户ID
     * @param isAdmin 是否为管理员
     */
    public void deleteContract(Long contractId, Long currentUserId, boolean isAdmin) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("合同不存在"));

        // 权限检查：只有管理员或合同负责人可以删除
        if (!isAdmin && !contract.getResponsibleUserId().equals(currentUserId)) {
            throw new RuntimeException("无权限删除此合同");
        }

        contractRepository.delete(contract);
    }

    /**
     * 根据ID获取合同详情
     * @param contractId 合同ID
     * @param currentUserId 当前用户ID
     * @param isAdmin 是否为管理员
     * @return 合同详情
     */
    public Optional<Contract> getContractById(Long contractId, Long currentUserId, boolean isAdmin) {
        Optional<Contract> contractOpt = contractRepository.findById(contractId);
        
        if (contractOpt.isPresent()) {
            Contract contract = contractOpt.get();
            // 权限检查：只有管理员或合同负责人可以查看
            if (!isAdmin && !contract.getResponsibleUserId().equals(currentUserId)) {
                throw new RuntimeException("无权限查看此合同");
            }
        }
        
        return contractOpt;
    }

    /**
     * 分页查询合同列表
     * @param contractName 合同名称（可选）
     * @param contractType 合同类型（可选）
     * @param status 合同状态（可选）
     * @param currentUserId 当前用户ID
     * @param isAdmin 是否为管理员
     * @param pageable 分页参数
     * @return 合同分页列表
     */
    public Page<Contract> getContracts(String contractName, String contractType, 
                                     Contract.ContractStatus status, Long currentUserId, 
                                     boolean isAdmin, Pageable pageable) {
        if (isAdmin) {
            // 管理员可以查看所有合同
            return contractRepository.findContractsByConditions(
                contractName, contractType, status, null, pageable);
        } else {
            // 普通用户只能查看自己负责的合同
            return contractRepository.findContractsByConditions(
                contractName, contractType, status, currentUserId, pageable);
        }
    }



    /**
     * 获取合同统计信息
     * @param userId 用户ID（如果为null则获取所有合同统计）
     * @param isAdmin 是否为管理员
     * @return 统计信息
     */
    public ContractStatistics getContractStatistics(Long userId, boolean isAdmin) {
        List<Contract> contracts;
        if (isAdmin) {
            contracts = contractRepository.findAll();
        } else {
            // 使用分页查询但获取所有结果
            Page<Contract> contractPage = contractRepository.findByResponsibleUserId(userId, 
                org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE));
            contracts = contractPage.getContent();
        }

        long activeCount = contracts.stream().filter(c -> c.getStatus() == Contract.ContractStatus.ACTIVE).count();
        long expiredCount = contracts.stream().filter(c -> c.getStatus() == Contract.ContractStatus.EXPIRED).count();
        long terminatedCount = contracts.stream().filter(c -> c.getStatus() == Contract.ContractStatus.TERMINATED).count();

        return new ContractStatistics(activeCount, expiredCount, terminatedCount);
    }

    /**
     * 获取即将到期的合同列表
     * @param days 提前天数
     * @return 即将到期的合同列表
     */
    public List<Contract> getExpiringContracts(int days) {
        LocalDate targetDate = LocalDate.now().plusDays(days);
        return contractRepository.findByEndDateBetweenAndStatus(
            LocalDate.now(), targetDate, Contract.ContractStatus.ACTIVE);
    }

    /**
     * 更新过期合同状态
     * 将已过期但状态仍为ACTIVE的合同更新为EXPIRED
     * @return 更新的合同数量
     */
    public int updateExpiredContracts() {
        List<Contract> expiredContracts = contractRepository.findByEndDateBeforeAndStatus(
            LocalDate.now(), Contract.ContractStatus.ACTIVE);
        
        for (Contract contract : expiredContracts) {
            contract.setStatus(Contract.ContractStatus.EXPIRED);
            contractRepository.save(contract);
        }
        
        return expiredContracts.size();
    }

    /**
     * 检查用户是否为指定合同的管理者
     * @param contractId 合同ID
     * @param username 用户名
     * @return 是否为合同管理者
     */
    public boolean isContractManager(Long contractId, String username) {
        Contract contract = contractRepository.findById(contractId).orElse(null);
        if (contract == null) {
            return false;
        }
        
        User manager = contract.getManager();
        return manager != null && manager.getUsername().equals(username);
    }

    /**
     * 合同统计信息内部类
     */
    public static class ContractStatistics {
        private long activeCount;
        private long expiredCount;
        private long terminatedCount;

        // 构造函数
        public ContractStatistics() {}
        
        public ContractStatistics(long activeCount, long expiredCount, long terminatedCount) {
            this.activeCount = activeCount;
            this.expiredCount = expiredCount;
            this.terminatedCount = terminatedCount;
        }

        // Getter和Setter方法
        public long getActiveCount() {
            return activeCount;
        }

        public void setActiveCount(long activeCount) {
            this.activeCount = activeCount;
        }

        public long getExpiredCount() {
            return expiredCount;
        }

        public void setExpiredCount(long expiredCount) {
            this.expiredCount = expiredCount;
        }

        public long getTerminatedCount() {
            return terminatedCount;
        }

        public void setTerminatedCount(long terminatedCount) {
            this.terminatedCount = terminatedCount;
        }
    }
}