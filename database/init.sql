-- 合同管理系统数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS contract_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE contract_management;

-- 创建用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    real_name VARCHAR(100) NOT NULL COMMENT '真实姓名',
    email VARCHAR(100) NOT NULL COMMENT '邮箱地址',
    role VARCHAR(20) DEFAULT 'USER' COMMENT '用户角色：ADMIN/USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 创建合同表
CREATE TABLE contracts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_name VARCHAR(200) NOT NULL COMMENT '合同名称',
    contract_type VARCHAR(50) NOT NULL COMMENT '合同类型',
    contract_number VARCHAR(100) UNIQUE COMMENT '合同编号',
    responsible_user_id BIGINT NOT NULL COMMENT '负责人ID',
    start_date DATE NOT NULL COMMENT '合同开始日期',
    end_date DATE NOT NULL COMMENT '合同截止日期',
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '合同状态：ACTIVE/EXPIRED/TERMINATED',
    description TEXT COMMENT '合同描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_contracts_responsible_user(responsible_user_id),
    INDEX idx_contracts_end_date(end_date),
    INDEX idx_contracts_status(status)
);

-- 创建合同文件表
CREATE TABLE contract_files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT NOT NULL COMMENT '合同ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_type VARCHAR(50) NOT NULL COMMENT '文件类型',
    file_size BIGINT NOT NULL COMMENT '文件大小（字节）',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    INDEX idx_contract_files_contract_id(contract_id)
);

-- 创建系统配置表
CREATE TABLE system_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value VARCHAR(500) NOT NULL COMMENT '配置值',
    description VARCHAR(200) COMMENT '配置描述',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 创建系统日志表
CREATE TABLE system_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '操作用户ID',
    operation VARCHAR(100) NOT NULL COMMENT '操作类型',
    details TEXT COMMENT '操作详情',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_system_logs_user_id(user_id),
    INDEX idx_system_logs_created_at(created_at)
);

-- 初始化管理员账号 (密码: 123456)
INSERT INTO users (username, password_hash, real_name, email, role) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', '系统管理员', 'admin@company.com', 'ADMIN');

-- 初始化普通用户账号 (密码: 123456)
INSERT INTO users (username, password_hash, real_name, email, role) 
VALUES 
('user1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', '张三', 'zhangsan@company.com', 'USER'),
('user2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', '李四', 'lisi@company.com', 'USER');

-- 初始化系统配置
INSERT INTO system_config (config_key, config_value, description) VALUES 
('email.reminder.days', '30,15,7,3', '合同到期提醒天数（逗号分隔）'),
('email.smtp.host', 'smtp.company.com', 'SMTP服务器地址'),
('email.smtp.port', '587', 'SMTP服务器端口'),
('email.smtp.username', 'system@company.com', 'SMTP用户名'),
('email.smtp.password', 'password', 'SMTP密码'),
('file.upload.path', './uploads/', '文件上传路径'),
('file.max.size', '10485760', '文件最大大小（10MB）');

-- 初始化示例合同数据
INSERT INTO contracts (contract_name, contract_type, contract_number, responsible_user_id, start_date, end_date, status, description) VALUES 
('软件开发服务合同', '服务合同', 'CONTRACT-2024-001', 2, '2024-01-01', '2024-12-31', 'ACTIVE', '与ABC公司签署的软件开发服务合同'),
('办公设备采购合同', '采购合同', 'CONTRACT-2024-002', 3, '2024-02-01', '2024-06-30', 'ACTIVE', '办公设备批量采购合同'),
('租赁合同', '租赁合同', 'CONTRACT-2024-003', 2, '2024-01-01', '2024-03-31', 'ACTIVE', '办公场地租赁合同');

-- 提交事务
COMMIT;