    package com.haui.ZenBook.enums;
    
    import lombok.Getter;
    
    @Getter
    public enum MemberTier {
        MEMBER(0.0, 1.0, "Đồng"),
        SILVER(2000000.0, 1.05, "Bạc"),
        GOLD(5000000.0, 1.10, "Vàng"),
        PLATINUM(10000000.0, 1.20, "Bạch Kim"),
        DIAMOND(20000000.0, 1.30, "Kim Cương");
    
        private final Double minSpending;     // Ngưỡng chi tiêu để đạt hạng
        private final Double pointMultiplier; // Hệ số nhân điểm thưởng
        private final String displayName;
    
        MemberTier(Double minSpending, Double pointMultiplier, String displayName) {
            this.minSpending = minSpending;
            this.pointMultiplier = pointMultiplier;
            this.displayName = displayName;
        }
    }