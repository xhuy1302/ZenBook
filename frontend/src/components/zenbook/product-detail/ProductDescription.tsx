import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ProductDescriptionProps {
  description: string
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  const { t } = useTranslation('common')
  const [isExpanded, setIsExpanded] = useState(false)

  if (!description) {
    return <p className='text-sm text-gray-400 italic'>{t('product.noDescription')}</p>
  }

  return (
    <div className='flex flex-col'>
      <div
        className={`relative overflow-hidden transition-[max-height] duration-500 ${
          isExpanded ? 'max-h-[9999px]' : 'max-h-[320px]'
        }`}
      >
        <div
          className='prose prose-sm max-w-none text-gray-700 leading-relaxed text-sm'
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {!isExpanded && (
          <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none' />
        )}
      </div>

      <div className='flex justify-center mt-3'>
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className='text-[#c92127] text-sm font-medium hover:underline'
        >
          {isExpanded ? t('product.collapse') : t('product.seeMore')}
        </button>
      </div>
    </div>
  )
}
