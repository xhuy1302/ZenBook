'use client'

import {
  BookOpen,
  ShoppingCart,
  Users,
  FileText,
  TicketPercent,
  Tags,
  Star,
  Settings2,
  AudioWaveform,
  GalleryVerticalEnd,
  Package,
  Gift
} from 'lucide-react'
import * as React from 'react'
import { useMemo, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

import { NavMain } from '@/components/admin/sidebar/nav-main'
import { NavProjects } from '@/components/admin/sidebar/nav-projects'
import { NavUser } from '@/components/admin/sidebar/nav-user'
import { TeamSwitcher } from '@/components/admin/sidebar/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { AuthContext } from '@/context/AuthContext'
import { orderService } from '@/services/order/order.api'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 👉 SỬA Ở ĐÂY: Lấy thêm i18n để bắt được sự kiện thay đổi ngôn ngữ
  const { t, i18n } = useTranslation('sidebar')

  const authContext = useContext(AuthContext)
  const user = authContext?.user

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['orders', 'sidebar-count'],
    queryFn: () => orderService.getCountPending(),
    refetchInterval: 30000,
    enabled: !!user
  })

  // Dữ liệu cho TeamSwitcher
  const teams = useMemo(
    () => [
      {
        name: t('teams.store.name'),
        logo: GalleryVerticalEnd,
        plan: t('teams.store.plan')
      },
      {
        name: t('teams.logistics.name'),
        logo: AudioWaveform,
        plan: t('teams.logistics.plan')
      }
    ],
    // 👉 SỬA Ở ĐÂY: Thêm i18n.language vào dependency
    [t, i18n.language]
  )

  // Danh sách menu hệ thống (bên dưới NavMain)
  const systemMenus = useMemo(
    () => [
      { name: t('systemMenus.accounts'), url: '/dashboard/users', icon: Users },
      { name: t('systemMenus.promotions'), url: '/dashboard/promotions', icon: Gift },
      { name: t('systemMenus.coupons'), url: '/dashboard/coupons', icon: TicketPercent },
      { name: t('systemMenus.news'), url: '/dashboard/news', icon: FileText },
      { name: t('systemMenus.reviews'), url: '/dashboard/reviews', icon: Star },
      { name: t('systemMenus.tags'), url: '/dashboard/tags', icon: Tags },
      { name: t('systemMenus.settings'), url: '/dashboard/settings', icon: Settings2 }
    ],
    // 👉 SỬA Ở ĐÂY: Thêm i18n.language
    [t, i18n.language]
  )

  // Nav chính (Quản lý Sách, Kho, Đơn hàng)
  const navMainWithBadge = useMemo(
    () => [
      {
        title: t('navMain.books'),
        url: '#',
        icon: BookOpen,
        isActive: true,
        items: [
          { title: t('navMain.booksAll'), url: '/dashboard/books' },
          { title: t('navMain.booksCategories'), url: '/dashboard/categories' },
          { title: t('navMain.booksAuthors'), url: '/dashboard/authors' },
          { title: t('navMain.booksPublishers'), url: '/dashboard/publishers' }
        ]
      },
      {
        title: t('navMain.inventory'),
        url: '#',
        icon: Package,
        items: [
          { title: t('navMain.inventorySuppliers'), url: '/dashboard/suppliers' },
          { title: t('navMain.inventoryReceipts'), url: '/dashboard/receipts' },
          { title: t('navMain.inventoryStockCheck'), url: '/dashboard/inventory' }
        ]
      },
      {
        title: t('navMain.orders'),
        url: '/dashboard/orders',
        icon: ShoppingCart,
        badge: pendingCount > 0 ? String(pendingCount) : undefined
      }
    ],
    // 👉 SỬA Ở ĐÂY: Thêm i18n.language
    [t, i18n.language, pendingCount]
  )

  const currentUser = {
    name: user?.fullName || t('user.defaultName'),
    email: user?.email || t('user.defaultEmail'),
    avatar: user?.avatar || '/avatars/admin.jpg'
  }

  return (
    <Sidebar side='left' variant='inset' collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      <SidebarContent
        className='
          overflow-y-auto 
          [&::-webkit-scrollbar]:w-[5px] 
          [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 
          hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 
          [&::-webkit-scrollbar-thumb]:rounded-full
        '
      >
        <NavMain items={navMainWithBadge} />
        <NavProjects projects={systemMenus} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
