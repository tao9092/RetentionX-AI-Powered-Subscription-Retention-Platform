import type { RetentionAction } from '@/types/action'
import type { Customer, Recommendation } from '@/types/customer'

export const annualRevenueAtRisk = (customers: Customer[]) =>
  customers.reduce((sum, customer) => sum + customer.annualRevenueAtRisk, 0)

export function potentialProtectableArr(customers: Customer[], recommendations: Recommendation[], actions: RetentionAction[]): number {
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]))
  return recommendations.filter((recommendation) => {
    const customer = customerMap.get(recommendation.customerId)
    const endedUnsuccessfully = actions.some((action) => action.customerId === recommendation.customerId
      && action.status === 'Completed' && (action.customerResponse === 'Rejected' || action.outcome === 'Churned'))
    return customer && customer.riskLevel !== 'Low' && recommendation.actionType !== 'Monitor'
      && recommendation.action.trim().length > 0 && !endedUnsuccessfully
  }).reduce((sum, recommendation) => sum + recommendation.potentialRevenueProtected, 0)
}

export const realisedSavedArr = (actions: RetentionAction[]) => actions
  .filter((action) => action.status === 'Completed' && (action.outcome === 'Retained' || action.outcome === 'Downgraded'))
  .reduce((sum, action) => sum + Math.max(0, action.realisedRevenueProtected), 0)
