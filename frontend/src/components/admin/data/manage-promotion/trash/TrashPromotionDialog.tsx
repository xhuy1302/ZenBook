'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArchiveRestore, Loader2, Trash2, RefreshCcw, AlertOctagon } from 'lucide-react'
import { format } from 'date-fns'

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
import { Badge } from '@/components/ui/badge'

import { getAllPromotionsInTrashApi } from '@/services/promotion/promotion.api'
import type { PromotionResponse } from '@/services/promotion/promotion.type'

import { RestorePromotionDialog } from '../restore/RestorePromotionDialog'
import { HardDeletePromotionDialog } from '../delete/DeletePermanentPromotionDialog'

export function TrashPromotionDialog() {
  const { t } = useTranslation('promotion')
  const [open, setOpen] = useState(false)

  const [selectedRestore, setSelectedRestore] = useState<PromotionResponse | null>(null)
  const [selectedHardDelete, setSelectedHardDelete] = useState<PromotionResponse | null>(null)

  const { data: trashPromotions, isLoading } = useQuery({
    queryKey: ['promotions-trash'],
    queryFn: () => getAllPromotionsInTrashApi(),
    enabled: open
  })

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant='outline'
            className='gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20'
          >
            <Trash2 className='w-4 h-4' />
            {t('actions.trash', 'Thùng rác')}
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-4xl p-0 bg-background overflow-hidden border-none shadow-2xl'>
          <DialogHeader className='px-6 py-5 bg-destructive/5 border-b border-destructive/10'>
            <div className='flex items-center justify-between'>
              <DialogTitle className='text-xl font-bold flex items-center gap-2 text-destructive'>
                <ArchiveRestore className='w-5 h-5' />
                {t('dialogTitle.trash', 'Thùng rác khuyến mãi')}
              </DialogTitle>
              <Badge variant='destructive' className='rounded-full px-3'>
                {trashPromotions?.length || 0} mục
              </Badge>
            </div>
          </DialogHeader>

          <div className='p-6 max-h-[70vh] overflow-y-auto custom-scrollbar'>
            <div className='border rounded-xl overflow-hidden bg-card shadow-sm'>
              <Table>
                <TableHeader className='bg-muted/30'>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead>Tên chương trình</TableHead>
                    <TableHead>Mức giảm</TableHead>
                    <TableHead>Thời gian đã tạo</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className='h-32 text-center'>
                        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground mx-auto' />
                      </TableCell>
                    </TableRow>
                  ) : trashPromotions && trashPromotions.length > 0 ? (
                    trashPromotions.map((promo) => (
                      <TableRow key={promo.id} className='transition-colors hover:bg-muted/40'>
                        <TableCell>
                          <div
                            className='font-semibold text-foreground line-clamp-1 max-w-[250px]'
                            title={promo.name}
                          >
                            {promo.name}
                          </div>
                          <div className='text-[10px] text-muted-foreground font-mono mt-0.5'>
                            ID: {promo.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='font-bold text-primary'>
                            {promo.discountType === 'PERCENTAGE'
                              ? `${promo.discountValue}%`
                              : new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(promo.discountValue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className='text-xs font-medium text-muted-foreground'>
                            {format(new Date(promo.createdAt), 'dd/MM/yyyy HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                              onClick={() => setSelectedRestore(promo)}
                            >
                              <RefreshCcw className='w-4 h-4 mr-1.5' />
                              Khôi phục
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10'
                              onClick={() => setSelectedHardDelete(promo)}
                            >
                              <AlertOctagon className='w-4 h-4 mr-1.5' />
                              Xóa vĩnh viễn
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className='h-48 text-center'>
                        <div className='flex flex-col items-center justify-center text-muted-foreground'>
                          <div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3'>
                            <ArchiveRestore className='h-6 w-6 opacity-40' />
                          </div>
                          <span className='font-medium text-foreground'>Thùng rác trống</span>
                          <span className='text-sm mt-1 opacity-70'>
                            Không có chương trình nào bị xóa.
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RestorePromotionDialog
        open={!!selectedRestore}
        onOpenChange={(isOpen) => !isOpen && setSelectedRestore(null)}
        promotion={selectedRestore}
      />

      <HardDeletePromotionDialog
        open={!!selectedHardDelete}
        onOpenChange={(isOpen) => !isOpen && setSelectedHardDelete(null)}
        promotion={selectedHardDelete}
      />
    </>
  )
}
