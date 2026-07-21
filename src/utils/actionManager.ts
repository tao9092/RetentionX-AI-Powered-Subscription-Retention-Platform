import type { RetentionAction, RetentionActionUpdate } from '@/types/action'
import type { Customer, Recommendation } from '@/types/customer'

const statuses = ['Not started', 'Planned', 'In progress', 'Completed']
const responses = ['Pending', 'Accepted', 'Rejected', 'No response']
const outcomes = ['Unknown', 'Retained', 'Downgraded', 'Churned']

export function createActionFromRecommendation(
  recommendation: Recommendation,
  customer: Customer,
  overrides: Partial<RetentionAction> = {},
): RetentionAction {
  const now = new Date().toISOString()
  const due = new Date()
  due.setDate(due.getDate() + (recommendation.timeframe.includes('24') ? 1 : recommendation.timeframe.includes('48') ? 2 : 7))
  return {
    id: overrides.id ?? `action-${customer.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    customerId: customer.id,
    actionType: recommendation.actionType,
    title: recommendation.action,
    priority: recommendation.priority,
    owner: 'Unassigned',
    dueDate: due.toISOString().slice(0, 10),
    status: 'Planned',
    customerResponse: 'Pending',
    outcome: 'Unknown',
    beforeRisk: customer.churnProbability,
    potentialRevenueProtected: recommendation.potentialRevenueProtected,
    realisedRevenueProtected: 0,
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function updateRetentionAction(action: RetentionAction, update: RetentionActionUpdate): RetentionAction {
  const status = update.status ?? action.status
  return {
    ...action,
    ...update,
    completedAt: status === 'Completed' ? action.completedAt ?? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  }
}

export function latestActionForCustomer(actions: RetentionAction[], customerId: number): RetentionAction | undefined {
  return actions.filter((action) => action.customerId === customerId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
}

export function isActionOverdue(action: RetentionAction, today = new Date()): boolean {
  return action.status !== 'Completed' && Boolean(action.dueDate) && new Date(`${action.dueDate}T23:59:59`).getTime() < today.getTime()
}

export interface OutcomeMetrics {
  retained: number
  downgraded: number
  churned: number
  unknown: number
  realisedSavedArr: number
  successRate: number | null
  averageCompletionDays: number | null
}

export function calculateOutcomeMetrics(actions: RetentionAction[]): OutcomeMetrics {
  const completed = actions.filter((action) => action.status === 'Completed')
  const known = completed.filter((action) => action.outcome !== 'Unknown')
  const successful = known.filter((action) => action.outcome === 'Retained' || action.outcome === 'Downgraded')
  const completionDays = completed.filter((action) => action.completedAt).map((action) =>
    Math.max(0, (new Date(action.completedAt!).getTime() - new Date(action.createdAt).getTime()) / 86400000))
  return {
    retained: completed.filter((action) => action.outcome === 'Retained').length,
    downgraded: completed.filter((action) => action.outcome === 'Downgraded').length,
    churned: completed.filter((action) => action.outcome === 'Churned').length,
    unknown: actions.filter((action) => action.outcome === 'Unknown').length,
    realisedSavedArr: successful.reduce((sum, action) => sum + Math.max(0, action.realisedRevenueProtected), 0),
    successRate: known.length ? Math.round((successful.length / known.length) * 100) : null,
    averageCompletionDays: completionDays.length ? Math.round((completionDays.reduce((a, b) => a + b, 0) / completionDays.length) * 10) / 10 : null,
  }
}

function isRetentionAction(value: unknown): value is RetentionAction {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<RetentionAction>
  return typeof item.id === 'string' && typeof item.customerId === 'number' && typeof item.title === 'string'
    && statuses.includes(item.status ?? '') && responses.includes(item.customerResponse ?? '') && outcomes.includes(item.outcome ?? '')
}

export function parseStoredActions(raw: string | null, fallback: RetentionAction[] = []): RetentionAction[] {
  if (!raw) return fallback
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.every(isRetentionAction) ? parsed : fallback
  } catch {
    return fallback
  }
}
