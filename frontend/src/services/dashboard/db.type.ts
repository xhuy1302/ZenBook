export interface RevenueChartData {
  month: string
  revenue: number
  profit: number
}

export interface LowStockBook {
  id: string
  title: string
  stockQuantity: number
}

export interface CategoryChartData {
  category: string
  sales: number
  fill: string
}

export interface VisitorChartData {
  month: string
  newVisitors: number
  returningVisitors: number
}

export interface RecentOrder {
  id: string
  orderCode: string
  customerName: string
  finalTotal: number
  status: string
}

export interface DashboardSummary {
  totalRevenue: number
  newOrdersCount: number
  totalCustomers: number
  lowStockCount: number
  revenueChart: RevenueChartData[]
  categoryChart: CategoryChartData[]
  visitorChart: VisitorChartData[]
  recentOrders: RecentOrder[]
  lowStockBooks?: LowStockBook[]
}
