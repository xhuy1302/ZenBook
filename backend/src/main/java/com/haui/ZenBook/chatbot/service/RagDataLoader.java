package com.haui.ZenBook.chatbot.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.TextReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagDataLoader {

    private final VectorStore vectorStore;

    // 👉 ĐÃ CẬP NHẬT "SÁCH GIÁO KHOA": Xóa rule 250k cứng, thêm chi tiết hạng điểm
    private static final String FAQ_KNOWLEDGE_BASE = """
            CHÍNH SÁCH VẬN CHUYỂN & ĐỔI TRẢ:
            - Nhà sách ZenBook hợp tác với GHN giao hàng toàn quốc. Nội thành Hà Nội (1-2 ngày), Ngoại tỉnh (3-5 ngày).
            - Phí vận chuyển tiêu chuẩn là 30.000đ. Điều kiện Freeship phụ thuộc vào mã khuyến mãi hiện hành trên hệ thống.
            - Đặc quyền: Khách hàng hạng Bạch Kim (Platinum) và Kim Cương (Diamond) luôn được Freeship 100% mọi đơn hàng bất kể giá trị.
            - Đổi trả sách (do lỗi in ấn, giao sai): Thời hạn 7 ngày đối với Thành viên thường & Bạc. Lên đến 14 ngày đối với hạng Vàng, Bạch Kim, Kim Cương.

            HỆ THỐNG HẠNG THÀNH VIÊN VÀ QUYỀN LỢI (ZPOINTS):
            - Thành viên Mới (MEMBER): Tích lũy x1.0 ZPoints.
            - Hạng BẠC (SILVER): Tích lũy x1.05 ZPoints. Nhận Voucher sinh nhật 5%. Ưu tiên CSKH.
            - Hạng VÀNG (GOLD): Tích lũy x1.10 ZPoints. Nhận Voucher tháng 10%. Quyền đổi trả lên tới 14 ngày.
            - Hạng BẠCH KIM (PLATINUM): Tích lũy x1.20 ZPoints. Freeship không giới hạn (Unlimited). Tặng Box quà sinh nhật.
            - Hạng KIM CƯƠNG (DIAMOND): Tích lũy x1.30 ZPoints. CSKH & Hotline riêng. Voucher sinh nhật 15-20%. Hoàn xu 3-5%.

            TƯ VẤN SÁCH THEO TÂM TRẠNG (CHỮA LÀNH):
            - Nếu khách hàng cảm thấy mệt mỏi, áp lực công việc, overthinking, mất phương hướng: Hãy tư vấn các cuốn sách như "Hiểu về trái tim", "Tuổi trẻ đáng giá bao nhiêu", "Muôn kiếp nhân sinh".
            - Nếu khách hàng muốn học hỏi kỹ năng kinh doanh, phát triển bản thân: Hãy tư vấn "Dạy con làm giàu", "Đắc nhân tâm", "7 thói quen để thành đạt".
            """;

    @PostConstruct
    public void loadKnowledgeBase() {
        log.info("Đang kiểm tra dữ liệu RAG trong Redis...");

        // Đổi từ khóa check để ép hệ thống nhận diện bản Update mới
        List<Document> testDocs = vectorStore.similaritySearch("HỆ THỐNG HẠNG THÀNH VIÊN");

        if (!testDocs.isEmpty() && testDocs.get(0).getContent().contains("ZPOINTS")) {
            log.info("Dữ liệu RAG (Bản mới nhất) đã có sẵn trong Redis. Bỏ qua bước nạp.");
            return;
        }

        log.info("Bắt đầu nạp 'Sách Giáo Khoa' bản nâng cấp vào Redis Vector Database...");

        Resource resource = new ByteArrayResource(FAQ_KNOWLEDGE_BASE.getBytes(StandardCharsets.UTF_8));
        TextReader textReader = new TextReader(resource);
        textReader.getCustomMetadata().put("source", "zenbook-faq-v2");

        List<Document> documents = textReader.get();

        TokenTextSplitter textSplitter = new TokenTextSplitter(150, 50, 5, 10000, true);
        List<Document> splitDocuments = textSplitter.apply(documents);

        vectorStore.add(splitDocuments);

        log.info("Đã nạp thành công {} chunks vào Redis Vector Store!", splitDocuments.size());
    }
}