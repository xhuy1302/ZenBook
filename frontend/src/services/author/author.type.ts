import type { AuthorStatus } from '@/defines/author.enum'

export interface AuthorResponse {
  id: string
  name: string
  biography?: string | null
  avatar?: string | null
  nationality?: string | null
  dateOfBirth?: string | null
  status: AuthorStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type CreateAuthorRequest = {
  name: string
  biography?: string | null
  nationality?: string | null
  dateOfBirth?: string | null
  status: AuthorStatus
  avatar?: string | null
}

export type UpdateAuthorRequest = {
  name?: string
  biography?: string | null
  nationality?: string | null
  dateOfBirth?: string | null
  status: AuthorStatus
  avatar?: string | null
}

export type UpdateAuthorResponse = {
  id: string
  name: string
  biography?: string | null
  nationality?: string | null
  dateOfBirth?: string | null
  avatar?: string | null
  status: AuthorStatus
}
