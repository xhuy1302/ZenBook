package com.haui.ZenBook.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(999, "uncategorized.exception", HttpStatus.INTERNAL_SERVER_ERROR),
    KEY_INVALID(998, "key.invalid", HttpStatus.BAD_REQUEST),

    EMAIL_EXSISTED(1001, "email.exists", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_EXSISTED(1002, "email.not.existed", HttpStatus.NOT_FOUND),
    EMAIL_NOTBLANK(1003, "email.not.blank", HttpStatus.BAD_REQUEST),
    EMAIL_VALID(1004, "email.valid", HttpStatus.BAD_REQUEST),

    USERNAME_NOTBLANK(2001, "username.not.blank", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(2002, "password.invalid", HttpStatus.BAD_REQUEST),
    PASSWORD_NOTBLANK(2003, "password.not.blank", HttpStatus.BAD_REQUEST),

    OLD_PASSWORD_NOTBLANK(2004, "password.old.not.blank", HttpStatus.BAD_REQUEST),
    NEW_PASSWORD_NOTBLANK(2005, "password.new.not.blank", HttpStatus.BAD_REQUEST),
    OLD_PASSWORD_INVALID(2006, "password.old.invalid", HttpStatus.BAD_REQUEST),
    NEW_PASSWORD_SAME_AS_OLD(2007, "password.new.same.old", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(401, "unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(403, "unauthorized", HttpStatus.FORBIDDEN),

    ROLE_NOT_FOUND(3000, "role.not.found", HttpStatus.BAD_REQUEST),

    USER_NOT_FOUND(4001, "user.not.found", HttpStatus.NOT_FOUND),
    CANNOT_DELETE_SELF(4002, "user.cannot.delete.self", HttpStatus.BAD_REQUEST),

    CATEGORY_NOT_FOUND(5000, "category.not.found", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_NOTBLANK(5001, "category.name.not.blank", HttpStatus.BAD_REQUEST),
    CATEGORY_SLUG_NOTBLANK(5002, "category.slug.not.blank", HttpStatus.BAD_REQUEST),
    CATEGORY_SLUG_EXISTED(5003, "category.slug.exists", HttpStatus.BAD_REQUEST),
    CATEGORY_PARENT_NOT_FOUND(5004, "category.parent.not.found", HttpStatus.BAD_REQUEST),
    CATEGORY_PARENT_INVALID(5005, "category.parent.invalid", HttpStatus.BAD_REQUEST),
    CATEGORY_HAS_CHILD(5006, "category.has.child", HttpStatus.BAD_REQUEST),
    CATEGORY_NAME_INVALID_SIZE(5011, "category.name.invalid.size", HttpStatus.BAD_REQUEST),
    CATEGORY_CANNOT_PARENT_ITSELF(5012, "category.cannot.parent.itself", HttpStatus.BAD_REQUEST),
    CATEGORY_LEVEL_TOO_DEEP(5013, "category.level.too.deep", HttpStatus.BAD_REQUEST),
    PARENT_CATEGORY_NOT_FOUND(5004, "category.parent.not.found", HttpStatus.BAD_REQUEST), // Note: Duplicate key in original, kept to avoid breaking changes if used
    CATEGORY_HAS_CHILDREN(5006, "category.has.child", HttpStatus.BAD_REQUEST), // Note: Duplicate key in original, kept to avoid breaking changes if used
    CATEGORY_HAS_BOOKS(5014, "category.has.books", HttpStatus.BAD_REQUEST),

    BRAND_NOT_FOUND(5007, "brand.not.found", HttpStatus.NOT_FOUND),
    BRAND_NAME_NOTBLANK(5008, "brand.name.not.blank", HttpStatus.BAD_REQUEST),
    BRAND_SLUG_NOTBLANK(5009, "brand.slug.not.blank", HttpStatus.BAD_REQUEST),
    BRAND_SLUG_EXISTED(5010, "brand.slug.exists", HttpStatus.BAD_REQUEST),

    AUTHOR_NOT_FOUND(7000, "author.not.found", HttpStatus.NOT_FOUND),
    AUTHOR_NAME_NOTBLANK(7001, "author.name.not.blank", HttpStatus.BAD_REQUEST),
    AUTHOR_NAME_EXISTED(7002, "author.name.exists", HttpStatus.BAD_REQUEST),
    AUTHOR_EMAIL_NOTBLANK(7003, "author.email.not.blank", HttpStatus.BAD_REQUEST),
    AUTHOR_EMAIL_VALID(7004, "author.email.valid", HttpStatus.BAD_REQUEST),
    AUTHOR_EMAIL_EXISTED(7005, "author.email.exists", HttpStatus.BAD_REQUEST),
    AUTHOR_CANNOT_DELETE(7006, "author.cannot.delete", HttpStatus.BAD_REQUEST),
    AUTHOR_HAS_BOOKS(7007, "author.has.book", HttpStatus.BAD_REQUEST),

    // ================= Thêm mới cho Supplier =================
    SUPPLIER_NOT_FOUND(8000, "supplier.not.found", HttpStatus.NOT_FOUND),
    SUPPLIER_NAME_NOTBLANK(8001, "supplier.name.not.blank", HttpStatus.BAD_REQUEST),
    SUPPLIER_EMAIL_EXISTED(8002, "supplier.email.exists", HttpStatus.BAD_REQUEST),
    SUPPLIER_TAX_CODE_EXISTED(8003, "supplier.tax.code.exists", HttpStatus.BAD_REQUEST),
    SUPPLIER_CANNOT_DELETE(8004, "supplier.cannot.delete", HttpStatus.BAD_REQUEST),

    // ================= Thêm mới cho Books =================
    BOOK_NOT_FOUND(9000, "book.not.found", HttpStatus.NOT_FOUND),
    BOOK_TITLE_NOTBLANK(9001, "book.title.not.blank", HttpStatus.BAD_REQUEST),
    BOOK_SLUG_EXISTED(9002, "book.slug.exists", HttpStatus.BAD_REQUEST),
    BOOK_ISBN_EXISTED(9003, "book.isbn.exists", HttpStatus.BAD_REQUEST),
    BOOK_PRICE_INVALID(9004, "book.price.invalid", HttpStatus.BAD_REQUEST),
    BOOK_STOCK_INVALID(9005, "book.stock.invalid", HttpStatus.BAD_REQUEST),
    BOOK_UPDATE_FAILED(9006, "book.update.failed", HttpStatus.INTERNAL_SERVER_ERROR),
    BOOK_DELETE_FAILED(9007, "book.delete.failed", HttpStatus.BAD_REQUEST),

    // Tag errors
    TAG_NOT_FOUND(9100, "tag.not.found", HttpStatus.NOT_FOUND),
    TAG_NAME_EXISTED(9101, "tag.name.exists", HttpStatus.BAD_REQUEST),

    FILE_TYPE_INVALID(6000, "file.type.invalid", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(6001, "file.too.large", HttpStatus.BAD_REQUEST),
    UPLOAD_IMAGE_FAILED(6002, "upload.image.failed", HttpStatus.INTERNAL_SERVER_ERROR),
    UPLOAD_FAILED(1009, "Upload file to S3 failed!", HttpStatus.INTERNAL_SERVER_ERROR),
    USERNAME_EXISTED(1010, "username.exists", HttpStatus.BAD_REQUEST);

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;
}