import type { Customer, CustomerInput, RiskLevel, RiskReason } from '@/types/customer'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

export function calculateUsageDecline(current: number, previous: number): number {
  if (previous <= 0 || current >= previous) return 0
  return Math.round(((previous - current) / previous) * 100)
}

function buildRiskReasons(customer: CustomerInput, usageDeclinePct: number, seatUtilizationPct: number): RiskReason[] {
  const reasons: RiskReason[] = []

  if (usageDeclinePct >= 20) {
    reasons.push({
      label: 'Usage activity is declining',
      detail: `Login activity fell by ${usageDeclinePct}% compared with the previous 30 days.`,
      severity: usageDeclinePct >= 60 ? 25 : usageDeclinePct >= 40 ? 18 : 10,
      category: 'Engagement',
    })
  }

  if (customer.featureUsagePct < 50) {
    reasons.push({
      label: 'Low feature adoption',
      detail: `Only ${customer.featureUsagePct}% of subscribed features are being used.`,
      severity: customer.featureUsagePct <= 20 ? 20 : customer.featureUsagePct <= 35 ? 15 : 8,
      category: 'Adoption',
    })
  }

  if (seatUtilizationPct < 60) {
    reasons.push({
      label: 'Purchased seats are under-utilised',
      detail: `${customer.activeSeats} of ${customer.licensedSeats} licensed seats are active (${seatUtilizationPct}%).`,
      severity: seatUtilizationPct < 30 ? 10 : 6,
      category: 'Adoption',
    })
  }

  if (customer.unresolvedTickets > 0) {
    reasons.push({
      label: 'Unresolved support issues',
      detail: `${customer.unresolvedTickets} support ticket${customer.unresolvedTickets === 1 ? '' : 's'} still require resolution.`,
      severity: customer.unresolvedTickets >= 3 ? 18 : customer.unresolvedTickets === 2 ? 14 : 7,
      category: 'Support',
    })
  }

  if (customer.satisfactionScore <= 7) {
    reasons.push({
      label: 'Customer satisfaction is weak',
      detail: `The latest satisfaction score is ${customer.satisfactionScore}/10.`,
      severity: customer.satisfactionScore <= 3 ? 17 : customer.satisfactionScore <= 5 ? 12 : 5,
      category: 'Satisfaction',
    })
  }

  if (customer.latePayments90d > 0) {
    reasons.push({
      label: 'Payment behaviour needs attention',
      detail: `${customer.latePayments90d} late payment${customer.latePayments90d === 1 ? '' : 's'} occurred in the last 90 days.`,
      severity: customer.latePayments90d >= 2 ? 10 : 5,
      category: 'Payment',
    })
  }

  if (customer.daysUntilRenewal <= 60) {
    reasons.push({
      label: 'Renewal date is approaching',
      detail: `The current subscription renews in ${customer.daysUntilRenewal} days.`,
      severity: customer.daysUntilRenewal <= 14 ? 10 : customer.daysUntilRenewal <= 30 ? 7 : 3,
      category: 'Renewal',
    })
  }

  return reasons.sort((a, b) => b.severity - a.severity)
}

export function enrichCustomer(customer: CustomerInput): Customer {
  const usageDeclinePct = calculateUsageDecline(customer.logins30d, customer.previousLogins30d)
  const seatUtilizationPct = Math.round((customer.activeSeats / Math.max(customer.licensedSeats, 1)) * 100)
  const riskReasons = buildRiskReasons(customer, usageDeclinePct, seatUtilizationPct)

  let score = 5
  score += usageDeclinePct >= 60 ? 25 : usageDeclinePct >= 40 ? 18 : usageDeclinePct >= 20 ? 10 : 0
  score += customer.featureUsagePct <= 20 ? 20 : customer.featureUsagePct <= 35 ? 15 : customer.featureUsagePct < 50 ? 8 : 0
  score += seatUtilizationPct < 30 ? 7 : seatUtilizationPct < 50 ? 4 : 0
  score += customer.unresolvedTickets >= 3 ? 18 : customer.unresolvedTickets === 2 ? 14 : customer.unresolvedTickets === 1 ? 7 : 0
  score += customer.satisfactionScore <= 3 ? 17 : customer.satisfactionScore <= 5 ? 12 : customer.satisfactionScore <= 7 ? 5 : 0
  score += customer.latePayments90d >= 2 ? 10 : customer.latePayments90d === 1 ? 5 : 0
  score += customer.daysUntilRenewal <= 14 ? 10 : customer.daysUntilRenewal <= 30 ? 7 : customer.daysUntilRenewal <= 60 ? 3 : 0

  const churnProbability = clamp(Math.round(score), 6, 95)
  const healthScore = clamp(100 - churnProbability, 5, 94)
  const underUtilized = customer.featureUsagePct < 35 || seatUtilizationPct < 50

  return {
    ...customer,
    usageDeclinePct,
    seatUtilizationPct,
    churnProbability,
    healthScore,
    riskLevel: getRiskLevel(churnProbability),
    underUtilized,
    monthlyRevenueAtRisk: Math.round(customer.monthlyRevenue * (churnProbability / 100)),
    annualRevenueAtRisk: Math.round(customer.monthlyRevenue * 12 * (churnProbability / 100)),
    riskReasons,
  }
}
