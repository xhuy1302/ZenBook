package com.haui.ZenBook.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

@Configuration
@EnableCaching // 👉 Đây là "chìa khóa" kích hoạt toàn bộ hệ thống Cache
public class RedisConfig {

    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                // Cài đặt thời gian sống (TTL) của Cache là 30 phút.
                // Sau 30 phút, Redis tự xóa, AI chọc vào sẽ quét lại DB để lấy giá mới nhất.
                .entryTtl(Duration.ofMinutes(30))
                .disableCachingNullValues() // Đỡ tốn RAM lưu mấy cái rỗng
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
}