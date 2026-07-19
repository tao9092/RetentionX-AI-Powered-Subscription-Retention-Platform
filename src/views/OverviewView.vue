<script setup lang="ts">
import { computed } from 'vue'
import CustomerTable from '@/components/CustomerTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import type { Customer, Recommendation, Plan } from '@/types/customer'

const props = defineProps<{ customers: Customer[]; recommendations: Recommendation[] }>()
const emit = defineEmits<{ openCustomer: [customerId: number]; viewCustomers: []; viewActions: [] }>()

const formatMoney = (amount: number) => `RM ${Math.round(amount).toLocaleString('en-MY')}`
const highRiskCustomers = computed(() => props.customers.filter((c) => c.riskLevel === 'High').sort((a, b) => b.churnProbability - a.churnProbability))
const underUtilized = computed(() => props.customers.filter((c) => c.underUtilized))
const monthlyRevenueAtRisk = computed(() => props.customers.reduce((sum, customer) => sum + customer.monthlyRevenueAtRisk, 0))
const recoverableRevenue = computed(() => props.recommendations.reduce((sum, item) => sum + item.potentialRevenueProtected, 0))

const riskDistribution = computed(() => {
  const total = props.customers.length
  return ['High', 'Medium', 'Low'].map((level) => {
    const count = props.customers.filter((customer) => customer.riskLevel === level).length
    return { level, count, pct: Math.round((count / total) * 100) }
  })
})

