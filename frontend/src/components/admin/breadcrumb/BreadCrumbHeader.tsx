'use client'

import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next' // Thêm cái này
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

export default function BreadcrumbHeader() {
  const { t } = useTranslation('breadcrumb')
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const formatSegment = (segment: string) => {
    const lowerSegment = segment.toLowerCase()

    return t(lowerSegment, {
      defaultValue: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    })
  }

  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className='hidden md:block'>
              <BreadcrumbLink asChild>
                <Link to='/dashboard'>Zenbook</Link>
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

      <div className='flex items-center gap-4'>
        <ModeToggle />
      </div>
    </header>
  )
}
