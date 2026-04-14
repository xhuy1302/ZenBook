'use client'

import { useState, useMemo } from 'react'
import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllReceiptsApi } from '@/services/receipt/receipt.api'
import { useTranslation } from 'react-i18next'
import { getColumns } from './columns'
import { DataTable } from './data-table'
import type { ReceiptResponse } from '@/services/receipt/receipt.type'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

export default function ReceiptPage() {
  const { t } = useTranslation('receipt')

  const [date, setDate] = useState<DateRange | undefined>()

  const fromStr = date?.from ? format(date.from, 'yyyy-MM-dd') : ''
  const toStr = date?.to ? format(date.to, 'yyyy-MM-dd') : ''

  // 👉 QUAN TRỌNG: Dùng Array Key để React Query quản lý phân cấp
  const queryKey = ['receipts', 'list', { from: fromStr, to: toStr }]

  const { data, isLoading } = useFetchData<ReceiptResponse[]>(queryKey, () =>
    getAllReceiptsApi(fromStr, toStr)
  )

  const dataSource = data || []
  const tableColumns = useMemo(() => getColumns(t), [t])

  return (
    <div className='p-4 space-y-4'>
      <div className='mb-6 px-4 py-3 bg-secondary/50 border rounded-md'>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          {t('receipt.page.title', 'Quản lý phiếu nhập')}
        </h1>
      </div>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <DataTable
          columns={tableColumns}
          data={dataSource}
          dateRange={date}
          setDateRange={setDate}
        />
      )}
    </div>
  )
}
