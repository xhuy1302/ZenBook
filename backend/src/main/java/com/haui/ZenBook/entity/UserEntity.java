package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity extends BaseEntity implements UserDetails {

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "avatar", length = 500)
    private String avatar;
    @Column(name = "nationality", length = 100)
    private String nationality;

    // 👉 Đã thêm 2 trường cho trang Profile Khách hàng
    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private UserStatus status;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<RoleEntity> roles;

    // mappedBy = "author" phải khớp chính xác với tên biến UserEntity author; trong NewsEntity
    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private Set<NewsEntity> writtenNews;

    // ==========================================
    // 👉 QUAN HỆ ONE-TO-MANY VỚI ADDRESSES
    // ==========================================
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AddressEntity> addresses = new ArrayList<>();

    // Các hàm Helper hỗ trợ Sổ địa chỉ
    public void addAddress(AddressEntity address) {
        addresses.add(address);
        address.setUser(this);
    }

    public void removeAddress(AddressEntity address) {
        addresses.remove(address);
        address.setUser(null);
    }

    // ==========================================
    // CÁC HÀM CỦA SPRING SECURITY (USERDETAILS)
    // ==========================================
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (roles == null) return java.util.Collections.emptyList();

        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public String getUsername() {
        return this.email; // Đăng nhập bằng Email
    }
    public String getRealUsername() {
        return this.username;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == null || status == UserStatus.ACTIVE;
    }

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReviewEntity> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReviewHelpfulVoteEntity> helpfulVotes = new ArrayList<>();
}