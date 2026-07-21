import type { Recommendation } from '@/types/customer'

export type ActionStatus = 'Not started' | 'Planned' | 'In progress' | 'Completed'
export type CustomerResponse = 'Pending' | 'Accepted' | 'Rejected' | 'No response'
export type RetentionOutcome = 'Unknown' | 'Retained' | 'Downgraded' | 'Churned'

export interface RetentionAction {
  id: string
  customerId: number
  actionType: Recommendation['actionType']
  title: string
  priority: Recommendation['priority']
  owner: string
  dueDate: string
  status: ActionStatus
  customerResponse: CustomerResponse
  outcome: RetentionOutcome
  beforeRisk: number
  afterRisk?: number
  potentialRevenueProtected: number
  realisedRevenueProtected: number
  notes: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  synthetic?: boolean
}

export type RetentionActionUpdate = Partial<Omit<RetentionAction, 'id' | 'customerId' | 'createdAt'>>
