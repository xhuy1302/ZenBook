package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {

    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    List<UserEntity> findByStatus(UserStatus status);

    List<UserEntity> findByStatusNotOrderByCreatedAtDesc(UserStatus status);

    List<UserEntity> findAllByStatusAndDeletedAtBefore(UserStatus status, LocalDateTime time);

    @Query("SELECT FUNCTION('MONTHNAME', u.createdAt), COUNT(u) FROM UserEntity u GROUP BY FUNCTION('MONTHNAME', u.createdAt), FUNCTION('MONTH', u.createdAt) ORDER BY FUNCTION('MONTH', u.createdAt)")
    List<Object[]> getNewUsersByMonthRaw();

    @Modifying
    @Query("""
        update UserEntity u
        set u.status = DELETED,
            u.deletedAt = :deletedAt
        where u.id = :id
          and u.deletedAt is null
    """)
    int softDelete(
            @Param("id") String id,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    @Modifying
    @Query("""
        update UserEntity u
        set u.status = ACTIVE,
            u.deletedAt = null
        where u.id = :id
          and u.deletedAt is not null
    """)
    int restore(@Param("id") String id);

    List<UserEntity> findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(UserStatus status);

    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.createdAt BETWEEN :start AND :end")
    Long countNewUsersBetween(LocalDateTime start, LocalDateTime end);
}
