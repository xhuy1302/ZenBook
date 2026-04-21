import { useQuery } from '@tanstack/react-query'
import { getMeApi } from '@/services/customer/customer.api'
import ProfileForm from '@/components/zenbook/account/ProfileForm'
import SecurityPanel from '@/components/zenbook/account/SecurityPanel'

export default function ProfileTab() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getMeApi,
    staleTime: 5 * 60 * 1000
  })

  return (
    <div className='grid grid-cols-1 lg:grid-cols-[1fr_1px_380px] gap-0'>
      <div className='pr-0 lg:pr-8 pb-8 lg:pb-0'>
        <ProfileForm user={user} isLoading={isLoading} />
      </div>

      <div className='hidden lg:block bg-border' />

      <div className='pl-0 lg:pl-8 pt-8 lg:pt-0 border-t border-border lg:border-t-0'>
        <SecurityPanel user={user} isLoading={isLoading} />
      </div>
    </div>
  )
}
