import { cn } from '@/lib/utils'
import { ROLE_CONFIG, type UserRole } from '@/defines/roleConfig'

interface UserRoleBadgesProps {
  roles?: UserRole[]
}

export function UserRoleBadges({ roles }: UserRoleBadgesProps) {
  if (!roles || roles.length === 0) return <span>-</span>

  return (
    <div className='flex flex-wrap gap-1'>
      {roles.map((role) => {
        const config = ROLE_CONFIG[role]

        return (
          <div
            key={role}
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium',
              config.className
            )}
          >
            {config.icon}
            {config.label}
          </div>
        )
      })}
    </div>
  )
}
