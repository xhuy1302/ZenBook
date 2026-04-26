'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MessageSquarePlus, Send, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

import { reviewReplySchema, type ReviewReplyFormValues } from '../schema/ReviewReply.schema'

const QUICK_TEMPLATES = [
  {
    label: '🙏 Cảm ơn',
    text: 'Cảm ơn bạn đã tin tưởng và đánh giá sản phẩm. Chúng tôi rất trân trọng phản hồi của bạn và sẽ tiếp tục cải thiện chất lượng dịch vụ!'
  },
  {
    label: '😔 Xin lỗi',
    text: 'Chúng tôi thành thật xin lỗi vì trải nghiệm chưa tốt của bạn. Vui lòng liên hệ bộ phận CSKH để được hỗ trợ nhanh nhất!'
  },
  {
    label: '📦 Giao hàng',
    text: 'Cảm ơn bạn đã phản hồi về vấn đề giao hàng. Chúng tôi đã ghi nhận và sẽ cải thiện dịch vụ logistics trong thời gian sớm nhất.'
  }
]

interface ReviewReplyFormProps {
  defaultValues?: Partial<ReviewReplyFormValues>
  isEditing?: boolean
  isLoading?: boolean
  onSubmit: (values: ReviewReplyFormValues) => void
  onCancel?: () => void
}

export function ReviewReplyForm({
  defaultValues,
  isEditing = false,
  isLoading = false,
  onSubmit,
  onCancel
}: ReviewReplyFormProps) {
  const form = useForm<ReviewReplyFormValues>({
    resolver: zodResolver(reviewReplySchema),
    defaultValues: {
      content: '',
      ...defaultValues
    }
  })

  useEffect(() => {
    if (defaultValues?.content) {
      form.reset({ content: defaultValues.content })
    }
  }, [defaultValues?.content])

  const contentValue = form.watch('content')
  const charCount = contentValue?.length ?? 0

  const applyTemplate = (text: string) => {
    form.setValue('content', text, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        {/* Quick Templates — only for new reply */}
        {!isEditing && (
          <div className='space-y-2'>
            <p className='text-xs font-medium text-slate-500'>Mẫu phản hồi nhanh:</p>
            <div className='flex flex-wrap gap-2'>
              {QUICK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type='button'
                  onClick={() => applyTemplate(tpl.text)}
                  className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-xs text-slate-600 transition-colors duration-150'
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Textarea */}
        <FormField
          control={form.control}
          name='content'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center justify-between'>
                <FormLabel className='text-sm font-medium text-slate-700'>
                  {isEditing ? (
                    <span className='flex items-center gap-1.5'>
                      <Pencil className='h-3.5 w-3.5 text-slate-400' />
                      Chỉnh sửa phản hồi
                    </span>
                  ) : (
                    <span className='flex items-center gap-1.5'>
                      <MessageSquarePlus className='h-3.5 w-3.5 text-slate-400' />
                      Nội dung phản hồi
                    </span>
                  )}
                </FormLabel>
                <span
                  className={`text-xs tabular-nums transition-colors ${
                    charCount > 1800
                      ? 'text-red-500 font-medium'
                      : charCount > 1500
                        ? 'text-amber-500'
                        : 'text-slate-400'
                  }`}
                >
                  {charCount} / 2000
                </span>
              </div>
              <FormControl>
                <Textarea
                  placeholder='Nhập nội dung phản hồi của bạn đến khách hàng...'
                  rows={5}
                  className='resize-none text-sm border-slate-200 focus:border-blue-400 focus:ring-blue-100 leading-relaxed'
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-xs' />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className='flex items-center justify-end gap-2 pt-1'>
          {onCancel && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onCancel}
              disabled={isLoading}
              className='h-9 px-4 text-sm border-slate-200 text-slate-600 hover:bg-slate-50'
            >
              Huỷ
            </Button>
          )}
          <Button
            type='submit'
            size='sm'
            disabled={isLoading || charCount === 0}
            className='h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium gap-2 min-w-[120px]'
          >
            <Send className='h-3.5 w-3.5' />
            {isLoading
              ? isEditing
                ? 'Đang lưu...'
                : 'Đang gửi...'
              : isEditing
                ? 'Lưu thay đổi'
                : 'Gửi phản hồi'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
