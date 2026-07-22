import type { Customer, CustomerInput, RiskContribution, RiskLevel, RiskReason } from '@/types/customer'

export const BASE_RISK = 5
export const MIN_RISK = 6
export const MAX_RISK = 95
export const RISK_THRESHOLDS = { medium: 40, high: 70 } as const

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.high) return 'High'
  if (score >= RISK_THRESHOLDS.medium) return 'Medium'
  return 'Low'
}

export function calculateUsageDecline(current: number, previous: number): number {
  if (previous <= 0 || current >= previous) return 0
  return Math.round(((previous - current) / previous) * 100)
}

export function getRiskContributions(customer: CustomerInput): RiskContribution[] {
  const usageDecline = calculateUsageDecline(customer.logins30d, customer.previousLogins30d)
  const seatUse = Math.round((customer.activeSeats / Math.max(customer.licensedSeats, 1)) * 100)
  const contributions: RiskContribution[] = [{
    id: 'base-risk', category: 'Account', label: 'Baseline account risk', points: BASE_RISK,
    observedValue: 'Applied to every account', explanation: 'A five-point baseline represents unobserved account risk.', source: 'Account',
  }]
  const available = customer.dataAvailability ?? { Usage: true, Billing: true, Support: true, Feedback: true, Account: true }
  const add = (item: RiskContribution) => { if (item.points > 0) contributions.push(item) }
  if (available.Usage) add({ id: 'usage-decline', category: 'Engagement', label: 'Usage activity decline', points: usageDecline >= 60 ? 25 : usageDecline >= 40 ? 18 : usageDecline >= 20 ? 10 : 0, observedValue: `${usageDecline}% decline`, explanation: 'Lower recent login activity indicates reduced engagement.', source: 'Usage' })
  if (available.Usage) add({ id: 'feature-adoption', category: 'Adoption', label: 'Feature adoption', points: customer.featureUsagePct <= 20 ? 20 : customer.featureUsagePct <= 35 ? 15 : customer.featureUsagePct < 50 ? 8 : 0, observedValue: `${customer.featureUsagePct}% used`, explanation: 'Low adoption may mean the customer is not realising enough product value.', source: 'Usage' })
  if (available.Usage) add({ id: 'seat-utilisation', category: 'Adoption', label: 'Seat utilisation', points: seatUse < 30 ? 7 : seatUse < 50 ? 4 : 0, observedValue: `${customer.activeSeats}/${customer.licensedSeats} seats (${seatUse}%)`, explanation: 'Unused licensed capacity can signal poor plan fit or incomplete onboarding.', source: 'Usage' })
  if (available.Support) add({ id: 'support-tickets', category: 'Support', label: 'Unresolved support issues', points: customer.unresolvedTickets >= 3 ? 18 : customer.unresolvedTickets === 2 ? 14 : customer.unresolvedTickets === 1 ? 7 : 0, observedValue: `${customer.unresolvedTickets} unresolved`, explanation: 'Open service issues increase relationship friction.', source: 'Support' })
  if (available.Feedback) add({ id: 'satisfaction', category: 'Satisfaction', label: 'Customer satisfaction', points: customer.satisfactionScore <= 3 ? 17 : customer.satisfactionScore <= 5 ? 12 : customer.satisfactionScore <= 7 ? 5 : 0, observedValue: `${customer.satisfactionScore}/10`, explanation: 'Weak feedback is treated as a direct dissatisfaction signal.', source: 'Feedback' })
  if (available.Billing) add({ id: 'late-payments', category: 'Payment', label: 'Late payment behaviour', points: customer.latePayments90d >= 2 ? 10 : customer.latePayments90d === 1 ? 5 : 0, observedValue: `${customer.latePayments90d} in 90 days`, explanation: 'Payment delays may indicate billing friction or budget pressure.', source: 'Billing' })
  if (available.Billing) add({ id: 'renewal-window', category: 'Renewal', label: 'Renewal proximity', points: customer.daysUntilRenewal <= 14 ? 10 : customer.daysUntilRenewal <= 30 ? 7 : customer.daysUntilRenewal <= 60 ? 3 : 0, observedValue: `${customer.daysUntilRenewal} days`, explanation: 'Near-term renewals reduce the available intervention window.', source: 'Billing' })
  return contributions
}

function contributionReasons(contributions: RiskContribution[]): RiskReason[] {
  return contributions.filter((item) => item.id !== 'base-risk').map((item) => ({
    label: item.label,
    detail: `${item.observedValue}. ${item.explanation}`,
    severity: item.points,
    category: item.category === 'Account' ? 'Renewal' : item.category,
  })).sort((a, b) => b.severity - a.severity)
}

export function calculateRiskScore(contributions: RiskContribution[]): number {
  return clamp(Math.round(contributions.reduce((sum, contribution) => sum + contribution.points, 0)), MIN_RISK, MAX_RISK)
}

export function enrichCustomer(customer: CustomerInput): Customer {
  const usageDeclinePct = calculateUsageDecline(customer.logins30d, customer.previousLogins30d)
  const seatUtilizationPct = Math.round((customer.activeSeats / Math.max(customer.licensedSeats, 1)) * 100)
  const riskContributions = getRiskContributions(customer)
  const churnProbability = calculateRiskScore(riskContributions)
  return {
    ...customer,
    usageDeclinePct,
    seatUtilizationPct,
    churnProbability,
    healthScore: clamp(100 - churnProbability, 5, 94),
    riskLevel: getRiskLevel(churnProbability),
    underUtilized: customer.featureUsagePct < 35 || seatUtilizationPct < 50,
    monthlyRevenueAtRisk: Math.round(customer.monthlyRevenue * (churnProbability / 100)),
    annualRevenueAtRisk: Math.round(customer.monthlyRevenue * 12 * (churnProbability / 100)),
    riskReasons: contributionReasons(riskContributions),
    riskContributions,
  }
}