const planRisk = computed(() => {
  const plans: Plan[] = ['Basic', 'Pro', 'Enterprise']
  return plans.map((plan) => {
    const group = props.customers.filter((customer) => customer.plan === plan)
    const value = group.reduce((sum, customer) => sum + customer.monthlyRevenueAtRisk, 0)
    return { plan, value }
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
</script>

<template>
  <div class="overview-page">
    <section class="hero-panel">
      <div>
        <span class="eyebrow">Subscription revenue command centre</span>
        <h2>Act before valuable customers leave.</h2>
        <p>RetentionX converts customer usage, support, payment and renewal signals into a prioritised retention plan.</p>
        <div class="hero-actions">
          <button class="primary-button" type="button" @click="emit('viewActions')">Review priority actions</button>
          <button class="secondary-button" type="button" @click="emit('viewCustomers')">Explore customers</button>
        </div>
      </div>
      <div class="impact-card">
        <span>Estimated annual revenue recoverable</span>
        <strong>{{ formatMoney(recoverableRevenue) }}</strong>
        <p>Based on transparent scenario estimates across the current demo portfolio.</p>
        <div class="impact-progress"><i :style="{ width: `${Math.min(78, Math.round((recoverableRevenue / Math.max(monthlyRevenueAtRisk * 12, 1)) * 100))}%` }"></i></div>
      </div>
    </section>

    <section class="metric-grid">
      <MetricCard label="Total customers" :value="customers.length.toLocaleString()" helper="Accounts in the active portfolio" icon="customers" tone="purple" />
      <MetricCard label="High-risk customers" :value="highRiskCustomers.length.toString()" helper="Require immediate retention attention" icon="risk" tone="red" />
      <MetricCard label="Under-utilised accounts" :value="underUtilized.length.toString()" helper="Low feature or licensed-seat usage" icon="usage" tone="amber" />
      <MetricCard label="Monthly revenue at risk" :value="formatMoney(monthlyRevenueAtRisk)" helper="Probability-weighted subscription revenue" icon="revenue" tone="blue" />
    </section>

    <section class="analytics-grid">
      <article class="panel risk-panel">
        <div class="panel-heading"><div><span class="eyebrow">Portfolio health</span><h3>Churn risk distribution</h3></div><span class="period-chip">Current snapshot</span></div>
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
        <div class="panel-heading"><div><span class="eyebrow">Commercial exposure</span><h3>Revenue at risk by plan</h3></div><span class="period-chip">Monthly</span></div>
        <div class="plan-bars">
          <div v-for="item in planRisk" :key="item.plan" class="plan-row">
            <div><span>{{ item.plan }}</span><strong>{{ formatMoney(item.value) }}</strong></div>
            <div class="vertical-track"><i :style="{ height: `${Math.max(8, (item.value / maxPlanRisk) * 100)}%` }"></i></div>
          </div>
        </div>
        <p class="chart-note">Enterprise exposure is prioritised by revenue impact, not churn probability alone.</p>
      </article>
    </section>

    <section class="bottom-grid">
      <article class="panel customer-panel">
        <div class="panel-heading"><div><span class="eyebrow">Priority queue</span><h3>Accounts requiring immediate action</h3></div><button type="button" @click="emit('viewCustomers')">View all customers →</button></div>
        <CustomerTable :customers="highRiskCustomers.slice(0, 5)" compact @select="emit('openCustomer', $event)" />
      </article>

      <article class="panel driver-panel">
        <div class="panel-heading"><div><span class="eyebrow">Explainability</span><h3>Top churn drivers</h3></div></div>
        <div class="driver-list">
          <div v-for="([driver, count], index) in riskDrivers" :key="driver">
            <span class="driver-rank">0{{ index + 1 }}</span>
            <div><strong>{{ driver }}</strong><small>Detected in {{ count }} priority accounts</small></div>
            <span class="driver-count">{{ count }}</span>
          </div>
        </div>
        <div class="insight-box"><span>✦</span><p><strong>Recommended focus:</strong> resolve support friction before using discounts. It is currently the most actionable signal among high-value accounts.</p></div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.overview-page { display: grid; gap: 19px; padding: 25px 28px 38px; }
.hero-panel { position: relative; overflow: hidden; display: grid; grid-template-columns: 1.4fr .75fr; gap: 28px; align-items: center; padding: 28px 30px; border-radius: 22px; color: #fff; background: radial-gradient(circle at 90% 10%, rgba(52, 198, 235, .23), transparent 30%), linear-gradient(125deg, #141a36, #26245c); box-shadow: 0 18px 45px rgba(34, 36, 86, .16); }
.hero-panel::after { content: ''; position: absolute; width: 210px; height: 210px; right: -70px; bottom: -120px; border: 1px solid rgba(255,255,255,.13); border-radius: 50%; }
.eyebrow { display: block; color: #8371ea; font-size: 9px; font-weight: 850; text-transform: uppercase; letter-spacing: .13em; }
.hero-panel .eyebrow { color: #9f91ff; }
.hero-panel h2 { margin: 8px 0 9px; font-size: clamp(25px, 3vw, 36px); line-height: 1.08; letter-spacing: -.045em; }
.hero-panel > div:first-child > p { max-width: 640px; margin: 0; color: #aab3d0; font-size: 12px; line-height: 1.6; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 20px; }
.primary-button, .secondary-button { padding: 10px 14px; border-radius: 10px; font-size: 11px; font-weight: 750; cursor: pointer; }
.primary-button { border: 0; color: #fff; background: linear-gradient(135deg, #7659ef, #3d8bea); box-shadow: 0 10px 20px rgba(68, 85, 222, .25); }
.secondary-button { border: 1px solid rgba(255,255,255,.15); color: #d9def0; background: rgba(255,255,255,.06); }
.impact-card { position: relative; z-index: 1; padding: 19px; border: 1px solid rgba(255,255,255,.13); border-radius: 17px; background: rgba(255,255,255,.07); backdrop-filter: blur(8px); }
.impact-card > span { color: #9fa8c6; font-size: 10px; }
.impact-card strong { display: block; margin-top: 7px; color: #fff; font-size: 27px; letter-spacing: -.04em; }
.impact-card p { margin: 8px 0 13px; color: #9fa8c6; font-size: 10px; line-height: 1.45; }
.impact-progress { height: 6px; border-radius: 99px; background: rgba(255,255,255,.1); }
.impact-progress i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #8570ff, #37c9e9); }
.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 13px; }
.analytics-grid { display: grid; grid-template-columns: 1.25fr .75fr; gap: 15px; }
.bottom-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(280px, .65fr); gap: 15px; }
.panel { border: 1px solid #e6e9f1; border-radius: 19px; background: #fff; box-shadow: 0 8px 28px rgba(30, 38, 66, .045); }
.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; padding: 19px 20px 14px; }
.panel-heading h3 { margin: 5px 0 0; color: #242a3c; font-size: 15px; letter-spacing: -.02em; }
.period-chip { padding: 6px 8px; border-radius: 8px; color: #858b9e; background: #f4f5f8; font-size: 9px; }
.risk-overview { display: grid; grid-template-columns: 170px 1fr; gap: 25px; align-items: center; padding: 8px 23px 24px; }
.donut { --high: 30%; --medium: 65%; display: grid; place-items: center; width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(#e34c6a 0 var(--high), #e7a42e var(--high) var(--medium), #24af82 var(--medium) 100%); }
.donut::before { content: ''; grid-area: 1/1; width: 105px; height: 105px; border-radius: 50%; background: #fff; }
.donut > div { z-index: 1; grid-area: 1/1; text-align: center; }
.donut strong { display: block; color: #22283a; font-size: 25px; }
.donut span { color: #949aac; font-size: 10px; }
.risk-bars { display: grid; gap: 13px; }
.risk-row > div:first-child { display: flex; align-items: center; justify-content: space-between; }
.risk-row > div:first-child span { display: inline-flex; align-items: center; gap: 7px; color: #62697d; font-size: 11px; }
.risk-row > div:first-child i { width: 7px; height: 7px; border-radius: 50%; }
.risk-row.high i { background: #e34c6a; } .risk-row.medium i { background: #e7a42e; } .risk-row.low i { background: #24af82; }
.risk-row strong { color: #363c4f; font-size: 12px; }
.bar-track { height: 6px; margin-top: 6px; overflow: hidden; border-radius: 99px; background: #eff1f5; }
.bar-track i { display: block; height: 100%; border-radius: inherit; }
.risk-row.high .bar-track i { background: #e34c6a; } .risk-row.medium .bar-track i { background: #e7a42e; } .risk-row.low .bar-track i { background: #24af82; }
.risk-row small { display: block; margin-top: 5px; color: #a1a6b5; font-size: 9px; }
.plan-bars { display: flex; align-items: flex-end; justify-content: space-around; height: 190px; padding: 5px 26px 0; }
.plan-row { display: flex; flex-direction: column; align-items: center; width: 25%; height: 100%; }
.plan-row > div:first-child { order: 2; margin-top: 9px; text-align: center; }
.plan-row span { display: block; color: #7f8699; font-size: 10px; }
.plan-row strong { display: block; margin-top: 3px; color: #33394c; font-size: 10px; }
.vertical-track { order: 1; position: relative; width: 34px; height: 135px; border-radius: 9px 9px 4px 4px; background: #f1f2f6; }
.vertical-track i { position: absolute; right: 0; bottom: 0; left: 0; border-radius: inherit; background: linear-gradient(180deg, #7459ee, #4ca6ea); }
.chart-note { margin: 15px 20px 18px; padding: 10px; border-radius: 10px; color: #747b8d; background: #f7f7fa; font-size: 9px; line-height: 1.45; }
.customer-panel { min-width: 0; overflow: hidden; }
.customer-panel .panel-heading button { border: 0; color: #6d55db; background: transparent; font-size: 10px; font-weight: 750; cursor: pointer; }
.driver-list { display: grid; padding: 0 19px; }
.driver-list > div { display: grid; grid-template-columns: 29px 1fr auto; gap: 9px; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f2f6; }
.driver-rank { color: #b4b8c5; font-size: 9px; font-weight: 800; }
.driver-list strong, .driver-list small { display: block; }
.driver-list strong { color: #3a4052; font-size: 11px; }
.driver-list small { margin-top: 3px; color: #9a9faf; font-size: 9px; }
.driver-count { display: grid; place-items: center; min-width: 26px; height: 26px; border-radius: 8px; color: #6f57dd; background: #f0edff; font-size: 10px; font-weight: 800; }
.insight-box { display: flex; gap: 9px; margin: 14px 18px 18px; padding: 12px; border: 1px solid #e6e1ff; border-radius: 12px; background: #faf9ff; }
.insight-box > span { color: #7259e7; }
.insight-box p { margin: 0; color: #747b8d; font-size: 9px; line-height: 1.55; }
.insight-box strong { color: #4a405f; }
@media (max-width: 1180px) { .metric-grid { grid-template-columns: 1fr 1fr; } .bottom-grid { grid-template-columns: 1fr; } }
@media (max-width: 930px) { .hero-panel, .analytics-grid { grid-template-columns: 1fr; } .impact-card { max-width: 430px; } }
@media (max-width: 620px) { .overview-page { padding: 17px 14px 28px; } .hero-panel { padding: 23px 20px; } .metric-grid { grid-template-columns: 1fr; } .risk-overview { grid-template-columns: 1fr; justify-items: center; } .risk-bars { width: 100%; } }
</style>
