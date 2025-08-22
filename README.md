# 合同管理系统

## 项目概述

合同管理系统是一个面向企业内部员工的合同信息管理平台，主要用于合同信息的采集、存储、管理和到期提醒。

## 技术栈

### 后端
- Spring Boot 3.2
- Spring Security
- Spring Data JPA
- MySQL 8.0
- Spring Boot Mail
- Spring Boot Scheduler

### 前端
- React 18
- Ant Design 5
- Vite
- TypeScript

## 项目结构

```
agreement/
├── backend/                 # Spring Boot后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── pom.xml
│   └── README.md
├── frontend/                # React前端项目
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── database/                # 数据库脚本
│   └── init.sql
└── README.md
```

## 快速开始
### 前提
1. mvn clean 项目清理成功，现在需要重新编译项目以确保使用正确的Java版本。
2. mvn compile 
### 后端启动

1. 进入backend目录
2. 配置数据库连接信息
3. 运行 `mvn spring-boot:run`

### 前端启动

1. 进入frontend目录
2. 安装依赖 `npm install`
3. 启动开发服务器 `npm run dev`

## 功能特性

- 用户登录认证
- 合同信息管理
- 文件上传下载
- 自动邮件提醒
- 系统配置管理

## 默认账号

- 用户名：admin
- 密码：123456