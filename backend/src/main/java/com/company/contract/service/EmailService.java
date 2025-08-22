package com.company.contract.service;

import com.company.contract.entity.Contract;
import com.company.contract.entity.SystemConfig;
import com.company.contract.entity.User;
import com.company.contract.repository.SystemConfigRepository;
import com.company.contract.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

/**
 * 邮件服务类
 * 提供邮件发送功能，包括合同到期提醒邮件
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 发送合同到期提醒邮件
     * @param contract 合同信息
     * @param daysToExpire 距离到期天数
     */
    public void sendContractExpirationReminder(Contract contract, int daysToExpire) {
        try {
            // 获取负责人信息
            Optional<User> userOpt = userRepository.findById(contract.getResponsibleUserId());
            if (!userOpt.isPresent()) {
                System.err.println("找不到合同负责人，合同ID: " + contract.getId());
                return;
            }

            User responsibleUser = userOpt.get();
            
            // 构建邮件内容
            String subject = buildReminderSubject(contract, daysToExpire);
            String content = buildReminderContent(contract, responsibleUser, daysToExpire);
            
            // 发送邮件
            sendHtmlEmail(responsibleUser.getEmail(), subject, content);
            
            System.out.println("合同到期提醒邮件发送成功: " + contract.getContractName() + 
                             " -> " + responsibleUser.getEmail());
            
        } catch (Exception e) {
            System.err.println("发送合同到期提醒邮件失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 发送简单文本邮件
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param content 邮件内容
     */
    public void sendSimpleEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(getSmtpUsername());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            
            mailSender.send(message);
            System.out.println("简单邮件发送成功: " + to);
        } catch (Exception e) {
            System.err.println("发送简单邮件失败: " + e.getMessage());
            throw new RuntimeException("邮件发送失败", e);
        }
    }

    /**
     * 发送HTML格式邮件
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param htmlContent HTML内容
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(getSmtpUsername());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("HTML邮件发送成功: " + to);
        } catch (MessagingException e) {
            System.err.println("发送HTML邮件失败: " + e.getMessage());
            throw new RuntimeException("邮件发送失败", e);
        }
    }

    /**
     * 发送测试邮件
     * @param to 收件人
     * @param subject 主题
     * @param content 内容
     */
    public void sendTestEmail(String to, String subject, String content) {
        try {
            // 如果内容包含HTML标签，则发送HTML邮件，否则发送文本邮件
            if (content.contains("<") && content.contains(">")) {
                sendHtmlEmail(to, subject, content);
            } else {
                sendSimpleEmail(to, subject, content);
            }
            System.out.println("测试邮件发送成功: " + to);
        } catch (Exception e) {
            System.err.println("测试邮件发送失败: " + e.getMessage());
            throw new RuntimeException("测试邮件发送失败", e);
        }
    }

    /**
     * 构建提醒邮件主题
     * @param contract 合同信息
     * @param daysToExpire 距离到期天数
     * @return 邮件主题
     */
    private String buildReminderSubject(Contract contract, int daysToExpire) {
        if (daysToExpire <= 0) {
            return "【紧急】合同已到期提醒 - " + contract.getContractName();
        } else if (daysToExpire <= 3) {
            return "【紧急】合同即将到期提醒 - " + contract.getContractName();
        } else if (daysToExpire <= 7) {
            return "【重要】合同到期提醒 - " + contract.getContractName();
        } else {
            return "合同到期提醒 - " + contract.getContractName();
        }
    }

    /**
     * 构建提醒邮件内容
     * @param contract 合同信息
     * @param responsibleUser 负责人
     * @param daysToExpire 距离到期天数
     * @return HTML格式的邮件内容
     */
    private String buildReminderContent(Contract contract, User responsibleUser, int daysToExpire) {
        StringBuilder content = new StringBuilder();
        
        content.append("<!DOCTYPE html>");
        content.append("<html><head><meta charset='UTF-8'></head><body>");
        content.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>");
        
        // 邮件标题
        content.append("<h2 style='color: #1890ff; border-bottom: 2px solid #1890ff; padding-bottom: 10px;'>");
        content.append("合同管理系统 - 到期提醒");
        content.append("</h2>");
        
        // 问候语
        content.append("<p>尊敬的 ").append(responsibleUser.getRealName()).append(" 先生/女士：</p>");
        
        // 提醒内容
        if (daysToExpire <= 0) {
            content.append("<p style='color: #ff4d4f; font-weight: bold;'>您负责的合同已经到期，请及时处理！</p>");
        } else {
            content.append("<p>您负责的合同将在 <strong style='color: #ff4d4f;'>");
            content.append(daysToExpire).append(" 天</strong> 后到期，请及时关注并做好相应准备。</p>");
        }
        
        // 合同详情表格
        content.append("<table style='width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd;'>");
        content.append("<tr style='background-color: #f5f5f5;'>");
        content.append("<td style='padding: 12px; border: 1px solid #ddd; font-weight: bold;'>合同信息</td>");
        content.append("<td style='padding: 12px; border: 1px solid #ddd; font-weight: bold;'>详情</td>");
        content.append("</tr>");
        
        content.append("<tr>");
        content.append("<td style='padding: 12px; border: 1px solid #ddd;'>合同名称</td>");
        content.append("<td style='padding: 12px; border: 1px solid #ddd;'>").append(contract.getContractName()).append("</td>");
        content.append("</tr>");
        
        if (contract.getContractNumber() != null) {
            content.append("<tr>");
            content.append("<td style='padding: 12px; border: 1px solid #ddd;'>合同编号</td>");
            content.append("<td style='padding: 12px; border: 1px solid #ddd;'>").append(contract.getContractNumber()).append("</td>");
            content.append("</tr>");
        }
        
        content.append("<tr>");
        content.append("<td style='padding: 12px; border: 1px solid #ddd;'>合同类型</td>");
        content.append("<td style='padding: 12px; border: 1px solid #ddd;'>").append(contract.getContractType()).append("</td>");
        content.append("</tr>");
        
        content.append("<tr>");
        content.append("<td style='padding: 12px; border: 1px solid #ddd;'>开始日期</td>");
        content.append("<td style='padding: 12px; border: 1px solid #ddd;'>").append(contract.getStartDate()).append("</td>");
        content.append("</tr>");
        
        content.append("<tr style='background-color: #fff2f0;'>");
        content.append("<td style='padding: 12px; border: 1px solid #ddd; font-weight: bold;'>截止日期</td>");
        content.append("<td style='padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #ff4d4f;'>");
        content.append(contract.getEndDate()).append("</td>");
        content.append("</tr>");
        
        if (contract.getDescription() != null && !contract.getDescription().trim().isEmpty()) {
            content.append("<tr>");
            content.append("<td style='padding: 12px; border: 1px solid #ddd;'>合同描述</td>");
            content.append("<td style='padding: 12px; border: 1px solid #ddd;'>").append(contract.getDescription()).append("</td>");
            content.append("</tr>");
        }
        
        content.append("</table>");
        
        // 建议操作
        content.append("<div style='background-color: #f6ffed; border: 1px solid #b7eb8f; padding: 15px; margin: 20px 0; border-radius: 4px;'>");
        content.append("<h4 style='color: #52c41a; margin-top: 0;'>建议操作：</h4>");
        content.append("<ul style='margin: 0; padding-left: 20px;'>");
        content.append("<li>登录合同管理系统查看详细信息</li>");
        content.append("<li>联系相关方商讨续约或终止事宜</li>");
        content.append("<li>准备相关文档和材料</li>");
        content.append("<li>及时更新合同状态</li>");
        content.append("</ul>");
        content.append("</div>");
        
        // 系统信息
        content.append("<hr style='margin: 30px 0; border: none; border-top: 1px solid #ddd;'>");
        content.append("<p style='color: #666; font-size: 12px;'>");
        content.append("此邮件由合同管理系统自动发送，请勿直接回复。<br>");
        content.append("发送时间: ").append(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日")));
        content.append("</p>");
        
        content.append("</div>");
        content.append("</body></html>");
        
        return content.toString();
    }

    /**
     * 获取SMTP用户名配置
     * @return SMTP用户名
     */
    private String getSmtpUsername() {
        return getConfigValue("email.smtp.username", "system@company.com");
    }

    /**
     * 获取配置值
     * @param configKey 配置键
     * @param defaultValue 默认值
     * @return 配置值
     */
    private String getConfigValue(String configKey, String defaultValue) {
        try {
            Optional<SystemConfig> configOpt = systemConfigRepository.findByConfigKey(configKey);
            return configOpt.map(SystemConfig::getConfigValue).orElse(defaultValue);
        } catch (Exception e) {
            System.err.println("获取配置失败: " + configKey + ", 使用默认值: " + defaultValue);
            return defaultValue;
        }
    }

    /**
     * 测试邮件发送功能
     * @param toEmail 测试邮箱
     * @return 是否发送成功
     */
    public boolean testEmailSending(String toEmail) {
        try {
            String subject = "合同管理系统 - 邮件功能测试";
            String content = "这是一封测试邮件，用于验证邮件发送功能是否正常。\n\n" +
                           "如果您收到此邮件，说明邮件服务配置正确。\n\n" +
                           "发送时间: " + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日"));
            
            sendSimpleEmail(toEmail, subject, content);
            return true;
        } catch (Exception e) {
            System.err.println("邮件发送测试失败: " + e.getMessage());
            return false;
        }
    }
}