package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.tag.TagRequest;
import com.haui.ZenBook.dto.tag.TagResponse;

import java.util.List;

public interface TagService {
    TagResponse create(TagRequest request);

    List<TagResponse> getAll();

    TagResponse update(String id, TagRequest request);

    void softDelete(String id);

    void hardDelete(String id);

    List<TagResponse> getAllTrash();

    void restore(String id);
}