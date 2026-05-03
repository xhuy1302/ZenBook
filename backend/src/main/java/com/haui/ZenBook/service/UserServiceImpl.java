package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.auth.PendingRegistration;
import com.haui.ZenBook.dto.user.ProfileUpdateRequest;
import com.haui.ZenBook.dto.user.ProfileUpdateResponse;
import com.haui.ZenBook.dto.user.UserCreationRequest;
import com.haui.ZenBook.dto.user.UserResponse;
import com.haui.ZenBook.entity.RoleEntity;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.enums.Role;
import com.haui.ZenBook.enums.UserStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.UserMapper;
import com.haui.ZenBook.repository.RoleRepository;
import com.haui.ZenBook.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final S3Service s3Service;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final Map<String, PendingRegistration> pendingUsersMap = new ConcurrentHashMap<>();

    @Override
    public UserResponse create(UserCreationRequest request) {
        // 1. Kiểm tra tài khoản đã tồn tại trong DB chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXSISTED, request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED, request.getUsername());
        }

        // 2. Tạo OTP ngẫu nhiên 6 số
        String otp = String.format("%06d", new Random().nextInt(999999));

        // 3. Đóng gói vào DTO tạm và lưu vào bộ nhớ RAM (Map) với Key là Email, thời hạn 5 phút
        PendingRegistration pendingReg = new PendingRegistration(request, otp, LocalDateTime.now().plusMinutes(5));
        pendingUsersMap.put(request.getEmail(), pendingReg);

        // 4. Gửi Email
        emailService.sendOtpEmail(request.getEmail(), otp);

        // Trả về một object rỗng báo hiệu đã nhận yêu cầu nhưng chưa lưu DB thực sự
        return new UserResponse();
    }

    // 👉 THÊM HÀM NÀY ĐỂ BÊN AUTH SERVICE CÓ THỂ GỌI KHI XÁC THỰC OTP THÀNH CÔNG
    public UserResponse confirmRegistration(String email) {
        // Lấy thông tin từ Cache
        PendingRegistration pendingReg = pendingUsersMap.get(email);
        if (pendingReg == null) {
            throw new RuntimeException("Không tìm thấy dữ liệu đăng ký hoặc phiên đã hết hạn.");
        }

        UserCreationRequest request = pendingReg.getRequest();

        // Bắt đầu quá trình lưu vào Database thực sự
        UserEntity newUser = userMapper.toEntity(request);
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        Set<RoleEntity> roles = new HashSet<>();
        RoleEntity role = roleRepository.findByName(Role.USER.name())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND, Role.USER.name()));

        newUser.setStatus(UserStatus.ACTIVE); // Đã xác thực OTP thì là ACTIVE luôn
        roles.add(role);
        newUser.setRoles(roles);
        newUser.setAvatar("https://ui.shadcn.com/avatars/02.png");

        UserEntity savedUser = userRepository.save(newUser);

        // Xóa khỏi Cache sau khi đã lưu DB thành công
        pendingUsersMap.remove(email);

        return userMapper.toUserResponse(savedUser);
    }

    // 👉 HÀM NÀY ĐỂ BÊN AUTH SERVICE KIỂM TRA MÃ OTP
    public PendingRegistration getPendingRegistration(String email) {
        return pendingUsersMap.get(email);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findByStatusNotOrderByCreatedAtDesc(UserStatus.DELETED).stream().map(userMapper::toUserResponse).toList();
    }

    @Override
    public UserResponse getUserById(String id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, id));
        return userMapper.toUserResponse(user);
    }

    @Override
    public ProfileUpdateResponse updateProfile(String id, ProfileUpdateRequest request) {
        UserEntity userEntity = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, id));

        String newUsername = request.getUsername();
        String currentUsername = userEntity.getUsername();

        if (newUsername != null && !newUsername.equals(currentUsername)) {
            if (userRepository.existsByUsername(newUsername)) {
                throw new AppException(ErrorCode.USERNAME_EXISTED, newUsername);
            }
        }

        userMapper.updateUser(userEntity, request);

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<String> roleNames = request.getRoles();
            List<RoleEntity> roleEntities = roleRepository.findByNameIn(roleNames);

            if (roleEntities.size() != roleNames.size()) {
                throw new AppException(ErrorCode.ROLE_NOT_FOUND, "những role cung cấp");
            }

            userEntity.setRoles(new HashSet<>(roleEntities));
        }

        return userMapper.toProfileUpdateResponse(userRepository.save(userEntity));
    }

    @Override
    @Transactional
    public void hardDeleteUser(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, userId));

        // 2. Xóa user -> Membership tự động "bay màu" theo, không lỗi đỏ
        userRepository.delete(user);
    }

    @Override
    public void softDeleteUser(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, userId));

        user.setDeletedAt(LocalDateTime.now());
        user.setStatus(UserStatus.DELETED);
        userRepository.save(user);
    }

    @Override
    public List<UserResponse> getAllUsersSD() {
        return userRepository.findByStatus(UserStatus.DELETED).stream().map(userMapper::toUserResponse).toList();
    }

    @Override
    @Transactional
    public void restoreUser(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, userId));

        if (user.getDeletedAt() == null) {
            throw new RuntimeException("Tài khoản này hiện không nằm trong thùng rác.");
        }

        user.setDeletedAt(null);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public String updateAvatar(String userId, MultipartFile file) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, userId));

            String avatarUrl = s3Service.uploadFile(file, "avatars");
            user.setAvatar(avatarUrl);
            userRepository.save(user);

            return avatarUrl;
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }
}