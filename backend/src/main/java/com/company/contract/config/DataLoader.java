package com.company.contract.config;

import com.company.contract.entity.User;
import com.company.contract.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 数据初始化加载器
 * 在应用启动时自动创建默认用户数据
 */
@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 应用启动时执行的数据初始化方法
     * @param args 命令行参数
     * @throws Exception 异常
     */
    @Override
    public void run(String... args) throws Exception {
        // 创建默认管理员用户
        createDefaultAdminUser();
        
        // 创建默认普通用户
        createDefaultUser();
        
        System.out.println("数据初始化完成！");
    }

    /**
     * 创建默认管理员用户
     */
    private void createDefaultAdminUser() {
        String adminUsername = "admin";
        
        // 检查管理员用户是否已存在
        if (!userRepository.findByUsername(adminUsername).isPresent()) {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setPasswordHash(passwordEncoder.encode("123456"));
            admin.setRealName("系统管理员");
            admin.setEmail("admin@company.com");
            admin.setRole(User.UserRole.ADMIN);
            
            userRepository.save(admin);
            System.out.println("已创建默认管理员用户: " + adminUsername);
        } else {
            System.out.println("管理员用户已存在: " + adminUsername);
        }
    }

    /**
     * 创建默认普通用户
     */
    private void createDefaultUser() {
        String userUsername = "user1";
        
        // 检查普通用户是否已存在
        if (!userRepository.findByUsername(userUsername).isPresent()) {
            User user = new User();
            user.setUsername(userUsername);
            user.setPasswordHash(passwordEncoder.encode("123456"));
            user.setRealName("普通用户1");
            user.setEmail("user1@company.com");
            user.setRole(User.UserRole.USER);
            
            userRepository.save(user);
            System.out.println("已创建默认普通用户: " + userUsername);
        } else {
            System.out.println("普通用户已存在: " + userUsername);
        }
    }
}