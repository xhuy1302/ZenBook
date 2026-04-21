import { Navigate } from 'react-router-dom'
import AccountLayout from '@/components/zenbook/account/AccountLayout'

export default function AccountPage() {
  return <AccountLayout />
}

// Re-export the redirect default so App.tsx can use it:
export function AccountIndexRedirect() {
  return <Navigate to='/account/profile' replace />
}
