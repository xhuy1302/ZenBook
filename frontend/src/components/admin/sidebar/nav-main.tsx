'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
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
          // TRƯỜNG HỢP 1: CÓ MENU CON (XỔ XUỐNG)
          if (item.items && item.items.length > 0) {
            const isChildActive = item.items.some(
              (sub) => pathname === sub.url || pathname.startsWith(`${sub.url}/`)
            )

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive || isChildActive}
                className='group/collapsible'
              >
                <SidebarMenuItem className='mb-1 relative'>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className='font-medium text-muted-foreground hover:text-foreground'
                    >
                      {item.icon && <item.icon className='size-4' />}
                      <span className='flex-1'>{item.title}</span>

                      {/* Badge cho menu có dropdown */}
                      {item.badge && (
                        <span className='mr-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm'>
                          {item.badge}
                        </span>
                      )}

                      <ChevronRight className='ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        // Kiểm tra active chính xác cho cả route con (VD: /dashboard/publishers/create)
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
          }

          // TRƯỜNG HỢP 2: KHÔNG CÓ MENU CON (LINK TRỰC TIẾP - VÍ DỤ: ĐƠN HÀNG)
          const isDirectActive = pathname === item.url || pathname.startsWith(`${item.url}/`)

          return (
            <SidebarMenuItem key={item.title} className='mb-1 relative'>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isDirectActive}
                className={`transition-all duration-200 rounded-md py-4 ${
                  isDirectActive
                    ? 'bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 hover:text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
                }`}
              >
                <Link to={item.url}>
                  {item.icon && <item.icon className='size-4' />}
                  <span className='flex-1'>{item.title}</span>

                  {/* Badge hiển thị trực tiếp trong Link */}
                  {item.badge && (
                    <span className='ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background group-hover:ring-transparent transition-all'>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
