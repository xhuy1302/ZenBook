package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.publisher.PublisherFilterResponse;
import com.haui.ZenBook.dto.publisher.PublisherUpdateRequest;
import com.haui.ZenBook.dto.publisher.PublisherCreationRequest;
import com.haui.ZenBook.dto.publisher.PublisherResponse;
import com.haui.ZenBook.entity.PublisherEntity;
import com.haui.ZenBook.enums.PublisherStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.PublisherMapper;
import com.haui.ZenBook.repository.PublisherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublisherServiceImpl implements PublisherService {

    private final PublisherRepository publisherRepository;
    private final PublisherMapper publisherMapper;

    @Override
    public PublisherResponse create(PublisherCreationRequest request) {
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (publisherRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.PUBLISHER_EMAIL_EXISTED, request.getEmail());
            }
        }

        if (request.getTaxCode() != null && !request.getTaxCode().trim().isEmpty()) {
            if (publisherRepository.existsByTaxCode(request.getTaxCode())) {
                throw new AppException(ErrorCode.PUBLISHER_TAX_CODE_EXISTED, request.getTaxCode());
            }
        }

        PublisherEntity newPublisher = publisherMapper.toEntity(request);
        newPublisher.setStatus(PublisherStatus.ACTIVE);
        PublisherEntity savedPublisher = publisherRepository.save(newPublisher);
        return publisherMapper.toResponse(savedPublisher);
    }

    @Override
    public List<PublisherResponse> getAllPublishers() {
        return publisherRepository.findByStatusNot(PublisherStatus.DELETED).stream()
                .map(publisherMapper::toResponse)
                .toList();
    }

    @Override
    public PublisherResponse getPublisherById(String id) {
        PublisherEntity publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND, id));
        return publisherMapper.toResponse(publisher);
    }

    @Override
    public PublisherResponse updatePublisher(String id, PublisherUpdateRequest request) {
        PublisherEntity publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND, id));

        String newEmail = request.getEmail();
        if (newEmail != null && !newEmail.trim().isEmpty() && !newEmail.equals(publisher.getEmail())) {
            if (publisherRepository.existsByEmail(newEmail)) {
                throw new AppException(ErrorCode.PUBLISHER_EMAIL_EXISTED, newEmail);
            }
        }

        String newTaxCode = request.getTaxCode();
        if (newTaxCode != null && !newTaxCode.trim().isEmpty() && !newTaxCode.equals(publisher.getTaxCode())) {
            if (publisherRepository.existsByTaxCode(newTaxCode)) {
                throw new AppException(ErrorCode.PUBLISHER_TAX_CODE_EXISTED, newTaxCode);
            }
        }

        publisherMapper.updatePublisher(publisher, request);
        return publisherMapper.toResponse(publisherRepository.save(publisher));
    }

    @Override
    public void softDeletePublisher(String id) {
        PublisherEntity publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND, id));

        publisher.setDeletedAt(LocalDateTime.now());
        publisher.setStatus(PublisherStatus.DELETED);
        publisherRepository.save(publisher);
    }

    @Override
    public void hardDeletePublisher(String id) {
        if (!publisherRepository.existsById(id)) {
            throw new AppException(ErrorCode.PUBLISHER_NOT_FOUND, id);
        }
        publisherRepository.deleteById(id);
    }

    @Override
    public List<PublisherResponse> getAllPublishersSD() {
        return publisherRepository.findByStatus(PublisherStatus.DELETED).stream()
                .map(publisherMapper::toResponse)
                .toList();
    }

    @Override
    public void restorePublisher(String id) {
        PublisherEntity publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND, id));

        if (publisher.getDeletedAt() == null) {
            throw new RuntimeException("Nhà xuất bản này không nằm trong thùng rác!");
        }

        publisher.setDeletedAt(null);
        publisher.setStatus(PublisherStatus.ACTIVE);
        publisherRepository.save(publisher);
    }

    @Override
    public List<PublisherFilterResponse> getPublishersForFilter() {
        return publisherRepository.getPublishersForFilter();
    }
}