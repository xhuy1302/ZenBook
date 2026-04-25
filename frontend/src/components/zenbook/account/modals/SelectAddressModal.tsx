import { CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Address } from '@/services/customer/customer.type'

interface SelectAddressModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addresses: Address[]
  currentSelectedId?: string
  onSelect: (address: Address) => void
  onAddNew: () => void
}

export default function SelectAddressModal({
  open,
  onOpenChange,
  addresses,
  currentSelectedId,
  onSelect,
  onAddNew
}: SelectAddressModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
        </DialogHeader>

        <div className='space-y-3 mt-4'>
          {addresses.map((address) => {
            const isSelected = address.id === currentSelectedId
            return (
              <div
                key={address.id}
                onClick={() => onSelect(address)} // TOÀN BỘ THẺ CÓ THỂ CLICK ĐỂ CHỌN
                className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-green bg-brand-green/5 shadow-sm'
                    : 'border-border hover:border-gray-400'
                }`}
              >
                <div className='flex items-start gap-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='font-bold text-foreground'>{address.recipientName}</span>
                      <span className='text-muted-foreground'>| {address.phone}</span>
                    </div>
                    <p className='text-sm text-foreground'>{address.street}</p>
                    <p className='text-sm text-muted-foreground'>
                      {address.ward}, {address.district}, {address.city}
                    </p>
                    {address.isDefault && (
                      <span className='inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded border border-brand-green text-brand-green'>
                        Mặc định
                      </span>
                    )}
                  </div>

                  {/* Nút check hiện lên khi thẻ được chọn */}
                  {isSelected && <CheckCircle2 className='w-6 h-6 text-brand-green shrink-0' />}
                </div>
              </div>
            )
          })}
        </div>

        <div className='mt-4 pt-4 border-t border-border flex justify-end'>
          <Button variant='outline' onClick={onAddNew}>
            + Thêm địa chỉ mới
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
