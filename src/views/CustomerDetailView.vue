<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Customer, Recommendation } from '@/types/customer'
import type { RetentionAction, RetentionActionUpdate } from '@/types/action'
import { recommendPlanFit } from '@/utils/planFit'
import { customerTimeline } from '@/utils/timeline'

const props = defineProps<{ customer: Customer; recommendation: Recommendation; actions: RetentionAction[]; latestAction?: RetentionAction }>()
const emit = defineEmits<{
  back: []
  openScenario: [customerId: number]
  createAction: [customerId: number]
  updateAction: [actionId: string, update: RetentionActionUpdate]
}>()
const formatMoney = (amount: number) => `RM ${Math.round(amount).toLocaleString('en-MY')}`
const planFit = computed(() => recommendPlanFit(props.customer))
const eventFilter = ref('All')
const timeline = computed(() => customerTimeline(props.customer, props.actions).filter(event => eventFilter.value === 'All' || event.category === eventFilter.value))
const availability = computed(() => props.customer.dataAvailability ?? { Usage:true,Billing:true,Support:true,Feedback:true,Account:true })
const completeness = computed(() => Math.round(Object.values(availability.value).filter(Boolean).length / 5 * 100))
</script>

<template>
  <div class="customer-detail-page">
    <button class="back-button" type="button" @click="emit('back')">
      <span aria-hidden="true">←</span> Back to customers
    </button>

    <section class="customer-hero">
      <div class="identity-block">
        <span class="customer-avatar">{{ customer.companyName.slice(0, 2).toUpperCase() }}</span>
        <div>
          <span class="eyebrow">Customer 360</span>
          <h2>{{ customer.companyName }}</h2>
          <p>{{ customer.industry }} · {{ customer.plan }} plan · {{ formatMoney(customer.monthlyRevenue) }}/month</p>
        </div>
      </div>

      <div class="hero-actions">
        <button v-if="!latestAction" class="scenario-button" type="button" @click="emit('createAction', customer.id)">Create retention action</button>
        <span v-else class="status-field"><span>Latest action</span><strong>{{ latestAction.status }} · {{ latestAction.outcome }}</strong></span>
        <button class="scenario-button" type="button" @click="emit('openScenario', customer.id)">Compare scenarios</button>
      </div>
    </section>

    <section class="summary-grid">
      <article class="health-summary">
        <div class="health-ring" :style="{ '--score': `${customer.healthScore * 3.6}deg` }">
          <div><strong>{{ customer.healthScore }}</strong><span>Health score</span></div>
        </div>
        <div>
          <span class="risk-chip" :class="customer.riskLevel.toLowerCase()">{{ customer.riskLevel }} risk · {{ customer.churnProbability }}%</span>
          <h3>{{ customer.riskLevel === 'High' ? 'Immediate retention attention required' : customer.riskLevel === 'Medium' ? 'Proactive follow-up recommended' : 'Account is currently healthy' }}</h3>
          <p>Weighted monthly revenue at risk: <strong>{{ formatMoney(customer.monthlyRevenueAtRisk) }}</strong></p>
        </div>
      </article>

      <article class="revenue-summary">
        <span>Annual revenue at risk</span>
        <strong>{{ formatMoney(customer.annualRevenueAtRisk) }}</strong>
        <p title="Monthly revenue × 12 × transparent risk score.">Annual exposure weighted by the transparent risk indicator.</p>
        <div><span>Potential Protectable ARR</span><b>{{ customer.riskLevel !== 'Low' && recommendation.actionType !== 'Monitor' ? formatMoney(recommendation.potentialRevenueProtected) : 'Not eligible' }}</b></div>
      </article>
    </section>

    <section class="detail-metrics">
      <article><span>Feature usage</span><strong :class="{ warning: customer.featureUsagePct < 35 }">{{ customer.featureUsagePct }}%</strong><p>Across subscribed capabilities</p></article>
      <article><span>Seat utilisation</span><strong :class="{ warning: customer.seatUtilizationPct < 50 }">{{ customer.seatUtilizationPct }}%</strong><p>{{ customer.activeSeats }} of {{ customer.licensedSeats }} seats active</p></article>
      <article><span>Usage decline</span><strong :class="{ warning: customer.usageDeclinePct >= 35 }">{{ customer.usageDeclinePct }}%</strong><p>Compared with the prior period</p></article>
      <article><span>Days to renewal</span><strong :class="{ warning: customer.daysUntilRenewal <= 30 }">{{ customer.daysUntilRenewal }}</strong><p>Time remaining to intervene</p></article>
    </section>

    <section class="content-grid">
      <article class="panel risk-panel">
        <div class="panel-heading">
          <div><span class="eyebrow">Explainable risk</span><h3>Why this account is flagged</h3><p>The highest-impact signals contributing to the current churn risk.</p></div>
          <span class="count-chip">Top {{ Math.min(customer.riskReasons.length, 5) }}</span>
        </div>

        <ol class="reason-list">
          <li v-for="(reason, index) in customer.riskReasons.slice(0, 5)" :key="`${reason.category}-${index}`">
            <span class="reason-number">{{ index + 1 }}</span>
            <div><strong>{{ reason.label }}</strong><p>{{ reason.detail }}</p></div>
            <span class="reason-category">{{ reason.category }} · {{ customer.riskContributions.find(item => item.label === reason.label)?.source }}</span>
          </li>
          <li v-if="customer.riskReasons.length === 0" class="healthy-note">No material churn signals were detected for this account.</li>
        </ol>
      </article>

      <article class="recommendation-panel">
        <span class="recommendation-icon">✓</span>
        <span class="eyebrow light">Next best action</span>
        <h3>{{ recommendation.action }}</h3>
        <p>{{ recommendation.explanation }}</p>

        <div class="recommendation-stats">
          <div><span>Priority</span><strong>{{ recommendation.priority }}</strong></div>
          <div><span>Target timeframe</span><strong>{{ recommendation.timeframe }}</strong></div>
          <div><span>Estimated risk reduction</span><strong>-{{ recommendation.estimatedRiskReduction }} pts</strong></div>
        </div>

        <button type="button" @click="emit('openScenario', customer.id)">Open what-if scenario lab <span>→</span></button>
      </article>
    </section>

    <section class="panel account-details">
      <div class="panel-heading">
        <div><span class="eyebrow">Account signals</span><h3>Operational context</h3><p>Customer engagement, service and payment indicators used by the decision engine.</p></div>
      </div>
      <div class="signal-grid">
        <div><span>Logins, last 30 days</span><strong>{{ customer.logins30d }}</strong></div>
        <div><span>Previous 30 days</span><strong>{{ customer.previousLogins30d }}</strong></div>
        <div><span>Open support tickets</span><strong :class="{ warning: customer.unresolvedTickets > 1 }">{{ customer.unresolvedTickets }}</strong></div>
        <div><span>Late payments, 90 days</span><strong :class="{ warning: customer.latePayments90d > 0 }">{{ customer.latePayments90d }}</strong></div>
        <div><span>Satisfaction score</span><strong :class="{ warning: customer.satisfactionScore < 6 }">{{ customer.satisfactionScore }}/10</strong></div>
        <div><span>Current plan</span><strong>{{ customer.plan }}</strong></div>
      </div>
    </section>

    <section class="panel account-details">
      <div class="panel-heading"><div><span class="eyebrow">Data lineage</span><h3>{{ completeness }}% customer data completeness</h3><p>Missing sources remain missing and are excluded from risk contributions.</p></div></div>
      <div class="signal-grid"><div v-for="(available, source) in availability" :key="source"><span>{{ source }} data</span><strong>{{ available ? 'Available' : 'Missing' }}</strong></div></div>
    </section>

    <section class="panel account-details">
      <div class="panel-heading"><div><span class="eyebrow">Plan fit</span><h3>{{ planFit.kind }}</h3><p>{{ planFit.reason }}</p></div><span class="count-chip">Directional</span></div>
      <div class="signal-grid"><div><span>Current plan</span><strong>{{ planFit.currentPlan }}</strong></div><div><span>Recommended plan</span><strong>{{ planFit.recommendedPlan }}</strong></div><div><span>Current monthly revenue</span><strong>{{ formatMoney(customer.monthlyRevenue) }}</strong></div><div><span>Estimated monthly difference</span><strong>{{ formatMoney(planFit.estimatedMonthlyDifference) }}</strong></div><div><span>Licensed / active seats</span><strong>{{ customer.licensedSeats }} / {{ customer.activeSeats }}</strong></div><div><span>Seat / feature utilisation</span><strong>{{ customer.seatUtilizationPct }}% / {{ customer.featureUsagePct }}%</strong></div></div>
      <p class="method-note">Confidence basis: {{ planFit.confidenceBasis }} Financial impact is directional because no imported plan catalogue is configured.</p>
    </section>

    <section class="panel account-details timeline-panel">
      <div class="panel-heading"><div><span class="eyebrow">Customer activity</span><h3>Chronological timeline</h3><p>Imported source records and retention actions, newest first.</p></div></div>
      <div class="timeline-filters"><button v-for="filter in ['All','Usage','Billing','Support','Feedback','Retention actions']" :key="filter" :class="{active:eventFilter===filter}" @click="eventFilter=filter">{{ filter }}</button></div>
      <ol v-if="timeline.length" class="timeline"><li v-for="event in timeline" :key="event.id"><div class="timeline-date"><time :datetime="event.occurredAt">{{ new Date(event.occurredAt).toLocaleDateString('en-MY',{day:'2-digit',month:'short',year:'numeric'}) }}</time><span>{{ new Date(event.occurredAt).toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'}) }}</span></div><div class="timeline-content"><strong>{{ event.title }}</strong><p>{{ event.detail }}</p><span>{{ event.category }} · {{ event.type }}<template v-if="event.synthetic"> · Sample event</template></span></div></li></ol>
      <p v-else class="empty-timeline">No events match this filter. Imported events are never invented when a source is missing.</p>
    </section>

    <section class="panel account-details">
      <div class="panel-heading"><div><span class="eyebrow">Retention history</span><h3>Past actions and recorded outcomes</h3><p>Workflow completion and customer outcome are reported independently.</p></div></div>
      <div v-if="actions.length" class="signal-grid"><div v-for="action in [...actions].sort((a,b)=>b.createdAt.localeCompare(a.createdAt))" :key="action.id"><span>{{ action.createdAt.slice(0,10) }} · {{ action.owner }}</span><strong>{{ action.title }}</strong><p>{{ action.status }} · {{ action.customerResponse }} · {{ action.outcome }}</p></div></div>
      <p v-else>No retention actions have been recorded for this customer.</p>
    </section>

    <p class="method-note">Method note: risk scores use transparent rule-based signals. A trained, validated churn model can replace this scoring layer without changing the product workflow.</p>
  </div>
</template>

<style scoped>
.timeline-panel{padding-bottom:10px}.timeline-filters{display:flex;flex-wrap:wrap;gap:8px;margin:18px 30px}.timeline-filters button{padding:8px 12px;border:1px solid var(--color-border);border-radius:999px;background:#fff}.timeline-filters button.active{color:#fff;background:#171717}.timeline{display:grid;margin:0;padding:0 30px;list-style:none}.timeline li{position:relative;display:grid;grid-template-columns:150px minmax(0,1fr);gap:24px;padding:20px 0;border-top:1px solid var(--color-border)}.timeline li::before{position:absolute;top:25px;left:143px;width:9px;height:9px;border:3px solid #fff;border-radius:50%;background:var(--color-brown);box-shadow:0 0 0 1px var(--color-border);content:''}.timeline-date{display:grid;align-content:start;gap:3px;padding-right:12px;text-align:right}.timeline-date time{color:var(--color-ink);font-size:13px;font-weight:800}.timeline-date span,.timeline-content>span{color:var(--color-muted);font-size:12px}.timeline-content{min-width:0;padding-left:10px}.timeline-content strong{font-size:15px}.timeline p{margin:5px 0;overflow-wrap:anywhere}.empty-timeline{padding:30px;color:var(--color-muted);text-align:center}
.customer-detail-page { display: grid; gap: 24px; max-width: 1540px; margin: 0 auto; padding: 32px clamp(24px, 3vw, 48px) 56px; }
.back-button { display: inline-flex; align-items: center; gap: 10px; width: fit-content; min-height: 46px; padding: 0 14px; border: 1px solid #d8deed; border-radius: 13px; color: #34406e; background: #ffffff; font-size: 15px; font-weight: 800; cursor: pointer; }
.back-button:hover { color: #fff; border-color: #171717; background: #171717; }
.customer-hero { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 32px; border: 1px solid #dce1ef; border-radius: 26px; background: #ffffff; box-shadow: 0 14px 36px rgba(44,65,57,.06); }
.identity-block { display: flex; align-items: center; gap: 20px; min-width: 0; }
.customer-avatar { display: grid; flex: 0 0 76px; place-items: center; width: 76px; height: 76px; border-radius: 22px; color: #fff; background: #171717; font-size: 22px; font-weight: 900; box-shadow: 0 12px 28px rgba(98,92,246,.20); }
.eyebrow { color: #5c6b91; font-size: 12px; font-weight: 850; text-transform: uppercase; letter-spacing: .12em; }.eyebrow.light { color: #b7c8df; }
h2 { margin: 8px 0 0; color: #171717; font-size: clamp(38px, 3vw, 50px); line-height: 1; letter-spacing: -.05em; }
.identity-block p { margin: 11px 0 0; color: #69769a; font-size: 16px; }
.hero-actions { display: flex; align-items: flex-end; gap: 12px; }
.status-field { display: grid; gap: 7px; }
.status-field > span { color: #64729a; font-size: 12px; font-weight: 850; text-transform: uppercase; letter-spacing: .08em; }
.status-field select { min-width: 170px; min-height: 52px; padding: 0 14px; border: 1px solid #d8deed; border-radius: 14px; color: #34406e; background: #f1f3fb; font-size: 15px; font-weight: 750; }
.scenario-button { min-height: 52px; padding: 0 18px; border: 0; border-radius: 14px; color: #fff; background: #171717; font-size: 15px; font-weight: 850; cursor: pointer; }
.summary-grid { display: grid; grid-template-columns: 1.45fr .55fr; gap: 20px; }
.health-summary, .revenue-summary { border-radius: 24px; box-shadow: 0 14px 36px rgba(44,65,57,.06); }
.health-summary { display: grid; grid-template-columns: auto 1fr; gap: 28px; align-items: center; padding: 30px; border: 1px solid #dce1ef; background: #ffffff; }
.health-ring { position: relative; display: grid; flex: 0 0 auto; place-items: center; width: 164px; height: 164px; border-radius: 50%; background: conic-gradient(#0f8f82 0 var(--score), #e2e6f1 var(--score) 360deg); }
.health-ring::before { content: ''; position: absolute; width: 124px; height: 124px; border-radius: 50%; background: #ffffff; }
.health-ring > div { position: relative; z-index: 1; text-align: center; }
.health-ring strong, .health-ring span { display: block; }
.health-ring strong { color: #171717; font-size: 46px; letter-spacing: -.06em; }
.health-ring span { margin-top: 5px; color: #69769a; font-size: 11px; font-weight: 850; text-transform: uppercase; letter-spacing: .08em; }
.risk-chip { display: inline-flex; padding: 9px 12px; border-radius: 999px; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: .05em; }
.risk-chip.high { color: #b93648; background: #fff0f2; }.risk-chip.medium { color: #8a5d1a; background: #fff3d6; }.risk-chip.low { color: #0f7e73; background: #ddf8f4; }
.health-summary h3 { margin: 16px 0 0; color: #27305f; font-size: 27px; line-height: 1.25; letter-spacing: -.035em; }
.health-summary p { margin: 10px 0 0; color: #69769a; font-size: 15px; }.health-summary p strong { color: #d13f52; }
.revenue-summary { padding: 30px; color: #fff; background: #171717; }
.revenue-summary > span { color: #b7c8df; font-size: 14px; font-weight: 750; }
.revenue-summary > strong { display: block; margin-top: 13px; font-size: clamp(38px, 3.2vw, 52px); line-height: 1; letter-spacing: -.055em; }
.revenue-summary > p { margin: 17px 0 0; color: #c8d4e7; font-size: 14px; line-height: 1.6; }
.revenue-summary > div { margin-top: 24px; padding: 16px; border: 1px solid rgba(255,255,255,.14); border-radius: 15px; background: rgba(255,255,255,.07); }
.revenue-summary > div span, .revenue-summary > div b { display: block; }.revenue-summary > div span { color: #b3c3d8; font-size: 12px; }.revenue-summary > div b { margin-top: 7px; color: #f8dfcf; font-size: 20px; }
.detail-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.detail-metrics article { min-height: 148px; padding: 22px; border: 1px solid #dfe3f1; border-radius: 20px; background: #ffffff; }
.detail-metrics span { color: #64729a; font-size: 14px; font-weight: 750; }.detail-metrics strong { display: block; margin-top: 11px; color: #27305f; font-size: 32px; letter-spacing: -.04em; }.detail-metrics strong.warning { color: #d94456; }.detail-metrics p { margin: 11px 0 0; color: #7a86a6; font-size: 13px; line-height: 1.45; }
.content-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(380px, .75fr); gap: 20px; }
.panel { overflow: hidden; border: 1px solid #dfe3f1; border-radius: 24px; background: #ffffff; box-shadow: 0 14px 36px rgba(44,65,57,.055); }
.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 28px 30px 0; }
.panel-heading h3 { margin: 8px 0 0; color: #171717; font-size: 27px; letter-spacing: -.04em; }.panel-heading p { margin: 9px 0 0; color: #69769a; font-size: 15px; line-height: 1.5; }
.count-chip { padding: 9px 12px; border-radius: 999px; color: #0f7e73; background: #f3f2f0; font-size: 13px; font-weight: 850; }
.reason-list { display: grid; margin: 18px 0 0; padding: 0 30px 26px; list-style: none; }
.reason-list li { display: grid; grid-template-columns: 38px 1fr auto; gap: 15px; align-items: start; padding: 18px 0; border-bottom: 1px solid #e9ecf5; }
.reason-list li:last-child { border-bottom: 0; }
.reason-number { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; color: #b93648; background: #fff0f2; font-size: 13px; font-weight: 900; }
.reason-list strong { color: #27305f; font-size: 16px; }.reason-list p { margin: 6px 0 0; color: #69769a; font-size: 14px; line-height: 1.55; }
.reason-category { padding: 7px 9px; border-radius: 9px; color: #5c6b91; background: #eef1fa; font-size: 11px; font-weight: 850; text-transform: uppercase; letter-spacing: .05em; }
.healthy-note { display: block ; color: #0f8f82; font-size: 16px; }
.recommendation-panel { position: relative; overflow: hidden; padding: 30px; border-radius: 24px; color: #fff; background: #171717; box-shadow: 0 16px 40px rgba(98,92,246,.20); }
.recommendation-icon { display: grid; place-items: center; width: 50px; height: 50px; margin-bottom: 22px; border-radius: 15px; color: #171717; background: #f8dfcf; font-size: 21px; }
.recommendation-panel h3 { margin: 12px 0 0; color: #fff; font-size: 30px; line-height: 1.2; letter-spacing: -.04em; }
.recommendation-panel > p { margin: 16px 0 0; color: #cad5e7; font-size: 15px; line-height: 1.65; }
.recommendation-stats { display: grid; gap: 10px; margin-top: 24px; }
.recommendation-stats > div { padding: 15px; border: 1px solid rgba(255,255,255,.13); border-radius: 14px; background: rgba(255,255,255,.06); }
.recommendation-stats span, .recommendation-stats strong { display: block; }.recommendation-stats span { color: #b3c3d8; font-size: 12px; }.recommendation-stats strong { margin-top: 6px; color: #fff; font-size: 17px; }
.recommendation-panel > button { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 54px; margin-top: 24px; padding: 0 17px; border: 0; border-radius: 14px; color: #171717; background: #f8dfcf; font-size: 15px; font-weight: 850; cursor: pointer; }
.signal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 24px 30px 30px; }
.signal-grid > div { padding: 18px; border: 1px solid #dfe4f0; border-radius: 16px; background: #f4f6fb; }
.signal-grid span, .signal-grid strong { display: block; }.signal-grid span { color: #64729a; font-size: 13px; }.signal-grid strong { margin-top: 8px; color: #27305f; font-size: 21px; }.signal-grid strong.warning { color: #d13f52; }
.method-note { margin: 0; color: #69769a; font-size: 13px; line-height: 1.55; text-align: center; }
@media (max-width: 1200px) { .summary-grid, .content-grid { grid-template-columns: 1fr; } .detail-metrics { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 760px) {
  .customer-detail-page { padding: 24px 16px 42px; }
  .customer-hero { align-items: flex-start; flex-direction: column; padding: 24px 20px; }
  .identity-block { align-items: flex-start; }.customer-avatar { width: 62px; height: 62px; flex-basis: 62px; border-radius: 18px; font-size: 18px; }
  h2 { font-size: 36px; }.hero-actions { width: 100%; align-items: stretch; flex-direction: column; }.status-field select, .scenario-button { width: 100%; }
  .health-summary { grid-template-columns: 1fr; text-align: center; }.health-ring { margin: auto; }
  .detail-metrics, .signal-grid { grid-template-columns: 1fr; }
  .panel-heading { padding: 24px 22px 0; }.reason-list { padding-inline: 22px; }.reason-category { display: none; }
  .timeline-filters{margin-inline:22px}.timeline{padding-inline:22px}.timeline li{grid-template-columns:1fr;gap:8px}.timeline li::before{display:none}.timeline-date{display:flex;gap:8px;padding:0;text-align:left}.timeline-content{padding:0}
}
</style>
