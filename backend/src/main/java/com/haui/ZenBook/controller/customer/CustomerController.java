package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.address.AddressRequest;
import com.haui.ZenBook.dto.address.AddressResponse;
import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.dto.user.ChangePasswordRequest;
import com.haui.ZenBook.dto.user.CustomerProfileUpdateRequest;
import com.haui.ZenBook.dto.user.PhoneUpdateRequest;
import com.haui.ZenBook.dto.user.UserProfileResponse;
import com.haui.ZenBook.service.CustomerService;
import com.haui.ZenBook.util.MessageUtil; // 👉 IMPORT MessageUtil
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final MessageUtil messageUtil; // 👉 INJECT MessageUtil

    // ==========================================
    // ── KHU VỰC 1: PROFILE & AUTH ──
    // ==========================================

    @GetMapping("/auth/me")
    public ApiResponse<UserProfileResponse> getMe(Principal principal) {
        return ApiResponse.<UserProfileResponse>builder()
                .data(customerService.getMyProfile(principal.getName()))
                .build();
    }

    @PutMapping("/users/update")
    public ApiResponse<UserProfileResponse> updateProfile(
            Principal principal,
            @Valid @RequestBody CustomerProfileUpdateRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .data(customerService.updateMyProfile(principal.getName(), request))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    @PutMapping("/users/phone")
    public ApiResponse<Void> updatePhone(
            Principal principal,
            @Valid @RequestBody PhoneUpdateRequest request) {
        customerService.updatePhone(principal.getName(), request);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("phone.updated.success"))
                .build();
    }

    @PutMapping("/users/change-password")
    public ApiResponse<Void> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        customerService.changePassword(principal.getName(), request);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("password.changed.success"))
                .build();
    }

    @PostMapping(value = "/users/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadAvatar(
            Principal principal,
            @RequestParam("file") MultipartFile file) {
        String avatarUrl = customerService.uploadAvatar(principal.getName(), file);

        Map<String, String> responseData = new HashMap<>();
        responseData.put("avatarUrl", avatarUrl);

        return ApiResponse.<Map<String, String>>builder()
                .data(responseData)
                .message(messageUtil.getMessage("avatar.updated.success"))
                .build();
    }

    // ==========================================
    // ── KHU VỰC 2: ORDERS ──
    // ==========================================

    @GetMapping("/orders/my")
    public ApiResponse<List<OrderResponse>> getMyOrders(Principal principal) {
        return ApiResponse.<List<OrderResponse>>builder()
                .data(customerService.getMyOrders(principal.getName()))
                .build();
    }

    // ==========================================
    // ── KHU VỰC 3: ADDRESSES ──
    // ==========================================

    @GetMapping("/users/addresses")
    public ApiResponse<List<AddressResponse>> getMyAddresses(Principal principal) {
        return ApiResponse.<List<AddressResponse>>builder()
                .data(customerService.getMyAddresses(principal.getName()))
                .build();
    }

    @PostMapping("/users/addresses")
    public ApiResponse<AddressResponse> createAddress(
            Principal principal,
            @Valid @RequestBody AddressRequest request) {
        return ApiResponse.<AddressResponse>builder()
                .data(customerService.createAddress(principal.getName(), request))
                .message(messageUtil.getMessage("address.created.success"))
                .build();
    }

    @PutMapping("/users/addresses/{id}")
    public ApiResponse<AddressResponse> updateAddress(
            Principal principal,
            @PathVariable("id") String addressId,
            @Valid @RequestBody AddressRequest request) {
        return ApiResponse.<AddressResponse>builder()
                .data(customerService.updateAddress(principal.getName(), addressId, request))
                .message(messageUtil.getMessage("address.updated.success"))
                .build();
    }

    @DeleteMapping("/users/addresses/{id}")
    public ApiResponse<Void> deleteAddress(
            Principal principal,
            @PathVariable("id") String addressId) {
        customerService.deleteAddress(principal.getName(), addressId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("address.deleted.success"))
                .build();
    }

    @PutMapping("/users/addresses/{id}/default")
    public ApiResponse<Void> setDefaultAddress(
            Principal principal,
            @PathVariable("id") String addressId) {
        customerService.setDefaultAddress(principal.getName(), addressId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("address.default.success"))
                .build();
    }
}