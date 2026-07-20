import type { Customer } from '@/types/customer'

export type ScenarioId = 'none' | 'support' | 'onboarding' | 'right-size' | 'incentive' | 'combined'

export interface RetentionScenario {
  id: ScenarioId
  name: string
  shortName: string
  description: string
  eligible: boolean
  ineligibleReason?: string
  riskReduction: number
  projectedRisk: number
  interventionCost: number
  annualRevenueProtected: number
  netBenefit: number
  roi: number | null
  steps: string[]
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function makeScenario(
  customer: Customer,
  config: {
    id: ScenarioId
    name: string
    shortName: string
    description: string
    eligible?: boolean
    ineligibleReason?: string
    riskReduction: number
    interventionCost: number
    steps: string[]
  },
): RetentionScenario {
  const eligible = config.eligible ?? true
  const reduction = eligible ? Math.min(config.riskReduction, Math.max(customer.churnProbability - 5, 0)) : 0
  const projectedRisk = clamp(customer.churnProbability - reduction, 5, 95)
  const annualRevenue = customer.monthlyRevenue * 12
  const annualRevenueProtected = eligible
    ? Math.max(0, Math.round(annualRevenue * ((customer.churnProbability - projectedRisk) / 100)))
    : 0
  const netBenefit = annualRevenueProtected - (eligible ? config.interventionCost : 0)
  const roi = eligible && config.interventionCost > 0
    ? Math.round((netBenefit / config.interventionCost) * 10) / 10
    : null

  return {
    ...config,
    eligible,
    riskReduction: reduction,
    projectedRisk,
    annualRevenueProtected,
    netBenefit,
    roi,
  }
}

export function buildRetentionScenarios(customer: Customer): RetentionScenario[] {
  const annualRevenue = customer.monthlyRevenue * 12
  const supportReduction = Math.min(34, 16 + customer.unresolvedTickets * 5 + (customer.satisfactionScore <= 4 ? 5 : 0))
  const onboardingReduction = Math.min(31, 15 + (customer.featureUsagePct < 35 ? 9 : 4) + (customer.usageDeclinePct >= 40 ? 5 : 0))
  const planReduction = customer.underUtilized ? 27 : 10
  const incentiveReduction = customer.daysUntilRenewal <= 30 ? 19 : 13
  const combinedReduction = Math.min(46, Math.max(supportReduction, onboardingReduction, planReduction) + 12)

  return [
    makeScenario(customer, {
      id: 'none',
      name: 'Continue monitoring',
      shortName: 'No action',
      description: 'Keep the current account plan and accept the baseline churn exposure.',
      riskReduction: 0,
      interventionCost: 0,
      steps: ['Continue automated health monitoring', 'Review again at the next customer-success cycle'],
    }),
    makeScenario(customer, {
      id: 'support',
      name: 'Support recovery sprint',
      shortName: 'Support recovery',
      description: 'Resolve open support issues and complete a structured recovery call.',
      eligible: customer.unresolvedTickets > 0,
      ineligibleReason: 'No unresolved support tickets are currently recorded.',
      riskReduction: supportReduction,
      interventionCost: 350,
      steps: ['Escalate all unresolved tickets', 'Confirm resolution with the customer', 'Schedule a recovery call within 24 hours'],
    }),
    makeScenario(customer, {
      id: 'onboarding',
      name: 'Guided value onboarding',
      shortName: 'Onboarding',
      description: 'Focus the customer on the most valuable features and adoption milestones.',
      eligible: customer.featureUsagePct < 65 || customer.usageDeclinePct >= 20,
      ineligibleReason: 'Feature adoption and engagement are already healthy.',
      riskReduction: onboardingReduction,
      interventionCost: 280,
      steps: ['Identify two high-value use cases', 'Run a guided onboarding session', 'Agree on a 30-day adoption target'],
    }),
    makeScenario(customer, {
      id: 'right-size',
      name: 'Right-size the subscription plan',
      shortName: 'Plan right-size',
      description: 'Protect the relationship with a package that better matches actual usage.',
      eligible: customer.underUtilized && customer.plan !== 'Basic',
      ineligibleReason: customer.plan === 'Basic' ? 'The account is already on the entry plan.' : 'Current plan utilisation is within a healthy range.',
      riskReduction: planReduction,
      interventionCost: Math.round(annualRevenue * 0.1),
      steps: ['Review seats and feature adoption', 'Offer a right-sized plan or temporary capacity adjustment', 'Schedule a 60-day expansion review'],
    }),
    makeScenario(customer, {
      id: 'incentive',
      name: 'Targeted renewal incentive',
      shortName: '10% incentive',
      description: 'Use a limited commercial incentive tied to a clear renewal commitment.',
      riskReduction: incentiveReduction,
      interventionCost: Math.round(annualRevenue * 0.1),
      steps: ['Confirm renewal decision criteria', 'Offer a time-limited 10% incentive', 'Secure a documented renewal commitment'],
    }),
    makeScenario(customer, {
      id: 'combined',
      name: 'Combined recovery plan',
      shortName: 'Combined plan',
      description: 'Combine operational recovery, adoption support and a targeted commercial adjustment.',
      riskReduction: combinedReduction,
      interventionCost: 500 + Math.round(annualRevenue * 0.05),
      steps: ['Resolve the primary service friction', 'Run targeted value onboarding', 'Offer a conditional plan adjustment', 'Review progress after 30 days'],
    }),
  ]
}

export function getBestScenario(customer: Customer): RetentionScenario {
  const eligible = buildRetentionScenarios(customer).filter((scenario) => scenario.eligible && scenario.id !== 'none')
  return eligible.sort((a, b) => b.netBenefit - a.netBenefit || b.riskReduction - a.riskReduction)[0]
    ?? buildRetentionScenarios(customer)[0]!
}
