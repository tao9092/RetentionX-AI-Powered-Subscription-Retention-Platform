export type Plan = 'Basic' | 'Pro' | 'Enterprise'
export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface CustomerInput {
  id: number
  companyName: string
  industry: string
  plan: Plan
  monthlyRevenue: number
  licensedSeats: number
  activeSeats: number
  logins30d: number
  previousLogins30d: number
  featureUsagePct: number
  unresolvedTickets: number
  latePayments90d: number
  satisfactionScore: number
  daysUntilRenewal: number
}

export interface RiskReason {
  label: string
  detail: string
  severity: number
  category: 'Engagement' | 'Adoption' | 'Support' | 'Payment' | 'Satisfaction' | 'Renewal'
}

export interface RiskContribution {
  id: string
  category: RiskReason['category'] | 'Account'
  label: string
  points: number
  observedValue: string
  explanation: string
  source: 'Usage' | 'Billing' | 'Support' | 'Feedback' | 'Account'
}

export interface Customer extends CustomerInput {
  usageDeclinePct: number
  seatUtilizationPct: number
  churnProbability: number
  healthScore: number
  riskLevel: RiskLevel
  underUtilized: boolean
  monthlyRevenueAtRisk: number
  annualRevenueAtRisk: number
  riskReasons: RiskReason[]
  riskContributions: RiskContribution[]
}

export interface Recommendation {
  customerId: number
  action: string
  actionType: 'Support' | 'Onboarding' | 'Plan Review' | 'Renewal' | 'Payment' | 'Re-engagement' | 'Monitor'
  priority: 'Critical' | 'High' | 'Normal'
  timeframe: string
  explanation: string
  estimatedRiskReduction: number
  potentialRevenueProtected: number
  priorityScore: number
}
