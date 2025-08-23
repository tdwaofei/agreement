package com.company.contract.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * 数据库密码更新工具
 * 用于更新admin用户的密码哈希值
 */
public class DatabasePasswordUpdater {
    
    private static final String DB_URL = "jdbc:mysql://sh-cynosdbmysql-grp-ikhg477i.sql.tencentcdb.com:21589/aofeimysql?useUnicode=true&characterEncoding=utf8&useSSL=true&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true";
    private static final String DB_USER = "aofei";
    private static final String DB_PASSWORD = "NG()G5*zbwLb";
    private static final String NEW_PASSWORD_HASH = "$2a$10$KBBuIx1BHWF8vX0CzDKRaOrJH7v617EfA0/WYojzVN6zX9Uz26cnS";
    
    /**
     * 主方法
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        Connection conn = null;
        PreparedStatement updateStmt = null;
        PreparedStatement selectStmt = null;
        ResultSet rs = null;
        
        try {
            // 加载MySQL驱动
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            // 建立数据库连接
            System.out.println("正在连接数据库...");
            conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
            System.out.println("数据库连接成功！");
            
            // 查询当前admin用户信息
            System.out.println("\n查询当前admin用户信息:");
            selectStmt = conn.prepareStatement("SELECT username, password_hash, real_name, email, role FROM users WHERE username = ?");
            selectStmt.setString(1, "admin");
            rs = selectStmt.executeQuery();
            
            if (rs.next()) {
                System.out.println("用户名: " + rs.getString("username"));
                System.out.println("当前密码哈希: " + rs.getString("password_hash"));
                System.out.println("真实姓名: " + rs.getString("real_name"));
                System.out.println("邮箱: " + rs.getString("email"));
                System.out.println("角色: " + rs.getString("role"));
            } else {
                System.out.println("未找到admin用户！");
                return;
            }
            
            // 更新密码哈希
            System.out.println("\n正在更新admin用户密码哈希...");
            updateStmt = conn.prepareStatement("UPDATE users SET password_hash = ? WHERE username = ?");
            updateStmt.setString(1, NEW_PASSWORD_HASH);
            updateStmt.setString(2, "admin");
            
            int rowsAffected = updateStmt.executeUpdate();
            System.out.println("更新完成，影响行数: " + rowsAffected);
            
            // 验证更新结果
            System.out.println("\n验证更新结果:");
            rs.close();
            selectStmt.close();
            
            selectStmt = conn.prepareStatement("SELECT username, password_hash FROM users WHERE username = ?");
            selectStmt.setString(1, "admin");
            rs = selectStmt.executeQuery();
            
            if (rs.next()) {
                String newHash = rs.getString("password_hash");
                System.out.println("新的密码哈希: " + newHash);
                System.out.println("更新成功: " + NEW_PASSWORD_HASH.equals(newHash));
            }
            
            System.out.println("\n密码更新完成！现在可以使用用户名'admin'和密码'123456'登录系统。");
            
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL驱动未找到: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("数据库操作失败: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // 关闭资源
            try {
                if (rs != null) rs.close();
                if (selectStmt != null) selectStmt.close();
                if (updateStmt != null) updateStmt.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                System.err.println("关闭数据库连接失败: " + e.getMessage());
            }
        }
    }
}