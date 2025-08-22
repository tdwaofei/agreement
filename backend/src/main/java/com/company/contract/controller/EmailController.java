package com.company.contract.controller;

import com.company.contract.entity.Contract;
import com.company.contract.service.ContractService;
import com.company.contract.service.EmailService;
import com.company.contract.service.ScheduledTaskService;
import com.company.contract.util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 邮件提醒控制器
 * 处理邮件发送和定时任务管理相关的HTTP请求
 */
@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private ContractService contractService;

    @Autowired
    private ScheduledTaskService scheduledTaskService;

    /**
     * 发送测试邮件
     * @param request 邮件请求参数
     * @return 发送结果
     */
    @PostMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> sendTestEmail(@RequestBody TestEmailRequest request) {
        try {
            emailService.sendTestEmail(request.getTo(), request.getSubject(), request.getContent());
            return ApiResponse.success("测试邮件发送成功");
        } catch (Exception e) {
            return ApiResponse.error("测试邮件发送失败: " + e.getMessage());
        }
    }

    /**
     * 手动发送合同到期提醒邮件
     * @param contractId 合同ID
     * @return 发送结果
     */
    @PostMapping("/reminder/{contractId}")
    @PreAuthorize("hasRole('ADMIN') or @contractService.isContractManager(#contractId, authentication.name)")
    public ApiResponse<String> sendContractReminder(@PathVariable Long contractId) {
        try {
            // 简化处理，直接通过repository获取合同
            Optional<Contract> contractOpt = contractService.getContractById(contractId, 1L, true);
            if (!contractOpt.isPresent()) {
                return ApiResponse.error("合同不存在");
            }
            Contract contract = contractOpt.get();

            // 计算距离到期天数
            long daysToExpire = java.time.temporal.ChronoUnit.DAYS.between(
                java.time.LocalDate.now(), contract.getEndDate());
            
            if (daysToExpire < 0) {
                return ApiResponse.error("合同已过期，无需发送提醒");
            }

            emailService.sendContractExpirationReminder(contract, (int) daysToExpire);
            return ApiResponse.success("合同到期提醒邮件发送成功");
        } catch (Exception e) {
            return ApiResponse.error("发送合同到期提醒失败: " + e.getMessage());
        }
    }

    /**
     * 批量发送即将到期合同的提醒邮件
     * @param days 提前天数
     * @return 发送结果
     */
    @PostMapping("/batch-reminder")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> sendBatchReminders(@RequestParam(defaultValue = "7") int days) {
        try {
            List<Contract> expiringContracts = contractService.getExpiringContracts(days);
            
            int successCount = 0;
            int failCount = 0;
            
            for (Contract contract : expiringContracts) {
                try {
                    long daysToExpire = java.time.temporal.ChronoUnit.DAYS.between(
                        java.time.LocalDate.now(), contract.getEndDate());
                    
                    emailService.sendContractExpirationReminder(contract, (int) daysToExpire);
                    successCount++;
                    
                    // 添加延迟避免邮件服务器压力
                    Thread.sleep(500);
                } catch (Exception e) {
                    failCount++;
                    System.err.println("发送合同 " + contract.getId() + " 的提醒邮件失败: " + e.getMessage());
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("totalContracts", expiringContracts.size());
            result.put("successCount", successCount);
            result.put("failCount", failCount);
            result.put("message", String.format("批量发送完成：成功 %d 个，失败 %d 个", successCount, failCount));
            
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("批量发送提醒邮件失败: " + e.getMessage());
        }
    }

    /**
     * 手动执行合同到期检查任务
     * @return 执行结果
     */
    @PostMapping("/manual-check")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> manualCheckExpiration() {
        try {
            String result = scheduledTaskService.manualCheckContractExpiration();
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("手动执行到期检查失败: " + e.getMessage());
        }
    }

    /**
     * 手动执行过期合同状态更新任务
     * @return 执行结果
     */
    @PostMapping("/manual-update-expired")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> manualUpdateExpired() {
        try {
            String result = scheduledTaskService.manualUpdateExpiredContracts();
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("手动执行状态更新失败: " + e.getMessage());
        }
    }

    /**
     * 获取即将到期的合同列表
     * @param days 提前天数
     * @return 合同列表
     */
    @GetMapping("/expiring-contracts")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ApiResponse<List<Contract>> getExpiringContracts(@RequestParam(defaultValue = "30") int days) {
        try {
            List<Contract> contracts = contractService.getExpiringContracts(days);
            return ApiResponse.success(contracts);
        } catch (Exception e) {
            return ApiResponse.error("获取即将到期合同失败: " + e.getMessage());
        }
    }

    /**
     * 获取邮件发送统计信息
     * @return 统计信息
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> getEmailStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            
            // 获取即将到期的合同数量（不同时间段）
            statistics.put("expiring3Days", contractService.getExpiringContracts(3).size());
            statistics.put("expiring7Days", contractService.getExpiringContracts(7).size());
            statistics.put("expiring15Days", contractService.getExpiringContracts(15).size());
            statistics.put("expiring30Days", contractService.getExpiringContracts(30).size());
            
            // 获取合同统计信息
            ContractService.ContractStatistics contractStats = contractService.getContractStatistics(1L, true);
            statistics.put("activeContracts", contractStats.getActiveCount());
            statistics.put("expiredContracts", contractStats.getExpiredCount());
            statistics.put("terminatedContracts", contractStats.getTerminatedCount());
            
            return ApiResponse.success(statistics);
        } catch (Exception e) {
            return ApiResponse.error("获取邮件统计信息失败: " + e.getMessage());
        }
    }

    /**
     * 测试邮件请求参数
     */
    public static class TestEmailRequest {
        private String to;
        private String subject;
        private String content;

        // Getters and Setters
        public String getTo() {
            return to;
        }

        public void setTo(String to) {
            this.to = to;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}