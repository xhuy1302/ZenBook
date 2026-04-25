'use client'

import { useState, type ReactNode } from 'react' // 👉 Thêm import ReactNode
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  FileSpreadsheet,
  Loader2,
  Upload,
  Trash2,
  CheckCircle2,
  XCircle,
  PackageSearch,
  Info
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import { getAllSuppliersApi } from '@/services/supplier/supplier.api'
import { previewImportReceiptExcelApi, createReceiptApi } from '@/services/receipt/receipt.api'
import type { PreviewReceiptResponse, ReceiptRequest } from '@/services/receipt/receipt.type'
import type { AxiosError } from 'axios'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 👉 ĐỊNH NGHĨA KIỂU CHO CÁC HELPER COMPONENTS ĐỂ TRÁNH LỖI 'any'
interface CellProps {
  children: ReactNode
  center?: boolean
  right?: boolean
  className?: string
}

export function ImportReceiptDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const [file, setFile] = useState<File | null>(null)
  const [supplierId, setSupplierId] = useState('')
  const [previewData, setPreviewData] = useState<PreviewReceiptResponse | null>(null)

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers', 'active'],
    queryFn: getAllSuppliersApi,
    enabled: open
  })

  const previewMutation = useMutation({
    mutationFn: (file: File) => previewImportReceiptExcelApi(file),
    onSuccess: (data) => {
      setPreviewData(data)
      toast.success('Đã tải dữ liệu xem trước')
    },
    onError: () => {
      setPreviewData(null)
      toast.error('File không hợp lệ')
    }
  })

  const confirmMutation = useMutation({
    mutationFn: (payload: ReceiptRequest) => createReceiptApi(payload),
    onSuccess: () => {
      toast.success('Nhập kho thành công')
      queryClient.invalidateQueries({ queryKey: ['receipts'] })
      handleClose()
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    previewMutation.mutate(selectedFile)
  }

  const handleConfirm = () => {
    if (!supplierId || !previewData || previewData.validRows === 0) return
    const validDetails = previewData.details
      .filter((x) => x.isValid)
      .map((x) => ({
        bookId: x.bookId,
        quantity: x.quantity,
        importPrice: x.importPrice
      }))

    confirmMutation.mutate({
      supplierId,
      note: `Import Excel - ${file?.name}`,
      details: validDetails
    })
  }

  const handleClose = () => {
    setFile(null)
    setSupplierId('')
    setPreviewData(null)
    onOpenChange(false)
  }

  const actualImportAmount =
    previewData?.details
      ?.filter((x) => x.isValid === true)
      .reduce((sum, item) => sum + Number(item.quantity) * Number(item.importPrice), 0) ?? 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[1250px] w-[98vw] h-[92vh] p-0 overflow-hidden border-0 rounded-2xl bg-white shadow-2xl flex flex-col'>
        <DialogHeader className='px-6 py-3 border-b bg-white shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100'>
              <FileSpreadsheet className='h-5 w-5 text-emerald-600' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-slate-800 tracking-tight'>
                Nhập kho bằng Excel
              </DialogTitle>
              <DialogDescription className='text-[12px] text-slate-500'>
                Hệ thống tự động kiểm tra dữ liệu trước khi nhập kho
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-hidden flex flex-col p-5 gap-4 text-[13px] bg-slate-50/30'>
          <div className='grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0'>
            <div>
              <Label className='text-[11px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>
                1. Nhà cung cấp
              </Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className='h-9 bg-white text-[13px]'>
                  <SelectValue placeholder='Chọn nhà cung cấp' />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((s) => (
                    <SelectItem key={s.id} value={s.id} className='text-[13px]'>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className='text-[11px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>
                2. Tệp dữ liệu
              </Label>
              <div className='flex gap-2'>
                <Input
                  id='upload'
                  type='file'
                  accept='.xlsx,.xls'
                  onChange={handleFileChange}
                  className='hidden'
                />
                <Button
                  asChild
                  variant='outline'
                  className='flex-1 h-9 justify-start bg-white border-dashed border-2 hover:border-emerald-500'
                >
                  <label htmlFor='upload' className='cursor-pointer flex items-center gap-2 w-full'>
                    {previewMutation.isPending ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Upload className='h-4 w-4 text-slate-400' />
                    )}
                    <span className='truncate text-[13px]'>
                      {file ? file.name : 'Chọn file Excel...'}
                    </span>
                  </label>
                </Button>
                {file && (
                  <Button
                    size='icon'
                    variant='outline'
                    className='h-9 w-9 text-red-500 bg-white border-red-100 hover:bg-red-50'
                    onClick={() => {
                      setFile(null)
                      setPreviewData(null)
                    }}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className='flex-1 min-h-0 border rounded-xl overflow-hidden flex flex-col bg-white shadow-sm border-slate-200'>
            <div className='flex items-center justify-between px-4 py-2 bg-slate-50 border-b shrink-0'>
              <div className='flex items-center gap-2 text-slate-600 font-semibold uppercase text-[11px]'>
                <Info className='w-3.5 h-3.5' />
                <span>Danh sách kiểm tra chi tiết</span>
              </div>

              {previewData && (
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1 px-2 py-0.5 bg-white border rounded shadow-sm text-[11px]'>
                    <span className='text-slate-400 font-bold'>TỔNG:</span>
                    <span className='font-black text-slate-700'>{previewData.totalRows}</span>
                  </div>
                  <div className='flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded shadow-sm text-[11px]'>
                    <span className='text-emerald-500 font-bold'>HỢP LỆ:</span>
                    <span className='font-black text-emerald-700'>{previewData.validRows}</span>
                  </div>
                  <div className='flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-100 rounded shadow-sm text-[11px]'>
                    <span className='text-red-500 font-bold'>LỖI:</span>
                    <span className='font-black text-red-700'>{previewData.invalidRows}</span>
                  </div>
                </div>
              )}
            </div>

            {previewData ? (
              <div className='flex-1 min-h-0 flex flex-col overflow-hidden'>
                <div className='grid grid-cols-[60px_1fr_150px_90px_130px_140px_100px] bg-slate-100/80 border-b text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0'>
                  <CellHead center>#</CellHead>
                  <CellHead>Tên sách</CellHead>
                  <CellHead>Mã SKU</CellHead>
                  <CellHead center>SL</CellHead>
                  <CellHead right>Giá nhập</CellHead>
                  <CellHead right>Thành tiền</CellHead>
                  <CellHead center>Kết quả</CellHead>
                </div>

                <ScrollArea className='flex-1 h-full overflow-y-auto'>
                  <div className='flex flex-col'>
                    {previewData.details.map((row, index) => {
                      const total = Number(row.quantity) * Number(row.importPrice)
                      return (
                        <div
                          key={row.rowNumber}
                          className={`grid grid-cols-[60px_1fr_150px_90px_130px_140px_100px] items-center border-b text-[13px] hover:bg-slate-50 transition-colors ${
                            !row.isValid
                              ? 'bg-red-50/40'
                              : index % 2 === 0
                                ? 'bg-white'
                                : 'bg-slate-50/20'
                          }`}
                        >
                          <Cell center className='font-mono text-slate-400'>
                            {row.rowNumber}
                          </Cell>
                          <Cell>
                            <div>
                              <p
                                className={`font-bold ${row.isValid ? 'text-slate-700' : 'text-red-700'}`}
                              >
                                {row.bookTitle || '---'}
                              </p>
                              {!row.isValid && (
                                <p className='text-[11px] text-red-500 mt-0.5 font-medium italic'>
                                  {row.errorMessages?.join(' • ')}
                                </p>
                              )}
                            </div>
                          </Cell>
                          <Cell>
                            <Badge variant='outline' className='text-[10px] font-mono bg-white'>
                              {row.bookId}
                            </Badge>
                          </Cell>
                          <Cell center className='font-black text-slate-700'>
                            {row.quantity}
                          </Cell>
                          <Cell right className='font-medium text-slate-600'>
                            {new Intl.NumberFormat('vi-VN').format(row.importPrice)}đ
                          </Cell>
                          <Cell
                            right
                            className={`font-bold ${row.isValid ? 'text-emerald-600' : 'text-slate-400'}`}
                          >
                            {new Intl.NumberFormat('vi-VN').format(total)}đ
                          </Cell>
                          <Cell center>
                            {row.isValid ? (
                              <CheckCircle2 className='w-4 h-4 text-emerald-500 mx-auto' />
                            ) : (
                              <XCircle className='w-4 h-4 text-red-400 mx-auto' />
                            )}
                          </Cell>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className='flex-1 flex flex-col items-center justify-center text-slate-300'>
                <PackageSearch className='w-12 h-12 mb-2 opacity-20' />
                <p className='text-[13px] font-medium'>Chưa có dữ liệu Preview</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='border-t px-6 py-3 bg-white flex justify-between items-center shrink-0'>
          <div className='flex items-center gap-5'>
            <div className='flex flex-col'>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                Thực nhập ({previewData?.validRows || 0} dòng)
              </span>
              <span className='text-xl font-black text-emerald-600 tracking-tight'>
                {new Intl.NumberFormat('vi-VN').format(actualImportAmount)}đ
              </span>
            </div>
            <div className='h-8 w-px bg-slate-200' />
            <div className='text-[12px] font-semibold text-slate-500 italic'>
              Lưu ý: <span className='text-red-500'>{previewData?.invalidRows || 0} dòng lỗi</span>{' '}
              sẽ bị bỏ qua
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleClose}
              className='font-bold text-[12px] h-9 px-5 rounded-lg'
            >
              HỦY BỎ
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                !supplierId ||
                !previewData ||
                previewData.validRows === 0 ||
                confirmMutation.isPending
              }
              className='bg-slate-900 hover:bg-slate-800 text-white font-bold text-[12px] h-9 px-6 rounded-lg shadow-md transition-all'
            >
              {confirmMutation.isPending && <Loader2 className='w-3.5 h-3.5 mr-2 animate-spin' />}
              XÁC NHẬN NHẬP
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 👉 SỬA: Thay 'any' bằng kiểu Props cụ thể
function Cell({ children, center, right, className = '' }: CellProps) {
  return (
    <div
      className={`px-4 py-2.5 ${center ? 'text-center' : ''} ${right ? 'text-right' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

function CellHead({ children, center, right }: CellProps) {
  return (
    <div className={`px-4 py-2 ${center ? 'text-center' : ''} ${right ? 'text-right' : ''}`}>
      {children}
    </div>
  )
}
