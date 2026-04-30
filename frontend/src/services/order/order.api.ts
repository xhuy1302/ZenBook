import { api } from '@/utils/axiosCustomize'
import type { Order, Page, OrderCreateRequest, OrderUpdateRequest } from './order.type'
import type { OrderStatus } from '@/defines/order.enum'

export const orderService = {
  // 1. TẠO MỚI ĐƠN HÀNG
  create: async (data: OrderCreateRequest): Promise<Order> => {
    const res = await api.post<unknown>('/orders', data)
    const responseObj = res as unknown as Record<string, unknown>

    if (responseObj?.data) {
      const innerData = responseObj.data as Record<string, unknown>
      if (innerData?.data) return innerData.data as unknown as Order
      return innerData as unknown as Order
    }
    return responseObj as unknown as Order
  },

  // 2. CẬP NHẬT ĐƠN HÀNG (👉 Đã đổi id thành orderCode)
  update: async (orderCode: string, data: OrderUpdateRequest): Promise<Order> => {
    const res = await api.put<unknown>(`/orders/${orderCode}`, data)
    const responseObj = res as unknown as Record<string, unknown>

    if (responseObj?.data) {
      const innerData = responseObj.data as Record<string, unknown>
      if (innerData?.data) return innerData.data as unknown as Order
      return innerData as unknown as Order
    }
    return responseObj as unknown as Order
  },

  // 3. LẤY TẤT CẢ ĐƠN HÀNG (ADMIN)
  getAll: async (params: {
    page: number
    size: number
    status?: OrderStatus
    startDate?: string
    endDate?: string
  }): Promise<Page<Order>> => {
    const res = await api.get<unknown>('/orders', { params })
    const response = res as unknown as Record<string, unknown>

    let pageObj: Record<string, unknown> | null = null

    if (response && typeof response.content !== 'undefined') {
      pageObj = response
    } else if (
      response?.data &&
      typeof (response.data as Record<string, unknown>).content !== 'undefined'
    ) {
      pageObj = response.data as Record<string, unknown>
    } else if (
      (response?.data as Record<string, unknown>)?.data &&
      typeof ((response.data as Record<string, unknown>).data as Record<string, unknown>)
        .content !== 'undefined'
    ) {
      pageObj = (response.data as Record<string, unknown>).data as Record<string, unknown>
    }

    if (pageObj) {
      // Hỗ trợ format mới của Spring Boot (thông tin phân trang nằm trong object 'page')
      const pageInfo = pageObj.page ? (pageObj.page as Record<string, unknown>) : pageObj

      return {
        content: (pageObj.content as Order[]) || [],
        totalElements:
          (pageInfo.totalElements as number) ?? (pageInfo.totalElementsCount as number) ?? 0,
        totalPages: (pageInfo.totalPages as number) || 0,
        number: (pageInfo.number as number) || 0,
        size: (pageInfo.size as number) || 0
      }
    }

    return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 }
  },

  // 4. LẤY ĐƠN HÀNG CỦA TÔI (CUSTOMER)
  getMyOrders: async (params: {
    page: number
    size: number
    status?: string
  }): Promise<Page<Order>> => {
    const res = await api.get<unknown>('/orders/my-orders', { params })
    const responseObj = res as unknown as Record<string, unknown>

    let pageObj: Record<string, unknown> | null = null

    if (responseObj?.data) {
      const dataLevel1 = responseObj.data as Record<string, unknown>
      if (
        dataLevel1?.data &&
        typeof (dataLevel1.data as Record<string, unknown>).content !== 'undefined'
      ) {
        pageObj = dataLevel1.data as Record<string, unknown>
      } else if (typeof dataLevel1.content !== 'undefined') {
        pageObj = dataLevel1
      }
    } else if (typeof responseObj.content !== 'undefined') {
      pageObj = responseObj
    }

    if (pageObj) {
      const pageInfo = pageObj.page ? (pageObj.page as Record<string, unknown>) : pageObj

      return {
        content: (pageObj.content as Order[]) || [],
        totalElements: (pageInfo.totalElements as number) || 0,
        totalPages: (pageInfo.totalPages as number) || 0,
        number: (pageInfo.number as number) || 0,
        size: (pageInfo.size as number) || 0
      }
    }

    return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 }
  },

  // 5. CẬP NHẬT TRẠNG THÁI (👉 Đã đổi id thành orderCode)
  updateStatus: async (
    orderCode: string,
    data: { newStatus: OrderStatus; note?: string }
  ): Promise<Order> => {
    const res = await api.patch<unknown>(`/orders/${orderCode}/status`, data)
    const responseObj = res as unknown as Record<string, unknown>

    if (responseObj?.data) {
      const innerData = responseObj.data as Record<string, unknown>
      if (innerData?.data) return innerData.data as unknown as Order
      return innerData as unknown as Order
    }

    return responseObj as unknown as Order
  },

  // 6. LẤY CHI TIẾT 1 ĐƠN HÀNG (👉 Đã đổi id thành orderCode)
  getById: async (orderCode: string): Promise<Order> => {
    const res = await api.get<unknown>(`/orders/${orderCode}`)
    const responseObj = res as unknown as Record<string, unknown>

    if (responseObj?.data) {
      const innerData = responseObj.data as Record<string, unknown>
      if (innerData?.data) return innerData.data as unknown as Order
      return innerData as unknown as Order
    }

    return responseObj as unknown as Order
  },

  // 7. ĐẾM ĐƠN CHỜ XỬ LÝ
  getCountPending: async (): Promise<number> => {
    const res = await api.get<unknown>('/orders/count-pending')
    const responseObj = res as unknown as Record<string, unknown>

    if (typeof res === 'number') return res
    if (typeof responseObj.data === 'number') return responseObj.data

    return 0
  }
}
