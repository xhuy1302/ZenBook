'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Eye,
  Pencil,
  MoreHorizontal,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
  Package,
  FileDown,
  Loader2
} from 'lucide-react'
import { OrderStatus } from '@/defines/order.enum'
import { OrderDetailDialog } from '@/components/admin/data/manage-order/detail/OrderDetailDialog'
import { OrderFormDialog } from '@/components/admin/data/manage-order/form/OrderFormDialog'
import { OrderStatusDialog } from '@/components/admin/data/manage-order/status/OrderStatusDialog'
import { useTranslation } from 'react-i18next'
import type { Order } from '@/services/order/order.type'
import { api } from '@/utils/axiosCustomize'
import { toast } from 'sonner'

interface OrderActionsCellProps {
  order: Order
}

export function OrderActionsCell({ order }: OrderActionsCellProps) {
  const { t } = useTranslation('order')
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; newStatus?: OrderStatus }>({
    open: false
  })

  // 👉 NGHIỆP VỤ 1: Chỉ cho phép SỬA THÔNG TIN khi đơn còn PENDING
  const canEdit = order.status === OrderStatus.PENDING

  // 👉 NGHIỆP VỤ 2: Các trạng thái cuối cùng thì KHÔNG CÒN menu Update Status
  const canUpdate =
    order.status !== OrderStatus.COMPLETED &&
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.RETURNED

  // 👉 NGHIỆP VỤ 3: Xuất hóa đơn cho phép khi đã Xác nhận trở lên (Trừ Hủy)
  const canExportInvoice =
    order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CANCELLED

  const handleExportPdf = async () => {
    try {
      setIsExporting(true)
      const response = await api.get(`/admin/invoices/${order.id}/export-pdf`, {
        responseType: 'blob'
      })

      const blobData = response.data || response

      if (blobData instanceof Blob && blobData.type === 'application/json') {
        const text = await blobData.text()
        const errorJson = JSON.parse(text)
        toast.error(errorJson.message || 'Lỗi từ Server khi tạo PDF!')
        return
      }

      const blob = new Blob([blobData], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `HoaDon_${order.orderCode || order.id}.pdf`)
      document.body.appendChild(link)
      link.click()

      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Xuất hóa đơn PDF thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi xuất hóa đơn!')
    } finally {
      setIsExporting(false)
    }
  }

  // 👉 NGHIỆP VỤ 4: ĐIỀU KHIỂN LUỒNG HIỂN THỊ NÚT (MATCH 100% VỚI SWITCH CASE BACKEND)
  const getStatusActions = () => {
    switch (order.status) {
      case OrderStatus.PENDING:
        return (
          <>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.CONFIRMED })}
            >
              <CheckCircle className='mr-2 h-4 w-4 text-brand-green' /> Xác nhận đơn
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.CANCELLED })}
            >
              <XCircle className='mr-2 h-4 w-4 text-rose-500' />{' '}
              <span className='text-rose-500'>Hủy đơn</span>
            </DropdownMenuItem>
          </>
        )
      case OrderStatus.CONFIRMED:
        return (
          <DropdownMenuItem
            onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.PACKING })}
          >
            <Package className='mr-2 h-4 w-4' /> Đóng gói
          </DropdownMenuItem>
        )
      case OrderStatus.PACKING:
        return (
          <DropdownMenuItem
            onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.SHIPPING })}
          >
            <Truck className='mr-2 h-4 w-4' /> Giao hàng
          </DropdownMenuItem>
        )
      case OrderStatus.SHIPPING:
        return (
          <DropdownMenuItem
            onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.COMPLETED })}
          >
            <CheckCircle className='mr-2 h-4 w-4 text-brand-green' />{' '}
            <span className='text-brand-green'>Đã giao (Hoàn thành)</span>
          </DropdownMenuItem>
        )
      // 👇 TRẠNG THÁI MỚI THÊM: Xử lý khi khách yêu cầu hoàn trả
      case 'RETURN_REQUESTED' as OrderStatus:
        return (
          <>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.RETURNED })}
            >
              <RotateCcw className='mr-2 h-4 w-4 text-amber-500' />{' '}
              <span className='text-amber-500'>Duyệt Trả hàng</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.COMPLETED })}
            >
              <XCircle className='mr-2 h-4 w-4 text-slate-500' />{' '}
              <span className='text-slate-500'>Từ chối Trả hàng</span>
            </DropdownMenuItem>
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className='flex items-center justify-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{t('actions.title')}</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => setDetailOpen(true)}>
              <Eye className='mr-2 h-4 w-4' /> {t('actions.view')}
            </DropdownMenuItem>

            {canExportInvoice && (
              <DropdownMenuItem onClick={handleExportPdf} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin text-brand-green' />
                ) : (
                  <FileDown className='mr-2 h-4 w-4 text-brand-green' />
                )}
                Xuất hóa đơn PDF
              </DropdownMenuItem>
            )}

            {canEdit && (
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className='mr-2 h-4 w-4' /> {t('actions.edit')}
              </DropdownMenuItem>
            )}

            {canUpdate && (
              <>
                <DropdownMenuSeparator />
                {getStatusActions()}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <OrderDetailDialog open={detailOpen} onOpenChange={setDetailOpen} orderId={order.id} />
      <OrderFormDialog open={editOpen} onOpenChange={setEditOpen} order={order} mode='edit' />
      {statusDialog.newStatus && (
        <OrderStatusDialog
          open={statusDialog.open}
          onOpenChange={(open) => setStatusDialog({ ...statusDialog, open })}
          order={order}
          newStatus={statusDialog.newStatus}
        />
      )}
    </>
  )
}
