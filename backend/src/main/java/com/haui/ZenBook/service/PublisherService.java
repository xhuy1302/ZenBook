package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.author.AuthorFilterResponse;
import com.haui.ZenBook.dto.publisher.PublisherFilterResponse;
import com.haui.ZenBook.dto.publisher.PublisherResponse;
import com.haui.ZenBook.dto.publisher.PublisherCreationRequest;
import com.haui.ZenBook.dto.publisher.PublisherUpdateRequest;

import java.util.List;

public interface PublisherService {
    PublisherResponse create(PublisherCreationRequest request);
    List<PublisherResponse> getAllPublishers();
    PublisherResponse getPublisherById(String id);
    PublisherResponse updatePublisher(String id, PublisherUpdateRequest request);
    void softDeletePublisher(String id);
    void hardDeletePublisher(String id);
    List<PublisherResponse> getAllPublishersSD(); // Soft deleted
    void restorePublisher(String id);
    List<PublisherFilterResponse> getPublishersForFilter();
}