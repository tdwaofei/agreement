package com.company.contract.service;

import com.company.contract.entity.Contract;
import com.company.contract.entity.ContractFile;
import com.company.contract.repository.ContractFileRepository;
import com.company.contract.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 文件服务类
 * 提供文件上传、下载、删除等功能
 */
@Service
@Transactional
public class FileService {

    @Autowired
    private ContractFileRepository contractFileRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Value("${file.upload-path:./uploads/}")
    private String uploadPath;

    @Value("${spring.servlet.multipart.max-file-size:10MB}")
    private String maxFileSize;

    /**
     * 允许的文件类型
     */
    private static final String[] ALLOWED_EXTENSIONS = {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
        ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff",
        ".txt", ".rtf", ".zip", ".rar", ".7z"
    };

    /**
     * 最大文件大小（10MB）
     */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    /**
     * 上传合同文件
     * @param contractId 合同ID
     * @param file 上传的文件
     * @param currentUserId 当前用户ID
     * @param isAdmin 是否为管理员
     * @return 上传的文件信息
     */
    public ContractFile uploadFile(Long contractId, MultipartFile file, Long currentUserId, boolean isAdmin) {
        // 验证合同是否存在
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("合同不存在"));

        // 权限检查：只有管理员或合同负责人可以上传文件
        if (!isAdmin && !contract.getResponsibleUserId().equals(currentUserId)) {
            throw new RuntimeException("无权限上传文件到此合同");
        }

        // 验证文件
        validateFile(file);

        try {
            // 创建上传目录
            createUploadDirectory();

            // 生成唯一文件名
            String originalFileName = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFileName);
            String uniqueFileName = generateUniqueFileName(originalFileName);
            String relativePath = generateRelativePath(contractId, uniqueFileName);
            String absolutePath = uploadPath + relativePath;

            // 保存文件到磁盘
            Path targetPath = Paths.get(absolutePath);
            Files.createDirectories(targetPath.getParent());
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // 保存文件信息到数据库
            ContractFile contractFile = new ContractFile();
            contractFile.setContractId(contractId);
            contractFile.setFileName(originalFileName);
            contractFile.setFilePath(relativePath);
            contractFile.setFileType(fileExtension);
            contractFile.setFileSize(file.getSize());

            return contractFileRepository.save(contractFile);

        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取合同的所有文件
     * @param contractId 合同ID
     * @param currentUserId 当前用户ID
     * @param isAdmin 是否为管理员
     * @return 文件列表
     */
    public List<ContractFile> getContractFiles(Long contractId, Long currentUserId, boolean isAdmin) {
        // 验证合同是否存在
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("合同不存在"));

        // 权限检查：只有管理员或合同负责人可以查看文件
        if (!isAdmin && !contract.getResponsibleUserId().equals(currentUserId)) {
            throw new RuntimeException("无权限查看此合同的文件");
        }

        return contractFileRepository.findByContractId(contractId);
    }

    /**
     * 下载文件
     * @param fileId 文件ID
     * @param currentUserId 当前用户ID
     * @param isAdmin 是否为管理员
     * @return 文件路径
     */
    public String downloadFile(Long fileId, Long currentUserId, boolean isAdmin) {
        ContractFile contractFile = contractFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("文件不存在"));

        // 验证合同权限
        Contract contract = contractRepository.findById(contractFile.getContractId())
                .orElseThrow(() -> new RuntimeException("关联的合同不存在"));

        if (!isAdmin && !contract.getResponsibleUserId().equals(currentUserId)) {
            throw new RuntimeException("无权限下载此文件");
        }

        String absolutePath = uploadPath + contractFile.getFilePath();
        File file = new File(absolutePath);
        if (!file.exists()) {
            throw new RuntimeException("文件不存在于服务器上");
        }

        return absolutePath;
    }

    /**
     * 删除文件
     * @param fileId 文件ID
     * @param currentUserId 当前用户ID
     * @param isAdmin 是否为管理员
     */
    public void deleteFile(Long fileId, Long currentUserId, boolean isAdmin) {
        ContractFile contractFile = contractFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("文件不存在"));

        // 验证合同权限
        Contract contract = contractRepository.findById(contractFile.getContractId())
                .orElseThrow(() -> new RuntimeException("关联的合同不存在"));

        if (!isAdmin && !contract.getResponsibleUserId().equals(currentUserId)) {
            throw new RuntimeException("无权限删除此文件");
        }

        try {
            // 删除磁盘上的文件
            String absolutePath = uploadPath + contractFile.getFilePath();
            Path filePath = Paths.get(absolutePath);
            Files.deleteIfExists(filePath);

            // 删除数据库记录
            contractFileRepository.delete(contractFile);

        } catch (IOException e) {
            throw new RuntimeException("删除文件失败: " + e.getMessage(), e);
        }
    }

    /**
     * 验证上传的文件
     * @param file 上传的文件
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("文件不能为空");
        }

        // 检查文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("文件大小不能超过10MB");
        }

        // 检查文件类型
        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new RuntimeException("文件名不能为空");
        }

        String fileExtension = getFileExtension(fileName).toLowerCase();
        boolean isAllowed = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (allowedExt.equalsIgnoreCase(fileExtension)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new RuntimeException("不支持的文件类型: " + fileExtension);
        }
    }

    /**
     * 获取文件扩展名
     * @param fileName 文件名
     * @return 扩展名
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    /**
     * 生成唯一文件名
     * @param originalFileName 原始文件名
     * @return 唯一文件名
     */
    private String generateUniqueFileName(String originalFileName) {
        String fileExtension = getFileExtension(originalFileName);
        String baseName = originalFileName.substring(0, originalFileName.lastIndexOf("."));
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return baseName + "_" + timestamp + "_" + uuid + fileExtension;
    }

    /**
     * 生成相对路径
     * @param contractId 合同ID
     * @param fileName 文件名
     * @return 相对路径
     */
    private String generateRelativePath(Long contractId, String fileName) {
        String dateFolder = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        return "contracts/" + contractId + "/" + dateFolder + "/" + fileName;
    }

    /**
     * 创建上传目录
     */
    private void createUploadDirectory() {
        try {
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("创建上传目录失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取文件信息
     * @param fileId 文件ID
     * @param currentUserId 当前用户ID
     * @param isAdmin 是否为管理员
     * @return 文件信息
     */
    public Optional<ContractFile> getFileById(Long fileId, Long currentUserId, boolean isAdmin) {
        Optional<ContractFile> fileOpt = contractFileRepository.findById(fileId);
        
        if (fileOpt.isPresent()) {
            ContractFile contractFile = fileOpt.get();
            
            // 验证权限
            Contract contract = contractRepository.findById(contractFile.getContractId())
                    .orElseThrow(() -> new RuntimeException("关联的合同不存在"));
            
            if (!isAdmin && !contract.getResponsibleUserId().equals(currentUserId)) {
                throw new RuntimeException("无权限访问此文件");
            }
        }
        
        return fileOpt;
    }
}