package com.company.contract.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * 密码哈希生成工具类
 * 用于生成BCrypt密码哈希值
 */
public class PasswordHashGenerator {
    
    /**
     * 主方法，用于生成密码哈希值
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "123456";
        String hashedPassword = encoder.encode(password);
        
        System.out.println("原始密码: " + password);
        System.out.println("BCrypt哈希值: " + hashedPassword);
        
        // 验证哈希值是否正确
        boolean matches = encoder.matches(password, hashedPassword);
        System.out.println("验证结果: " + matches);
        
        // 生成SQL更新语句
        System.out.println("\nSQL更新语句:");
        System.out.println("UPDATE users SET password_hash = '" + hashedPassword + "' WHERE username = 'admin';");
    }
}