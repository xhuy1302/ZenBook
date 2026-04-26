import { Badge } from '@/components/ui/badge'
import { ReviewStatus } from '@/defines/review.enum'
import { useTranslation } from 'react-i18next'

export const ReviewStatusBadge = ({ status }: { status: ReviewStatus }) => {
  const { t } = useTranslation('review')

  switch (status) {
    case ReviewStatus.APPROVED:
      return (
        <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
          {t('status.APPROVED')}
        </Badge>
      )
    case ReviewStatus.PENDING:
      return (
        <Badge variant='outline' className='bg-yellow-50 text-yellow-700 border-yellow-200'>
          {t('status.PENDING')}
        </Badge>
      )
    case ReviewStatus.REJECTED:
      return (
        <Badge variant='outline' className='bg-red-50 text-red-700 border-red-200'>
          {t('status.REJECTED')}
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}
