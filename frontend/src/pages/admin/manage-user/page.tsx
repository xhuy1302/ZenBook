import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllUsersApi } from '@/services/user/user.api'
import { useTranslation } from 'react-i18next'
import { columns } from './columns'
import { DataTable } from './data-table'

export default function UserPage() {
  const { t } = useTranslation('user')

  const { data, isLoading } = useFetchData('users', getAllUsersApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibolds'>{t('list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data} />}
    </div>
  )
}
