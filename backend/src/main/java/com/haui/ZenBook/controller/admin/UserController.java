package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.user.ProfileUpdateRequest;
import com.haui.ZenBook.dto.user.ProfileUpdateResponse;
import com.haui.ZenBook.dto.user.UserCreationRequest;
import com.haui.ZenBook.dto.user.UserResponse;
import com.haui.ZenBook.service.UserService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final MessageUtil messageUtil;
    private final UserService userService;

    // 1. Đăng ký/Tạo mới User
    @PostMapping("/register")
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody UserCreationRequest request) {
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setData(userService.create(request));
        apiResponse.setMessage(messageUtil.getMessage("created.success"));
        return apiResponse;
    }

    // 2. Lấy danh sách toàn bộ User (Active)
    @GetMapping
    public ApiResponse<List<UserResponse>> getAll() {
        return ApiResponse.<List<UserResponse>>builder()
                .data(userService.getAllUsers())
                .build();
    }

    // 3. Lấy thông tin chi tiết 1 User
    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getUser(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .data(userService.getUserById(userId))
                .build();
    }

    // 4. Cập nhật Profile (Thông tin text như tên, tuổi, roles...)
    @PutMapping("/{userId}")
    public ApiResponse<ProfileUpdateResponse> updateUser(
            @PathVariable String userId,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ApiResponse.<ProfileUpdateResponse>builder()
                .data(userService.updateProfile(userId, request))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // 5. CẬP NHẬT AVATAR (Hàm mới thêm vào)
    @PatchMapping(value = "/{userId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> uploadAvatar(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file) {

        // Gọi xuống Service để xử lý upload S3 và lưu DB
        String avatarUrl = userService.updateAvatar(userId, file);

        return ApiResponse.<String>builder()
                .data(avatarUrl)
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // 6. Xóa vĩnh viễn User
    @DeleteMapping("/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable String userId) {
        userService.hardDeleteUser(userId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    // 7. Xóa mềm User (Cho vào thùng rác)
    @DeleteMapping("/soft-delete/{userId}")
    public ApiResponse<Void> softDelete(@PathVariable String userId) {
        userService.softDeleteUser(userId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    // 8. Lấy danh sách User trong thùng rác (Inactive)
    @GetMapping("/trash")
    public ApiResponse<List<UserResponse>> getAllUsersSD() {
        return ApiResponse.<List<UserResponse>>builder()
                .data(userService.getAllUsersSD())
                .build();
    }

    // 9. Khôi phục User từ thùng rác
    @PatchMapping("/restore/{userId}")
    public ApiResponse<Void> restore(@PathVariable String userId) {
        userService.restoreUser(userId);
        return ApiResponse.<Void>builder()
                .message("restored.success")
                .build();
    }
}