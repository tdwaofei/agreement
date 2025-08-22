package com.company.contract.service;

import com.company.contract.entity.User;
import com.company.contract.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 用户详情服务实现类
 * 实现Spring Security的UserDetailsService接口，用于用户认证
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /**
     * 根据用户名加载用户详情
     * @param username 用户名
     * @return 用户详情
     * @throws UsernameNotFoundException 用户不存在异常
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));

        return new CustomUserDetails(user);
    }

    /**
     * 自定义用户详情类
     * 实现Spring Security的UserDetails接口
     */
    public static class CustomUserDetails implements UserDetails {
        private final User user;

        public CustomUserDetails(User user) {
            this.user = user;
        }

        /**
         * 获取用户权限
         * @return 权限集合
         */
        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            return authorities;
        }

        /**
         * 获取密码
         * @return 密码哈希
         */
        @Override
        public String getPassword() {
            return user.getPasswordHash();
        }

        /**
         * 获取用户名
         * @return 用户名
         */
        @Override
        public String getUsername() {
            return user.getUsername();
        }

        /**
         * 账户是否未过期
         * @return true
         */
        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        /**
         * 账户是否未锁定
         * @return true
         */
        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        /**
         * 凭证是否未过期
         * @return true
         */
        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        /**
         * 账户是否启用
         * @return true
         */
        @Override
        public boolean isEnabled() {
            return true;
        }

        /**
         * 获取用户实体
         * @return 用户实体
         */
        public User getUser() {
            return user;
        }
    }
}