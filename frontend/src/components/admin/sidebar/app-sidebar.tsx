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
  Truck,
  Package
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
        { title: 'Danh mục', url: '/dashboard/categories' },
        { title: 'Tác giả', url: '/dashboard/authors' },
        { title: 'Nhà xuất bản', url: '/dashboard/publishers' },
        { title: 'Thuộc tính sách', url: '/dashboard/books/specs' }
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
      url: '#',
      icon: ShoppingCart,
      badge: '24',
      items: [
        { title: 'Tất cả đơn hàng', url: '/dashboard/orders' },
        { title: 'Tạo đơn hàng (POS)', url: '/dashboard/orders/create' },
        { title: 'Chờ xử lý', url: '/dashboard/orders/pending' },
        { title: 'Đang giao hàng', url: '/dashboard/orders/shipping' },
        { title: 'Hoàn thành', url: '/dashboard/orders/completed' },
        { title: 'Đã hủy / Trả hàng', url: '/dashboard/orders/cancelled' }
      ]
    }
  ],
  systemMenus: [
    { name: 'Tài khoản', url: '/dashboard/users', icon: Users },
    { name: 'Nhà cung cấp', url: '/dashboard/suppliers', icon: Truck },
    { name: 'Mã giảm giá', url: '/dashboard/vouchers', icon: TicketPercent },
    { name: 'Bài viết & Blog', url: '/dashboard/blog', icon: FileText },
    { name: 'Đánh giá / Review', url: '/dashboard/reviews', icon: Star },
    { name: 'Tags bài viết', url: '/dashboard/tags', icon: Tags },
    { name: 'Cài đặt hệ thống', url: '/dashboard/settings', icon: Settings2 }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const authContext = useContext(AuthContext)
  const user = authContext?.user

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
        <NavProjects projects={data.systemMenus} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
