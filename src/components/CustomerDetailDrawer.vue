<script setup lang="ts">
import HealthRing from './HealthRing.vue'
import RiskBadge from './RiskBadge.vue'
import type { Customer, Recommendation } from '@/types/customer'
import type { ActionStatus } from '@/types/action'

const props = defineProps<{ customer: Customer; recommendation: Recommendation; actionStatus: ActionStatus }>()
const emit = defineEmits<{ close: []; openScenario: [customerId: number]; updateStatus: [customerId: number, status: ActionStatus] }>()
const statusOptions: ActionStatus[] = ['Not started', 'Planned', 'In progress', 'Completed']

const formatMoney = (amount: number) => `RM ${amount.toLocaleString('en-MY')}`

function onStatusChange(event: Event) {
  emit('updateStatus', props.customer.id, (event.target as HTMLSelectElement).value as ActionStatus)
}
</script>

<template>
  <div class="drawer-overlay" @click.self="$emit('close')">
    <aside class="drawer" role="dialog" aria-modal="true" :aria-label="`${props.customer.companyName} customer details`">
      <header>
        <div class="customer-title">
          <span class="large-avatar">{{ customer.companyName.slice(0, 2).toUpperCase() }}</span>
          <div><span class="eyebrow">Customer 360 profile</span><h2>{{ customer.companyName }}</h2><p>{{ customer.industry }} · {{ customer.plan }} plan</p></div>
        </div>
        <button type="button" aria-label="Close details" @click="$emit('close')">×</button>
      </header>

      <div class="drawer-content">
        <section class="risk-summary">
          <HealthRing :score="customer.healthScore" />
          <div class="risk-summary__copy">
            <RiskBadge :level="customer.riskLevel" :probability="customer.churnProbability" />
            <h3>{{ customer.riskLevel === 'High' ? 'Immediate retention attention required' : customer.riskLevel === 'Medium' ? 'Account requires proactive follow-up' : 'Account is currently healthy' }}</h3>
            <p>Weighted monthly revenue at risk: <strong>{{ formatMoney(customer.monthlyRevenueAtRisk) }}</strong></p>
          </div>
        </section>

        <section class="metric-grid">
          <div><span>Monthly revenue</span><strong>{{ formatMoney(customer.monthlyRevenue) }}</strong></div>
          <div><span>Feature usage</span><strong :class="{ warning: customer.featureUsagePct < 35 }">{{ customer.featureUsagePct }}%</strong></div>
          <div><span>Seat utilisation</span><strong :class="{ warning: customer.seatUtilizationPct < 50 }">{{ customer.seatUtilizationPct }}%</strong></div>
          <div><span>Usage decline</span><strong :class="{ warning: customer.usageDeclinePct >= 35 }">{{ customer.usageDeclinePct }}%</strong></div>
          <div><span>Open tickets</span><strong :class="{ warning: customer.unresolvedTickets > 1 }">{{ customer.unresolvedTickets }}</strong></div>
          <div><span>Days to renewal</span><strong :class="{ warning: customer.daysUntilRenewal <= 30 }">{{ customer.daysUntilRenewal }}</strong></div>
        </section>

        <section class="section-card">
          <div class="section-heading"><div><span class="eyebrow">Explainable risk</span><h3>Why this account is flagged</h3></div><span class="count-chip">Top {{ Math.min(customer.riskReasons.length, 5) }}</span></div>
          <ol class="reason-list">
            <li v-for="(reason, index) in customer.riskReasons.slice(0, 5)" :key="`${reason.category}-${index}`">
              <span class="reason-number">{{ index + 1 }}</span>
              <div><strong>{{ reason.label }}</strong><p>{{ reason.detail }}</p></div>
              <span class="reason-category">{{ reason.category }}</span>
            </li>
            <li v-if="customer.riskReasons.length === 0" class="healthy-note">No material churn signals were detected for this account.</li>
          </ol>
        </section>

        <section class="recommendation-card">
          <div class="recommendation-head"><span class="spark">✦</span><div><span class="eyebrow">Next best action</span><h3>{{ recommendation.action }}</h3></div><span class="priority" :class="recommendation.priority.toLowerCase()">{{ recommendation.priority }}</span></div>
          <p>{{ recommendation.explanation }}</p>
          <div class="recommendation-metrics">
            <div><span>Target timeframe</span><strong>{{ recommendation.timeframe }}</strong></div>
            <div><span>Estimated risk reduction</span><strong>-{{ recommendation.estimatedRiskReduction }} pts</strong></div>
            <div><span>Potential annual revenue protected</span><strong>{{ formatMoney(recommendation.potentialRevenueProtected) }}</strong></div>
          </div>
          <div class="recommendation-actions">
            <label><span>Action status</span><select :value="actionStatus" @change="onStatusChange"><option v-for="status in statusOptions" :key="status">{{ status }}</option></select></label>
            <button type="button" @click="emit('openScenario', customer.id)">Compare what-if scenarios</button>
          </div>
        </section>

        <p class="method-note">Prototype note: the score is generated from transparent rule-based signals for the preliminary demo. A trained and validated churn model can replace this scoring layer without changing the product workflow.</p>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.drawer-overlay { position: fixed; z-index: 120; inset: 0; display: flex; justify-content: flex-end; background: rgba(13, 15, 18, .5); backdrop-filter: blur(8px); }
