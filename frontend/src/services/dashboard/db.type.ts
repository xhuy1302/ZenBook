// 1. Metric Item cho 4 thẻ tổng quan
export interface MetricItem {
  value: string
  change: string
  up: boolean
}

export interface DashboardMetrics {
  revenue: MetricItem
  orders: MetricItem
  booksSold: MetricItem
  newCustomers: MetricItem
}

// 2. Biểu đồ doanh thu
export interface MonthlyRevenue {
  month: string
  revenue: number
  orders: number
}

// 3. Biểu đồ danh mục
export interface CategoryStat {
  name: string
  value: number
}

// 4. Top sách bán chạy
export interface TopBook {
  id: string // Backend đã đổi sang String
  title: string
  author: string
  sold: number
  revenue: string
  stock: number
  trend: string
  cover: string
}

// 5. Đơn hàng gần đây
export interface RecentOrder {
  id: string
  customer: string
  avatar: string
  time: string
  items: number
  total: string
  status: string
}

// 6. Cảnh báo tồn kho
export interface StockAlert {
  book: string
  stock: number
  threshold: number
}

// 7. Thống kê hôm nay
export interface TodayStats {
  newOrders: number
  visitors: number
  reviews: number
  shipping: number
}

// === INTERFACE GỐC BAO BỌC TẤT CẢ ===
export interface DashboardData {
  metrics: DashboardMetrics
  revenueData: MonthlyRevenue[]
  categoryData: CategoryStat[]
  topBooks: TopBook[]
  recentOrders: RecentOrder[]
  alerts: StockAlert[]
  todayStats: TodayStats
}
