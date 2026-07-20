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
.drawer-overlay { position: fixed; z-index: 100; inset: 0; display: flex; justify-content: flex-end; background: rgba(8, 12, 26, .5); backdrop-filter: blur(4px); }
.drawer { width: min(720px, 100%); height: 100%; overflow-y: auto; color: #303648; background: #f7f8fc; box-shadow: -24px 0 65px rgba(17, 22, 45, .2); animation: slide-in .22s ease-out; }
@keyframes slide-in { from { transform: translateX(40px); opacity: .5; } }
.drawer > header { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; padding: 21px 25px; border-bottom: 1px solid #e5e8f0; background: rgba(255,255,255,.94); backdrop-filter: blur(12px); }
.customer-title { display: flex; align-items: center; gap: 13px; }
.large-avatar { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 14px; color: #5c48cc; background: #ece9ff; font-size: 12px; font-weight: 900; }
.eyebrow { display: block; color: #7c66e8; font-size: 9px; font-weight: 850; text-transform: uppercase; letter-spacing: .12em; }
h2, h3, p { margin-top: 0; }
h2 { margin-bottom: 3px; color: #171c2d; font-size: 19px; letter-spacing: -.025em; }
.customer-title p { margin-bottom: 0; color: #9298aa; font-size: 11px; }
.drawer > header button { width: 36px; height: 36px; border: 1px solid #e4e7ef; border-radius: 11px; color: #60677b; background: #fff; font-size: 23px; cursor: pointer; }
.drawer-content { display: grid; gap: 17px; padding: 21px 25px 32px; }
.risk-summary { display: flex; align-items: center; gap: 20px; padding: 21px; border: 1px solid #e5e7f0; border-radius: 19px; background: #fff; }
.risk-summary__copy h3 { margin: 12px 0 6px; color: #23283a; font-size: 17px; }
.risk-summary__copy p { margin: 0; color: #858b9d; font-size: 12px; }
.risk-summary__copy p strong { color: #d94766; }
.metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.metric-grid > div { padding: 14px; border: 1px solid #e8eaf1; border-radius: 14px; background: #fff; }
.metric-grid span, .recommendation-metrics span { display: block; color: #969cad; font-size: 10px; }
.metric-grid strong, .recommendation-metrics strong { display: block; margin-top: 6px; color: #31374a; font-size: 15px; }
.metric-grid strong.warning { color: #db4565; }
.section-card { padding: 19px; border: 1px solid #e5e8f0; border-radius: 18px; background: #fff; }
.section-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 9px; }
.section-heading h3 { margin: 5px 0 0; color: #202638; font-size: 15px; }
.count-chip { padding: 6px 9px; border-radius: 8px; color: #6c59ce; background: #f1efff; font-size: 10px; font-weight: 750; }
.reason-list { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
.reason-list li { display: grid; grid-template-columns: 28px 1fr auto; gap: 10px; align-items: start; padding: 13px 0; border-bottom: 1px solid #f0f2f6; }
.reason-list li:last-child { border-bottom: 0; padding-bottom: 0; }
.reason-number { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 8px; color: #d74765; background: #fff0f3; font-size: 10px; font-weight: 850; }
.reason-list strong { color: #32384a; font-size: 12px; }
.reason-list p { margin: 4px 0 0; color: #8a90a2; font-size: 11px; line-height: 1.45; }
.reason-category { padding: 5px 7px; border-radius: 7px; color: #747b8e; background: #f4f5f8; font-size: 9px; }
.healthy-note { display: block !important; color: #178261; font-size: 12px; }
.recommendation-card { padding: 20px; border: 1px solid #dcd7ff; border-radius: 18px; background: linear-gradient(140deg, #fbfaff, #f5f8ff); }
.recommendation-head { display: flex; align-items: center; gap: 11px; }
.spark { display: grid; place-items: center; width: 37px; height: 37px; border-radius: 12px; color: #fff; background: linear-gradient(135deg, #7458ee, #2cb8e7); }
.recommendation-head h3 { margin: 4px 0 0; color: #242a3c; font-size: 15px; }
.priority { margin-left: auto; padding: 6px 8px; border-radius: 7px; font-size: 9px; font-weight: 850; text-transform: uppercase; }
.priority.critical { color: #cc3657; background: #ffe9ef; }
.priority.high { color: #a96600; background: #fff2d5; }
.priority.normal { color: #14785e; background: #e8f8f2; }
.recommendation-card > p { margin: 14px 0; color: #6c7387; font-size: 11px; line-height: 1.55; }
.recommendation-metrics { display: grid; grid-template-columns: 1fr 1fr 1.35fr; gap: 8px; }
.recommendation-metrics > div { padding: 11px; border: 1px solid #e7e3ff; border-radius: 11px; background: rgba(255,255,255,.75); }
.recommendation-metrics strong { font-size: 12px; }
.recommendation-actions { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e7e3ff; }
.recommendation-actions label { display: flex; align-items: center; gap: 8px; }
.recommendation-actions label span { color: #969cad; font-size: 9px; text-transform: uppercase; }
.recommendation-actions select { padding: 8px 10px; border: 1px solid #dedaf7; border-radius: 9px; color: #4f566b; background: #fff; font-size: 10px; font-weight: 700; }
.recommendation-actions button { padding: 9px 12px; border: 0; border-radius: 9px; color: #fff; background: #6f56df; font-size: 10px; font-weight: 800; cursor: pointer; }
.method-note { margin: 0; padding: 0 4px; color: #969caf; font-size: 10px; line-height: 1.5; }
@media (max-width: 620px) { .recommendation-actions { align-items: stretch; flex-direction: column; } .recommendation-actions label { justify-content: space-between; } .recommendation-actions button { width: 100%; } .drawer-content { padding: 17px 15px 28px; } .drawer > header { padding: 17px 15px; } .metric-grid { grid-template-columns: 1fr 1fr; } .risk-summary { align-items: flex-start; } .recommendation-metrics { grid-template-columns: 1fr; } .reason-category { display: none; } }
</style>
