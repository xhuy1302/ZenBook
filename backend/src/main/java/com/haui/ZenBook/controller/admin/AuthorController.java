package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.author.AuthorCreationRequest;
import com.haui.ZenBook.dto.author.AuthorResponse;
import com.haui.ZenBook.dto.author.AuthorUpdateRequest;
import com.haui.ZenBook.service.AuthorService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;
    private final MessageUtil messageUtil;

    // 1. CREATE Author
    @PostMapping("/createAuthor")
    public ApiResponse<AuthorResponse> create(
            @Valid @RequestBody AuthorCreationRequest request) {

        return ApiResponse.<AuthorResponse>builder()
                .data(authorService.create(request))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    // 2. GET ALL Author (ACTIVE)
    @GetMapping
    public ApiResponse<List<AuthorResponse>> getAll() {
        return ApiResponse.<List<AuthorResponse>>builder()
                .data(authorService.getAllAuthors())
                .build();
    }

    // 3. GET Author by ID
    @GetMapping("/{authorId}")
    public ApiResponse<AuthorResponse> getById(@PathVariable String authorId) {
        return ApiResponse.<AuthorResponse>builder()
                .data(authorService.getAuthorById(authorId))
                .build();
    }

    // 4. UPDATE Author
    @PutMapping("/{authorId}")
    public ApiResponse<AuthorResponse> update(
            @PathVariable String authorId,
            @Valid @RequestBody AuthorUpdateRequest request) {

        return ApiResponse.<AuthorResponse>builder()
                .data(authorService.updateAuthor(authorId, request))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // 5. UPDATE AVATAR
    @PatchMapping(value = "/{authorId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> updateAvatar(
            @PathVariable String authorId,
            @RequestParam("file") MultipartFile file) {

        String avatarUrl = authorService.updateAvatar(authorId, file);

        return ApiResponse.<String>builder()
                .data(avatarUrl)
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // 6. HARD DELETE
    @DeleteMapping("/{authorId}")
    public ApiResponse<Void> hardDelete(@PathVariable String authorId) {
        authorService.hardDeleteAuthor(authorId);

        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    // 7. SOFT DELETE
    @DeleteMapping("/soft-delete/{authorId}")
    public ApiResponse<Void> softDelete(@PathVariable String authorId) {
        authorService.softDeleteAuthor(authorId);

        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    // 8. GET TRASH (DELETED)
    @GetMapping("/trash")
    public ApiResponse<List<AuthorResponse>> getTrash() {
        return ApiResponse.<List<AuthorResponse>>builder()
                .data(authorService.getAllAuthorsSD())
                .build();
    }

    // 9. RESTORE
    @PatchMapping("/restore/{authorId}")
    public ApiResponse<Void> restore(@PathVariable String authorId) {
        authorService.restoreAuthor(authorId);

        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }
}