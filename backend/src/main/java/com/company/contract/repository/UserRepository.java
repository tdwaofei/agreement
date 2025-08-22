package com.company.contract.repository;

import com.company.contract.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 用户数据访问接口
 * 提供用户相关的数据库操作方法
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据用户名查找用户
     * @param username 用户名
     * @return 用户信息（可选）
     */
    Optional<User> findByUsername(String username);

    /**
     * 根据邮箱查找用户
     * @param email 邮箱地址
     * @return 用户信息（可选）
     */
    Optional<User> findByEmail(String email);

    /**
     * 检查用户名是否存在
     * @param username 用户名
     * @return 是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在
     * @param email 邮箱地址
     * @return 是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 根据角色查找用户列表
     * @param role 用户角色
     * @return 用户列表
     */
    List<User> findByRole(User.UserRole role);

    /**
     * 查找所有普通用户（用于合同负责人选择）
     * @return 普通用户列表
     */
    @Query("SELECT u FROM User u WHERE u.role = 'USER' ORDER BY u.realName")
    List<User> findAllRegularUsers();

    /**
     * 根据真实姓名模糊查询用户
     * @param realName 真实姓名关键字
     * @return 用户列表
     */
    @Query("SELECT u FROM User u WHERE u.realName LIKE %:realName% ORDER BY u.realName")
    List<User> findByRealNameContaining(@Param("realName") String realName);
}