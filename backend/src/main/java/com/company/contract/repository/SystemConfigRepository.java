package com.company.contract.repository;

import com.company.contract.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 系统配置数据访问接口
 * 提供系统配置相关的数据库操作方法
 */
@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {

    /**
     * 根据配置键查找配置
     * @param configKey 配置键
     * @return 配置信息（可选）
     */
    Optional<SystemConfig> findByConfigKey(String configKey);

    /**
     * 检查配置键是否存在
     * @param configKey 配置键
     * @return 是否存在
     */
    boolean existsByConfigKey(String configKey);

    /**
     * 根据配置键删除配置
     * @param configKey 配置键
     */
    void deleteByConfigKey(String configKey);
}