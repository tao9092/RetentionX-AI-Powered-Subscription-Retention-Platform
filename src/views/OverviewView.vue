<script setup lang="ts">
import { computed } from 'vue'
import CustomerTable from '@/components/CustomerTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import type { Customer, Recommendation, Plan } from '@/types/customer'
import type { ActionStatusMap } from '@/types/action'

const props = defineProps<{ customers: Customer[]; recommendations: Recommendation[]; actionStatuses: ActionStatusMap }>()
const emit = defineEmits<{ openCustomer: [customerId: number]; viewCustomers: []; viewActions: []; viewScenarios: [] }>()

const formatMoney = (amount: number) => `RM ${Math.round(amount).toLocaleString('en-MY')}`
const highRiskCustomers = computed(() => props.customers.filter((c) => c.riskLevel === 'High').sort((a, b) => b.monthlyRevenueAtRisk - a.monthlyRevenueAtRisk || b.churnProbability - a.churnProbability))
const underUtilized = computed(() => props.customers.filter((c) => c.underUtilized))
const monthlyRevenueAtRisk = computed(() => props.customers.reduce((sum, customer) => sum + customer.monthlyRevenueAtRisk, 0))
const recoverableRevenue = computed(() => props.recommendations.reduce((sum, item) => sum + item.potentialRevenueProtected, 0))
const activeActions = computed(() => Object.values(props.actionStatuses).filter((status) => status === 'Planned' || status === 'In progress').length)
const completedActions = computed(() => Object.values(props.actionStatuses).filter((status) => status === 'Completed').length)
const untouchedHighRisk = computed(() => highRiskCustomers.value.filter((customer) => !props.actionStatuses[String(customer.id)] || props.actionStatuses[String(customer.id)] === 'Not started'))
const actionCoverage = computed(() => Math.round(((highRiskCustomers.value.length - untouchedHighRisk.value.length) / Math.max(highRiskCustomers.value.length, 1)) * 100))

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
    const count = group.filter((customer) => customer.riskLevel === 'High').length
    return { plan, value, count }
  })
})

const maxPlanRisk = computed(() => Math.max(...planRisk.value.map((item) => item.value), 1))

const riskDrivers = computed(() => {
  const counts = new Map<string, number>()
  props.customers.filter((c) => c.riskLevel !== 'Low').forEach((customer) => {
    customer.riskReasons.slice(0, 3).forEach((reason) => counts.set(reason.category, (counts.get(reason.category) ?? 0) + 1))
  })
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4)
})

const focusAccount = computed(() => highRiskCustomers.value[0] ?? props.customers[0])
const focusRecommendation = computed(() => props.recommendations.find((item) => item.customerId === focusAccount.value?.id))
</script>

