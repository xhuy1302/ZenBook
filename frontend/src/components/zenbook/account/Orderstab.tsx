// ─────────────────────────────────────────────────────────────────────────────
// components/zenbook/account/OrdersTab.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { getMyOrdersApi } from '@/services/customer/customer.api'
import type { Order } from '@/services/customer/customer.type'

// ── Status config (keys will be used in t()) ──────────────────────────────────

const STATUS_KEYS: Record<Order['status'], string> = {
  pending: 'orders.status.pending',
  shipping: 'orders.status.shipping',
  completed: 'orders.status.completed',
  cancelled: 'orders.status.cancelled'
}

const STATUS_CLASSES: Record<Order['status'], string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  shipping: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className='rounded-xl border border-border overflow-hidden'>
      <div className='bg-muted/50 p-3 grid grid-cols-5 gap-4'>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className='h-4' />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className='p-3 grid grid-cols-5 gap-4 border-t border-border'>
          {[1, 2, 3, 4, 5].map((j) => (
            <Skeleton key={j} className='h-4' />
          ))}
        </div>
      ))}
    </div>
  )
}

function EmptyOrders() {
  const { t } = useTranslation('account')
  return (
    <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
      <div className='w-20 h-20 rounded-full bg-muted flex items-center justify-center'>
        <ShoppingBag className='w-9 h-9 text-muted-foreground' />
      </div>
      <div>
        <p className='font-semibold text-foreground'>{t('orders.emptyTitle')}</p>
        <p className='text-sm text-muted-foreground mt-1'>{t('orders.emptyDescription')}</p>
      </div>
      <Button asChild className='bg-brand-green hover:bg-brand-green-dark text-primary-foreground'>
        <Link to='/'>{t('orders.shopNow')}</Link>
      </Button>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrdersTab() {
  const { t } = useTranslation('account')
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getMyOrdersApi
  })

  return (
    <div>
      {/* Header */}
      <div className='mb-6'>
        <h2 className='text-xl font-bold text-foreground'>{t('orders.title')}</h2>
        <p className='text-sm text-muted-foreground mt-1'>{t('orders.subtitle')}</p>
      </div>

      {isLoading ? (
        <OrderSkeleton />
      ) : !orders?.length ? (
        <EmptyOrders />
      ) : (
        <div className='rounded-xl border border-border overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/50 hover:bg-muted/50'>
                <TableHead className='font-semibold text-foreground'>
                  {t('orders.columns.code')}
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  {t('orders.columns.date')}
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  {t('orders.columns.items')}
                </TableHead>
                <TableHead className='font-semibold text-foreground text-right'>
                  {t('orders.columns.total')}
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  {t('orders.columns.status')}
                </TableHead>
                <TableHead className='font-semibold text-foreground text-right'>
                  {t('orders.columns.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => {
                const statusKey = STATUS_KEYS[order.status]
                const statusClass = STATUS_CLASSES[order.status]
                return (
                  <TableRow key={order.id} className='hover:bg-muted/20 transition-colors'>
                    <TableCell className='font-mono font-medium text-sm'>#{order.code}</TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {formatDate(order.date)}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {t('orders.itemCount', { count: order.itemCount })}
                    </TableCell>
                    <TableCell className='text-right font-semibold text-sm'>
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
                      >
                        {t(statusKey)}
                      </span>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        asChild
                        className='h-8 gap-1.5 hover:text-brand-green hover:bg-brand-green/10'
                      >
                        <Link to={`/orders/${order.id}`}>
                          <Eye className='w-3.5 h-3.5' />
                          {t('orders.details')}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
