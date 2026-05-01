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

    // Đây là "Sách giáo khoa" thu nhỏ. Trong thực tế, bạn có thể lưu ra file .txt hoặc .pdf rồi đọc vào.
    private static final String FAQ_KNOWLEDGE_BASE = """
            CHÍNH SÁCH VẬN CHUYỂN (GIAO HÀNG):
            Nhà sách ZenBook hợp tác với GHN để giao hàng toàn quốc.
            - Phí vận chuyển tiêu chuẩn là 30.000đ cho mọi đơn hàng.
            - Freeship (Miễn phí vận chuyển) cho đơn hàng có tổng giá trị từ 250.000đ trở lên.
            - Đối với khách hàng thành viên VIP (Hạng Platinum và Diamond), luôn được Freeship 100% mọi đơn hàng bất kể giá trị.
            - Thời gian giao hàng dự kiến: Nội thành Hà Nội (1-2 ngày), Ngoại tỉnh (3-5 ngày).

            CHÍNH SÁCH ĐỔI TRẢ VÀ BẢO HÀNH:
            Khách hàng được quyền yêu cầu đổi hoặc trả hàng (Hoàn tiền) trong các trường hợp sau:
            - Sách bị lỗi in ấn (Thiếu trang, mờ chữ, rách trang, bung gáy) từ nhà xuất bản.
            - Giao sai sách (Không đúng tựa sách, không đúng ấn bản đã đặt).
            - Thời hạn yêu cầu đổi trả: 
                + Khách hàng thường: Trong vòng 7 ngày kể từ khi đơn hàng ở trạng thái "Đã giao thành công" (COMPLETED).
                + Khách hàng VIP (Gold, Platinum, Diamond): Được gia hạn thời gian đổi trả lên tới 14 ngày.

            TƯ VẤN SÁCH THEO TÂM TRẠNG (CHỮA LÀNH):
            - Nếu khách hàng cảm thấy mệt mỏi, áp lực công việc, overthinking, mất phương hướng: Hãy tư vấn các cuốn sách như "Hiểu về trái tim", "Tuổi trẻ đáng giá bao nhiêu", "Muôn kiếp nhân sinh".
            - Nếu khách hàng muốn học hỏi kỹ năng kinh doanh, phát triển bản thân: Hãy tư vấn "Dạy con làm giàu", "Đắc nhân tâm", "7 thói quen để thành đạt".
            """;

    @PostConstruct
    public void loadKnowledgeBase() {
        log.info("Đang kiểm tra dữ liệu RAG trong Redis...");

        // Đoạn logic này kiểm tra xem trong Redis có data chưa. Nếu chưa mới nạp vào để tránh nạp trùng lặp.
        List<Document> testDocs = vectorStore.similaritySearch("chính sách vận chuyển");

        // Kiểm tra xem có kết quả trả về không, và nội dung có chứa từ khóa của FAQ không
        if (!testDocs.isEmpty() && testDocs.get(0).getContent().contains("CHÍNH SÁCH VẬN CHUYỂN")) {
            log.info("Dữ liệu RAG đã có sẵn trong Redis. Bỏ qua bước nạp.");
            return;
        }

        log.info("Bắt đầu nạp 'Sách Giáo Khoa' (FAQ) vào Redis Vector Database...");

        // 1. Chuyển String thành Resource để Reader đọc
        Resource resource = new ByteArrayResource(FAQ_KNOWLEDGE_BASE.getBytes(StandardCharsets.UTF_8));
        TextReader textReader = new TextReader(resource);
        textReader.getCustomMetadata().put("source", "zenbook-faq"); // Thêm metadata để sau này filter nếu cần

        List<Document> documents = textReader.get();

        // 2. Chunking thông minh (Chia nhỏ văn bản tránh nhồi quá nhiều vào Prompt)
        // Chia thành các đoạn tối đa 150 token, overlap 50 token để giữ ngữ cảnh liền mạch
        TokenTextSplitter textSplitter = new TokenTextSplitter(150, 50, 5, 10000, true);
        List<Document> splitDocuments = textSplitter.apply(documents);

        // 3. Nạp vào Vector DB (Tự động gọi Embedding Model để mã hóa)
        vectorStore.add(splitDocuments);

        log.info("Đã nạp thành công {} chunks vào Redis Vector Store!", splitDocuments.size());
    }
}