// components/admin/action/OrderAction.tsx
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
  Package
} from 'lucide-react'
import { OrderStatus } from '@/defines/order.enum'
import { OrderDetailDialog } from '@/components/admin/data/manage-order/detail/OrderDetailDialog'
import { OrderFormDialog } from '@/components/admin/data/manage-order/form/OrderFormDialog'
import { OrderStatusDialog } from '@/components/admin/data/manage-order/status/OrderStatusDialog'
import { useTranslation } from 'react-i18next'
import type { Order } from '@/services/order/order.type'

interface OrderActionsCellProps {
  order: Order
}

export function OrderActionsCell({ order }: OrderActionsCellProps) {
  const { t } = useTranslation('order')
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; newStatus?: OrderStatus }>({
    open: false
  })

  const canEdit = order.status === OrderStatus.PENDING
  const canUpdate =
    order.status !== OrderStatus.COMPLETED &&
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.RETURNED

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
