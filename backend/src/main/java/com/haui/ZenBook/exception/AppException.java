package com.haui.ZenBook.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppException extends RuntimeException {

    private ErrorCode errorCode;
    private Object[] messageArgs;

    public AppException(ErrorCode errorCode, Object... messageArgs) {
        super(errorCode.getMessage()); // Lúc này nó truyền cái key "author.has.book" lên cha
        this.errorCode = errorCode;
        this.messageArgs = messageArgs; // Giữ lại mảng tham số (VD: ["5 sách (Harry Potter...)"])
    }
}