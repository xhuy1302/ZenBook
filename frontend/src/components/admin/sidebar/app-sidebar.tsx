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
import { useContext, useMemo } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/order/order.api'

const staticData = {
  teams: [
    {
      name: 'Zenbook Store.',
      logo: GalleryVerticalEnd,
      plan: 'Pro Plan'
    },
    {
      name: 'Zenbook Logistics',
      logo: AudioWaveform,
      plan: 'Startup'
    }
  ],
  systemMenus: [
    { name: 'Tài khoản', url: '/dashboard/users', icon: Users },
    // Đã xóa 'Nhà cung cấp' khỏi đây
    { name: 'Khuyến mãi', url: '/dashboard/promotions', icon: Gift },
    { name: 'Mã giảm giá', url: '/dashboard/vouchers', icon: TicketPercent },
    { name: 'Bài viết & Blog', url: '/dashboard/blog', icon: FileText },
    { name: 'Đánh giá / Review', url: '/dashboard/reviews', icon: Star },
    { name: 'Tags sách', url: '/dashboard/tags', icon: Tags },
    { name: 'Cài đặt hệ thống', url: '/dashboard/settings', icon: Settings2 }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const authContext = useContext(AuthContext)
  const user = authContext?.user

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['orders', 'sidebar-count'],
    queryFn: () => orderService.getCountPending(),
    refetchInterval: 30000,
    enabled: !!user
  })

  const navMainWithBadge = useMemo(
    () => [
      {
        title: 'Quản lý Sách',
        url: '#',
        icon: BookOpen,
        isActive: true,
        items: [
          { title: 'Tất cả sách', url: '/dashboard/books' },
          { title: 'Danh mục', url: '/dashboard/categories' },
          { title: 'Tác giả', url: '/dashboard/authors' },
          { title: 'Nhà xuất bản', url: '/dashboard/publishers' }
        ]
      },
      {
        title: 'Quản lý Kho',
        url: '#',
        icon: Package,
        items: [
          { title: 'Phiếu nhập kho', url: '/dashboard/receipts' },
          { title: 'Kiểm kê tồn kho', url: '/dashboard/inventory' }
        ]
      },
      {
        title: 'Đơn hàng',
        url: '/dashboard/orders',
        icon: ShoppingCart,
        badge: pendingCount > 0 ? String(pendingCount) : undefined
      }
    ],
    [pendingCount]
  )

  const currentUser = {
    name: user?.fullName || 'Zenbook Admin',
    email: user?.email || 'admin@zenbook.com',
    avatar: user?.avatar || '/avatars/admin.jpg'
  }

  return (
    <Sidebar side='left' variant='inset' collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={staticData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithBadge} />
        <NavProjects projects={staticData.systemMenus} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
