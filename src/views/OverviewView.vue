<script setup lang="ts">
import { computed } from 'vue'
import CustomerTable from '@/components/CustomerTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import type { Customer, Recommendation, Plan } from '@/types/customer'
import type { RetentionAction } from '@/types/action'
import { annualRevenueAtRisk as getAnnualRevenueAtRisk, potentialProtectableArr, realisedSavedArr } from '@/utils/revenueMetrics'

const props = defineProps<{ customers: Customer[]; recommendations: Recommendation[]; actions: RetentionAction[] }>()
const emit = defineEmits<{ openCustomer: [customerId: number]; viewCustomers: []; viewActions: []; viewScenarios: [] }>()

const formatMoney = (amount: number) => `RM ${Math.round(amount).toLocaleString('en-MY')}`
const highRiskCustomers = computed(() => props.customers.filter((c) => c.riskLevel === 'High').sort((a, b) => b.monthlyRevenueAtRisk - a.monthlyRevenueAtRisk || b.churnProbability - a.churnProbability))
const underUtilized = computed(() => props.customers.filter((c) => c.underUtilized))
const monthlyRevenueAtRisk = computed(() => props.customers.reduce((sum, customer) => sum + customer.monthlyRevenueAtRisk, 0))
const annualRevenueAtRisk = computed(() => getAnnualRevenueAtRisk(props.customers))
const recoverableRevenue = computed(() => potentialProtectableArr(props.customers, props.recommendations, props.actions))
const savedRevenue = computed(() => realisedSavedArr(props.actions))
const untouchedHighRisk = computed(() => highRiskCustomers.value.filter((customer) => !props.actions.some(action => action.customerId === customer.id && action.status !== 'Completed')))
const actionCoverage = computed(() => Math.round(((highRiskCustomers.value.length - untouchedHighRisk.value.length) / Math.max(highRiskCustomers.value.length, 1)) * 100))
const averageHealth = computed(() => Math.round(props.customers.reduce((sum, customer) => sum + customer.healthScore, 0) / Math.max(props.customers.length, 1)))
const recoveryRate = computed(() => Math.min(100, Math.round((recoverableRevenue.value / Math.max(annualRevenueAtRisk.value, 1)) * 100)))

const riskDistribution = computed(() => {
  const total = props.customers.length
  return ['High', 'Medium', 'Low'].map((level) => {
    const count = props.customers.filter((customer) => customer.riskLevel === level).length
    return { level, count, pct: Math.round((count / Math.max(total, 1)) * 100) }
  })
})

const planRisk = computed(() => {
  const plans: Plan[] = ['Basic', 'Pro', 'Enterprise']
  return plans.map((plan) => {
    const group = props.customers.filter((customer) => customer.plan === plan)
    const value = group.reduce((sum, customer) => sum + customer.monthlyRevenueAtRisk, 0)
    return { plan, value, count: group.filter((customer) => customer.riskLevel === 'High').length }
  })
})
const maxPlanRisk = computed(() => Math.max(...planRisk.value.map((item) => item.value), 1))

const focusAccount = computed(() => highRiskCustomers.value[0] ?? props.customers[0])
const focusRecommendation = computed(() => props.recommendations.find((item) => item.customerId === focusAccount.value?.id))
</script>

