package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.MembershipEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<MembershipEntity, String> {
    Optional<MembershipEntity> findByUserId(String userId);
}