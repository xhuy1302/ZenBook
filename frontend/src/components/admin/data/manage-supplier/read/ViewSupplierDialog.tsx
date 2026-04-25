'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Building2, Mail, Phone, MapPin, Hash, UserCircle, NotebookPen, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SupplierResponse } from '@/services/supplier/supplier.type'
import { SupplierStatusBadge } from '../SupplierStatusBadge'

/* ─────────────────────────────────────────────────────────────────────────────
   InfoCard — từng ô thông tin
───────────────────────────────────────────────────────────────────────────── */
function InfoCard({
  icon: Icon,
  label,
  value,
  iconClass,
  className
}: {
  icon: React.ElementType
  label: string
  value?: string | null
  iconClass: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 transition-colors hover:bg-slate-50',
        className
      )}
    >
      <div
        className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconClass)}
      >
        <Icon className='h-4 w-4' />
      </div>
      <div className='min-w-0 space-y-0.5'>
        <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>{label}</p>
        <p
          className={cn('text-sm font-medium', value ? 'text-slate-800' : 'text-slate-400 italic')}
        >
          {value || 'Chưa cập nhật'}
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Helper — lấy 2 chữ cái đầu viết tắt từ tên
───────────────────────────────────────────────────────────────────────────── */
function getInitials(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main dialog
───────────────────────────────────────────────────────────────────────────── */
interface ViewSupplierDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  supplier: SupplierResponse
  /** Tuỳ chọn: callback khi nhấn nút "Chỉnh sửa" */
  onEdit?: () => void
}

export function ViewSupplierDialog({
  open,
  onOpenChange,
  supplier,
  onEdit
}: ViewSupplierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[580px] gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl'>
        {/* ── HERO HEADER ──────────────────────────────────────────────────── */}
        <DialogHeader className='relative overflow-hidden p-0'>
          {/* hidden title cho a11y */}
          <DialogTitle className='sr-only'>Chi tiết nhà cung cấp: {supplier.name}</DialogTitle>

          <div
            className='relative px-6 py-5'
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #a855f7 100%)' }}
          >
            {/* Decorative orbs */}
            <div className='pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10' />
            <div className='pointer-events-none absolute  right-12 top-8  h-12 w-12 rounded-full bg-white/06' />
            <div className='pointer-events-none absolute -left-4  bottom-0  h-20 w-20 rounded-full bg-white/06' />

            <div className='relative flex items-center gap-4'>
              {/* Avatar với chữ viết tắt */}
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/20 text-lg font-bold text-white backdrop-blur-sm'>
                {getInitials(supplier.name)}
              </div>

              <div className='min-w-0 flex-1'>
                <h2 className='truncate text-[17px] font-bold leading-tight tracking-tight text-white'>
                  {supplier.name}
                </h2>
                <div className='mt-2'>
                  <SupplierStatusBadge status={supplier.status} />
                </div>
              </div>

              {/* Building icon trang trí */}
              <Building2 className='h-6 w-6 shrink-0 text-white/30' aria-hidden />
            </div>
          </div>
        </DialogHeader>

        {/* ── BODY ─────────────────────────────────────────────────────────── */}
        <div className='space-y-4 p-5'>
          {/* Info grid */}
          <div className='grid grid-cols-2 gap-2.5'>
            <InfoCard
              icon={Hash}
              label='Mã số thuế'
              value={supplier.taxCode}
              iconClass='bg-indigo-50 text-indigo-600'
            />
            <InfoCard
              icon={UserCircle}
              label='Người đại diện'
              value={supplier.contactName}
              iconClass='bg-violet-50 text-violet-600'
            />
            <InfoCard
              icon={Mail}
              label='Email'
              value={supplier.email}
              iconClass='bg-sky-50 text-sky-600'
            />
            <InfoCard
              icon={Phone}
              label='Điện thoại'
              value={supplier.phone}
              iconClass='bg-emerald-50 text-emerald-600'
            />
            <InfoCard
              icon={MapPin}
              label='Địa chỉ trụ sở'
              value={supplier.address}
              iconClass='bg-rose-50 text-rose-500'
              className='col-span-2'
            />
          </div>

          {/* Description box */}
          {supplier.description && (
            <div className='flex gap-3 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4'>
              <NotebookPen className='mt-0.5 h-4 w-4 shrink-0 text-amber-600' />
              <div>
                <p className='mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600/80'>
                  Ghi chú hệ thống
                </p>
                <p className='whitespace-pre-wrap text-sm leading-relaxed text-amber-900'>
                  {supplier.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <div className='flex items-center justify-end gap-2.5 border-t border-slate-100 bg-white px-5 py-4'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='h-10 rounded-xl border-slate-200 px-5 text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200'
          >
            Đóng
          </Button>

          {onEdit && (
            <Button
              onClick={onEdit}
              className='h-10 rounded-xl px-6 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] border-0'
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              <Pencil className='mr-2 h-3.5 w-3.5' />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
