import { Crown, PencilLine, User2 } from 'lucide-react'
import type { ReactNode } from 'react'

export type UserRole = 'ADMIN' | 'USER' | 'STAFF'

export interface RoleConfigItem {
  label: string
  icon: ReactNode
  className: string
}

export const ROLE_CONFIG: Record<UserRole, RoleConfigItem> = {
  ADMIN: {
    label: 'Admin',
    icon: <Crown className='h-4 w-4' />,
    className: 'bg-blue-100 text-blue-700'
  },
  USER: {
    label: 'User',
    icon: <User2 className='h-4 w-4' />,
    className: 'bg-orange-100 text-orange-700'
  },
  STAFF: {
    label: 'Staff',
    icon: <PencilLine className='h-4 w-4' />,
    className: 'bg-purple-100 text-purple-700'
  }
}
