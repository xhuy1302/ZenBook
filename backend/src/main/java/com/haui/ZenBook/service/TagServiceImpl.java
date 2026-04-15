package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.tag.TagRequest;
import com.haui.ZenBook.dto.tag.TagResponse;
import com.haui.ZenBook.entity.TagEntity;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.TagMapper;
import com.haui.ZenBook.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    @Override
    @Transactional
    public TagResponse create(TagRequest request) {
        // 1. Kiểm tra trùng tên
        if (tagRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.TAG_NAME_EXISTED);
        }

        // 2. Chuyển DTO sang Entity
        TagEntity tag = tagMapper.toEntity(request);

        // 3. Tạo slug tự động
        tag.setSlug(generateSlug(request.getName()));

        // 4. Lưu và trả về response
        return tagMapper.toResponse(tagRepository.save(tag));
    }

    @Override
    public List<TagResponse> getAll() {
        return tagRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc().stream()
                .map(tagMapper::toResponse)
                .toList();
    }

    @LastModifiedDate
    @Override
    @Transactional
    public TagResponse update(String id, TagRequest request) {
        // 1. Kiểm tra tồn tại
        TagEntity tag = tagRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND));

        // 2. Kiểm tra trùng tên với các tag khác (trừ chính nó)
        if (tagRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new AppException(ErrorCode.TAG_NAME_EXISTED);
        }

        // 3. Cập nhật dữ liệu từ Request vào Entity
        // 👉 SỬA LỖI Ở ĐÂY: Phải là (tag, request) vì MapStruct dùng @MappingTarget cho tham số đầu tiên
        tagMapper.updateEntity(tag, request);

        // 4. Cập nhật lại slug mới theo tên vừa sửa
        tag.setSlug(generateSlug(request.getName()));

        // 5. Lưu lại và trả về kết quả
        return tagMapper.toResponse(tagRepository.save(tag));
    }

    @Override
    @Transactional
    public void softDelete(String id) {
        TagEntity tag = tagRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND));

        tag.setDeletedAt(LocalDateTime.now());
        tagRepository.save(tag);
    }

    @Override
    @Transactional
    public void hardDelete(String id) {
        if (!tagRepository.existsById(id)) {
            throw new AppException(ErrorCode.TAG_NOT_FOUND);
        }
        tagRepository.deleteById(id);
    }

    @Override
    public List<TagResponse> getAllTrash() {
        return tagRepository.findAllByDeletedAtIsNotNullOrderByCreatedAtDesc().stream()
                .map(tagMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void restore(String id) {
        TagEntity tag = tagRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND));

        if (tag.getDeletedAt() == null) {
            throw new AppException(ErrorCode.KEY_INVALID);
        }

        tag.setDeletedAt(null);
        tagRepository.save(tag);
    }

    private String generateSlug(String input) {
        if (input == null || input.isBlank()) return "";
        String nowhitespace = Pattern.compile("\\s+").matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}