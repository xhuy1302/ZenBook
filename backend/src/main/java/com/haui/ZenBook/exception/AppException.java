package com.haui.ZenBook.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppException extends RuntimeException {

    private ErrorCode errorCode;
    private Object[] messageArgs;

    public AppException(ErrorCode errorCode, Object... messageArgs) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.messageArgs = messageArgs;
    }
}
