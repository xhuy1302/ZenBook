'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table'

import { Badge } from '@/components/ui/badge'
import { CalendarDays, User, Store, FileText, Hash } from 'lucide-react'

import type { ReceiptResponse } from '@/services/receipt/receipt.type'
import { ReceiptStatusBadge } from '../ReceiptStatusBadge'

interface ViewReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: ReceiptResponse
}

export function ViewReceiptDialog({ open, onOpenChange, receipt }: ViewReceiptDialogProps) {
  const { t } = useTranslation('receipt')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---'
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl'>
        {/* HEADER */}
        <DialogHeader className='p-6 bg-muted/20'>
          <div className='flex justify-between items-center'>
            <div className='space-y-1'>
              <DialogTitle className='text-xl font-black uppercase tracking-tight text-primary'>
                {t('receipt.dialog.viewTitle', 'Chi tiết phiếu nhập')}
              </DialogTitle>
              <div className='flex items-center gap-2 text-muted-foreground text-sm font-mono'>
                <Hash className='w-3.5 h-3.5' />
                <span>{receipt.receiptCode}</span>
              </div>
            </div>
            <ReceiptStatusBadge status={receipt.status} />
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar'>
          {/* THÔNG TIN CHUNG: Dùng Flex với Label cố định để căn lề thẳng đứng */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 bg-muted/10 p-5 rounded-xl border border-dashed'>
            {/* Cột trái */}
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2 text-muted-foreground w-32 shrink-0'>
                  <Store className='w-4 h-4' />
                  <span className='text-xs font-bold uppercase'>
                    {/* 👉 Đã sửa thành NXB và key publisher */}
                    {t('receipt.table.publisher', 'NXB')}
                  </span>
                </div>
                {/* 👉 Đã sửa thành publisherName */}
                <span className='text-sm font-bold text-foreground'>: {receipt.publisherName}</span>
              </div>

              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2 text-muted-foreground w-32 shrink-0'>
                  <CalendarDays className='w-4 h-4' />
                  <span className='text-xs font-bold uppercase'>
                    {t('receipt.form.createdAt', 'Ngày lập')}
                  </span>
                </div>
                <span className='text-sm font-medium'>: {formatDate(receipt.createdAt)}</span>
              </div>
            </div>

            {/* Cột phải */}
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2 text-muted-foreground w-32 shrink-0'>
                  <User className='w-4 h-4' />
                  <span className='text-xs font-bold uppercase'>
                    {t('receipt.form.creator', 'Người tạo')}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-sm font-medium'>:</span>
                  <Badge variant='outline' className='bg-background text-[11px] font-mono py-0 h-5'>
                    {receipt.creatorName || receipt.creatorId?.split('-')[0] || 'Admin'}
                  </Badge>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2 text-muted-foreground w-32 shrink-0'>
                  <FileText className='w-4 h-4' />
                  <span className='text-xs font-bold uppercase'>
                    {t('receipt.form.updatedAt', 'Cập nhật')}
                  </span>
                </div>
                <span className='text-sm font-medium text-muted-foreground'>
                  : {formatDate(receipt.updatedAt)}
                </span>
              </div>
            </div>

            {/* Ghi chú nằm ngang bên dưới */}
            {receipt.note && (
              <div className='col-span-full pt-2 mt-2 border-t border-dashed flex items-start gap-3'>
                <div className='flex items-center gap-2 text-muted-foreground w-32 shrink-0'>
                  <FileText className='w-4 h-4' />
                  <span className='text-xs font-bold uppercase'>
                    {t('receipt.form.note', 'Ghi chú')}
                  </span>
                </div>
                <p className='text-sm italic text-foreground/70'>: {receipt.note}</p>
              </div>
            )}
          </div>

          {/* BẢNG CHI TIẾT */}
          <div className='space-y-4'>
            <h3 className='text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2'>
              <span className='w-1.5 h-1.5 rounded-full bg-primary' />
              {t('receipt.form.sectionDetails', 'Danh sách mặt hàng')}
            </h3>

            <div className='rounded-xl border shadow-sm overflow-hidden'>
              <Table>
                <TableHeader className='bg-muted/50'>
                  <TableRow>
                    <TableHead className='w-[50px] text-center font-bold'>#</TableHead>
                    <TableHead className='font-bold'>{t('receipt.form.book', 'Sách')}</TableHead>
                    <TableHead className='w-[80px] text-center font-bold'>
                      {t('receipt.form.quantity', 'SL')}
                    </TableHead>
                    <TableHead className='w-[140px] text-right font-bold'>
                      {t('receipt.form.importPrice', 'Giá nhập')}
                    </TableHead>
                    <TableHead className='w-[140px] text-right font-bold'>
                      {t('receipt.form.subTotal', 'Thành tiền')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipt.details?.map((item, index) => (
                    <TableRow key={item.id} className='hover:bg-transparent'>
                      <TableCell className='text-center text-muted-foreground text-xs'>
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className='font-bold text-sm'>{item.bookTitle}</div>
                        <div className='text-[10px] text-muted-foreground font-mono'>
                          ID: {item.bookId}
                        </div>
                      </TableCell>
                      <TableCell className='text-center font-semibold text-primary'>
                        {item.quantity}
                      </TableCell>
                      <TableCell className='text-right text-muted-foreground'>
                        {formatCurrency(item.importPrice)}
                      </TableCell>
                      <TableCell className='text-right font-bold'>
                        {formatCurrency(item.subTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className='bg-muted/20 border-t-2'>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='text-right font-black uppercase text-[11px] text-muted-foreground'
                    >
                      {t('receipt.table.totalAmount', 'Tổng cộng')}
                    </TableCell>
                    <TableCell className='text-right text-lg font-black text-orange-600'>
                      {formatCurrency(receipt.totalAmount)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </div>

        <div className='p-4 bg-muted/30 border-t text-center'>
          <p className='text-[10px] text-muted-foreground font-medium uppercase tracking-widest'>
            ZenBook Inventory Management System
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
