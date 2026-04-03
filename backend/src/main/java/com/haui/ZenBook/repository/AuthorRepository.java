package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.AuthorEntity;
import com.haui.ZenBook.enums.AuthorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AuthorRepository extends JpaRepository<AuthorEntity, String> {

    boolean existsByName(String name);


    List<AuthorEntity> findByStatusNotOrderByIdDesc(AuthorStatus status);

    List<AuthorEntity> findByStatusOrderByIdDesc(AuthorStatus status);



    // ================= SEARCH =================
    List<AuthorEntity> findByNameContainingIgnoreCaseAndStatus(String name, AuthorStatus status);

    // ================= SOFT DELETE =================
    @Modifying
    @Query("""
        update AuthorEntity a
        set a.status = com.haui.ZenBook.enums.AuthorStatus.DELETED,
            a.deletedAt = :deletedAt
        where a.id = :id
          and a.deletedAt is null
    """)
    int softDelete(
            @Param("id") String id,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    // ================= RESTORE =================
    @Modifying
    @Query("""
        update AuthorEntity a
        set a.status = com.haui.ZenBook.enums.AuthorStatus.ACTIVE,
            a.deletedAt = null
        where a.id = :id
          and a.deletedAt is not null
    """)
    int restore(@Param("id") String id);

    // ================= FILTER =================
    List<AuthorEntity> findAllByStatusAndDeletedAtBefore(AuthorStatus status, LocalDateTime time);

    List<AuthorEntity> findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(AuthorStatus status);
}
