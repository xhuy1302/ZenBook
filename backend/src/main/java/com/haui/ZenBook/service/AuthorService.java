package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.author.AuthorCreationRequest;
import com.haui.ZenBook.dto.author.AuthorFilterResponse;
import com.haui.ZenBook.dto.author.AuthorUpdateRequest;
import com.haui.ZenBook.dto.author.AuthorResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AuthorService {

    // CREATE
    AuthorResponse create(AuthorCreationRequest request);

    // READ
    List<AuthorResponse> getAllAuthors();

    AuthorResponse getAuthorById(String id);

    // UPDATE
    AuthorResponse updateAuthor(String id, AuthorUpdateRequest request);

    // DELETE
    void hardDeleteAuthor(String authorId);

    void softDeleteAuthor(String authorId);

    // GET SOFT DELETED
    List<AuthorResponse> getAllAuthorsSD();

    // RESTORE
    void restoreAuthor(String authorId);

    String updateAvatar(String authorId, MultipartFile file);

    List<AuthorFilterResponse> getAuthorsForFilter();
    // TODO:
}