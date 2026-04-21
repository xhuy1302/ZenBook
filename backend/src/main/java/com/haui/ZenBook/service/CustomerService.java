package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.address.AddressRequest;
import com.haui.ZenBook.dto.address.AddressResponse;
import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.dto.user.ChangePasswordRequest;
import com.haui.ZenBook.dto.user.CustomerProfileUpdateRequest;
import com.haui.ZenBook.dto.user.PhoneUpdateRequest;
import com.haui.ZenBook.dto.user.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CustomerService {

    // ── Profile ───────────────────────────────────────────────────────────────
    UserProfileResponse getMyProfile(String email);
    UserProfileResponse updateMyProfile(String email, CustomerProfileUpdateRequest request);
    void updatePhone(String email, PhoneUpdateRequest request);       // thêm mới
    void changePassword(String email, ChangePasswordRequest request);
    String uploadAvatar(String email, MultipartFile file);            // thêm mới

    // ── Orders ────────────────────────────────────────────────────────────────
    List<OrderResponse> getMyOrders(String email);

    // ── Addresses ─────────────────────────────────────────────────────────────
    List<AddressResponse> getMyAddresses(String email);
    AddressResponse createAddress(String email, AddressRequest request);
    AddressResponse updateAddress(String email, String addressId, AddressRequest request);
    void deleteAddress(String email, String addressId);
    void setDefaultAddress(String email, String addressId);
}