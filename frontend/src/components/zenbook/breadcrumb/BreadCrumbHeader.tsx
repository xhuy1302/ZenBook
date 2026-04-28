'use client'

import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

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
    <div className='w-full bg-gray-50 border-b border-gray-100'>
      <div className='max-w-7xl mx-auto px-4 h-12 flex items-center'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to='/'
                  className='text-sm text-gray-500 hover:text-brand-green transition-colors'
                >
                  Zenbook
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {pathSegments.map((segment, index) => {
              if (segment.toLowerCase() === 'dashboard') return null
              const url = `/${pathSegments.slice(0, index + 1).join('/')}`
              const isLast = index === pathSegments.length - 1

              return (
                <React.Fragment key={url}>
                  <BreadcrumbSeparator className='text-gray-400' />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className='text-sm font-semibold text-gray-800'>
                        {formatSegment(segment)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          to={url}
                          className='text-sm text-gray-500 hover:text-brand-green transition-colors'
                        >
                          {formatSegment(segment)}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  )
}
