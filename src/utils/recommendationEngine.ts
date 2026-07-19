import type { Customer, Recommendation } from '@/types/customer'

export function generateRecommendation(customer: Customer): Recommendation {
  let action = 'Continue health monitoring'
  let actionType: Recommendation['actionType'] = 'Monitor'
  let timeframe = 'Review next month'
  let explanation = 'No immediate intervention is required. Continue monitoring engagement and renewal signals.'
  let estimatedRiskReduction = 6

  if (customer.unresolvedTickets >= 2) {
    action = 'Escalate support and schedule a recovery call'
    actionType = 'Support'
    timeframe = 'Within 24 hours'
    explanation = 'Unresolved support issues are the strongest current churn signal. Close the tickets, confirm resolution and arrange a customer-success follow-up.'
    estimatedRiskReduction = 32
  } else if (customer.underUtilized && customer.plan !== 'Basic') {
    action = 'Run a plan-fit review with guided onboarding'
    actionType = 'Plan Review'
    timeframe = 'Within 48 hours'
    explanation = 'The account is paying for capacity or features it is not using. Review the plan, demonstrate relevant features and offer a right-sized package when necessary.'
    estimatedRiskReduction = 28
  } else if (customer.featureUsagePct < 45 || customer.usageDeclinePct >= 35) {
    action = 'Launch a personalised re-engagement programme'
    actionType = customer.featureUsagePct < 35 ? 'Onboarding' : 'Re-engagement'
    timeframe = 'Within 3 days'
    explanation = 'Engagement has weakened. Provide a focused onboarding session and a short success plan based on the customer’s most valuable use cases.'
    estimatedRiskReduction = 24
  } else if (customer.daysUntilRenewal <= 30) {
    action = 'Start an early renewal conversation'
    actionType = 'Renewal'
    timeframe = 'This week'
    explanation = 'The account is approaching renewal. Review achieved value, unresolved concerns and the most suitable package before the contract decision date.'
    estimatedRiskReduction = 20
  } else if (customer.latePayments90d > 0) {
    action = 'Offer proactive payment assistance'
    actionType = 'Payment'
    timeframe = 'Within 3 days'
    explanation = 'Recent payment delays may indicate friction or budget pressure. Confirm the billing issue and provide an appropriate payment arrangement.'
    estimatedRiskReduction = 16
  }

  const recoverability = Math.min(0.72, estimatedRiskReduction / Math.max(customer.churnProbability, 1))
  const potentialRevenueProtected = Math.round(customer.annualRevenueAtRisk * recoverability)
  const priorityScore = Math.round(customer.churnProbability * customer.monthlyRevenue * (0.5 + recoverability))

  return {
    customerId: customer.id,
    action,
    actionType,
    priority: customer.churnProbability >= 80 || (customer.riskLevel === 'High' && customer.monthlyRevenue >= 800)
      ? 'Critical'
      : customer.riskLevel === 'High'
        ? 'High'
        : 'Normal',
    timeframe,
    explanation,
    estimatedRiskReduction,
    potentialRevenueProtected,
    priorityScore,
  }
}
