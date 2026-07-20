<script setup lang="ts">
import { computed } from 'vue'
import type { Customer } from '@/types/customer'
import type { ActionStatusMap } from '@/types/action'

const props = defineProps<{ customers: Customer[]; actionStatuses: ActionStatusMap }>()
const emit = defineEmits<{ openCustomer: [customerId: number]; viewActions: [] }>()

const formatMoney = (amount: number) => `RM ${Math.round(amount).toLocaleString('en-MY')}`
const medianMrr = computed(() => {
  const values = props.customers.map((customer) => customer.monthlyRevenue).sort((a, b) => a - b)
  if (!values.length) return 0
  const middle = Math.floor(values.length / 2)
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2
})

const segments = computed(() => {
  const protectNow = props.customers.filter((customer) => customer.riskLevel === 'High' && customer.monthlyRevenue >= medianMrr.value)
  const recoverAtScale = props.customers.filter((customer) => customer.riskLevel === 'High' && customer.monthlyRevenue < medianMrr.value)
  const nurture = props.customers.filter((customer) => customer.riskLevel !== 'High' && customer.monthlyRevenue >= medianMrr.value)
  const healthyGrowth = props.customers.filter((customer) => customer.riskLevel !== 'High' && customer.monthlyRevenue < medianMrr.value)
  return [
    { id: 'protect', title: 'Protect now', subtitle: 'High risk · High value', customers: protectNow, className: 'danger', action: 'Immediate human intervention' },
    { id: 'recover', title: 'Recover at scale', subtitle: 'High risk · Lower value', customers: recoverAtScale, className: 'warning', action: 'Automated recovery campaign' },
    { id: 'nurture', title: 'Nurture & expand', subtitle: 'Lower risk · High value', customers: nurture, className: 'growth', action: 'Adoption and expansion play' },
    { id: 'healthy', title: 'Healthy self-service', subtitle: 'Lower risk · Lower value', customers: healthyGrowth, className: 'healthy', action: 'Monitor with low-touch support' },
  ]
})

const industries = computed(() => {
  const map = new Map<string, { accounts: number; totalRisk: number; revenueAtRisk: number; highRisk: number }>()
  props.customers.forEach((customer) => {
    const item = map.get(customer.industry) ?? { accounts: 0, totalRisk: 0, revenueAtRisk: 0, highRisk: 0 }
    item.accounts += 1
    item.totalRisk += customer.churnProbability
    item.revenueAtRisk += customer.monthlyRevenueAtRisk
    if (customer.riskLevel === 'High') item.highRisk += 1
    map.set(customer.industry, item)
  })
  return [...map.entries()]
    .map(([industry, data]) => ({ industry, ...data, averageRisk: Math.round(data.totalRisk / data.accounts) }))
    .sort((a, b) => b.averageRisk - a.averageRisk || b.revenueAtRisk - a.revenueAtRisk)
    .slice(0, 6)
})

const riskDrivers = computed(() => {
  const counts = new Map<string, { count: number; severity: number }>()
  props.customers.forEach((customer) => customer.riskReasons.forEach((reason) => {
    const item = counts.get(reason.label) ?? { count: 0, severity: 0 }
    item.count += 1
    item.severity += reason.severity
    counts.set(reason.label, item)
  }))
  const max = Math.max(1, ...[...counts.values()].map((item) => item.count))
  return [...counts.entries()]
    .map(([label, data]) => ({ label, ...data, width: Math.round((data.count / max) * 100) }))
    .sort((a, b) => b.count - a.count || b.severity - a.severity)
    .slice(0, 7)
})

const renewalWindows = computed(() => [
  { label: 'Next 30 days', customers: props.customers.filter((customer) => customer.daysUntilRenewal <= 30), className: 'critical' },
  { label: '31–60 days', customers: props.customers.filter((customer) => customer.daysUntilRenewal > 30 && customer.daysUntilRenewal <= 60), className: 'attention' },
  { label: '61–90 days', customers: props.customers.filter((customer) => customer.daysUntilRenewal > 60 && customer.daysUntilRenewal <= 90), className: 'planned' },
  { label: 'Beyond 90 days', customers: props.customers.filter((customer) => customer.daysUntilRenewal > 90), className: 'stable' },
])

const highRiskCustomers = computed(() => props.customers.filter((customer) => customer.riskLevel === 'High'))
const coveredHighRisk = computed(() => highRiskCustomers.value.filter((customer) => {
  const status = props.actionStatuses[String(customer.id)] ?? 'Not started'
  return status !== 'Not started'
}).length)
const interventionCoverage = computed(() => highRiskCustomers.value.length ? Math.round((coveredHighRisk.value / highRiskCustomers.value.length) * 100) : 100)
const unprotectedRevenue = computed(() => highRiskCustomers.value
  .filter((customer) => (props.actionStatuses[String(customer.id)] ?? 'Not started') === 'Not started')
  .reduce((sum, customer) => sum + customer.monthlyRevenueAtRisk, 0))
