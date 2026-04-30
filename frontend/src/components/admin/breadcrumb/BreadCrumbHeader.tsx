'use client'

import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ModeToggle } from '@/components/provider/MoodToggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import LanguageSelector from '@/components/common/LanguageSelector'
import { Search, Bell, RefreshCw } from 'lucide-react'

export default function BreadcrumbHeader() {
  const { t } = useTranslation('breadcrumbadmin')
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const formatSegment = (segment: string) => {
    const lowerSegment = segment.toLowerCase()
    return t(lowerSegment, {
      defaultValue: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    })
  }

  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background'>
      {/* ── LEFT: BREADCRUMBS ── */}
      <div className='flex items-center gap-2'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className='hidden md:block'>
              <BreadcrumbLink asChild>
                <Link to='/dashboard'>{t('dashboard')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {pathSegments.map((segment, index) => {
              if (segment.toLowerCase() === 'dashboard') return null

              const url = `/${pathSegments.slice(0, index + 1).join('/')}`
              const isLast = index === pathSegments.length - 1

              return (
                <React.Fragment key={url}>
                  <BreadcrumbSeparator className='hidden md:block' />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={url}>{formatSegment(segment)}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ── CENTER: SEARCH BAR ── */}
      <div className='flex-1 max-w-md hidden md:block'>
        <div className='relative group'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
          <input
            type='text'
            placeholder={t('searchPlaceholder', {
              defaultValue: 'Tìm sách, đơn hàng, khách hàng...'
            })}
            className='w-full rounded-lg border border-input bg-muted/50 px-10 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background'
          />
        </div>
      </div>

      {/* ── RIGHT: ACTIONS ── */}
      <div className='flex items-center gap-3'>
        {/* Nút chuông & Refresh */}
        <div className='flex items-center gap-1'>
          <button className='relative p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-full transition-colors'>
            <Bell className='h-[18px] w-[18px]' />
            {/* Chấm đỏ thông báo */}
            <span className='absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border-[1.5px] border-background'></span>
          </button>
          <button className='p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-full transition-colors hidden sm:block'>
            <RefreshCw className='h-[18px] w-[18px]' />
          </button>
        </div>

        <Separator orientation='vertical' className='h-5 hidden sm:block' />

        {/* Công cụ hiện có */}
        <LanguageSelector />
        <ModeToggle />
      </div>
    </header>
  )
}
