// ─────────────────────────────────────────────────────────────────────────────
// services/customer/customer.type.ts
// ─────────────────────────────────────────────────────────────────────────────

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  username: string
  email: string
  fullName?: string // thêm — từ UserProfileResponse.fullName
  phone?: string
  gender?: 'male' | 'female' | 'other'
  dateOfBirth?: string // thêm — "YYYY-MM-DD" (LocalDate từ backend)
  avatarUrl?: string // mapped từ "avatar" qua @Mapping trong UserMapper
  roles: string[]
}

// ── Update requests ───────────────────────────────────────────────────────────

export interface CustomerProfileUpdateRequest {
  fullName?: string
  nickname?: string
  gender?: 'male' | 'female' | 'other'
  dateOfBirth?: string // "YYYY-MM-DD"
  nationality?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface PhoneUpdateRequest {
  phone: string
}

// ── Order ─────────────────────────────────────────────────────────────────────

export interface Order {
  id: string
  code: string
  date: string
  total: number
  status: 'pending' | 'shipping' | 'completed' | 'cancelled'
  itemCount: number
}

// ── Address ───────────────────────────────────────────────────────────────────

export interface Address {
  id: string
  recipientName: string
  phone: string
  street: string
  ward: string
  district: string
  city: string
  isDefault: boolean
}

export type AddressPayload = Omit<Address, 'id' | 'isDefault'>

// ── Tab ───────────────────────────────────────────────────────────────────────

export type AccountTab = 'profile' | 'orders' | 'address' | 'password'
