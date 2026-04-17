'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ArchiveRestore, Trash, Trash2, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getCouponsInTrashApi } from '@/services/coupon/coupon.api'
import type { CouponResponse } from '@/services/coupon/coupon.type'

import { RestoreCouponDialog } from '../restore/RestoreCouponDialog'
import { HardDeleteCouponDialog } from '../delete/DeletePermanentCouponDialog'

export function TrashCouponDialog() {
  const { t } = useTranslation('coupon')
  const [open, setOpen] = useState(false)

  // State quản lý việc mở Popup con (Restore/HardDelete)
  const [selectedCoupon, setSelectedCoupon] = useState<CouponResponse | null>(null)
  const [openRestore, setOpenRestore] = useState(false)
  const [openHardDelete, setOpenHardDelete] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['coupons-trash'],
    queryFn: getCouponsInTrashApi,
    enabled: open
  })

  const couponsInTrash = data || []

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant='outline'
            className='gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {t('trash.btnTrash', 'Thùng rác')}
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[700px]'>
          <DialogHeader>
            <DialogTitle>{t('trash.title', 'Thùng rác mã giảm giá')}</DialogTitle>
          </DialogHeader>

          <div className='max-h-[60vh] overflow-auto rounded-md border custom-scrollbar'>
            <Table>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  <TableHead>{t('table.code', 'Mã Code')}</TableHead>
                  <TableHead>{t('table.discountValue', 'Mức giảm')}</TableHead>
                  <TableHead className='text-right'>{t('common.action', 'Thao tác')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className='text-center py-8'>
                      <Loader2 className='animate-spin mx-auto text-primary' />
                    </TableCell>
                  </TableRow>
                ) : couponsInTrash.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className='text-center py-8 text-muted-foreground'>
                      {t('trash.empty', 'Thùng rác trống')}
                    </TableCell>
                  </TableRow>
                ) : (
                  couponsInTrash.map((coupon: CouponResponse) => (
                    <TableRow key={coupon.id}>
                      <TableCell className='font-bold text-primary tracking-wider'>
                        {coupon.code}
                      </TableCell>
                      <TableCell>
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}%`
                          : new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(coupon.discountValue)}
                      </TableCell>
                      <TableCell className='text-right space-x-2'>
                        <Button
                          variant='secondary'
                          size='sm'
                          onClick={() => {
                            setSelectedCoupon(coupon)
                            setOpenRestore(true)
                          }}
                        >
                          <ArchiveRestore className='w-4 h-4 sm:mr-1' />{' '}
                          <span className='hidden sm:inline'>
                            {t('common.restore', 'Khôi phục')}
                          </span>
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => {
                            setSelectedCoupon(coupon)
                            setOpenHardDelete(true)
                          }}
                        >
                          <Trash className='w-4 h-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gắn 2 Popup con ở ngoài để không bị lỗi đè z-index */}
      <RestoreCouponDialog
        open={openRestore}
        onOpenChange={setOpenRestore}
        coupon={selectedCoupon}
      />
      <HardDeleteCouponDialog
        open={openHardDelete}
        onOpenChange={setOpenHardDelete}
        coupon={selectedCoupon}
      />
    </>
  )
}
