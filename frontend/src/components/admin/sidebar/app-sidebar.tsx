'use client'

import {
  BookOpen,
  LayoutGrid,
  ShoppingBag,
  UserRoundPen,
  Users2,
  FileText,
  TicketPercent,
  Tags,
  Star,
  Settings2,
  AudioWaveform,
  GalleryVerticalEnd
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
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

const data = {
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
  navMain: [
    {
      title: 'Quản lý Sách',
      url: '#',
      icon: BookOpen,
      isActive: true,
      items: [
        { title: 'Tất cả sách', url: '/dashboard/books' },
        { title: 'Thuộc tính sách', url: '/dashboard/books/specs' }
      ]
    },
    {
      title: 'Đơn hàng',
      url: '#',
      icon: ShoppingBag,
      badge: '24',
      items: [
        { title: 'Đang xử lý', url: '/dashboard/orders/pending' },
        { title: 'Hoàn thành', url: '/dashboard/orders/completed' },
        { title: 'Đã hủy', url: '/dashboard/orders/cancelled' }
      ]
    }
  ],
  projects: [
    { name: 'Danh mục', url: '/dashboard/categories', icon: LayoutGrid },
    { name: 'Tác giả', url: '/dashboard/authors', icon: UserRoundPen },
    { name: 'Bài viết', url: '/dashboard/blog', icon: FileText },
    { name: 'Người dùng', url: '/dashboard/users', icon: Users2 },
    { name: 'Mã giảm giá', url: '/dashboard/vouchers', icon: TicketPercent },
    { name: 'Tags', url: '/dashboard/tags', icon: Tags },
    { name: 'Đánh giá', url: '/dashboard/reviews', icon: Star },
    { name: 'Cài đặt', url: '/dashboard/settings', icon: Settings2 }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const authContext = useContext(AuthContext)
  const user = authContext?.user

  // Dữ liệu hiển thị ưu tiên từ Database, nếu chưa có thì dùng mặc định
  const currentUser = {
    name: user?.fullName || 'Zenbook Admin',
    email: user?.email || 'admin@zenbook.com',
    avatar: user?.avatar || '/avatars/admin.jpg'
  }

  return (
    <Sidebar side='left' variant='inset' collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
