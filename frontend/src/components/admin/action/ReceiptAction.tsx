'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner' // Hoặc thư viện toast của cưng
import { isAxiosError } from 'axios'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

import { ReceiptStatus } from '@/defines/receipt.enum' // Nhớ check lại path
import { completeReceiptApi, cancelReceiptApi } from '@/services/receipt/receipt.api'
import type { ReceiptResponse } from '@/services/receipt/receipt.type'

// MỞ COMMENT KHI CƯNG TẠO FILE XEM CHI TIẾT
import { ViewReceiptDialog } from '../data/manage-receipt/read/ViewReceiptDialog'

interface ReceiptActionsCellProps {
  receipt: ReceiptResponse
}

export function ReceiptActionsCell({ receipt }: ReceiptActionsCellProps) {
  const { t } = useTranslation('receipt')

  const [openView, setOpenView] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [openCancel, setOpenCancel] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // ---------------------------------
  // API LOGIC
  // ---------------------------------
  const handleComplete = async () => {
    try {
      setIsLoading(true)
      await completeReceiptApi(receipt.id)
      toast.success(t('receipt.message.completeSuccess', 'Chốt phiếu thành công! Đã cộng kho.'))
      setOpenComplete(false)
      window.location.reload() // Hoặc thay bằng mutate/refetch
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || t('common.error', 'Có lỗi xảy ra!'))
      } else {
        toast.error(t('common.error', 'Có lỗi hệ thống!'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      setIsLoading(true)
      await cancelReceiptApi(receipt.id)
      toast.success(t('receipt.message.cancelSuccess', 'Đã hủy phiếu nhập!'))
      setOpenCancel(false)
      window.location.reload() // Hoặc thay bằng mutate/refetch
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || t('common.error', 'Có lỗi xảy ra!'))
      } else {
        toast.error(t('common.error', 'Có lỗi hệ thống!'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isDraft = receipt.status === ReceiptStatus.DRAFT

  return (
    <>
      {/* --------------------------------- */}
      {/* HÀNG NÚT ACTION (UI NHƯ BOOK)      */}
      {/* --------------------------------- */}
      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='ghost'
          className='h-8 px-2 hover:bg-blue-50 text-muted-foreground hover:text-blue-600'
          onClick={() => setOpenView(true)}
          title={t('common.view', 'Xem chi tiết')}
        >
          <Eye className='h-4 w-4' />
        </Button>

        {isDraft && (
          <Button
            variant='ghost'
            className='h-8 px-2 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700'
            onClick={() => setOpenComplete(true)}
            title={t('receipt.action.complete', 'Chốt phiếu')}
          >
            <CheckCircle className='h-4 w-4' />
          </Button>
        )}

        {isDraft && (
          <Button
            variant='ghost'
            className='h-8 px-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700'
            onClick={() => setOpenCancel(true)}
            title={t('receipt.action.cancel', 'Hủy phiếu')}
          >
            <XCircle className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* --------------------------------- */}
      {/* CÁC DIALOG XỬ LÝ (POPUPS)         */}
      {/* --------------------------------- */}

      {/* 1. Modal Xem chi tiết (Chờ cưng tạo file) */}
      {/* <ViewReceiptDialog open={openView} onOpenChange={setOpenView} receipt={receipt} /> */}

      {/* 2. Modal Xác nhận Chốt phiếu */}
      <AlertDialog open={openComplete} onOpenChange={setOpenComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('receipt.dialog.completeTitle', 'Xác nhận chốt phiếu nhập?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'receipt.dialog.completeDesc',
                'Hành động này sẽ cộng số lượng sách vào tồn kho thực tế. Bạn sẽ không thể hoàn tác hoặc thay đổi thông tin sau khi chốt.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('common.cancel', 'Hủy')}</AlertDialogCancel>
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className='bg-emerald-600 text-white hover:bg-emerald-700'
            >
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {t('receipt.action.confirmComplete', 'Xác nhận chốt')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 3. Modal Xác nhận Hủy phiếu */}
      <AlertDialog open={openCancel} onOpenChange={setOpenCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('receipt.dialog.cancelTitle', 'Xác nhận hủy phiếu nhập?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'receipt.dialog.cancelDesc',
                'Bạn có chắc chắn muốn hủy bỏ phiếu nhập nháp này không? Dữ liệu sẽ chuyển sang trạng thái đã hủy.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('common.close', 'Đóng')}</AlertDialogCancel>
            <Button variant='destructive' onClick={handleCancel} disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {t('receipt.action.confirmCancel', 'Đồng ý hủy')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ViewReceiptDialog open={openView} onOpenChange={setOpenView} receipt={receipt} />
    </>
  )
}
