// components/admin/data/manage-order/status/OrderStatusDialog.tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { OrderStatus } from '@/defines/order.enum'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '@/services/order/order.api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Order } from '@/services/order/order.type'

interface OrderStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  newStatus: OrderStatus
}

export function OrderStatusDialog({
  open,
  onOpenChange,
  order,
  newStatus
}: OrderStatusDialogProps) {
  const { t } = useTranslation('order')
  const [note, setNote] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => orderService.updateStatus(order.id, { newStatus, note: note || undefined }),
    onSuccess: () => {
      toast.success(t('message.success.updateStatus'))
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      onOpenChange(false)
      setNote('')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || t('message.error.updateStatus'))
    }
  })

  // Map trạng thái sang chuỗi dịch
  const statusDisplayMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: t('status.PENDING'),
    [OrderStatus.CONFIRMED]: t('status.CONFIRMED'),
    [OrderStatus.PACKING]: t('status.PACKING'),
    [OrderStatus.SHIPPING]: t('status.SHIPPING'),
    [OrderStatus.COMPLETED]: t('status.COMPLETED'),
    [OrderStatus.CANCELLED]: t('status.CANCELLED'),
    [OrderStatus.RETURNED]: t('status.RETURNED')
  }

  // Map hành động tương ứng với trạng thái mới
  const actionDisplayMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '',
    [OrderStatus.CONFIRMED]: t('actions.confirm'),
    [OrderStatus.PACKING]: t('actions.packing'),
    [OrderStatus.SHIPPING]: t('actions.shipping'),
    [OrderStatus.COMPLETED]: t('actions.complete'),
    [OrderStatus.CANCELLED]: t('actions.cancel'),
    [OrderStatus.RETURNED]: t('actions.return')
  }

  const actionText = actionDisplayMap[newStatus]
  const statusText = statusDisplayMap[newStatus]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('statusDialog.title').replace('{{action}}', actionText)}</DialogTitle>
          <DialogDescription>
            {t('statusDialog.description')
              .replace('{{orderCode}}', order.orderCode)
              .replace('{{status}}', statusText)}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='note'>{t('fields.note')}</Label>
            <Textarea
              id='note'
              placeholder={t('statusDialog.notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('actions.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