<template>
  <div class="overview-page">
    <section class="briefing-grid">
      <article class="briefing-card">
        <div class="briefing-copy">
          <span class="eyebrow">Portfolio signal briefing</span>
          <h2>{{ highRiskCustomers.length }} accounts need attention before renewal.</h2>
          <p>RetentionX prioritises customers by churn probability, commercial value and intervention potential—not risk score alone.</p>
          <div class="briefing-actions">
            <button class="primary-button" type="button" @click="emit('viewActions')">Review priority actions <span>→</span></button>
            <button class="secondary-button" type="button" @click="emit('viewScenarios')">Compare scenarios</button>
          </div>
        </div>
        <div class="briefing-signal">
          <div class="signal-top"><span>Recoverable annual revenue</span><i>Live model</i></div>
          <strong>{{ formatMoney(recoverableRevenue) }}</strong>
          <div class="signal-foot"><span><b>{{ activeActions }}</b> active</span><span><b>{{ completedActions }}</b> completed</span><span><b>{{ actionCoverage }}%</b> covered</span></div>
        </div>
      </article>

      <article v-if="focusAccount && focusRecommendation" class="focus-card">
        <header><span class="eyebrow">Today’s focus</span><span class="priority-dot"></span></header>
        <div class="focus-customer">
          <span class="focus-avatar">{{ focusAccount.companyName.slice(0, 2).toUpperCase() }}</span>
          <div><strong>{{ focusAccount.companyName }}</strong><small>{{ focusAccount.plan }} · {{ focusAccount.industry }}</small></div>
          <span class="focus-risk">{{ focusAccount.churnProbability }}%</span>
        </div>
        <p>{{ focusRecommendation.action }}</p>
        <div class="focus-meta"><span>Protect <strong>{{ formatMoney(focusRecommendation.potentialRevenueProtected) }}</strong></span><span>{{ focusRecommendation.timeframe }}</span></div>
        <button type="button" @click="emit('openCustomer', focusAccount.id)">Open customer 360 <span>↗</span></button>
      </article>
    </section>

    <section class="metric-grid">
      <MetricCard label="Portfolio accounts" :value="customers.length.toLocaleString()" helper="Active subscription relationships" icon="customers" tone="purple" />
      <MetricCard label="High-risk accounts" :value="highRiskCustomers.length.toString()" :helper="`${untouchedHighRisk.length} still unassigned`" icon="risk" tone="red" />
      <MetricCard label="Under-utilised" :value="underUtilized.length.toString()" helper="Plan or seat mismatch detected" icon="usage" tone="amber" />
      <MetricCard label="Monthly risk exposure" :value="formatMoney(monthlyRevenueAtRisk)" helper="Probability-weighted recurring revenue" icon="revenue" tone="blue" />
    </section>

    <section class="analytics-grid">
      <article class="panel risk-panel">
        <div class="panel-heading"><div><span class="eyebrow">Portfolio health</span><h3>Churn risk distribution</h3><p>Current account mix by predicted churn band.</p></div><span class="period-chip">Current snapshot</span></div>
        <div class="risk-overview">
          <div class="donut" :style="{ '--high': `${riskDistribution[0]?.pct ?? 0}%`, '--medium': `${(riskDistribution[0]?.pct ?? 0) + (riskDistribution[1]?.pct ?? 0)}%` }"><div><strong>{{ highRiskCustomers.length }}</strong><span>high risk</span></div></div>
          <div class="risk-bars">
            <div v-for="item in riskDistribution" :key="item.level" class="risk-row" :class="item.level.toLowerCase()">
              <div><span><i></i>{{ item.level }}</span><strong>{{ item.count }}</strong></div>
              <div class="bar-track"><i :style="{ width: `${item.pct}%` }"></i></div>
              <small>{{ item.pct }}% of portfolio</small>
            </div>
          </div>
        </div>
      </article>

      <article class="panel plan-panel">
        <div class="panel-heading"><div><span class="eyebrow">Commercial exposure</span><h3>Revenue at risk by plan</h3><p>Monthly risk weighted by account value.</p></div><span class="period-chip">MRR</span></div>
        <div class="plan-bars">
          <div v-for="item in planRisk" :key="item.plan" class="plan-row">
            <div class="plan-value"><span>{{ item.plan }}</span><strong>{{ formatMoney(item.value) }}</strong><small>{{ item.count }} high risk</small></div>
            <div class="vertical-track"><i :style="{ height: `${Math.max(8, (item.value / maxPlanRisk) * 100)}%` }"></i></div>
          </div>
        </div>
      </article>
    </section>

    <section class="bottom-grid">
      <article class="panel customer-panel">
        <div class="panel-heading"><div><span class="eyebrow">Priority queue</span><h3>Accounts requiring immediate action</h3><p>Ranked by revenue exposure and churn likelihood.</p></div><button type="button" @click="emit('viewCustomers')">View all <span>→</span></button></div>
        <CustomerTable :customers="highRiskCustomers.slice(0, 5)" compact @select="emit('openCustomer', $event)" />
      </article>

      <article class="panel driver-panel">
        <div class="panel-heading"><div><span class="eyebrow">Explainability</span><h3>Top churn drivers</h3><p>Most frequent signals in priority accounts.</p></div></div>
        <div class="driver-list">
          <div v-for="([driver, count], index) in riskDrivers" :key="driver">
            <span class="driver-rank">{{ String(index + 1).padStart(2, '0') }}</span>
            <div><strong>{{ driver }}</strong><small>Detected in {{ count }} priority accounts</small></div>
            <span class="driver-count">{{ count }}</span>
          </div>
        </div>
        <div class="insight-box"><span>✦</span><p><strong>Best next move</strong>Resolve customer friction before discounting. Support issues are the most actionable signal in the current portfolio.</p></div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.overview-page { display: grid; gap: 18px; width: min(100%, 1540px); margin: 0 auto; padding: 24px 26px 42px; }
