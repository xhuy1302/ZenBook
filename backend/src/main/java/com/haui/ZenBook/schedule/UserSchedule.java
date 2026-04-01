package com.haui.ZenBook.schedule;

import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.enums.UserStatus;
import com.haui.ZenBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserSchedule {
    private final UserRepository userRepository;

    @Value("${cleanup-data.expire-minutes}")
    private long expireMinutes;

    @Scheduled(fixedRateString = "${cleanup-data.cleanup-rate-ms}")
    public void cleanupSoftDeletedBrands() {

        LocalDateTime expiredTime = LocalDateTime.now().minusMinutes(expireMinutes);

        List<UserEntity> expiredUsers =
                userRepository.findAllByStatusAndDeletedAtBefore(UserStatus.INACTIVE, expiredTime);

        if (!expiredUsers.isEmpty()) {
            userRepository.deleteAll(expiredUsers);
        }
    }
}
