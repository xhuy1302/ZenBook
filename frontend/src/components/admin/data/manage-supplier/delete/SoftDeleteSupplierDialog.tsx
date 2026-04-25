'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { softDeleteSupplierApi } from '@/services/supplier/supplier.api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { SupplierResponse } from '@/services/supplier/supplier.type'

export function DeleteSupplierDialog({
  open,
  onOpenChange,
  supplier
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  supplier: SupplierResponse
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => softDeleteSupplierApi(supplier.id),
    onSuccess: () => {
      toast.success('Đã chuyển nhà cung cấp vào thùng rác')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      onOpenChange(false)
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error.response?.data?.message || 'Không thể xóa nhà cung cấp này')
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa nhà cung cấp{' '}
            <strong className='text-foreground'>{supplier.name}</strong>? Hành động này sẽ chuyển dữ
            liệu vào thùng rác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='ghost' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
