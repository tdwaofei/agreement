package com.company.contract.controller;

import com.company.contract.entity.ContractFile;
import com.company.contract.entity.User;
import com.company.contract.service.FileService;
import com.company.contract.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

/**
 * 文件控制器
 * 处理文件上传、下载、删除等HTTP请求
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Autowired
    private FileService fileService;

    /**
     * 上传文件到指定合同
     * @param contractId 合同ID
     * @param file 上传的文件
     * @param authentication 认证信息
     * @return 上传结果
     */
    @PostMapping("/upload/{contractId}")
    public ResponseEntity<?> uploadFile(@PathVariable Long contractId,
                                      @RequestParam("file") MultipartFile file,
                                      Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            ContractFile contractFile = fileService.uploadFile(contractId, file, 
                                                              currentUser.getId(), isAdmin);
            return ResponseEntity.ok(contractFile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 获取合同的所有文件列表
     * @param contractId 合同ID
     * @param authentication 认证信息
     * @return 文件列表
     */
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<?> getContractFiles(@PathVariable Long contractId,
                                            Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            List<ContractFile> files = fileService.getContractFiles(contractId, 
                                                                   currentUser.getId(), isAdmin);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("获取文件列表失败: " + e.getMessage());
        }
    }

    /**
     * 下载文件
     * @param fileId 文件ID
     * @param authentication 认证信息
     * @return 文件资源
     */
    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId,
                                               Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            // 获取文件信息
            Optional<ContractFile> fileOpt = fileService.getFileById(fileId, 
                                                                    currentUser.getId(), isAdmin);
            if (!fileOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            ContractFile contractFile = fileOpt.get();
            String filePath = fileService.downloadFile(fileId, currentUser.getId(), isAdmin);
            
            File file = new File(filePath);
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            
            // 设置响应头
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                       "attachment; filename=" + encodeFileName(contractFile.getFileName()));
            headers.add(HttpHeaders.CONTENT_TYPE, getContentType(contractFile.getFileType()));
            headers.add(HttpHeaders.CONTENT_LENGTH, String.valueOf(file.length()));

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 删除文件
     * @param fileId 文件ID
     * @param authentication 认证信息
     * @return 删除结果
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable Long fileId,
                                      Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            fileService.deleteFile(fileId, currentUser.getId(), isAdmin);
            return ResponseEntity.ok("文件删除成功");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("删除文件失败: " + e.getMessage());
        }
    }

    /**
     * 获取文件详情
     * @param fileId 文件ID
     * @param authentication 认证信息
     * @return 文件详情
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<?> getFileInfo(@PathVariable Long fileId,
                                       Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            Optional<ContractFile> file = fileService.getFileById(fileId, 
                                                                 currentUser.getId(), isAdmin);
            if (file.isPresent()) {
                return ResponseEntity.ok(file.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("获取文件信息失败: " + e.getMessage());
        }
    }

    /**
     * 批量上传文件
     * @param contractId 合同ID
     * @param files 上传的文件数组
     * @param authentication 认证信息
     * @return 上传结果
     */
    @PostMapping("/batch-upload/{contractId}")
    public ResponseEntity<?> batchUploadFiles(@PathVariable Long contractId,
                                            @RequestParam("files") MultipartFile[] files,
                                            Authentication authentication) {
        try {
            UserDetailsServiceImpl.CustomUserDetails userDetails = 
                (UserDetailsServiceImpl.CustomUserDetails) authentication.getPrincipal();
            User currentUser = userDetails.getUser();
            boolean isAdmin = currentUser.getRole() == User.UserRole.ADMIN;

            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body("请选择要上传的文件");
            }

            if (files.length > 10) {
                return ResponseEntity.badRequest().body("一次最多只能上传10个文件");
            }

            java.util.List<ContractFile> uploadedFiles = new java.util.ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    ContractFile contractFile = fileService.uploadFile(contractId, file, 
                                                                      currentUser.getId(), isAdmin);
                    uploadedFiles.add(contractFile);
                }
            }

            return ResponseEntity.ok(uploadedFiles);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("批量上传失败: " + e.getMessage());
        }
    }

    /**
     * 编码文件名以支持中文
     * @param fileName 原始文件名
     * @return 编码后的文件名
     */
    private String encodeFileName(String fileName) {
        try {
            return URLEncoder.encode(fileName, StandardCharsets.UTF_8.toString())
                    .replaceAll("\\+", "%20");
        } catch (UnsupportedEncodingException e) {
            return fileName;
        }
    }

    /**
     * 根据文件扩展名获取Content-Type
     * @param fileExtension 文件扩展名
     * @return Content-Type
     */
    private String getContentType(String fileExtension) {
        switch (fileExtension.toLowerCase()) {
            case ".pdf":
                return "application/pdf";
            case ".doc":
                return "application/msword";
            case ".docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case ".xls":
                return "application/vnd.ms-excel";
            case ".xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case ".ppt":
                return "application/vnd.ms-powerpoint";
            case ".pptx":
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".gif":
                return "image/gif";
            case ".txt":
                return "text/plain";
            case ".zip":
                return "application/zip";
            case ".rar":
                return "application/x-rar-compressed";
            default:
                return "application/octet-stream";
        }
    }
}