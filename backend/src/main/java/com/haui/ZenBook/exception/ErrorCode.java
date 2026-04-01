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

    BRAND_NOT_FOUND(5007, "brand.not.found", HttpStatus.NOT_FOUND),
    BRAND_NAME_NOTBLANK(5008, "brand.name.not.blank", HttpStatus.BAD_REQUEST),
    BRAND_SLUG_NOTBLANK(5009, "brand.slug.not.blank", HttpStatus.BAD_REQUEST),
    BRAND_SLUG_EXISTED(5010, "brand.slug.exists", HttpStatus.BAD_REQUEST),

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
