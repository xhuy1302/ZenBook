package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service; // 👉 IMPORT S3Service
import com.haui.ZenBook.dto.address.AddressRequest;
import com.haui.ZenBook.dto.address.AddressResponse;
import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.dto.user.ChangePasswordRequest;
import com.haui.ZenBook.dto.user.CustomerProfileUpdateRequest;
import com.haui.ZenBook.dto.user.PhoneUpdateRequest;
import com.haui.ZenBook.dto.user.UserProfileResponse;
import com.haui.ZenBook.entity.AddressEntity;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.AddressMapper;
import com.haui.ZenBook.mapper.UserMapper;
import com.haui.ZenBook.repository.AddressRepository;
import com.haui.ZenBook.repository.OrderRepository;
import com.haui.ZenBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException; // 👉 IMPORT IOException
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;
    private final PasswordEncoder passwordEncoder;

    // 👉 THAY THẾ FileStorageService BẰNG S3Service CỦA BẠN
    private final S3Service s3Service;

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, email));
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    @Override
    public UserProfileResponse getMyProfile(String email) {
        return userMapper.toUserProfileResponse(getUserByEmail(email));
    }

    @Override
    @Transactional
    public UserProfileResponse updateMyProfile(String email, CustomerProfileUpdateRequest request) {
        UserEntity user = getUserByEmail(email);
        userMapper.updateCustomerProfile(user, request);
        return userMapper.toUserProfileResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void updatePhone(String email, PhoneUpdateRequest request) {
        UserEntity user = getUserByEmail(email);
        user.setPhone(request.getPhone());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        UserEntity user = getUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.OLD_PASSWORD_INVALID);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public String uploadAvatar(String email, MultipartFile file) {
        try {
            UserEntity user = getUserByEmail(email);
            String oldAvatarUrl = user.getAvatar();


            if (oldAvatarUrl != null && !oldAvatarUrl.trim().isEmpty()) {
                try {
                    s3Service.deleteFile(oldAvatarUrl);
                } catch (Exception e) {
                    System.err.println("Không thể xóa avatar cũ: " + oldAvatarUrl);
                }
            }

            // 👉 BƯỚC 2: Upload ảnh mới
            String newAvatarUrl = s3Service.uploadFile(file, "avatars");

            user.setAvatar(newAvatarUrl);
            userRepository.save(user);

            return newAvatarUrl;
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }

    // ── Orders ────────────────────────────────────────────────────────────────

    @Override
    public List<OrderResponse> getMyOrders(String email) {
        UserEntity user = getUserByEmail(email);
        // TODO: ráp OrderMapper khi OrderEntity sẵn sàng
        return List.of();
    }

    // ── Addresses ─────────────────────────────────────────────────────────────

    @Override
    public List<AddressResponse> getMyAddresses(String email) {
        UserEntity user = getUserByEmail(email);
        List<AddressEntity> addresses =
                addressRepository.findByUserIdOrderByIsDefaultDesc(user.getId());
        return addressMapper.toAddressResponseList(addresses);
    }

    @Override
    @Transactional
    public AddressResponse createAddress(String email, AddressRequest request) {
        UserEntity user = getUserByEmail(email);

        boolean isFirstAddress = user.getAddresses().isEmpty();

        // Nếu có địa chỉ rồi và request muốn set default → reset cũ trước
        if (!isFirstAddress && request.getIsDefault()) {
            addressRepository.resetDefaultAddressByUserId(user.getId());
        }

        AddressEntity newAddress = AddressEntity.builder()
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .street(request.getStreet())
                .ward(request.getWard())
                .district(request.getDistrict())
                .city(request.getCity())
                .isDefault(isFirstAddress || request.getIsDefault()) // địa chỉ đầu tiên luôn là default
                .user(user)
                .build();

        return addressMapper.toAddressResponse(addressRepository.save(newAddress));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String email, String addressId, AddressRequest request) {
        UserEntity user = getUserByEmail(email);

        AddressEntity address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND, addressId));

        if (request.getIsDefault() && !address.getIsDefault()) {
            addressRepository.resetDefaultAddressByUserId(user.getId());
        }

        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setStreet(request.getStreet());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setCity(request.getCity());

        if (request.getIsDefault()) {
            address.setIsDefault(true);
        }

        return addressMapper.toAddressResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(String email, String addressId) {
        UserEntity user = getUserByEmail(email);

        AddressEntity address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND, addressId));

        boolean wasDefault = address.getIsDefault();

        addressRepository.delete(address);

        if (wasDefault) {
            addressRepository.findFirstByUserIdAndIdNotOrderByCreatedAtDesc(user.getId(), addressId)
                    .ifPresent(newDefaultAddress -> {
                        newDefaultAddress.setIsDefault(true);
                        addressRepository.save(newDefaultAddress);
                    });
        }
    }

    @Override
    @Transactional
    public void setDefaultAddress(String email, String addressId) {
        UserEntity user = getUserByEmail(email);

        // 1. Lấy TẤT CẢ địa chỉ của user này lên
        List<AddressEntity> addresses = addressRepository.findByUserIdOrderByIsDefaultDesc(user.getId());

        boolean found = false;

        // 2. Lặp qua danh sách: Cái nào đúng ID thì bật true, còn lại tắt false hết
        for (AddressEntity addr : addresses) {
            if (addr.getId().equals(addressId)) {
                addr.setIsDefault(true);
                found = true;
            } else {
                addr.setIsDefault(false);
            }
        }

        if (!found) {
            throw new AppException(ErrorCode.ADDRESS_NOT_FOUND, addressId);
        }

        // 3. Lưu toàn bộ danh sách đã cập nhật xuống DB
        addressRepository.saveAll(addresses);
    }
}