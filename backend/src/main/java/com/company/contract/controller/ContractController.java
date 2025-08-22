package com.company.contract.controller;

import com.company.contract.dto.ContractCreateRequest;
import com.company.contract.dto.ContractUpdateRequest;
import com.company.contract.entity.Contract;
import com.company.contract.entity.User;
import com.company.contract.repository.UserRepository;
import com.company.contract.service.ContractService;
import com.company.contract.service.UserDetailsServiceImpl;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * 合同控制器
 * 处理合同相关的HTTP请求
 */
@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "*")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @Autowired
    private UserRepository userRepository;

    /**
     * 创建新合同
     * @param request 合同创建请求
     * @param authentication 认证信息
     * @return 创建结果
     */
    @PostMapping
    public ResponseEntity<?> createContract(@Valid @RequestBody ContractCreateRequest request,
                                          Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            Long currentUserId = userDetails.getUser().getId();

            Contract contract = contractService.createContract(request, currentUserId);
            return ResponseEntity.ok(contract);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("创建合同失败: " + e.getMessage());
        }
    }

    /**
     * 更新合同信息
     * @param contractId 合同ID
     * @param request 合同更新请求
     * @param authentication 认证信息
     * @return 更新结果
     */
    @PutMapping("/{contractId}")
    public ResponseEntity<?> updateContract(@PathVariable Long contractId,
                                          @Valid @RequestBody ContractUpdateRequest request,
                                          Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            Contract contract = contractService.updateContract(contractId, request, 
                                                             currentUser.getId(), isAdmin);
            return ResponseEntity.ok(contract);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("更新合同失败: " + e.getMessage());
        }
    }

    /**
     * 删除合同
     * @param contractId 合同ID
     * @param authentication 认证信息
     * @return 删除结果
     */
    @DeleteMapping("/{contractId}")
    public ResponseEntity<?> deleteContract(@PathVariable Long contractId,
                                          Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            contractService.deleteContract(contractId, currentUser.getId(), isAdmin);
            return ResponseEntity.ok("合同删除成功");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("删除合同失败: " + e.getMessage());
        }
    }

    /**
     * 获取合同详情
     * @param contractId 合同ID
     * @param authentication 认证信息
     * @return 合同详情
     */
    @GetMapping("/{contractId}")
    public ResponseEntity<?> getContract(@PathVariable Long contractId,
                                       Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            Optional<Contract> contract = contractService.getContractById(contractId, 
                                                                        currentUser.getId(), isAdmin);
            if (contract.isPresent()) {
                return ResponseEntity.ok(contract.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("获取合同失败: " + e.getMessage());
        }
    }

    /**
     * 分页查询合同列表
     * @param contractName 合同名称（可选）
     * @param contractType 合同类型（可选）
     * @param status 合同状态（可选）
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @param sort 排序字段
     * @param direction 排序方向
     * @param authentication 认证信息
     * @return 合同分页列表
     */
    @GetMapping
    public ResponseEntity<?> getContracts(
            @RequestParam(required = false) String contractName,
            @RequestParam(required = false) String contractType,
            @RequestParam(required = false) Contract.ContractStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            // 创建排序对象
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

            Page<Contract> contracts = contractService.getContracts(
                contractName, contractType, status, currentUser.getId(), isAdmin, pageable);
            
            return ResponseEntity.ok(contracts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("查询合同失败: " + e.getMessage());
        }
    }

    /**
     * 获取合同统计信息
     * @param authentication 认证信息
     * @return 统计信息
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getContractStatistics(Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            ContractService.ContractStatistics statistics = 
                contractService.getContractStatistics(currentUser.getId(), isAdmin);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("获取统计信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取即将到期的合同列表
     * @param days 提前天数（默认30天）
     * @param authentication 认证信息
     * @return 即将到期的合同列表
     */
    @GetMapping("/expiring")
    public ResponseEntity<?> getExpiringContracts(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        try {
            List<Contract> expiringContracts = contractService.getExpiringContracts(days);
            return ResponseEntity.ok(expiringContracts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("获取即将到期合同失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有用户列表（用于选择负责人）
     * @return 用户列表
     */
    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        try {
            List<User> users = userRepository.findAllRegularUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("获取用户列表失败: " + e.getMessage());
        }
    }
}