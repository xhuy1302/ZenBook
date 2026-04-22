package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.AddressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<AddressEntity, String> {

    // Lấy danh sách địa chỉ của 1 user, ưu tiên địa chỉ mặc định lên đầu
    List<AddressEntity> findByUserIdOrderByIsDefaultDesc(String userId);

    // Tìm 1 địa chỉ cụ thể của 1 user (để đảm bảo tính bảo mật khi sửa/xóa)
    Optional<AddressEntity> findByIdAndUserId(String addressId, String userId);
    Optional<AddressEntity> findFirstByUserIdAndIdNotOrderByCreatedAtDesc(String userId, String id);

    // Reset tất cả địa chỉ của user này về false (Dùng khi người dùng chọn 1 địa chỉ khác làm mặc định)
    @Modifying
    @Query("UPDATE AddressEntity a SET a.isDefault = false WHERE a.user.id = :userId")
    void resetDefaultAddressByUserId(String userId);
}