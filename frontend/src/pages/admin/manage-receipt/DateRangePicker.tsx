'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale' // Thêm tiếng Việt
import { Calendar as CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DateRangePickerProps {
  className?: React.HTMLAttributes<HTMLDivElement>
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DateRangePicker({ className, date, setDate }: DateRangePickerProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-[280px] justify-start text-left font-normal h-9 border-dashed hover:border-primary/50 transition-all',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4 text-primary' />
            {date?.from ? (
              date.to ? (
                <span className='text-xs lg:text-sm'>
                  {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                </span>
              ) : (
                <span className='text-xs lg:text-sm'>{format(date.from, 'dd/MM/yyyy')}</span>
              )
            ) : (
              <span className='text-xs lg:text-sm font-medium'>Lọc theo khoảng ngày</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0 shadow-2xl border-primary/10' align='start'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={vi} // Hiện thứ: T2, T3, T4...
            className='rounded-md border-none'
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