const upcomingRevenue = computed(() => props.customers.filter((customer) => customer.daysUntilRenewal <= 30).reduce((sum, customer) => sum + customer.monthlyRevenue, 0))
const underutilizedMrr = computed(() => props.customers.filter((customer) => customer.underUtilized).reduce((sum, customer) => sum + customer.monthlyRevenue, 0))

function segmentRevenue(customers: Customer[]) {
  return customers.reduce((sum, customer) => sum + customer.monthlyRevenueAtRisk, 0)
}

function printReport() {
  window.print()
}
</script>

<template>
  <div class="insights-page">
    <section class="page-intro">
      <div><span class="eyebrow">Portfolio intelligence</span><h2>Strategic Retention Insights</h2><p>Translate account-level churn signals into portfolio segments, renewal exposure and management priorities.</p></div>
      <button class="report-button" type="button" @click="printReport"><span>↗</span> Print executive report</button>
    </section>

    <section class="insight-metrics">
      <article><span class="metric-icon coverage">✓</span><div><small>High-risk action coverage</small><strong>{{ interventionCoverage }}%</strong><p>{{ coveredHighRisk }} of {{ highRiskCustomers.length }} accounts activated</p></div></article>
      <article><span class="metric-icon exposed">!</span><div><small>Unprotected monthly revenue</small><strong>{{ formatMoney(unprotectedRevenue) }}</strong><p>High-risk accounts without an action</p></div></article>
      <article><span class="metric-icon renewal">30</span><div><small>MRR renewing within 30 days</small><strong>{{ formatMoney(upcomingRevenue) }}</strong><p>Immediate renewal window exposure</p></div></article>
      <article><span class="metric-icon utilisation">↘</span><div><small>Under-utilised MRR</small><strong>{{ formatMoney(underutilizedMrr) }}</strong><p>Plan-fit or adoption opportunity</p></div></article>
    </section>

    <section class="matrix-panel panel">
      <div class="panel-heading"><div><span class="eyebrow">Risk × value</span><h3>Portfolio decision matrix</h3><p>Accounts are segmented using churn risk and portfolio median MRR of {{ formatMoney(medianMrr) }}.</p></div><button type="button" class="text-button" @click="emit('viewActions')">Open action queue →</button></div>
      <div class="matrix-axis top-axis"><span>Lower churn risk</span><span>Higher churn risk</span></div>
      <div class="matrix-layout">
        <div class="vertical-axis"><span>Higher customer value</span><i></i><span>Lower customer value</span></div>
        <div class="matrix-grid">
          <article v-for="segment in segments" :key="segment.id" class="segment" :class="segment.className">
            <div class="segment-heading"><div><span>{{ segment.subtitle }}</span><h4>{{ segment.title }}</h4></div><strong>{{ segment.customers.length }}</strong></div>
            <p>{{ segment.action }}</p>
            <div class="segment-value"><span>Monthly revenue at risk</span><strong>{{ formatMoney(segmentRevenue(segment.customers)) }}</strong></div>
            <div class="account-chips">
              <button v-for="customer in segment.customers.slice(0, 4)" :key="customer.id" type="button" @click="emit('openCustomer', customer.id)"><span>{{ customer.companyName.slice(0, 2).toUpperCase() }}</span><small>{{ customer.companyName }}</small></button>
              <span v-if="segment.customers.length === 0" class="empty-chip">No accounts</span>
              <span v-else-if="segment.customers.length > 4" class="more-chip">+{{ segment.customers.length - 4 }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="analytics-grid">
      <article class="panel hotspot-panel">
        <div class="panel-heading"><div><span class="eyebrow">Segment risk</span><h3>Industry hotspots</h3></div><span class="small-label">Top 6</span></div>
        <div class="hotspot-list">
          <div v-for="(item, index) in industries" :key="item.industry" class="hotspot-row">
            <span class="rank">{{ index + 1 }}</span><div class="hotspot-copy"><strong>{{ item.industry }}</strong><small>{{ item.accounts }} accounts · {{ item.highRisk }} high risk</small></div><div class="risk-meter"><i :style="{ width: `${item.averageRisk}%` }"></i></div><strong class="risk-number">{{ item.averageRisk }}%</strong><span class="risk-revenue">{{ formatMoney(item.revenueAtRisk) }}</span>
          </div>
        </div>
      </article>

      <article class="panel driver-panel">
        <div class="panel-heading"><div><span class="eyebrow">Explainability</span><h3>Most common risk drivers</h3></div><span class="small-label">Portfolio frequency</span></div>
        <div class="driver-list">
          <div v-for="driver in riskDrivers" :key="driver.label" class="driver-row"><div><strong>{{ driver.label }}</strong><span>{{ driver.count }} accounts</span></div><div class="driver-bar"><i :style="{ width: `${driver.width}%` }"></i></div></div>
        </div>
      </article>
    </section>

    <section class="renewal-panel panel">
      <div class="panel-heading"><div><span class="eyebrow">Renewal readiness</span><h3>Renewal exposure by window</h3></div><span class="small-label">Prioritise before contract end</span></div>
      <div class="renewal-grid">
        <article v-for="window in renewalWindows" :key="window.label" :class="window.className">
          <span>{{ window.label }}</span><strong>{{ window.customers.length }} accounts</strong><p>{{ formatMoney(window.customers.reduce((sum, customer) => sum + customer.monthlyRevenue, 0)) }} MRR</p>
          <div class="mini-accounts"><button v-for="customer in window.customers.slice(0, 3)" :key="customer.id" type="button" @click="emit('openCustomer', customer.id)">{{ customer.companyName.slice(0, 2).toUpperCase() }}</button><i v-if="window.customers.length > 3">+{{ window.customers.length - 3 }}</i></div>
        </article>
      </div>
    </section>

    <p class="disclaimer">Portfolio segments are decision-support heuristics based on the active dataset. They should be validated against business capacity, customer value definitions and historical retention outcomes.</p>
  </div>
</template>

<style scoped>
.insights-page{display:grid;gap:17px;width:min(100%,1540px);margin:0 auto;padding:24px 26px 42px}.page-intro,.panel-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.eyebrow{display:block;color:var(--rx-primary);font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.14em}h2{margin:8px 0 7px;color:var(--rx-ink);font-size:clamp(25px,3vw,34px);letter-spacing:-.05em}.page-intro p,.panel-heading p{max-width:680px;margin:0;color:var(--rx-muted);font-size:10px;line-height:1.55}.report-button{display:flex;align-items:center;gap:8px;min-height:38px;padding:0 12px;border:1px solid var(--rx-border-strong);border-radius:11px;color:#555c65;background:#fff;font-size:8px;font-weight:850;cursor:pointer}.insight-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.insight-metrics article{display:flex;align-items:center;gap:11px;min-height:88px;padding:15px;border:1px solid var(--rx-border);border-radius:17px;background:#fff;box-shadow:var(--rx-shadow-sm)}.metric-icon{display:grid;place-items:center;width:39px;height:39px;border-radius:12px;font-size:9px;font-weight:900}.coverage{color:var(--rx-success);background:var(--rx-success-soft)}.exposed{color:var(--rx-danger);background:var(--rx-danger-soft)}.renewal{color:var(--rx-warning);background:var(--rx-warning-soft)}.utilisation{color:var(--rx-blue);background:var(--rx-blue-soft)}.insight-metrics small,.insight-metrics strong,.insight-metrics p{display:block}.insight-metrics small{color:#989da6;font-size:7px;font-weight:850;text-transform:uppercase}.insight-metrics strong{margin-top:5px;color:#30343a;font-size:15px}.insight-metrics p{margin:3px 0 0;color:#9ca1aa;font-size:7.5px}.panel{border:1px solid var(--rx-border);border-radius:19px;background:#fff;box-shadow:var(--rx-shadow-sm)}.matrix-panel,.hotspot-panel,.driver-panel,.renewal-panel{padding:18px}.panel-heading{align-items:flex-start}.panel-heading h3{margin:5px 0 4px;color:#30343a;font-size:13px}.text-button{border:0;color:var(--rx-primary);background:transparent;font-size:8px;font-weight:850;cursor:pointer}.small-label{color:#9ba0a8;font-size:7px;font-weight:850;text-transform:uppercase}.top-axis{display:flex;justify-content:space-around;margin:17px 0 7px 70px;color:#9ba0a8;font-size:7px;text-transform:uppercase;letter-spacing:.07em}.matrix-layout{display:grid;grid-template-columns:58px 1fr;gap:10px}.vertical-axis{display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;transform:rotate(180deg);color:#9ba0a8;font-size:7px;text-transform:uppercase;letter-spacing:.07em}.vertical-axis i{width:1px;height:38px;margin:8px 0;background:#dfe1e4}.matrix-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.segment{min-height:174px;padding:14px;border:1px solid;border-radius:14px}.segment.danger{border-color:#f4ccd4;background:#fff9fa}.segment.warning{border-color:#efdcb7;background:#fffbf4}.segment.growth{border-color:#ddd8fb;background:#faf9ff}.segment.healthy{border-color:#cce8df;background:#f7fcfa}.segment-heading{display:flex;justify-content:space-between;gap:12px}.segment-heading span{color:#999fa8;font-size:7px;text-transform:uppercase}.segment-heading h4{margin:4px 0 0;color:#383d44;font-size:11px}.segment-heading>strong{display:grid;place-items:center;width:31px;height:31px;border-radius:10px;color:#5143bc;background:rgba(102,86,232,.1);font-size:11px}.segment>p{margin:9px 0;color:#858c95;font-size:8px;line-height:1.45}.segment-value{padding-top:9px;border-top:1px solid rgba(120,126,136,.13)}.segment-value span,.segment-value strong{display:block}.segment-value span{color:#999fa8;font-size:7px}.segment-value strong{margin-top:4px;color:#3d4249;font-size:10px}.account-chips{display:flex;align-items:center;gap:4px;margin-top:11px}.account-chips button,.more-chip,.empty-chip{display:grid;place-items:center;height:29px;border:0;border-radius:9px}.account-chips button{width:29px;color:#5143bd;background:var(--rx-primary-soft);font-size:7px;font-weight:900;cursor:pointer}.account-chips button small{display:none}.more-chip{width:29px;color:#858c95;background:#eff0f2;font-size:7px}.empty-chip{width:auto;padding:0 9px;color:#9ba0a8;background:#f0f1f3;font-size:7px}.analytics-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:14px}.hotspot-list,.driver-list{display:grid;gap:7px;margin-top:13px}.hotspot-row{display:grid;grid-template-columns:22px minmax(120px,1fr) 90px 40px 72px;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #eff0f2}.rank{color:var(--rx-primary);font-size:8px;font-weight:900}.hotspot-copy strong,.hotspot-copy small{display:block}.hotspot-copy strong{color:#41474f;font-size:9px}.hotspot-copy small{margin-top:3px;color:#9aa0a8;font-size:7.5px}.risk-meter,.driver-bar{height:5px;overflow:hidden;border-radius:99px;background:#eceef0}.risk-meter i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--rx-primary),var(--rx-danger))}.risk-number{color:var(--rx-danger);font-size:9px}.risk-revenue{color:#7c838c;font-size:8px;text-align:right}.driver-row{display:grid;grid-template-columns:minmax(150px,1fr) .85fr;gap:12px;align-items:center}.driver-row>div:first-child{display:flex;justify-content:space-between;gap:8px}.driver-row strong{color:#454b53;font-size:8.5px}.driver-row span{color:#999fa8;font-size:7.5px}.driver-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--rx-primary),#5aa7ef)}.renewal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:13px}.renewal-grid article{padding:13px;border:1px solid var(--rx-border);border-radius:13px}.renewal-grid article.critical{border-color:#f4ccd4;background:#fff9fa}.renewal-grid article.attention{border-color:#efdcb7;background:#fffbf4}.renewal-grid article.planned{border-color:#ddd8fb;background:#faf9ff}.renewal-grid article.stable{border-color:#cce8df;background:#f7fcfa}.renewal-grid article>span{color:#969ca5;font-size:7px;text-transform:uppercase}.renewal-grid article>strong{display:block;margin-top:7px;color:#3b4047;font-size:10px}.renewal-grid article>p{margin:4px 0 0;color:#858c95;font-size:8px}.mini-accounts{display:flex;gap:4px;margin-top:10px}.mini-accounts button,.mini-accounts i{display:grid;place-items:center;width:27px;height:27px;border:0;border-radius:8px;color:#5143bd;background:var(--rx-primary-soft);font-size:7px;font-weight:900;font-style:normal;cursor:pointer}.mini-accounts i{color:#858c95;background:#eff0f2}.disclaimer{margin:0 3px;color:#9ba0a9;font-size:8px;line-height:1.5}@media(max-width:1120px){.insight-metrics{grid-template-columns:repeat(2,1fr)}.analytics-grid{grid-template-columns:1fr}.renewal-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:720px){.insights-page{padding:17px 14px 30px}.page-intro{align-items:flex-start;flex-direction:column}.matrix-layout{grid-template-columns:1fr}.vertical-axis,.top-axis{display:none}.matrix-grid{grid-template-columns:1fr}.hotspot-row{grid-template-columns:22px 1fr 40px}.risk-meter,.risk-revenue{display:none}.renewal-grid{grid-template-columns:1fr}}@media(max-width:480px){.insight-metrics{grid-template-columns:1fr}}@media print{.report-button,.text-button{display:none}.insights-page{padding:0}.panel,.insight-metrics article{box-shadow:none;break-inside:avoid}}
</style>