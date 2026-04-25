'use client'

import { useState } from 'react'
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSuppliersInTrashApi,
  restoreSupplierApi,
  hardDeleteSupplierApi
} from '@/services/supplier/supplier.api'
import { toast } from 'sonner'
import type { SupplierResponse } from '@/services/supplier/supplier.type'

export function TrashSupplierDialog() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers-trash'],
    queryFn: getSuppliersInTrashApi, // Đảm bảo bạn đã khai báo API này
    enabled: open
  })

  const restoreMutation = useMutation({
    mutationFn: restoreSupplierApi,
    onSuccess: () => {
      toast.success('Khôi phục thành công!')
      queryClient.invalidateQueries({ queryKey: ['suppliers-trash'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteSupplierApi,
    onSuccess: () => {
      toast.success('Đã xóa vĩnh viễn!')
      queryClient.invalidateQueries({ queryKey: ['suppliers-trash'] })
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error.response?.data?.message || 'Không thể xóa vĩnh viễn do có dữ liệu liên kết')
  })

  const suppliers = data || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='gap-2 text-destructive hover:bg-destructive/10 border-destructive/20'
        >
          <Trash2 className='h-4 w-4' /> Thùng rác
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[800px]'>
        <DialogHeader>
          <DialogTitle>Thùng rác Nhà cung cấp</DialogTitle>
        </DialogHeader>

        <div className='max-h-[60vh] overflow-auto rounded-md border'>
          <Table>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                <TableHead>Tên NCC</TableHead>
                <TableHead>Mã số thuế</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center py-8'>
                    <Loader2 className='animate-spin mx-auto' />
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center py-8 text-muted-foreground'>
                    Thùng rác trống
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((sup: SupplierResponse) => (
                  <TableRow key={sup.id}>
                    <TableCell className='font-medium'>{sup.name}</TableCell>
                    <TableCell>{sup.taxCode || '---'}</TableCell>
                    <TableCell className='text-right space-x-2'>
                      <Button
                        variant='secondary'
                        size='sm'
                        onClick={() => restoreMutation.mutate(sup.id)}
                        disabled={restoreMutation.isPending}
                      >
                        <ArchiveRestore className='w-4 h-4 mr-1' /> Khôi phục
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => {
                          if (confirm('Xóa vĩnh viễn sẽ không thể khôi phục. Tiếp tục?'))
                            hardDeleteMutation.mutate(sup.id)
                        }}
                        disabled={hardDeleteMutation.isPending}
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
  )
}
