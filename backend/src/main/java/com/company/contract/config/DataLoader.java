package com.company.contract.config;

import com.company.contract.entity.User;
import com.company.contract.entity.Contract;
import com.company.contract.repository.UserRepository;
import com.company.contract.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * 数据初始化加载器
 * 在应用启动时自动创建默认用户数据和示例合同数据
 */
@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContractRepository contractRepository;

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
        
        // 创建示例合同数据
        createSampleContracts();
        
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

    /**
     * 创建示例合同数据
     */
    private void createSampleContracts() {
        // 检查是否已有合同数据
        if (contractRepository.count() > 0) {
            System.out.println("合同数据已存在，跳过初始化");
            return;
        }

        // 获取用户ID
        User admin = userRepository.findByUsername("admin").orElse(null);
        User user1 = userRepository.findByUsername("user1").orElse(null);
        
        if (admin == null || user1 == null) {
            System.out.println("用户数据不完整，跳过合同数据初始化");
            return;
        }

        // 创建示例合同1
        Contract contract1 = new Contract();
        contract1.setContractName("软件开发服务合同");
        contract1.setContractType("服务合同");
        contract1.setContractNumber("CONTRACT-2024-001");
        contract1.setResponsibleUserId(user1.getId());
        contract1.setStartDate(LocalDate.of(2024, 1, 1));
        contract1.setEndDate(LocalDate.of(2024, 12, 31));
        contract1.setStatus(Contract.ContractStatus.ACTIVE);
        contract1.setDescription("与ABC公司签署的软件开发服务合同");
        contractRepository.save(contract1);

        // 创建示例合同2
        Contract contract2 = new Contract();
        contract2.setContractName("办公设备采购合同");
        contract2.setContractType("采购合同");
        contract2.setContractNumber("CONTRACT-2024-002");
        contract2.setResponsibleUserId(admin.getId());
        contract2.setStartDate(LocalDate.of(2024, 2, 1));
        contract2.setEndDate(LocalDate.of(2024, 6, 30));
        contract2.setStatus(Contract.ContractStatus.ACTIVE);
        contract2.setDescription("办公设备批量采购合同");
        contractRepository.save(contract2);

        // 创建示例合同3
        Contract contract3 = new Contract();
        contract3.setContractName("办公场地租赁合同");
        contract3.setContractType("租赁合同");
        contract3.setContractNumber("CONTRACT-2024-003");
        contract3.setResponsibleUserId(user1.getId());
        contract3.setStartDate(LocalDate.of(2024, 1, 1));
        contract3.setEndDate(LocalDate.of(2025, 12, 31));
        contract3.setStatus(Contract.ContractStatus.ACTIVE);
        contract3.setDescription("办公场地租赁合同");
        contractRepository.save(contract3);

        System.out.println("已创建3个示例合同数据");
    }
}