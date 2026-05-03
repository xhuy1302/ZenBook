package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.auth.PendingRegistration;
import com.haui.ZenBook.dto.user.ProfileUpdateRequest;
import com.haui.ZenBook.dto.user.ProfileUpdateResponse;
import com.haui.ZenBook.dto.user.UserCreationRequest;
import com.haui.ZenBook.dto.user.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    UserResponse create(UserCreationRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(String id);

    ProfileUpdateResponse updateProfile(String id, ProfileUpdateRequest request);

    void hardDeleteUser(String userId);

    void softDeleteUser(String userId);

    List<UserResponse> getAllUsersSD();

    void restoreUser(String userId);

    String updateAvatar(String userId, MultipartFile file);

    UserResponse confirmRegistration(String email);

    PendingRegistration getPendingRegistration(String email);
}
