package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.author.*;
import com.haui.ZenBook.dto.user.UserResponse;
import com.haui.ZenBook.entity.AuthorEntity;
import com.haui.ZenBook.enums.AuthorStatus;
import com.haui.ZenBook.enums.UserStatus;
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
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;
    private final S3Service s3Service;

    // ================= CREATE =================
    @Override
    public AuthorResponse create(AuthorCreationRequest request) {
        if (authorRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.AUTHOR_EMAIL_EXISTED, request.getEmail());
        }

        AuthorEntity author = authorMapper.toEntity(request);

        // default avatar
        author.setAvatar("https://ui.shadcn.com/avatars/03.png");

        return authorMapper.toResponse(authorRepository.save(author));
    }

    // ================= READ =================
    @Override
    public List<AuthorResponse> getAllAuthors() {
        return authorRepository.findByStatusNot(AuthorStatus.DELETED)
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

        authorMapper.updateAuthor(author, request);

        return authorMapper.toResponse(authorRepository.save(author));
    }

    // ================= HARD DELETE =================
    @Override
    @Transactional
    public void hardDeleteAuthor(String authorId) {
        if (!authorRepository.existsById(authorId)) {
            throw new AppException(ErrorCode.AUTHOR_NOT_FOUND, authorId);
        }

        authorRepository.deleteById(authorId);
    }

    // ================= SOFT DELETE =================
    @Override
    public void softDeleteAuthor(String authorId) {
        AuthorEntity author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        log.info(author.getStatus().name());
//        log.info(author.getDeletedAt().format(DateTimeFormatter.BASIC_ISO_DATE));
        author.setDeletedAt(LocalDateTime.now());
        author.setStatus(AuthorStatus.DELETED);
        log.info(author.getStatus().name());
        log.info(author.getDeletedAt().format(DateTimeFormatter.BASIC_ISO_DATE));

        authorRepository.save(author);
    }

    // ================= GET SOFT DELETE =================
    @Override
    public List<AuthorResponse> getAllAuthorsSD() {
        return authorRepository.findByStatus(AuthorStatus.DELETED)
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

        if (author.getDeletedAt() == null) {
            throw new RuntimeException("Author không nằm trong thùng rác");
        }

        author.setDeletedAt(null);
        author.setStatus(AuthorStatus.ACTIVE);

        authorRepository.save(author);
    }

    // ================= UPDATE AVATAR =================
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