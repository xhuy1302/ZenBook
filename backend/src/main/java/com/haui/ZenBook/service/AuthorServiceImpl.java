package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.author.*;
import com.haui.ZenBook.entity.AuthorEntity;
import com.haui.ZenBook.entity.BookEntity;
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
import java.util.stream.Collectors;

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
            // Ném lỗi kèm theo tên tác giả bị trùng
            throw new AppException(ErrorCode.AUTHOR_NAME_EXISTED, request.getName());
        }

        AuthorEntity author = authorMapper.toEntity(request);

        author.setAvatar("https://ui.shadcn.com/avatars/03.png");
        author.setStatus(AuthorStatus.ACTIVE);

        return authorMapper.toResponse(authorRepository.save(author));
    }

    // ================= READ (HIỆN MỚI NHẤT LÊN ĐẦU) =================
    @Override
    public List<AuthorResponse> getAllAuthors() {
        return authorRepository.findByStatusNotOrderByIdDesc(AuthorStatus.DELETED)
                .stream()
                .map(authorMapper::toResponse)
                .toList();
    }

    @Override
    public AuthorResponse getAuthorById(String id) {
        AuthorEntity author = authorRepository.findById(id)
                // Ném lỗi kèm ID không tìm thấy
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND, id));
        return authorMapper.toResponse(author);
    }

    // ================= UPDATE =================
    @Override
    public AuthorResponse updateAuthor(String id, AuthorUpdateRequest request) {
        AuthorEntity author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND, id));

        // Kiểm tra nếu đổi tên sang tên đã tồn tại
        if (!author.getName().equals(request.getName()) && authorRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.AUTHOR_NAME_EXISTED, request.getName());
        }

        authorMapper.updateAuthor(author, request);
        return authorMapper.toResponse(authorRepository.save(author));
    }

    // ================= HARD DELETE =================
    @Override
    @Transactional
    public void hardDeleteAuthor(String authorId) {
        AuthorEntity author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND, authorId));

        String oldAvatarUrl = author.getAvatar();

        try {
            authorRepository.delete(author);

            if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty()) {
                s3Service.deleteFile(oldAvatarUrl);
            }
        } catch (Exception e) {
            log.error("Lỗi khi hard delete tác giả: ", e);
            // Ném lỗi kèm ID để biết tác giả nào không xóa được
            throw new AppException(ErrorCode.AUTHOR_CANNOT_DELETE, authorId);
        }
    }

    // ================= SOFT DELETE =================
    @Override
    public void softDeleteAuthor(String authorId) {
        AuthorEntity author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND, authorId));

        if (author.getBooks() != null && !author.getBooks().isEmpty()) {
            String linkedBookTitles = author.getBooks().stream()
                    .limit(3)
                    .map(BookEntity::getTitle)
                    .collect(Collectors.joining(", "));

            int totalBooks = author.getBooks().size();
            String extra = totalBooks > 3 ? " và " + (totalBooks - 3) + " cuốn khác" : "";
            String detailInfo = totalBooks + " sách (VD: " + linkedBookTitles + extra + ")";

            throw new AppException(ErrorCode.AUTHOR_HAS_BOOKS, detailInfo);
        }

        author.setDeletedAt(LocalDateTime.now());
        author.setStatus(AuthorStatus.DELETED);

        authorRepository.save(author);
    }

    // ================= GET SOFT DELETE (TRASH) =================
    @Override
    public List<AuthorResponse> getAllAuthorsSD() {
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
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND, authorId));

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
                    .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND, authorId));

            String avatarUrl = s3Service.uploadFile(file, "authors");
            author.setAvatar(avatarUrl);
            authorRepository.save(author);

            return avatarUrl;
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_FAILED); // Cái này có thể giữ nguyên không cần đối số
        }
    }

    @Override
    public List<AuthorFilterResponse> getAuthorsForFilter() {
        return authorRepository.getAuthorsForFilter();
    }

}