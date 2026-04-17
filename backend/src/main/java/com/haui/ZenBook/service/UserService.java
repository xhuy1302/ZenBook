package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.user.UserCreationRequest;
import com.haui.ZenBook.dto.user.UserResponse;

public interface UserService {
    UserResponse create(UserCreationRequest request);
}