.drawer { width: min(690px, 100%); height: 100%; overflow-y: auto; color: var(--rx-ink-soft); background: var(--rx-bg); box-shadow: -28px 0 90px rgba(10, 12, 16, .25); animation: slide-in .2s ease-out; }
@keyframes slide-in { from { transform: translateX(32px); opacity: .55; } }
.drawer > header { position: sticky; top: 0; z-index: 4; display: flex; align-items: center; justify-content: space-between; min-height: 76px; padding: 14px 20px; border-bottom: 1px solid rgba(218,221,225,.92); background: rgba(244,245,247,.9); backdrop-filter: blur(18px); }
.customer-title { display: flex; align-items: center; gap: 12px; min-width: 0; }
.large-avatar { display: grid; place-items: center; width: 43px; height: 43px; flex: 0 0 auto; border: 1px solid #ded9ff; border-radius: 13px; color: #4e41b8; background: var(--rx-primary-soft); font-size: 10px; font-weight: 900; }
.eyebrow { display: block; color: var(--rx-primary); font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .13em; }
h2, h3, p { margin-top: 0; }
h2 { margin: 4px 0 2px; overflow: hidden; color: #24282e; font-size: 17px; letter-spacing: -.03em; text-overflow: ellipsis; white-space: nowrap; }
.customer-title p { margin-bottom: 0; color: #9298a1; font-size: 9px; }
.drawer > header button { display: grid; place-items: center; width: 36px; height: 36px; flex: 0 0 auto; border: 1px solid var(--rx-border-strong); border-radius: 11px; color: #6b727c; background: #fff; font-size: 21px; cursor: pointer; }
.drawer > header button:hover { color: #fff; border-color: #1c1f23; background: #1c1f23; }
.drawer-content { display: grid; gap: 14px; padding: 18px 20px 34px; }
.risk-summary { display: flex; align-items: center; gap: 18px; padding: 19px; border: 1px solid var(--rx-border); border-radius: 19px; background: var(--rx-surface); box-shadow: var(--rx-shadow-sm); }
.risk-summary__copy { min-width: 0; }
.risk-summary__copy h3 { margin: 11px 0 6px; color: #2b2f35; font-size: 16px; line-height: 1.2; letter-spacing: -.025em; }
.risk-summary__copy p { margin: 0; color: #858b94; font-size: 10px; }
.risk-summary__copy p strong { color: var(--rx-danger); }
.metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }
.metric-grid > div { min-height: 79px; padding: 13px; border: 1px solid var(--rx-border); border-radius: 14px; background: var(--rx-surface); box-shadow: 0 1px 2px rgba(20,23,29,.025); }
.metric-grid span, .recommendation-metrics span { display: block; color: #979ca5; font-size: 7.5px; font-weight: 850; text-transform: uppercase; letter-spacing: .06em; }
.metric-grid strong, .recommendation-metrics strong { display: block; margin-top: 8px; color: #343940; font-size: 14px; letter-spacing: -.02em; }
.metric-grid strong.warning { color: var(--rx-danger); }
.section-card { padding: 18px; border: 1px solid var(--rx-border); border-radius: 18px; background: var(--rx-surface); box-shadow: var(--rx-shadow-sm); }
.section-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.section-heading h3 { margin: 5px 0 0; color: #2d3137; font-size: 13px; }
.count-chip { padding: 6px 8px; border: 1px solid #e4e0ff; border-radius: 8px; color: #5548bd; background: var(--rx-primary-soft); font-size: 8px; font-weight: 850; }
.reason-list { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
.reason-list li { display: grid; grid-template-columns: 27px minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 12px 0; border-bottom: 1px solid #eff0f2; }
.reason-list li:last-child { border-bottom: 0; padding-bottom: 0; }
.reason-number { display: grid; place-items: center; width: 24px; height: 24px; border: 1px solid #f4ccd4; border-radius: 8px; color: var(--rx-danger); background: var(--rx-danger-soft); font-size: 8px; font-weight: 900; }
.reason-list strong { color: #3a3f46; font-size: 10px; }
.reason-list p { margin: 4px 0 0; color: #90969f; font-size: 9px; line-height: 1.45; }
.reason-category { padding: 5px 7px; border: 1px solid #e6e8eb; border-radius: 7px; color: #7e858e; background: #f7f7f8; font-size: 7px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; }
.healthy-note { display: block !important; color: var(--rx-success); font-size: 10px; }
.recommendation-card { position: relative; overflow: hidden; padding: 19px; border: 1px solid #2b2f34; border-radius: 19px; color: #fff; background: radial-gradient(circle at 100% 0%, rgba(216,255,114,.12), transparent 28%), #191b1f; box-shadow: 0 16px 38px rgba(20,23,29,.12); }
.recommendation-head { display: flex; align-items: center; gap: 11px; }
.spark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; color: var(--rx-lime-ink); background: var(--rx-lime); }
.recommendation-card .eyebrow { color: var(--rx-lime); }
.recommendation-head h3 { margin: 4px 0 0; color: #fff; font-size: 13px; }
.priority { margin-left: auto; padding: 6px 8px; border: 1px solid; border-radius: 7px; font-size: 7px; font-weight: 900; text-transform: uppercase; letter-spacing: .05em; }
.priority.critical { color: #ff8ca0; border-color: rgba(255,140,160,.3); background: rgba(223,75,100,.13); }
.priority.high { color: #ffd27e; border-color: rgba(255,210,126,.3); background: rgba(217,138,22,.13); }
.priority.normal { color: #72ddb5; border-color: rgba(114,221,181,.3); background: rgba(30,157,114,.13); }
.recommendation-card > p { margin: 14px 0; color: #9da4ad; font-size: 9.5px; line-height: 1.6; }
.recommendation-metrics { display: grid; grid-template-columns: 1fr 1fr 1.35fr; gap: 8px; }
.recommendation-metrics > div { padding: 11px; border: 1px solid #34383e; border-radius: 11px; background: #22252a; }
.recommendation-metrics span { color: #7f8790; }.recommendation-metrics strong { color: #f0f2f4; font-size: 10px; }
.recommendation-actions { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 13px; padding-top: 13px; border-top: 1px solid #30343a; }
.recommendation-actions label { display: flex; align-items: center; gap: 8px; }
.recommendation-actions label span { color: #7e858e; font-size: 7px; font-weight: 850; text-transform: uppercase; letter-spacing: .06em; }
.recommendation-actions select { min-height: 35px; padding: 0 9px; border: 1px solid #3a3e44; border-radius: 9px; color: #d6dae0; background: #25282d; font-size: 8px; font-weight: 750; }
.recommendation-actions button { min-height: 36px; padding: 0 11px; border: 0; border-radius: 9px; color: var(--rx-lime-ink); background: var(--rx-lime); font-size: 8px; font-weight: 900; cursor: pointer; }
.recommendation-actions button:hover { background: #e3ff94; }
.method-note { margin: 0; padding: 0 3px; color: #9ba0a9; font-size: 8px; line-height: 1.55; }
@media (max-width: 620px) { .recommendation-actions { align-items: stretch; flex-direction: column; } .recommendation-actions label { justify-content: space-between; } .recommendation-actions button { width: 100%; } .drawer-content { padding: 14px 13px 28px; } .drawer > header { padding: 12px 13px; } .metric-grid { grid-template-columns: 1fr 1fr; } .risk-summary { align-items: flex-start; } .recommendation-metrics { grid-template-columns: 1fr; } .reason-category { display: none; } }
</style>
