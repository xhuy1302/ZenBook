import { Skeleton } from '@/components/ui/skeleton'

export function UserTableSkeleton() {
  return (
    <div className='rounded-md border bg-background'>
      <div className='grid grid-cols-5 gap-4 border-b px-4 py-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-4 w-full' />
        ))}
      </div>

      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <div key={rowIndex} className='grid grid-cols-5 gap-4 px-4 py-4 border-b last:border-b-0'>
          <Skeleton className='h-4 w-[80%]' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[70%]' />
          <Skeleton className='h-4 w-[60%]' />
          <Skeleton className='h-4 w-[40%]' />
        </div>
      ))}
    </div>
  )
}