<template>
  <div class="overview-page">
    <section class="portfolio-hero">
      <div class="hero-copy">
        <span class="hero-label"><i></i> Portfolio pulse</span>
        <h2>Protect recurring revenue before customers decide to leave.</h2>
        <p>RetentionX turns usage, support and payment signals into a clear daily action plan for customer-success teams.</p>
        <div class="hero-actions">
          <button class="primary-button" type="button" @click="emit('viewActions')">Review priority actions <span>→</span></button>
          <button class="secondary-button" type="button" @click="emit('viewScenarios')">Compare scenarios</button>
        </div>
      </div>

      <div class="recovery-summary">
        <span>Recoverable annual revenue</span>
        <strong>{{ formatMoney(recoverableRevenue) }}</strong>
        <div class="recovery-track"><i :style="{ width: `${recoveryRate}%` }"></i></div>
        <div class="recovery-meta">
          <div><b>{{ recoveryRate }}%</b><span>of annual risk can be protected</span></div>
          <div><b>{{ actionCoverage }}%</b><span>of high-risk accounts have an action</span></div>
        </div>
      </div>
    </section>

    <section class="metric-grid" aria-label="Portfolio metrics">
      <MetricCard label="Total customers" :value="customers.length.toLocaleString()" helper="Active subscription relationships" icon="customers" tone="neutral" />
      <MetricCard label="High-risk customers" :value="highRiskCustomers.length.toString()" :helper="`${untouchedHighRisk.length} still need an owner`" icon="risk" tone="red" />
      <MetricCard label="Under-utilised accounts" :value="underUtilized.length.toString()" helper="Plan or seat mismatch detected" icon="usage" tone="amber" />
      <MetricCard label="Annual Revenue at Risk" :value="formatMoney(annualRevenueAtRisk)" helper="Annual revenue exposure weighted by transparent churn risk" icon="revenue" tone="blue" />
    </section>

    <section class="decision-grid">
      <article class="panel health-panel">
        <div class="panel-heading">
          <div>
            <span class="eyebrow">Customer health</span>
            <h3>Portfolio risk overview</h3>
            <p>See the current churn mix and where revenue exposure is concentrated.</p>
          </div>
          <span class="live-chip"><i></i> Live snapshot</span>
        </div>

        <div class="health-body">
          <div class="health-donut" :style="{ '--high': `${riskDistribution[0]?.pct ?? 0}%`, '--medium': `${(riskDistribution[0]?.pct ?? 0) + (riskDistribution[1]?.pct ?? 0)}%` }">
            <div><strong>{{ averageHealth }}</strong><span>Average health</span></div>
          </div>

          <div class="risk-breakdown">
            <div v-for="item in riskDistribution" :key="item.level" class="risk-line" :class="item.level.toLowerCase()">
              <div><span><i></i>{{ item.level }} risk</span><strong>{{ item.count }} accounts</strong></div>
              <div class="bar-track"><i :style="{ width: `${item.pct}%` }"></i></div>
              <small>{{ item.pct }}% of the customer portfolio</small>
            </div>
          </div>
        </div>

        <div class="plan-exposure">
          <div v-for="item in planRisk" :key="item.plan">
            <span>{{ item.plan }}</span>
            <strong>{{ formatMoney(item.value) }}</strong>
            <div><i :style="{ width: `${Math.max(8, (item.value / maxPlanRisk) * 100)}%` }"></i></div>
            <small>{{ item.count }} high-risk accounts</small>
          </div>
        </div>
      </article>

      <article v-if="focusAccount && focusRecommendation" class="priority-panel">
        <div class="panel-heading compact">
          <div><span class="eyebrow light">Next best action</span><h3>Today's priority</h3></div>
          <span class="priority-pill">Critical</span>
        </div>

        <button class="priority-customer" type="button" @click="emit('openCustomer', focusAccount.id)">
          <span class="focus-avatar">{{ focusAccount.companyName.slice(0, 2).toUpperCase() }}</span>
          <span><strong>{{ focusAccount.companyName }}</strong><small>{{ focusAccount.plan }} · {{ formatMoney(focusAccount.monthlyRevenue) }}/month</small></span>
          <b>{{ focusAccount.churnProbability }}%</b>
        </button>

        <div class="action-copy">
          <span>Recommended intervention</span>
          <h4>{{ focusRecommendation.action }}</h4>
          <p>{{ focusRecommendation.explanation }}</p>
        </div>

        <div class="action-value-grid">
          <div><span>Potential revenue protected</span><strong>{{ formatMoney(focusRecommendation.potentialRevenueProtected) }}</strong></div>
          <div><span>Recommended timeframe</span><strong>{{ focusRecommendation.timeframe }}</strong></div>
        </div>

        <button class="priority-cta" type="button" @click="emit('openCustomer', focusAccount.id)">Open customer 360 <span>→</span></button>
      </article>
    </section>

    <section class="panel customer-panel">
      <div class="panel-heading table-heading">
        <div>
          <span class="eyebrow">Priority accounts</span>
          <h3>High-risk customers</h3>
          <p>Start with accounts that combine high risk indicator and meaningful recurring revenue.</p>
        </div>
        <button type="button" @click="emit('viewCustomers')">View all customers →</button>
      </div>
      <CustomerTable :customers="highRiskCustomers.slice(0, 5)" compact @select="emit('openCustomer', $event)" />
    </section>

    <p class="overview-note">Directional decision support based on the active dataset. Production use requires validated historical outcomes.</p>
  </div>
</template>

