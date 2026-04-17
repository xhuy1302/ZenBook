'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import { CategoryStatusBadge } from '@/components/admin/data/manage-category/CategoryStatusBadges'
import type { CategoryResponse } from '@/services/category/category.type'
import { getAllCategoriesApi } from '@/services/category/category.api'
import { Calendar, Clock, Layers, Link2, Tag, FileText } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'

interface ViewCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryResponse
}

export function ViewCategoryDialog({ open, onOpenChange, category }: ViewCategoryDialogProps) {
  const { t } = useTranslation('category')
  const [imageError, setImageError] = useState(false)

  // Đổi sang placeholder ổn định hơn
  const defaultThumb = 'https://placehold.co/400x400?text=No+Image'

  // Gọi useQuery để lấy danh sách. Nếu đã có cache, nó sẽ lấy ngay lập tức không cần chờ API.
  const { data: allCategories = [], isLoading } = useQuery({
    queryKey: ['categories-list'], // Đảm bảo key này khớp với màn hình chính (bạn đang dùng 'categories-list')
    queryFn: getAllCategoriesApi,
    enabled: !!category.parentId && open // Tiết kiệm API: Chỉ gọi nếu danh mục có cha VÀ Dialog đang mở
  })

  // Tìm tên danh mục cha dựa trên parentId
  const parentCategoryName = useMemo(() => {
    if (!category.parentId) return '—' // Không có cha

    const parent = allCategories.find((cat) => cat.id === category.parentId)

    // Nếu đang load data thì hiện text thông báo
    if (isLoading) return 'Đang tải...'

    // Nếu tìm thấy thì hiện Tên, không thì hiện ID dự phòng
    return parent ? parent.categoryName : category.parentId
  }, [category.parentId, allCategories, isLoading])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[850px] p-0 overflow-hidden bg-background'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b border-border/50'>
          <DialogTitle className='text-xl font-semibold'>
            {t('dialogTitle.view', 'Chi tiết danh mục')}
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col md:flex-row max-h-[80vh] overflow-y-auto'>
          {/* CỘT TRÁI: Ảnh bìa & Trạng thái */}
          <div className='w-full md:w-1/3 bg-muted/30 p-8 flex flex-col items-center border-r border-border/50'>
            <div className='relative mb-4'>
              <img
                // Sử dụng || để thay thế nếu thumbnailUrl là chuỗi rỗng ""
                src={imageError ? defaultThumb : category.thumbnailUrl || defaultThumb}
                alt='Thumbnail'
                className='h-32 w-32 rounded-lg object-cover border-4 border-background shadow-lg'
                onError={() => setImageError(true)}
              />
            </div>

            <div className='text-center space-y-2 w-full'>
              <h2 className='text-xl font-bold tracking-tight text-foreground truncate px-2'>
                {category.categoryName}
              </h2>
              <p className='text-xs text-muted-foreground flex items-center justify-center gap-1.5'>
                <Link2 className='w-3.5 h-3.5' />/{category.slug}
              </p>
            </div>

            <Separator className='my-6' />

            <div className='flex flex-col items-center gap-4 w-full'>
              <div className='space-y-1.5 text-center w-full'>
                <Label className='text-[10px] text-muted-foreground uppercase tracking-wider font-bold'>
                  {t('table.columns.status', 'Trạng thái')}
                </Label>
                <div className='flex justify-center'>
                  <CategoryStatusBadge status={category.status} />
                </div>
              </div>

              <div className='space-y-1.5 text-center w-full'>
                <Label className='text-[10px] text-muted-foreground uppercase tracking-wider font-bold'>
                  {t('table.columns.level', 'Cấp độ')}
                </Label>
                <div className='flex justify-center'>
                  <Badge variant='outline'>Level {category.level}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Thông tin chi tiết */}
          <div className='w-full md:w-2/3 p-8 space-y-8 bg-background'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b pb-2'>
                <Tag className='w-5 h-5 text-primary' />
                <h3 className='text-sm font-bold text-foreground uppercase tracking-wider'>
                  Thông tin cơ bản
                </h3>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2'>
                <InfoCardField
                  label={t('table.columns.name', 'Tên danh mục')}
                  value={category.categoryName}
                />

                {/* HIỂN THỊ TÊN DANH MỤC CHA */}
                <InfoCardField
                  label={t('table.columns.parentId', 'Danh mục cha')}
                  value={parentCategoryName}
                  icon={<Layers className='w-4 h-4 text-muted-foreground' />}
                />

                <div className='sm:col-span-2'>
                  <InfoCardField
                    label={t('table.columns.desc', 'Mô tả')}
                    value={category.categoryDesc}
                    icon={<FileText className='w-4 h-4 text-muted-foreground' />}
                  />
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b pb-2'>
                <Clock className='w-5 h-5 text-primary' />
                <h3 className='text-sm font-bold text-foreground uppercase tracking-wider'>
                  Thời gian hệ thống
                </h3>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2'>
                <InfoCardField
                  label={t('fields.createdAt', 'Ngày tạo')}
                  value={category.createdAt}
                  icon={<Calendar className='w-4 h-4 text-muted-foreground' />}
                />
                <InfoCardField
                  label={t('fields.updatedAt', 'Cập nhật cuối')}
                  value={category.updatedAt}
                  icon={<Clock className='w-4 h-4 text-muted-foreground' />}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end'>
          <Button variant='default' onClick={() => onOpenChange(false)} className='w-28'>
            {t('actions.close', 'Đóng')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoCardField({
  label,
  value,
  icon
}: {
  label: string
  value?: string | null
  icon?: React.ReactNode
}) {
  return (
    <div className='space-y-1.5 p-3 rounded-lg bg-muted/10 border border-border/30 hover:bg-muted/30 transition-colors'>
      <div className='flex items-center gap-1.5'>
        {icon}
        <Label className='text-[10px] text-muted-foreground font-bold uppercase'>{label}</Label>
      </div>
      <p className='text-sm font-semibold text-foreground truncate'>{value || '—'}</p>
    </div>
  )
}
