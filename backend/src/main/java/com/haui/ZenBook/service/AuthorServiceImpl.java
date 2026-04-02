package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.author.*;
import com.haui.ZenBook.entity.AuthorEntity;
import com.haui.ZenBook.enums.AuthorStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.AuthorMapper;
import com.haui.ZenBook.repository.AuthorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;
    private final S3Service s3Service;


    @Override
    public AuthorResponse create(AuthorCreationRequest request) {
        if (authorRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.AUTHOR_NAME_EXISTED);
        }

        AuthorEntity author = authorMapper.toEntity(request);

        author.setAvatar("https://ui.shadcn.com/avatars/03.png");
        author.setStatus(AuthorStatus.ACTIVE);

        return authorMapper.toResponse(authorRepository.save(author));
    }

    // ================= READ (HIỆN MỚI NHẤT LÊN ĐẦU) =================
    @Override
    public List<AuthorResponse> getAllAuthors() {
        // Sử dụng hàm OrderByIdDesc để bản ghi mới nhất luôn ở vị trí đầu tiên
        return authorRepository.findByStatusNotOrderByIdDesc(AuthorStatus.DELETED)
                .stream()
                .map(authorMapper::toResponse)
                .toList();
    }

    @Override
    public AuthorResponse getAuthorById(String id) {
        AuthorEntity author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND, id));
        return authorMapper.toResponse(author);
    }

    // ================= UPDATE =================
    @Override
    public AuthorResponse updateAuthor(String id, AuthorUpdateRequest request) {
        AuthorEntity author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND, id));

        // Kiểm tra nếu đổi tên sang tên đã tồn tại (của người khác)
        if (!author.getName().equals(request.getName()) && authorRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.AUTHOR_NAME_EXISTED);
        }

        authorMapper.updateAuthor(author, request);
        return authorMapper.toResponse(authorRepository.save(author));
    }

    // ================= HARD DELETE =================
    @Override
    @Transactional
    public void hardDeleteAuthor(String authorId) {
        // 1. Kiểm tra sự tồn tại và lấy thông tin tác giả
        AuthorEntity author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND, authorId));

        // 2. Kiểm tra logic: Tác giả có đang gắn với cuốn sách nào không?
        // Giả sử trong Author Entity bạn có: @OneToMany(mappedBy = "author") List<Book> books;
//        if (author.getBooks() != null && !author.getBooks().isEmpty()) {
//            throw new AppException(ErrorCode.AUTHOR_HAS_BOOKS, authorId);
//            // Lưu ý: Bạn cần định nghĩa thêm ErrorCode.AUTHOR_HAS_BOOKS trong Enum ErrorCode của bạn
//        }

        // 3. Lấy URL ảnh cũ trước khi xóa record trong DB
        String oldAvatarUrl = author.getAvatar(); // Hoặc field tương ứng lưu URL ảnh

        try {
            // 4. Xóa bản ghi trong Database
            authorRepository.delete(author);

            // 5. Xóa ảnh trên S3 (Chỉ thực hiện khi xóa DB thành công)
            if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty()) {
                s3Service.deleteFile(oldAvatarUrl);
            }
        } catch (Exception e) {
            // Log lỗi hoặc ném ra exception tùy theo cách bạn xử lý global
            throw new AppException(ErrorCode.AUTHOR_CANNOT_DELETE, "Lỗi khi xóa tác giả hoặc file S3");
        }
    }

    // ================= SOFT DELETE =================
    @Override
    public void softDeleteAuthor(String authorId) {
        AuthorEntity author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        author.setDeletedAt(LocalDateTime.now());
        author.setStatus(AuthorStatus.DELETED);

        authorRepository.save(author);
    }

    // ================= GET SOFT DELETE (TRASH) =================
    @Override
    public List<AuthorResponse> getAllAuthorsSD() {
        // Thùng rác cũng hiện cái mới xóa lên đầu
        return authorRepository.findByStatusOrderByIdDesc(AuthorStatus.DELETED)
                .stream()
                .map(authorMapper::toResponse)
                .toList();
    }

    // ================= RESTORE =================
    @Override
    @Transactional
    public void restoreAuthor(String authorId) {
        AuthorEntity author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        author.setDeletedAt(null);
        author.setStatus(AuthorStatus.ACTIVE);

        authorRepository.save(author);
    }

    // ================= UPDATE AVATAR (S3) =================
    @Override
    @Transactional
    public String updateAvatar(String authorId, MultipartFile file) {
        try {
            AuthorEntity author = authorRepository.findById(authorId)
                    .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

            String avatarUrl = s3Service.uploadFile(file, "authors");
            author.setAvatar(avatarUrl);
            authorRepository.save(author);

            return avatarUrl;
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }
}