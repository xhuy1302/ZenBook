import { CategoryActionsCell } from '@/components/admin/action/CategoryAction'
import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import { CategoryStatusBadge } from '@/components/admin/data/manage-category/CategoryStatusBadges'
import i18n from '@/i18n/i18n'
import { type ColumnDef } from '@tanstack/react-table'
import type { CategoryResponse } from '@/services/category/category.type'
import { useQuery } from '@tanstack/react-query'
import { getAllCategoriesApi } from '@/services/category/category.api'

// --- COMPONENT PHỤ: Tra cứu Tên Danh Mục Cha từ Cache ---
const ParentCategoryCell = ({ parentId }: { parentId?: string | null }) => {
  // Thay vì queryClient.getQueryData, chúng ta dùng useQuery để "subscribe" (đăng ký lắng nghe) dữ liệu
  const { data: allCategories } = useQuery({
    queryKey: ['categories-list'],
    queryFn: getAllCategoriesApi,
    staleTime: 5 * 60 * 1000 // Giữ dữ liệu tươi trong 5 phút
  })

  if (!parentId) return <span className='text-sm text-muted-foreground'>---</span>

  // Khi dữ liệu allCategories về, component này sẽ tự động render lại và tìm tên
  const parent = allCategories?.find((cat) => cat.id === parentId)

  return (
    <div className='text-sm font-medium'>
      {parent ? (
        parent.categoryName
      ) : (
        <span className='text-muted-foreground italic'>Loading...</span>
      )}
    </div>
  )
}
// ---------------------------------------------------------

export const columns: ColumnDef<CategoryResponse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='pl-2'>
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='pl-2'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'categoryName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('category:table.columns.name', 'Tên danh mục')}
      />
    ),
    cell: ({ row }) => {
      const category = row.original
      return (
        <div className='flex items-center gap-3 py-1'>
          <img
            src={category.thumbnailUrl || 'https://placehold.co/150?text=No+Image'}
            alt={category.categoryName}
            className='h-10 w-10 rounded-md object-cover border shadow-sm'
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/150?text=Error'
            }}
          />
          <div className='flex flex-col'>
            <span className='font-semibold text-foreground'>{category.categoryName}</span>
            <span className='text-[11px] text-muted-foreground'>/{category.slug}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'parentId',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('table.columns.parentId', 'Danh mục cha')}
      />
    ),
    cell: ({ row }) => <ParentCategoryCell parentId={row.getValue('parentId')} />
  },

  {
    accessorKey: 'level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('category:table.columns.level')} />
    ),
    cell: ({ row }) => {
      const level = row.getValue('level') as number

      // Xử lý đổi màu theo từng cấp độ
      let colorClass = 'bg-slate-100 text-slate-700 border-slate-200' // Default
      if (level === 0) {
        colorClass = 'bg-indigo-100 text-indigo-700 border-indigo-200'
      } else if (level === 1) {
        colorClass = 'bg-sky-100 text-sky-700 border-sky-200'
      } else if (level >= 2) {
        colorClass = 'bg-orange-100 text-orange-700 border-orange-200'
      }

      return (
        <div className='w-[80px] flex justify-start'>
          <span
            className={`flex items-center justify-center w-full px-2 py-1 text-[11px] uppercase font-bold border rounded-md shadow-sm ${colorClass}`}
          >
            Level {level}
          </span>
        </div>
      )
    }
  },
  // ✅ CỘT THỨ TỰ ĐÃ ĐƯỢC LÀM ĐẸP (HÌNH TRÒN)
  {
    accessorKey: 'displayOrder',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('category:table.columns.order')} />
    ),
    cell: ({ row }) => {
      const order = row.getValue('displayOrder') as number
      return (
        <div className='w-[70px] flex justify-center'>
          <span className='flex items-center justify-center h-7 w-7 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200 shadow-sm text-xs'>
            {order}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('category:table.columns.status')} />
    ),
    cell: ({ row }) => (
      <div className='w-[100px] flex justify-center'>
        <CategoryStatusBadge status={row.getValue('status')} />
      </div>
    )
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('category:table.columns.actions')}</div>,
    cell: ({ row }) => <CategoryActionsCell category={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
