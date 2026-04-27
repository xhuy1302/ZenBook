'use client'

import { type LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

export function NavProjects({
  projects
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { t } = useTranslation('sidebar')
  const location = useLocation()
  const pathname = location.pathname

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden mt-2'>
      <SidebarGroupLabel className='uppercase tracking-widest text-muted-foreground font-bold text-[11px] mb-1'>
        {t('navProjects.groupLabel')}
      </SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)

          return (
            <SidebarMenuItem key={item.name} className='mb-1'>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.name}
                className={`transition-all duration-200 rounded-md ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 hover:text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
                }`}
              >
                <Link to={item.url} className='flex items-center gap-2'>
                  <item.icon
                    className={`size-4 transition-transform ${isActive ? 'scale-110' : ''}`}
                  />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
