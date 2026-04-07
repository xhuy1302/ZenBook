'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'

export function NavMain({
  items
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: string
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <SidebarGroup>
      <SidebarGroupLabel className='uppercase tracking-widest text-muted-foreground font-bold text-[11px] mb-1'>
        Nghiệp vụ cửa hàng
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Tự động mở menu cha nếu đang đứng ở menu con
          const isChildActive = item.items?.some((sub) => pathname.startsWith(sub.url))

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || isChildActive}
              className='group/collapsible'
            >
              <SidebarMenuItem className='mb-1'>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className='font-medium text-muted-foreground hover:text-foreground'
                  >
                    {item.icon && <item.icon className='size-4' />}
                    <span className='flex-1'>{item.title}</span>

                    {/* Badge thông báo bo tròn cực mượt */}
                    {item.badge && (
                      <SidebarMenuBadge className='bg-red-500 text-white hover:bg-red-600 transition-colors rounded-full px-2 text-[10px] font-bold'>
                        {item.badge}
                      </SidebarMenuBadge>
                    )}

                    <ChevronRight className='ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isActive =
                        pathname === subItem.url || pathname.startsWith(`${subItem.url}/`)

                      return (
                        <SidebarMenuSubItem key={subItem.title} className='mb-1'>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive}
                            className={`transition-all duration-200 rounded-md py-4 ${
                              isActive
                                ? 'bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 hover:text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
                            }`}
                          >
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
