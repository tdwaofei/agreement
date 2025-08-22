package com.company.contract.controller;

import com.company.contract.dto.LoginRequest;
import com.company.contract.dto.LoginResponse;
import com.company.contract.entity.User;
import com.company.contract.service.UserDetailsServiceImpl;
import com.company.contract.util.JwtUtil;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 * 处理用户登录、登出等认证相关请求
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    /**
     * 用户登录接口
     * @param loginRequest 登录请求参数
     * @return 登录响应结果
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // 进行用户认证
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(), 
                    loginRequest.getPassword()
                )
            );

            // 获取用户详情
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            // 生成JWT令牌
            String token = jwtUtil.generateToken(
                user.getUsername(), 
                user.getId(), 
                user.getRole().name()
            );

            // 构建响应
            LoginResponse response = new LoginResponse();
            response.setSuccess(true);
            response.setToken(token);
            response.setUserInfo(new LoginResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getRealName(),
                user.getEmail(),
                user.getRole().name()
            ));
            response.setMessage("登录成功");

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            // 认证失败
            LoginResponse response = new LoginResponse();
            response.setSuccess(false);
            response.setMessage("用户名或密码错误");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            // 其他异常
            LoginResponse response = new LoginResponse();
            response.setSuccess(false);
            response.setMessage("登录失败：" + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 用户登出接口
     * @return 登出响应结果
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT是无状态的，客户端删除token即可实现登出
        return ResponseEntity.ok().body("登出成功");
    }

    /**
     * 获取当前用户信息接口
     * @param authentication 认证信息
     * @return 用户信息
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("未认证");
        }

        UserDetailsServiceImpl.CustomUserDetails userDetails = 
            (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
            user.getId(),
            user.getUsername(),
            user.getRealName(),
            user.getEmail(),
            user.getRole().name()
        );

        return ResponseEntity.ok(userInfo);
    }
}