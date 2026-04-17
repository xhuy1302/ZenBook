import AppAreaChart from '@/pages/admin/dashboard/charts/AppAreaChart'
import AppBarChart from '@/pages/admin/dashboard/charts/AppBarChart'
import AppPieChart from '@/pages/admin/dashboard/charts/AppPieChart'

export default function DashboardHome() {
  return (
    <>
      <div className='grid auto-rows-min gap-4 md:grid-cols-4'>
        <div className='bg-primary-foreground p-4 rounded-sm lg:col-span-2 xl:col-span-1 2xl:col-span-2'>
          <AppBarChart />
        </div>
        <div className='bg-primary-foreground p-4 rounded-sm'>Test</div>
        <div className='bg-primary-foreground p-4 rounded-sm'>
          <AppPieChart />
        </div>
        <div className='bg-primary-foreground p-4 rounded-sm'>Test</div>
        <div className='bg-primary-foreground p-4 rounded-sm lg:col-span-2 xl:col-span-1 2xl:col-span-2'>
          <AppAreaChart />
        </div>
        <div className='bg-primary-foreground p-4 rounded-sm'>Test</div>
      </div>
      <div className='bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min' />
    </>
  )
}
