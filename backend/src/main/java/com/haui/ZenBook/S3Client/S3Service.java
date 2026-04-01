package com.haui.ZenBook.S3Client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region; // Thêm biến này để tạo URL đầy đủ

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Hàm upload dùng chung cho toàn bộ Project
     * @param file: File từ Request
     * @param folder: Thư mục trên S3 (ví dụ: "avatars", "books", "promotions")
     * @return URL đầy đủ của file trên S3
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // Tạo đường dẫn file: folder/uuid_name.jpg (giúp S3 tự chia thư mục)
        String fileName = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        // Xây dựng request gửi lên S3
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        // Thực hiện Upload
        s3Client.putObject(putObjectRequest,
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Trả về URL đầy đủ để lưu vào Database
        // Cấu trúc: https://bucketname.s3.region.amazonaws.com/folder/filename
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
    }
}