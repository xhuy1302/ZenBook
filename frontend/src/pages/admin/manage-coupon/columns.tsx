import { type ColumnDef } from '@tanstack/react-table'
import { CouponStatusBadge } from '@/components/admin/data/manage-coupon/CouponStatusBadge'
import { CouponActionsCell } from '@/components/admin/action/CouponAction'
import type { CouponResponse } from '@/services/coupon/coupon.type'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import type { TFunction } from 'i18next'
import { format } from 'date-fns'

export const getColumns = (t: TFunction<'coupon'>): ColumnDef<CouponResponse>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='pl-2'>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='pl-2'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('coupon.table.code', 'Mã Code')} />
    ),
    cell: ({ row }) => (
      <span className='font-bold text-primary tracking-wide bg-primary/10 px-2 py-1 rounded'>
        {row.original.code}
      </span>
    )
  },
  // 👉 THÊM MỚI CỘT: LOẠI MÃ
  {
    accessorKey: 'couponType',
    header: () => <div className='text-center'>Loại ưu đãi</div>,
    cell: ({ row }) => {
      const isShipping = row.original.couponType === 'SHIPPING'
      return (
        <div className='flex justify-center'>
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
              isShipping
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-orange-500 text-orange-600 bg-orange-50'
            }`}
          >
            {isShipping ? 'Freeship' : 'Tiền Sách'}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'discountType',
    header: () => <div className='text-center'>{t('coupon.table.discountValue', 'Mức giảm')}</div>,
    cell: ({ row }) => {
      const { discountType, discountValue, maxDiscountAmount } = row.original
      const isPercent = discountType === 'PERCENTAGE'
      return (
        <div className='flex flex-col items-center gap-1 py-1'>
          <span className='font-semibold text-emerald-600'>
            {isPercent
              ? `${discountValue}%`
              : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  discountValue
                )}
          </span>
          {isPercent && maxDiscountAmount && (
            <span className='text-[11px] text-muted-foreground'>
              Tối đa:{' '}
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                maxDiscountAmount
              )}
            </span>
          )}
        </div>
      )
    }
  },
  {
    id: 'condition',
    header: () => <div className='text-center'>{t('coupon.table.condition', 'Điều kiện')}</div>,
    cell: ({ row }) => (
      <span className='text-xs text-muted-foreground flex justify-center'>
        Đơn từ:{' '}
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
          row.original.minOrderValue
        )}
      </span>
    )
  },
  {
    id: 'usage',
    header: () => <div className='text-center'>{t('coupon.table.usage', 'Lượt dùng')}</div>,
    cell: ({ row }) => {
      const { usedCount, usageLimit } = row.original
      return (
        <div className='font-medium text-center'>
          {usedCount}{' '}
          <span className='text-muted-foreground'>/ {usageLimit ? usageLimit : '∞'}</span>
        </div>
      )
    }
  },
  {
    id: 'duration',
    header: () => <div className='text-center'>{t('coupon.table.duration', 'Thời hạn')}</div>,
    cell: ({ row }) => (
      <div className='flex flex-col items-center text-[11px] text-muted-foreground'>
        <span>{format(new Date(row.original.startDate), 'dd/MM/yyyy HH:mm')}</span>
        <span>-</span>
        <span className='text-destructive'>
          {format(new Date(row.original.endDate), 'dd/MM/yyyy HH:mm')}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: () => <div className='text-center'>{t('coupon.table.status')}</div>,
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <CouponStatusBadge status={row.original.status} />
      </div>
    )
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{t('coupon.table.action', 'Thao tác')}</div>,
    cell: ({ row }) => <CouponActionsCell coupon={row.original} />
  }
]
