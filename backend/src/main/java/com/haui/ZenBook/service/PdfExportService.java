package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;
import org.springframework.core.io.ClassPathResource;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfExportService {

    private final TemplateEngine templateEngine;
    private final OrderService orderService; // Gọi lại hàm getOrderById của bạn

    public byte[] exportOrderPdf(String orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);

            if ("PENDING".equals(order.getStatus().name())
                    || "CANCELLED".equals(order.getStatus().name())) {
                throw new AppException(ErrorCode.ORDER_NOT_COMPLETED);
            }

            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable(
                    "orderDate",
                    order.getCreatedAt().format(
                            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                    )
            );

            String html = templateEngine.process("invoice", context);

            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

                ITextRenderer renderer = new ITextRenderer();

                ClassPathResource font =
                        new ClassPathResource("fonts/Arial.ttf");

                renderer.getFontResolver().addFont(
                        font.getFile().getAbsolutePath(),
                        "Identity-H",
                        true
                );

                String baseUrl =
                        new ClassPathResource("templates/")
                                .getURL()
                                .toString();

                renderer.setDocumentFromString(html, baseUrl);
                renderer.layout();
                renderer.createPDF(outputStream);

                return outputStream.toByteArray();
            }

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.EXPORT_PDF_FAILED);
        }
    }
}