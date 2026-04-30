import { api } from '@/utils/axiosCustomize'
import type { NotificationResponse } from './notification.type'

export const getMyNotificationsApi = async () => {
  const res = await api.get<{ data: NotificationResponse[] }>('/notifications')
  return res.data.data
}

export const markAsReadApi = async (id: string) => {
  const res = await api.put(`/notifications/${id}/read`)
  return res.data
}

export const markAllAsReadApi = async () => {
  const res = await api.put('/notifications/read-all')
  return res.data
}
