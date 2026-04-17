package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final S3Service s3Service;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse create(UserCreationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXSISTED, request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED, request.getUsername());
        }

        UserEntity newUser = userMapper.toEntity(request);
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        Set<RoleEntity> roles = new HashSet<>();
        RoleEntity role = roleRepository.findByName(Role.USER.name())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND, Role.USER.name()));
        newUser.setStatus(UserStatus.ACTIVE);
        roles.add(role);
        newUser.setRoles(roles);
        newUser.setAvatar("https://ui.shadcn.com/avatars/02.png");
        UserEntity savedUser = userRepository.save(newUser);
        return userMapper.toUserResponse(savedUser);
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
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND, userId);
        }
        userRepository.deleteById(userId);
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