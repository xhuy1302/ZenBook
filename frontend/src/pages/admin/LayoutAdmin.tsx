import BreadcrumbHeader from '@/components/admin/breadcrumb/BreadCrumbHeader'
import { AppSidebar } from '@/components/admin/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Outlet } from 'react-router-dom'

export default function LayoutAdmin() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <BreadcrumbHeader />
          <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
