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
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final S3Service s3Service;

    @Override
    public UserResponse create(UserCreationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXSISTED, request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED, request.getUsername());
        }

        UserEntity newUser = userMapper.toEntity(request);
//        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        Set<RoleEntity> roles = new HashSet<>();
        RoleEntity role = roleRepository.findByName(Role.USER.name())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        roles.add(role);
        newUser.setRoles(roles);
        newUser.setAvatar("https://ui.shadcn.com/avatars/02.png");
        UserEntity savedUser = userRepository.save(newUser);
        return userMapper.toUserResponse(savedUser);

    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findByStatusNot(UserStatus.DELETED).stream().map(userMapper::toUserResponse).toList();
    }

    @Override
    public UserResponse getUserById(String id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @Override
    public ProfileUpdateResponse updateProfile(String id, ProfileUpdateRequest request) {
        // 1. Tìm user trong Database
        UserEntity userEntity = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. KIỂM TRA TRÙNG TÊN ĐĂNG NHẬP (Phải làm trước khi Map dữ liệu)
        String newUsername = request.getUsername();
        String currentUsername = userEntity.getUsername();

        // Nếu có đổi tên đăng nhập VÀ tên đăng nhập mới đã tồn tại -> Báo lỗi ngay lập tức
        if (newUsername != null && !newUsername.equals(currentUsername)) {
            if (userRepository.existsByUsername(newUsername)) {
                throw new AppException(ErrorCode.USERNAME_EXISTED);
            }
        }

        // 3. Map dữ liệu mới vào Entity (Cập nhật các trường khác như fullName, phone, avatar...)
        userMapper.updateUser(userEntity, request);

        // 4. Cập nhật Roles
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<String> roleNames = request.getRoles();
            List<RoleEntity> roleEntities = roleRepository.findByNameIn(roleNames);

            if (roleEntities.size() != roleNames.size()) {
                throw new AppException(ErrorCode.ROLE_NOT_FOUND);
            }

            userEntity.setRoles(new HashSet<>(roleEntities));
        }

        // 5. Lưu xuống DB và trả về kết quả
        return userMapper.toProfileUpdateResponse(userRepository.save(userEntity));
    }

    @Override
    @Transactional
    public void hardDeleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        userRepository.deleteById(userId);
    }

    @Override
    public void softDeleteUser(String userId) {
        // 1. Tìm user, nếu không thấy thì báo lỗi
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Cập nhật thời gian xóa là thời điểm hiện tại
        user.setDeletedAt(LocalDateTime.now());

        // 3. (Tùy chọn) Cập nhật trạng thái thành INACTIVE nếu bạn muốn
         user.setStatus(UserStatus.DELETED);

        // 4. Lưu lại
        userRepository.save(user);
    }

    @Override
    public List<UserResponse> getAllUsersSD() {
        return userRepository.findByStatus(UserStatus.DELETED).stream().map(userMapper::toUserResponse).toList();
    }

    @Override
    @Transactional
    public void restoreUser(String userId) {
        // 1. Tìm user trong DB (bao gồm cả người đã bị xóa mềm)
        // Nếu bạn dùng Hibernate @Where, hãy dùng phương thức có Native Query trong Repo
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Kiểm tra xem user này có thực sự đang bị xóa không
        if (user.getDeletedAt() == null) {
            throw new RuntimeException("Tài khoản này hiện không nằm trong thùng rác.");
        }

        // 3. Khôi phục dữ liệu
        user.setDeletedAt(null); // Xóa mốc thời gian xóa
        user.setStatus(UserStatus.ACTIVE); // Chuyển lại trạng thái hoạt động

        // 4. Lưu lại
        userRepository.save(user);
    }

    @Override
    @Transactional
    public String updateAvatar(String userId, MultipartFile file) {
        try {
            // 1. Dùng UserEntity thay vì User của thư viện lạ
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            // 2. Upload lên S3
            String avatarUrl = s3Service.uploadFile(file, "avatars");

            // 3. Cập nhật field avatar
            user.setAvatar(avatarUrl);

            // 4. Lưu lại
            userRepository.save(user);

            // Lưu ý: Nếu chưa có thư viện log, bạn có thể dùng System.out.println hoặc thêm @Slf4j ở đầu Class
            return avatarUrl;
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }

}
