package com.company.contract.service;

import com.company.contract.entity.Contract;
import com.company.contract.entity.SystemConfig;
import com.company.contract.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 定时任务服务类
 * 处理系统的定时任务，包括合同到期提醒、状态更新等
 */
@Service
public class ScheduledTaskService {

    @Autowired
    private ContractService contractService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    /**
     * 合同到期提醒定时任务
     * 每天上午9点执行，检查即将到期的合同并发送提醒邮件
     */
    @Scheduled(cron = "0 0 9 * * ?") // 每天上午9点执行
    public void checkContractExpiration() {
        System.out.println("开始执行合同到期提醒任务: " + LocalDate.now());
        
        try {
            // 获取提醒天数配置
            List<Integer> reminderDays = getReminderDays();
            
            for (Integer days : reminderDays) {
                // 获取指定天数后到期的合同
                List<Contract> expiringContracts = contractService.getExpiringContracts(days);
                
                for (Contract contract : expiringContracts) {
                    // 计算距离到期的确切天数
                    long daysToExpire = ChronoUnit.DAYS.between(LocalDate.now(), contract.getEndDate());
                    
                    // 只在配置的提醒天数发送邮件
                    if (reminderDays.contains((int) daysToExpire)) {
                        emailService.sendContractExpirationReminder(contract, (int) daysToExpire);
                        
                        // 添加延迟避免邮件服务器压力
                        Thread.sleep(1000);
                    }
                }
            }
            
            System.out.println("合同到期提醒任务执行完成");
            
        } catch (Exception e) {
            System.err.println("合同到期提醒任务执行失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 更新过期合同状态定时任务
     * 每天凌晨1点执行，将已过期但状态仍为ACTIVE的合同更新为EXPIRED
     */
    @Scheduled(cron = "0 0 1 * * ?") // 每天凌晨1点执行
    public void updateExpiredContracts() {
        System.out.println("开始执行过期合同状态更新任务: " + LocalDate.now());
        
        try {
            int updatedCount = contractService.updateExpiredContracts();
            System.out.println("过期合同状态更新完成，更新了 " + updatedCount + " 个合同");
        } catch (Exception e) {
            System.err.println("过期合同状态更新任务执行失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 系统健康检查定时任务
     * 每小时执行一次，检查系统运行状态
     */
    @Scheduled(cron = "0 0 * * * ?") // 每小时执行
    public void systemHealthCheck() {
        try {
            // 检查数据库连接
            long totalContracts = contractService.getContractStatistics(1L, true).getActiveCount() +
                                contractService.getContractStatistics(1L, true).getExpiredCount() +
                                contractService.getContractStatistics(1L, true).getTerminatedCount();
            
            System.out.println("系统健康检查完成 - 当前合同总数: " + totalContracts);
        } catch (Exception e) {
            System.err.println("系统健康检查失败: " + e.getMessage());
        }
    }

    /**
     * 手动执行合同到期提醒（用于测试）
     * @return 执行结果
     */
    public String manualCheckContractExpiration() {
        try {
            checkContractExpiration();
            return "手动执行合同到期提醒任务成功";
        } catch (Exception e) {
            return "手动执行合同到期提醒任务失败: " + e.getMessage();
        }
    }

    /**
     * 手动执行过期合同状态更新（用于测试）
     * @return 执行结果
     */
    public String manualUpdateExpiredContracts() {
        try {
            int updatedCount = contractService.updateExpiredContracts();
            return "手动执行过期合同状态更新成功，更新了 " + updatedCount + " 个合同";
        } catch (Exception e) {
            return "手动执行过期合同状态更新失败: " + e.getMessage();
        }
    }

    /**
     * 获取提醒天数配置
     * @return 提醒天数列表
     */
    private List<Integer> getReminderDays() {
        try {
            Optional<SystemConfig> configOpt = systemConfigRepository.findByConfigKey("email.reminder.days");
            String reminderDaysStr = configOpt.map(SystemConfig::getConfigValue).orElse("30,15,7,3");
            
            return Arrays.stream(reminderDaysStr.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("获取提醒天数配置失败，使用默认值: " + e.getMessage());
            return Arrays.asList(30, 15, 7, 3);
        }
    }

    /**
     * 发送系统状态报告邮件（每周一次）
     * 每周一上午10点执行
     */
    @Scheduled(cron = "0 0 10 * * MON") // 每周一上午10点执行
    public void sendWeeklyReport() {
        System.out.println("开始生成周报告: " + LocalDate.now());
        
        try {
            // 获取系统统计信息
            ContractService.ContractStatistics stats = contractService.getContractStatistics(1L, true);
            
            // 获取即将到期的合同
            List<Contract> expiringContracts = contractService.getExpiringContracts(30);
            
            // 构建报告内容
            StringBuilder report = new StringBuilder();
            report.append("合同管理系统周报告\n\n");
            report.append("统计时间: ").append(LocalDate.now()).append("\n\n");
            report.append("合同统计:\n");
            report.append("- 有效合同: ").append(stats.getActiveCount()).append(" 个\n");
            report.append("- 已过期合同: ").append(stats.getExpiredCount()).append(" 个\n");
            report.append("- 已终止合同: ").append(stats.getTerminatedCount()).append(" 个\n");
            report.append("- 合同总数: ").append(stats.getActiveCount() + stats.getExpiredCount() + stats.getTerminatedCount()).append(" 个\n\n");
            
            if (!expiringContracts.isEmpty()) {
                report.append("30天内即将到期的合同 (").append(expiringContracts.size()).append(" 个):\n");
                for (Contract contract : expiringContracts) {
                    long daysToExpire = ChronoUnit.DAYS.between(LocalDate.now(), contract.getEndDate());
                    report.append("- ").append(contract.getContractName())
                          .append(" (还有 ").append(daysToExpire).append(" 天)\n");
                }
            } else {
                report.append("30天内没有即将到期的合同。\n");
            }
            
            // 发送报告邮件给管理员
            // TODO: 获取管理员邮箱列表并发送报告
            System.out.println("周报告生成完成:\n" + report.toString());
            
        } catch (Exception e) {
            System.err.println("生成周报告失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 清理过期的系统日志（每月执行一次）
     * 每月1号凌晨2点执行
     */
    @Scheduled(cron = "0 0 2 1 * ?") // 每月1号凌晨2点执行
    public void cleanupOldLogs() {
        System.out.println("开始清理过期日志: " + LocalDate.now());
        
        try {
            // TODO: 实现日志清理逻辑
            // 删除3个月前的系统日志
            System.out.println("日志清理任务执行完成");
        } catch (Exception e) {
            System.err.println("日志清理任务执行失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}