import type { PublisherStatus } from '@/defines/publisher.enum'

export interface PublisherResponse {
  id: string
  name: string
  contactName?: string | null
  taxCode?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  website?: string | null
  description?: string | null
  status: PublisherStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type PublisherCreationRequest = {
  name: string
  contactName?: string | null
  taxCode?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  website?: string | null
  description?: string | null
}

export type PublisherUpdateRequest = PublisherCreationRequest & {
  status: PublisherStatus
}

export interface PublisherFilterResponse {
  id: string
  name: string
  count: number
}
