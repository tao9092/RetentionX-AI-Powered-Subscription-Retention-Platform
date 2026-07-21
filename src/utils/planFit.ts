import type { Customer, Plan } from '@/types/customer'

export type PlanFitKind = 'Onboarding' | 'Maintain' | 'Right-size / downgrade' | 'Upsell'
export interface PlanFitRecommendation { currentPlan: Plan; recommendedPlan: Plan; kind: PlanFitKind; estimatedMonthlyDifference: number; reason: string; confidenceBasis: string; directional: boolean }
const prices: Record<Plan, number> = { Basic: 180, Pro: 550, Enterprise: 1600 }
export function recommendPlanFit(customer: Customer): PlanFitRecommendation {
  const use = customer.seatUtilizationPct
  let kind: PlanFitKind = 'Maintain', recommendedPlan = customer.plan, reason = 'Current capacity and product adoption are broadly aligned.'
  if (customer.featureUsagePct < 35 && use < 50) {
    if (customer.plan === 'Enterprise') { kind = 'Right-size / downgrade'; recommendedPlan = 'Pro'; reason = 'Low seat and feature utilisation indicate the current enterprise commitment may be too large.' }
    else { kind = 'Onboarding'; reason = 'Low adoption should be addressed before changing commercial scope.' }
  } else if (use > 88 && customer.featureUsagePct > 75 && customer.plan !== 'Enterprise') {
    kind = 'Upsell'; recommendedPlan = customer.plan === 'Basic' ? 'Pro' : 'Enterprise'; reason = 'High seat and feature utilisation indicate credible expansion demand.'
  } else if (customer.featureUsagePct < 50) { kind = 'Onboarding'; reason = 'Feature adoption can improve before a commercial plan change is justified.' }
  return { currentPlan: customer.plan, recommendedPlan, kind, estimatedMonthlyDifference: prices[recommendedPlan] - customer.monthlyRevenue, reason, confidenceBasis: 'Prototype rule using seat utilisation, feature utilisation and current plan.', directional: true }
}