.eyebrow { display: block; color: var(--rx-primary); font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .14em; }
.briefing-grid { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(270px, .65fr); gap: 14px; }
.briefing-card { position: relative; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(250px, .65fr); gap: 24px; align-items: stretch; min-height: 224px; padding: 27px; border: 1px solid #262a30; border-radius: 22px; color: #fff; background: radial-gradient(circle at 78% 0%, rgba(113, 92, 240, .34), transparent 32%), #17191d; box-shadow: 0 18px 44px rgba(20,23,29,.12); }
.briefing-card::after { content: ''; position: absolute; right: -42px; bottom: -84px; width: 210px; height: 210px; border: 1px solid rgba(216,255,114,.15); border-radius: 50%; }
.briefing-copy { position: relative; z-index: 1; }
.briefing-copy .eyebrow { color: var(--rx-lime); }
.briefing-copy h2 { max-width: 660px; margin: 10px 0 10px; color: #fff; font-size: clamp(25px, 3vw, 38px); line-height: 1.06; letter-spacing: -.05em; }
.briefing-copy p { max-width: 620px; margin: 0; color: #9299a4; font-size: 11px; line-height: 1.65; }
.briefing-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 20px; }
.primary-button, .secondary-button { min-height: 39px; padding: 0 13px; border-radius: 11px; font-size: 9px; font-weight: 850; cursor: pointer; }
.primary-button { display: inline-flex; align-items: center; gap: 14px; border: 0; color: var(--rx-lime-ink); background: var(--rx-lime); }
.primary-button:hover { background: #e1ff8e; }
.primary-button span { font-size: 14px; }
.secondary-button { border: 1px solid #383c42; color: #cbd0d6; background: #23262b; }
.secondary-button:hover { border-color: #4a4f56; background: #292d32; }
.briefing-signal { position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: center; padding: 20px; border: 1px solid #34383e; border-radius: 17px; background: rgba(255,255,255,.045); }
.signal-top { display: flex; align-items: center; justify-content: space-between; color: #8f969f; font-size: 8px; text-transform: uppercase; letter-spacing: .08em; }
.signal-top i { padding: 5px 7px; border: 1px solid rgba(216,255,114,.24); border-radius: 7px; color: var(--rx-lime); background: rgba(216,255,114,.07); font-style: normal; font-weight: 850; }
.briefing-signal > strong { margin: 11px 0 17px; color: #fff; font-size: clamp(27px, 3vw, 38px); line-height: 1; letter-spacing: -.05em; }
.signal-foot { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
.signal-foot span { padding: 9px; border-radius: 10px; color: #858c95; background: #202328; font-size: 8px; }
.signal-foot b { display: block; margin-bottom: 4px; color: #f0f2f4; font-size: 11px; }
.focus-card { display: flex; flex-direction: column; min-height: 224px; padding: 19px; border: 1px solid var(--rx-border); border-radius: 22px; background: var(--rx-surface); box-shadow: var(--rx-shadow-sm); }
.focus-card header { display: flex; align-items: center; justify-content: space-between; }
.priority-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--rx-danger); box-shadow: 0 0 0 5px rgba(223,75,100,.1); }
.focus-customer { display: grid; grid-template-columns: auto 1fr auto; gap: 11px; align-items: center; margin-top: 18px; }
.focus-avatar { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; color: #4438b2; background: var(--rx-primary-soft); font-size: 10px; font-weight: 900; }
.focus-customer strong, .focus-customer small { display: block; }
.focus-customer strong { color: #292d33; font-size: 11px; }
.focus-customer small { margin-top: 4px; color: #979ca5; font-size: 8px; }
.focus-risk { padding: 7px 8px; border-radius: 9px; color: var(--rx-danger); background: var(--rx-danger-soft); font-size: 10px; font-weight: 900; }
.focus-card > p { flex: 1; margin: 15px 0; color: #5f6670; font-size: 10px; line-height: 1.55; }
.focus-meta { display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid #eff0f2; color: #9298a1; font-size: 8px; }
.focus-meta strong { color: #373c43; }
.focus-card > button { display: flex; justify-content: space-between; align-items: center; width: 100%; min-height: 37px; padding: 0 11px; border: 1px solid var(--rx-border-strong); border-radius: 10px; color: #444a53; background: #fafafb; font-size: 9px; font-weight: 800; cursor: pointer; }
.focus-card > button:hover { border-color: #c9ccd1; background: #f5f5f7; }
.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.analytics-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(300px, .8fr); gap: 14px; }
.bottom-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(300px, .65fr); gap: 14px; }
.panel { overflow: hidden; border: 1px solid var(--rx-border); border-radius: 20px; background: var(--rx-surface); box-shadow: var(--rx-shadow-sm); }
.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 19px 20px 0; }
.panel-heading h3 { margin: 5px 0 0; color: #2b2f35; font-size: 14px; letter-spacing: -.025em; }
.panel-heading p { margin: 4px 0 0; color: #a0a5ad; font-size: 8.5px; }
.period-chip { padding: 6px 8px; border: 1px solid var(--rx-border); border-radius: 8px; color: #838993; background: #fafafa; font-size: 8px; font-weight: 800; }
.panel-heading button { padding: 7px 9px; border: 0; color: var(--rx-primary); background: transparent; font-size: 9px; font-weight: 850; cursor: pointer; }
.panel-heading button span { margin-left: 7px; }
.risk-overview { display: grid; grid-template-columns: 180px 1fr; gap: 24px; align-items: center; padding: 21px 23px 24px; }
.donut { position: relative; display: grid; place-items: center; width: 146px; height: 146px; margin: auto; border-radius: 50%; background: conic-gradient(var(--rx-danger) 0 var(--high), #e2a02f var(--high) var(--medium), var(--rx-success) var(--medium) 100%); }
.donut::before { content: ''; position: absolute; width: 104px; height: 104px; border-radius: 50%; background: #fff; }
.donut > div { position: relative; z-index: 1; text-align: center; }
.donut strong, .donut span { display: block; }
.donut strong { color: #2c3036; font-size: 28px; letter-spacing: -.05em; }
.donut span { margin-top: 2px; color: #9a9fa8; font-size: 8px; text-transform: uppercase; letter-spacing: .09em; }
.risk-bars { display: grid; gap: 15px; }
.risk-row > div:first-child { display: flex; justify-content: space-between; color: #656b75; font-size: 9px; }
.risk-row > div:first-child span { display: inline-flex; align-items: center; gap: 7px; }
.risk-row > div:first-child i { width: 7px; height: 7px; border-radius: 50%; }
.risk-row.high i { background: var(--rx-danger); }.risk-row.medium i { background: #e2a02f; }.risk-row.low i { background: var(--rx-success); }
.risk-row strong { color: #353a41; font-size: 10px; }
.bar-track { height: 6px; margin: 7px 0 5px; overflow: hidden; border-radius: 99px; background: #eff0f2; }
.bar-track i { display: block; height: 100%; border-radius: inherit; }
.risk-row.high .bar-track i { background: var(--rx-danger); }.risk-row.medium .bar-track i { background: #e2a02f; }.risk-row.low .bar-track i { background: var(--rx-success); }
.risk-row small { color: #a2a7af; font-size: 8px; }
.plan-bars { display: flex; align-items: end; gap: 16px; height: 220px; padding: 25px 25px 20px; }
.plan-row { display: flex; flex: 1; flex-direction: column-reverse; height: 100%; gap: 12px; }
.vertical-track { position: relative; flex: 1; overflow: hidden; border-radius: 11px 11px 5px 5px; background: repeating-linear-gradient(to top, #f1f2f4 0 1px, transparent 1px 25%); }
.vertical-track i { position: absolute; right: 0; bottom: 0; left: 0; border-radius: 9px 9px 4px 4px; background: linear-gradient(180deg, #7d6cf0, #5646d7); }
.plan-row:nth-child(2) .vertical-track i { background: linear-gradient(180deg, #353a41, #1d2024); }
.plan-row:nth-child(3) .vertical-track i { background: linear-gradient(180deg, #d8ff72, #a9d83f); }
.plan-value span, .plan-value strong, .plan-value small { display: block; }
.plan-value span { color: #858b94; font-size: 8px; font-weight: 850; text-transform: uppercase; letter-spacing: .08em; }
.plan-value strong { margin-top: 4px; color: #373c43; font-size: 10px; }
.plan-value small { margin-top: 3px; color: #a3a8b0; font-size: 7.5px; }
.customer-panel { min-width: 0; }
.driver-list { display: grid; padding: 14px 20px 5px; }
.driver-list > div { display: grid; grid-template-columns: 28px 1fr auto; gap: 10px; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f1f3; }
.driver-list > div:last-child { border-bottom: 0; }
.driver-rank { color: #b0b4bb; font-size: 8px; font-weight: 900; }
.driver-list strong, .driver-list small { display: block; }
.driver-list strong { color: #383d44; font-size: 10px; }
.driver-list small { margin-top: 3px; color: #9ba0a8; font-size: 8px; }
.driver-count { display: grid; place-items: center; width: 29px; height: 29px; border-radius: 9px; color: #5143ca; background: var(--rx-primary-soft); font-size: 9px; font-weight: 900; }
.insight-box { display: grid; grid-template-columns: auto 1fr; gap: 10px; margin: 10px 15px 15px; padding: 13px; border: 1px solid #e8e5ff; border-radius: 13px; background: #f8f7ff; }
.insight-box > span { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; color: #fff; background: var(--rx-primary); font-size: 11px; }
.insight-box p { margin: 0; color: #747a85; font-size: 8.5px; line-height: 1.55; }
.insight-box strong { display: block; margin-bottom: 3px; color: #4e43b0; }
@media (max-width: 1180px) { .metric-grid { grid-template-columns: 1fr 1fr; } .briefing-grid { grid-template-columns: 1fr; } .focus-card { min-height: 0; } }
@media (max-width: 1000px) { .briefing-card { grid-template-columns: 1fr; } .analytics-grid, .bottom-grid { grid-template-columns: 1fr; } }
@media (max-width: 700px) { .overview-page { padding: 17px 14px 30px; } .metric-grid { grid-template-columns: 1fr; } .briefing-card { padding: 22px 18px; } .signal-foot { grid-template-columns: 1fr 1fr 1fr; } .risk-overview { grid-template-columns: 1fr; } .plan-bars { height: 200px; padding-inline: 16px; } }
</style>
