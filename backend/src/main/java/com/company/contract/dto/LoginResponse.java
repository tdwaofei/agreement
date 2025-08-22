package com.company.contract.dto;

/**
 * 登录响应数据传输对象
 * 用于返回用户登录结果
 */
public class LoginResponse {

    /**
     * 登录是否成功
     */
    private boolean success;

    /**
     * JWT认证令牌
     */
    private String token;

    /**
     * 用户基本信息
     */
    private UserInfo userInfo;

    /**
     * 响应消息
     */
    private String message;

    // 构造函数
    public LoginResponse() {}

    public LoginResponse(boolean success, String token, UserInfo userInfo, String message) {
        this.success = success;
        this.token = token;
        this.userInfo = userInfo;
        this.message = message;
    }

    // Getter和Setter方法
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserInfo getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(UserInfo userInfo) {
        this.userInfo = userInfo;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * 用户信息内部类
     */
    public static class UserInfo {
        /**
         * 用户ID
         */
        private Long id;

        /**
         * 用户名
         */
        private String username;

        /**
         * 真实姓名
         */
        private String realName;

        /**
         * 邮箱地址
         */
        private String email;

        /**
         * 用户角色
         */
        private String role;

        // 构造函数
        public UserInfo() {}

        public UserInfo(Long id, String username, String realName, String email, String role) {
            this.id = id;
            this.username = username;
            this.realName = realName;
            this.email = email;
            this.role = role;
        }

        // Getter和Setter方法
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getRealName() {
            return realName;
        }

        public void setRealName(String realName) {
            this.realName = realName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }
}