<style scoped>
.overview-page { display: grid; gap: 24px; max-width: 1640px; margin: 0 auto; padding: 32px clamp(24px, 3vw, 48px) 56px; }
.portfolio-hero { position: relative; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(400px, .75fr); gap: 36px; align-items: center; min-height: 330px; overflow: hidden; padding: 42px; border: 1px solid #dfe3f1; border-radius: 28px; color: #172033; background: linear-gradient(125deg, #fff 0%, #f1f0ff 60%, #e6faf7 100%); box-shadow: 0 18px 50px rgba(42,54,80,.09); }
.hero-label { display: inline-flex; align-items: center; gap: 9px; color: #5b5ce2; font-size: 12px; font-weight: 850; text-transform: uppercase; letter-spacing: .12em; }
.hero-label i { width: 10px; height: 10px; border-radius: 50%; background: #f8dfcf; box-shadow: 0 0 0 6px rgba(242,207,120,.14); }
.hero-copy h2 { max-width: 760px; margin: 18px 0 0; font-size: clamp(42px, 4vw, 64px); line-height: 1.03; letter-spacing: -.055em; }
.hero-copy p { max-width: 650px; margin: 20px 0 0; color: #64708a; font-size: 17px; line-height: 1.65; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
.primary-button, .secondary-button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 54px; padding: 0 19px; border-radius: 15px; font-size: 16px; font-weight: 850; cursor: pointer; }
.primary-button { border: 0; color: #fff; background: #5b5ce2; box-shadow: 0 10px 24px rgba(91,92,226,.22); }
.primary-button:hover { transform: translateY(-2px); background: #4546bd; }
.secondary-button { border: 1px solid #ccd3e2; color: #29344b; background: rgba(255,255,255,.72); }
.secondary-button:hover { background: #fff; }
.recovery-summary { padding: 30px; border: 1px solid #e0e4ee; border-radius: 22px; background: rgba(255,255,255,.84); box-shadow: 0 16px 40px rgba(42,54,80,.08); backdrop-filter: blur(12px); }
.recovery-summary > span { color: #64708a; font-size: 14px; font-weight: 750; }
.recovery-summary > strong { display: block; margin-top: 12px; font-size: clamp(40px, 4vw, 58px); line-height: 1; letter-spacing: -.055em; }
.recovery-track { height: 10px; margin: 28px 0 20px; overflow: hidden; border-radius: 99px; background: #e7eaf2; }
.recovery-track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #f8dfcf, #81ded2); }
.recovery-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.recovery-meta div { padding: 16px; border-radius: 15px; background: #f5f7fb; }
.recovery-meta b, .recovery-meta span { display: block; }
.recovery-meta b { font-size: 21px; }.recovery-meta span { margin-top: 6px; color: #77839a; font-size: 13px; line-height: 1.45; }
.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.decision-grid { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(370px, .55fr); gap: 22px; }
.panel, .priority-panel { overflow: hidden; border: 1px solid #dfe3f1; border-radius: 26px; background: #ffffff; box-shadow: 0 14px 36px rgba(44,65,57,.06); }
.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 28px 30px 0; }
.panel-heading h3 { margin: 8px 0 0; color: #171717; font-size: 28px; letter-spacing: -.04em; }
.panel-heading p { margin: 9px 0 0; color: #69769a; font-size: 15px; line-height: 1.55; }
.eyebrow { color: #5c6b91; font-size: 12px; font-weight: 850; text-transform: uppercase; letter-spacing: .12em; }.eyebrow.light { color: #b3c3d8; }
.live-chip { display: inline-flex; align-items: center; gap: 8px; padding: 9px 12px; border: 1px solid #d8deed; border-radius: 999px; color: #5c6b91; background: #f1f3fb; font-size: 13px; font-weight: 750; white-space: nowrap; }
.live-chip i { width: 9px; height: 9px; border-radius: 50%; background: #28633d; }
.health-body { display: grid; grid-template-columns: 230px 1fr; gap: 38px; align-items: center; padding: 34px 34px 28px; }
.health-donut { position: relative; display: grid; place-items: center; width: 192px; height: 192px; margin: auto; border-radius: 50%; background: conic-gradient(#e45768 0 var(--high), #e9a23b var(--high) var(--medium), #28633d var(--medium) 100%); }
.health-donut::before { content: ''; position: absolute; width: 142px; height: 142px; border-radius: 50%; background: #ffffff; }
.health-donut > div { position: relative; z-index: 1; text-align: center; }
.health-donut strong, .health-donut span { display: block; }
.health-donut strong { color: #171717; font-size: 48px; letter-spacing: -.06em; }
.health-donut span { margin-top: 4px; color: #69769a; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.risk-breakdown { display: grid; gap: 23px; }
.risk-line > div:first-child { display: flex; justify-content: space-between; gap: 14px; color: #59688d; font-size: 15px; font-weight: 750; }
.risk-line > div:first-child span { display: inline-flex; align-items: center; gap: 10px; }
.risk-line > div:first-child i { width: 10px; height: 10px; border-radius: 50%; }
.risk-line.high i { background: #e45768; }.risk-line.medium i { background: #e9a23b; }.risk-line.low i { background: #28633d; }
.risk-line strong { color: #27305f; font-size: 15px; }
.bar-track { height: 10px; margin: 10px 0 8px; overflow: hidden; border-radius: 99px; background: #e6eaf4; }
.bar-track i { display: block; height: 100%; border-radius: inherit; }
.risk-line.high .bar-track i { background: #e45768; }.risk-line.medium .bar-track i { background: #e9a23b; }.risk-line.low .bar-track i { background: #28633d; }
.risk-line small { color: #7a86a6; font-size: 13px; }
.plan-exposure { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 0 30px 30px; }
.plan-exposure > div { padding: 18px; border: 1px solid #dfe4f0; border-radius: 17px; background: #f4f6fb; }
.plan-exposure span, .plan-exposure strong, .plan-exposure small { display: block; }
.plan-exposure > div > span { color: #69769a; font-size: 12px; font-weight: 850; text-transform: uppercase; letter-spacing: .08em; }
.plan-exposure strong { margin-top: 8px; color: #27305f; font-size: 19px; }
.plan-exposure > div > div { height: 8px; margin: 13px 0 9px; overflow: hidden; border-radius: 99px; background: #e2e6f1; }
.plan-exposure > div > div i { display: block; height: 100%; border-radius: inherit; background: #0f8f82; }
.plan-exposure small { color: #7a86a6; font-size: 12px; }
.priority-panel { padding: 0 28px 28px; color: #fff; background: #171717; border-color: #171717; }
.priority-panel .panel-heading { padding-inline: 0; }
.priority-panel .panel-heading h3 { color: #fff; }
.priority-pill { padding: 9px 11px; border-radius: 999px; color: #171717; background: #f8dfcf; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .06em; }
.priority-customer { display: grid; grid-template-columns: auto 1fr auto; gap: 14px; align-items: center; width: 100%; margin-top: 26px; padding: 16px; border: 1px solid rgba(255,255,255,.16); border-radius: 18px; color: #fff; background: rgba(255,255,255,.08); text-align: left; cursor: pointer; }
.focus-avatar { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; color: #171717; background: #dff7f3; font-size: 14px; font-weight: 900; }
.priority-customer strong, .priority-customer small { display: block; }
.priority-customer strong { font-size: 17px; }.priority-customer small { margin-top: 5px; color: #c3cee1; font-size: 13px; }
.priority-customer b { padding: 9px 10px; border-radius: 11px; color: #fff; background: #d94456; font-size: 15px; }
.action-copy { margin-top: 25px; }
.action-copy > span { color: #b3c3d8; font-size: 12px; font-weight: 850; text-transform: uppercase; letter-spacing: .09em; }
.action-copy h4 { margin: 10px 0 0; color: #fff; font-size: 24px; line-height: 1.25; letter-spacing: -.035em; }
.action-copy p { margin: 12px 0 0; color: #cad5e7; font-size: 15px; line-height: 1.65; }
.action-value-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; margin-top: 22px; }
.action-value-grid div { padding: 15px; border: 1px solid rgba(255,255,255,.13); border-radius: 15px; background: rgba(255,255,255,.06); }
.action-value-grid span, .action-value-grid strong { display: block; }
.action-value-grid span { color: #b3c3d8; font-size: 12px; line-height: 1.4; }.action-value-grid strong { margin-top: 7px; color: #fff; font-size: 16px; }
.priority-cta { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 54px; margin-top: 22px; padding: 0 17px; border: 0; border-radius: 15px; color: #171717; background: #f8dfcf; font-size: 15px; font-weight: 850; cursor: pointer; }
.table-heading { padding-bottom: 24px; }
.table-heading button { min-height: 46px; padding: 0 15px; border: 1px solid #c8d4e7; border-radius: 13px; color: #171717; background: #f3f2f0; font-size: 14px; font-weight: 800; cursor: pointer; }
.overview-note { margin: 2px 0 0; color: #69769a; font-size: 13px; text-align: center; }
@media (max-width: 1300px) {
  .portfolio-hero { grid-template-columns: 1fr; }
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
  .decision-grid { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .overview-page { gap: 18px; padding: 24px 16px 42px; }
  .portfolio-hero { min-height: 0; padding: 28px 22px; border-radius: 24px; }
  .hero-copy h2 { font-size: 40px; }
  .hero-copy p { font-size: 16px; }
  .recovery-meta, .metric-grid, .action-value-grid { grid-template-columns: 1fr; }
  .health-body { grid-template-columns: 1fr; gap: 26px; padding: 26px 22px; }
  .plan-exposure { grid-template-columns: 1fr; padding: 0 22px 22px; }
  .panel-heading { padding: 24px 22px 0; }
  .panel-heading h3 { font-size: 24px; }
}
</style>
