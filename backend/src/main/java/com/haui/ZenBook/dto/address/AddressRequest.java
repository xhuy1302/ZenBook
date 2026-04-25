package com.haui.ZenBook.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    @NotBlank(message = "Tên người nhận không được để trống")
    private String recipientName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không đúng định dạng")
    private String phone;

    @NotBlank(message = "Tên đường/Tòa nhà không được để trống")
    private String street;

    @NotBlank(message = "Phường/Xã không được để trống")
    private String ward;

    @NotBlank(message = "Quận/Huyện không được để trống")
    private String district;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String city;

    // 👉 THÊM MỚI: Bắt buộc phải có để truyền cho GHN tính phí
    @NotNull(message = "Mã Quận/Huyện không được để trống")
    private Integer districtId;

    @NotBlank(message = "Mã Phường/Xã không được để trống")
    private String wardCode;

    private Boolean isDefault = false;
}