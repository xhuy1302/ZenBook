'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit3, X } from 'lucide-react'
import type { SupplierResponse } from '@/services/supplier/supplier.type'
import { EditSupplierForm } from './EditSupplierForm'

interface EditSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: SupplierResponse
}

export function EditSupplierDialog({ open, onOpenChange, supplier }: EditSupplierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[750px] p-0 flex flex-col h-[90vh] max-h-[850px] overflow-hidden bg-white border-none shadow-2xl [&>button.absolute]:hidden'>
        {/* HEADER ĐỒNG BỘ VỚI CREATE */}
        <DialogHeader className='px-6 py-4 border-b bg-white shrink-0 flex flex-row items-center justify-between space-y-0'>
          <div className='flex items-center gap-2'>
            <div className='p-2 bg-amber-100 text-amber-600 rounded-lg'>
              <Edit3 className='w-5 h-5' />
            </div>
            <DialogTitle className='text-xl font-bold tracking-tight text-slate-800'>
              Cập Nhật Nhà Cung Cấp
            </DialogTitle>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all focus:outline-none'
          >
            <X className='h-5 w-5' />
          </button>
        </DialogHeader>

        {/* PHẦN FORM */}
        <div className='flex-1 overflow-hidden'>
          <EditSupplierForm
            supplier={supplier}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
