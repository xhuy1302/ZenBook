package com.haui.ZenBook.chatbot.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.RedisVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import redis.clients.jedis.JedisPooled;

@Configuration
public class VectorStoreConfig {

    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        // 1. Tạo kết nối tới con Docker Redis Stack Server ở cổng 6379
        JedisPooled jedisPooled = new JedisPooled("localhost", 6379);

        // 2. Ép Spring tạo Redis Vector Store với các thông số chuẩn
        return new RedisVectorStore(
                RedisVectorStore.RedisVectorStoreConfig.builder()
                        .withIndexName("zenbook-rag-index")
                        .withPrefix("zenbook-doc:")
                        .build(),
                embeddingModel,
                jedisPooled,
                true // Bật True để nó tự động tạo Index Schema trong lần đầu tiên
        );
    }
}