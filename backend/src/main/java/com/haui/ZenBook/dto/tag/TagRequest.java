package com.haui.ZenBook.dto.tag;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TagRequest {

    @NotBlank(message = "Tên tag không được để trống")
    @Size(max = 100, message = "Tên tag không được quá 100 ký tự")
    String name;

    @Size(max = 255, message = "Mô tả không được quá 255 ký tự")
    String description;

    @Size(max = 20, message = "Mã màu không hợp lệ")
    String color; // Ví dụ nhận từ Frontend mã hex: #FF0000
}