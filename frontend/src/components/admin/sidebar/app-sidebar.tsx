import {
  AudioWaveform,
  Box,
  CircleStar,
  Command,
  GalleryVerticalEnd,
  ListCollapseIcon,
  MessageCircleMore,
  Settings,
  ShoppingCart,
  StickyNote,
  Tags,
  TicketPercent,
  Users2
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

// This is sample data.
const data = {
  user: {
    name: 'Zenbook',
    email: 'zenbook@gmail.com',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      name: 'Zenbook Store.',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free'
    }
  ],
  navMain: [
    {
      title: 'Books',
      url: '#',
      icon: Box,
      isActive: true,
      items: [
        {
          title: 'List Books',
          url: '#'
        },
        {
          title: 'Specifications',
          url: '#'
        }
      ]
    },
    {
      title: 'Orders',
      url: '#',
      icon: ShoppingCart,
      items: [
        {
          title: 'Introduction',
          url: '#'
        },
        {
          title: 'Get Started',
          url: '#'
        },
        {
          title: 'Tutorials',
          url: '#'
        },
        {
          title: 'Changelog',
          url: '#'
        }
      ]
    }
  ],
  projects: [
    {
      name: 'Categories',
      url: '/dashboard/categories',
      icon: ListCollapseIcon
    },
    {
      name: 'Authors',
      url: '/dashboard/authors',
      icon: CircleStar
    },
    {
      name: 'Blog',
      url: '#',
      icon: StickyNote
    },
    {
      name: 'Users',
      url: '/dashboard/users',
      icon: Users2
    },
    {
      name: 'Vouchers',
      url: '#',
      icon: TicketPercent
    },
    {
      name: 'Tags',
      url: '#',
      icon: Tags
    },
    {
      name: 'Reviews',
      url: '#',
      icon: MessageCircleMore
    },
    {
      name: 'Settings',
      url: '#',
      icon: Settings
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
