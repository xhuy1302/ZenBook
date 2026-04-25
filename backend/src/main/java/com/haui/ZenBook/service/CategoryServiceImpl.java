package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.category.*;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.CategoryEntity;
import com.haui.ZenBook.enums.CategoryStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.CategoryMapper;
import com.haui.ZenBook.repository.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl implements CategoryService {

    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;
    S3Service s3Service;

    @Override
    @Transactional
    public CategoryResponse create(CategoryCreationRequest request) {
        String slug = (request.getSlug() == null || request.getSlug().isBlank())
                ? generateSlug(request.getCategoryName())
                : request.getSlug();

        if (categoryRepository.existsBySlug(slug)) {
            throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTED, slug);
        }

        CategoryEntity category = categoryMapper.toEntity(request);
        category.setSlug(slug);

        // 👉 THÊM LOGIC: Xử lý thứ tự hiển thị tự động
        category.setDisplayOrder(getNextDisplayOrder(request.getParentId()));

        if (request.getParentId() != null && !request.getParentId().isBlank()) {
            CategoryEntity parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.PARENT_CATEGORY_NOT_FOUND, request.getParentId()));
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(0);
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc().stream()
                .filter(c -> c.getDeletedAt() == null)
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getCategoryTree() {
        return categoryRepository.findAllByLevelOrderByDisplayOrderAsc(0).stream()
                .filter(c -> c.getDeletedAt() == null)
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse getCategoryById(String id) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, id));
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryUpdateResponse update(String id, CategoryUpdateRequest request) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, id));

        if (id.equals(request.getParentId())) {
            throw new AppException(ErrorCode.CATEGORY_PARENT_INVALID, "Danh mục không thể là cha của chính nó");
        }

        if (request.getParentId() != null && !request.getParentId().isBlank()) {
            if (isCircularReference(id, request.getParentId())) {
                throw new AppException(ErrorCode.CATEGORY_PARENT_INVALID, "Gây ra vòng lặp danh mục");
            }
        }

        if (request.getSlug() != null && !request.getSlug().equals(category.getSlug())) {
            if (categoryRepository.existsBySlug(request.getSlug())) {
                throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTED, request.getSlug());
            }
        }

        // 👉 THÊM LOGIC: Kiểm tra xem có đổi danh mục cha hay không
        String oldParentId = category.getParentId();
        String newParentId = request.getParentId();
        boolean isParentChanged = (oldParentId == null && newParentId != null && !newParentId.isBlank()) ||
                (oldParentId != null && !oldParentId.equals(newParentId));

        categoryMapper.updateCategory(category, request);

        if (newParentId != null && !newParentId.isBlank()) {
            CategoryEntity parent = categoryRepository.findById(newParentId)
                    .orElseThrow(() -> new AppException(ErrorCode.PARENT_CATEGORY_NOT_FOUND, newParentId));

            category.setParentId(newParentId);
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setParentId(null);
            category.setLevel(0);
        }

        // 👉 Nếu đổi danh mục cha, xếp danh mục này xuống cuối danh sách của cha mới
        if (isParentChanged) {
            category.setDisplayOrder(getNextDisplayOrder(newParentId));
        }

        CategoryEntity updatedCategory = categoryRepository.save(category);

        return categoryMapper.toUpdateResponse(updatedCategory);
    }

    @Override
    @Transactional
    public void hardDeleteCategory(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, id);
        }
        if (!categoryRepository.findAllByParentIdOrderByDisplayOrderAsc(id).isEmpty()) {
            throw new AppException(ErrorCode.CATEGORY_HAS_CHILDREN, id);
        }
        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void softDeleteCategory(String id) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, id));

        if (!categoryRepository.findAllByParentIdOrderByDisplayOrderAsc(id).isEmpty()) {
            throw new AppException(ErrorCode.CATEGORY_HAS_CHILDREN, category.getCategoryName());
        }

        if (category.getBooks() != null && !category.getBooks().isEmpty()) {
            String linkedBookTitles = category.getBooks().stream()
                    .limit(3)
                    .map(BookEntity::getTitle)
                    .collect(Collectors.joining(", "));

            int totalBooks = category.getBooks().size();
            String extra = totalBooks > 3 ? " và " + (totalBooks - 3) + " cuốn khác" : "";
            String detailInfo = totalBooks + " sách (VD: " + linkedBookTitles + extra + ")";

            throw new AppException(ErrorCode.CATEGORY_HAS_BOOKS, detailInfo);
        }

        category.setDeletedAt(LocalDateTime.now());
        category.setStatus(CategoryStatus.INACTIVE);

        categoryRepository.save(category);
    }

    @Override
    public List<CategoryResponse> getAllCategoriesSD() {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getDeletedAt() != null)
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void restoreCategory(String id) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, id));

        category.setDeletedAt(null);
        category.setStatus(CategoryStatus.ACTIVE);
        categoryRepository.save(category);
    }

    private String generateSlug(String input) {
        String nowhitespace = Pattern.compile("\\s+").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

    @Override
    @Transactional
    public String uploadThumbnail(String id, MultipartFile file) {
        try {
            CategoryEntity category = categoryRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, id));

            String thumbnailUrl = s3Service.uploadFile(file, "categories");

            category.setThumbnailUrl(thumbnailUrl);
            categoryRepository.save(category);

            return thumbnailUrl;

        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }

    @Override
    public List<CategoryFilterResponse> getCategoriesForFilter() {
        return categoryRepository.getCategoriesForFilter();
    }

    private boolean isCircularReference(String currentCategoryId, String newParentId) {
        String checkId = newParentId;

        while (checkId != null && !checkId.isBlank()) {
            if (checkId.equals(currentCategoryId)) {
                return true;
            }

            CategoryEntity currentCheckNode = categoryRepository.findById(checkId).orElse(null);
            if (currentCheckNode != null) {
                checkId = currentCheckNode.getParentId();
            } else {
                break;
            }
        }
        return false;
    }

    // 👉 THÊM HÀM PHỤ: Lấy số thứ tự hiển thị tiếp theo
    private int getNextDisplayOrder(String parentId) {
        Integer maxOrder;
        if (parentId != null && !parentId.isBlank()) {
            maxOrder = categoryRepository.findMaxDisplayOrderByParentId(parentId);
        } else {
            maxOrder = categoryRepository.findMaxDisplayOrderRoot();
        }
        return (maxOrder == null) ? 0 : maxOrder + 1;
    }


}