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
  FileDown, // 👉 Import thêm icon tải file
  Loader2
} from 'lucide-react'
import { OrderStatus } from '@/defines/order.enum'
import { OrderDetailDialog } from '@/components/admin/data/manage-order/detail/OrderDetailDialog'
import { OrderFormDialog } from '@/components/admin/data/manage-order/form/OrderFormDialog'
import { OrderStatusDialog } from '@/components/admin/data/manage-order/status/OrderStatusDialog'
import { useTranslation } from 'react-i18next'
import type { Order } from '@/services/order/order.type'
import { api } from '@/utils/axiosCustomize' // 👉 Import api để gọi axios
import { toast } from 'sonner' // 👉 Import toast để thông báo

interface OrderActionsCellProps {
  order: Order
}

export function OrderActionsCell({ order }: OrderActionsCellProps) {
  const { t } = useTranslation('order')
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false) // 👉 State loading cho nút Export PDF
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; newStatus?: OrderStatus }>({
    open: false
  })

  const canEdit = order.status === OrderStatus.PENDING
  const canUpdate =
    order.status !== OrderStatus.COMPLETED &&
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.RETURNED

  const canExportInvoice = order.status === OrderStatus.CONFIRMED

  // 👉 HÀM XỬ LÝ XUẤT PDF
  // 👉 HÀM XỬ LÝ XUẤT PDF ĐÃ ĐƯỢC BẢO VỆ
  const handleExportPdf = async () => {
    try {
      setIsExporting(true)

      // BẮT BUỘC có responseType: 'blob' để Axios không cố gắng parse JSON
      const response = await api.get(`/invoices/${order.id}/export-pdf`, {
        responseType: 'blob'
      })

      // Lấy dữ liệu Blob (Tùy thuộc vào cấu hình interceptor của bạn)
      // Thường interceptor trả về response.data, nên ta ưu tiên lấy response.data
      const blobData = response.data || response

      // Nếu server lỡ trả về JSON báo lỗi (VD: không có quyền, lỗi 500) nhưng bị ép thành Blob
      if (blobData instanceof Blob && blobData.type === 'application/json') {
        const text = await blobData.text()
        const errorJson = JSON.parse(text)
        toast.error(errorJson.message || 'Lỗi từ Server khi tạo PDF!')
        return
      }

      // TẠO FILE VÀ TẢI XUỐNG
      const blob = new Blob([blobData], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `HoaDon_${order.orderCode || order.id}.pdf`)
      document.body.appendChild(link)
      link.click()

      // Dọn dẹp
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Xuất hóa đơn PDF thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi xuất hóa đơn!')
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusActions = () => {
    switch (order.status) {
      case OrderStatus.PENDING:
        return (
          <>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.CONFIRMED })}
            >
              <CheckCircle className='mr-2 h-4 w-4' /> {t('actions.confirm')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.CANCELLED })}
            >
              <XCircle className='mr-2 h-4 w-4' /> {t('actions.cancel')}
            </DropdownMenuItem>
          </>
        )
      case OrderStatus.CONFIRMED:
        return (
          <>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.PACKING })}
            >
              <Package className='mr-2 h-4 w-4' /> {t('actions.packing')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.CANCELLED })}
            >
              <XCircle className='mr-2 h-4 w-4' /> {t('actions.cancel')}
            </DropdownMenuItem>
          </>
        )
      case OrderStatus.PACKING:
        return (
          <>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.SHIPPING })}
            >
              <Truck className='mr-2 h-4 w-4' /> {t('actions.shipping')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.CANCELLED })}
            >
              <XCircle className='mr-2 h-4 w-4' /> {t('actions.cancel')}
            </DropdownMenuItem>
          </>
        )
      case OrderStatus.SHIPPING:
        return (
          <>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.COMPLETED })}
            >
              <CheckCircle className='mr-2 h-4 w-4' /> {t('actions.complete')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusDialog({ open: true, newStatus: OrderStatus.RETURNED })}
            >
              <RotateCcw className='mr-2 h-4 w-4' /> {t('actions.return')}
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
      <OrderStatusDialog
        open={statusDialog.open}
        onOpenChange={(open) => setStatusDialog({ ...statusDialog, open })}
        order={order}
        newStatus={statusDialog.newStatus!}
      />
    </>
  )
}
