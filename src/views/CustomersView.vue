<script setup lang="ts">
import { computed, ref } from 'vue'
import CustomerTable from '@/components/CustomerTable.vue'
import type { Customer, Plan, RiskLevel } from '@/types/customer'

const props = defineProps<{ customers: Customer[] }>()
const emit = defineEmits<{ openCustomer: [customerId: number] }>()

const search = ref('')
const risk = ref<'All' | RiskLevel>('All')
const plan = ref<'All' | Plan>('All')
const utilisation = ref<'All' | 'Under-utilised'>('All')
const sortBy = ref<'Risk priority' | 'Revenue at risk' | 'Renewal soon'>('Risk priority')
const riskOptions: Array<'All' | RiskLevel> = ['All', 'High', 'Medium', 'Low']

const filteredCustomers = computed(() => {
  const query = search.value.trim().toLowerCase()
  const result = props.customers
    .filter((customer) => !query || `${customer.companyName} ${customer.industry}`.toLowerCase().includes(query))
    .filter((customer) => risk.value === 'All' || customer.riskLevel === risk.value)
    .filter((customer) => plan.value === 'All' || customer.plan === plan.value)
    .filter((customer) => utilisation.value === 'All' || customer.underUtilized)

  return [...result].sort((a, b) => {
    if (sortBy.value === 'Revenue at risk') return b.monthlyRevenueAtRisk - a.monthlyRevenueAtRisk
    if (sortBy.value === 'Renewal soon') return a.daysUntilRenewal - b.daysUntilRenewal
    return b.churnProbability - a.churnProbability || b.monthlyRevenue - a.monthlyRevenue
  })
})

const totalMRR = computed(() => filteredCustomers.value.reduce((sum, customer) => sum + customer.monthlyRevenue, 0))
const totalRiskMRR = computed(() => filteredCustomers.value.reduce((sum, customer) => sum + customer.monthlyRevenueAtRisk, 0))
const formatMoney = (amount: number) => `RM ${Math.round(amount).toLocaleString('en-MY')}`

function setRisk(level: 'All' | RiskLevel) {
  risk.value = level
}

function resetFilters() {
  search.value = ''
  risk.value = 'All'
  plan.value = 'All'
  utilisation.value = 'All'
  sortBy.value = 'Risk priority'
}

function exportCsv() {
  const headers = [
    'Customer', 'Industry', 'Plan', 'Monthly Revenue', 'Health Score', 'Churn Probability',
    'Risk Level', 'Feature Usage', 'Seat Utilisation', 'Open Tickets', 'Days Until Renewal', 'Monthly Revenue At Risk',
  ]
  const rows = filteredCustomers.value.map((customer) => [
    customer.companyName,
    customer.industry,
    customer.plan,
    customer.monthlyRevenue,
    customer.healthScore,
    customer.churnProbability,
    customer.riskLevel,
    customer.featureUsagePct,
    customer.seatUtilizationPct,
    customer.unresolvedTickets,
    customer.daysUntilRenewal,
    customer.monthlyRevenueAtRisk,
  ])
  const escapeCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'retentionx-customer-risk-export.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="customers-page">
    <section class="page-intro">
      <div>
        <span class="eyebrow">Customer intelligence</span>
        <h2>Find the accounts that need you most.</h2>
        <p>Explore account health, filter meaningful segments and open an explainable Customer 360 profile.</p>
      </div>
      <div class="intro-actions">
        <div class="portfolio-chip"><span>Filtered portfolio</span><strong>{{ formatMoney(totalMRR) }}</strong><small>{{ formatMoney(totalRiskMRR) }} monthly risk exposure</small></div>
        <button class="export-button" type="button" @click="exportCsv"><span>↓</span> Export CSV</button>
      </div>
    </section>

    <section class="filter-panel">
      <div class="filter-topline">
        <label class="search-field">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
          <input v-model="search" type="search" placeholder="Search company or industry" />
          <kbd>/</kbd>
        </label>
        <div class="risk-tabs" role="group" aria-label="Risk filter">
          <button v-for="level in riskOptions" :key="level" type="button" :class="{ active: risk === level }" @click="setRisk(level)">{{ level }}</button>
        </div>
      </div>
      <div class="filter-controls">
        <label><span>Plan</span><select v-model="plan"><option>All</option><option>Basic</option><option>Pro</option><option>Enterprise</option></select></label>
        <label><span>Utilisation</span><select v-model="utilisation"><option>All</option><option>Under-utilised</option></select></label>
        <label><span>Sort by</span><select v-model="sortBy"><option>Risk priority</option><option>Revenue at risk</option><option>Renewal soon</option></select></label>
        <span class="result-count"><strong>{{ filteredCustomers.length }}</strong> accounts shown</span>
        <button class="reset-button" type="button" @click="resetFilters">Reset filters</button>
      </div>
    </section>

    <section class="customer-table-panel">
      <div class="table-heading">
        <div><span class="eyebrow">Portfolio view</span><h3>Customer health and churn risk</h3><p>Click any account to inspect its signals, recommendation and revenue impact.</p></div>
        <div class="legend"><span class="high"></span> High <span class="medium"></span> Medium <span class="low"></span> Low</div>
      </div>
      <CustomerTable :customers="filteredCustomers" @select="emit('openCustomer', $event)" />
    </section>
  </div>
</template>

<style scoped>
.customers-page { display: grid; gap: 17px; width: min(100%, 1540px); margin: 0 auto; padding: 24px 26px 42px; }
.page-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding: 3px 2px 2px; }
.eyebrow { display: block; color: var(--rx-primary); font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .14em; }
h2 { margin: 8px 0 7px; color: var(--rx-ink); font-size: clamp(25px, 3vw, 34px); line-height: 1.08; letter-spacing: -.05em; }
.page-intro p { max-width: 650px; margin: 0; color: var(--rx-muted); font-size: 10px; line-height: 1.55; }
.intro-actions { display: flex; align-items: stretch; gap: 9px; }
.portfolio-chip { min-width: 215px; padding: 12px 14px; border: 1px solid var(--rx-border); border-radius: 14px; background: var(--rx-surface); box-shadow: var(--rx-shadow-sm); }
.portfolio-chip span, .portfolio-chip strong, .portfolio-chip small { display: block; }
.portfolio-chip span { color: #9a9fa8; font-size: 7.5px; font-weight: 850; text-transform: uppercase; letter-spacing: .08em; }
.portfolio-chip strong { margin-top: 5px; color: #30343a; font-size: 15px; letter-spacing: -.025em; }
.portfolio-chip small { margin-top: 3px; color: var(--rx-danger); font-size: 8px; }
.export-button { display: flex; align-items: center; gap: 8px; min-width: 112px; padding: 0 14px; border: 0; border-radius: 13px; color: var(--rx-lime-ink); background: var(--rx-lime); font-size: 9px; font-weight: 850; cursor: pointer; }
.export-button:hover { background: #e2ff91; }.export-button span { font-size: 14px; }
.filter-panel { overflow: hidden; border: 1px solid var(--rx-border); border-radius: 18px; background: var(--rx-surface); box-shadow: var(--rx-shadow-sm); }
.filter-topline { display: flex; gap: 12px; padding: 13px; border-bottom: 1px solid #eff0f2; }
.search-field { display: grid; grid-template-columns: auto 1fr auto; gap: 9px; align-items: center; flex: 1; min-height: 41px; padding: 0 11px; border: 1px solid var(--rx-border-strong); border-radius: 11px; background: #fafafb; }
.search-field svg { width: 17px; height: 17px; fill: none; stroke: #747b84; stroke-width: 1.8; }
.search-field input { width: 100%; border: 0; outline: 0; color: #353a41; background: transparent; font-size: 10px; }
kbd { min-width: 22px; padding: 4px; border: 1px solid #dedfe3; border-radius: 6px; color: #9298a1; background: #fff; font: 750 8px/1 Inter, sans-serif; text-align: center; }
.risk-tabs { display: flex; gap: 3px; padding: 4px; border: 1px solid var(--rx-border); border-radius: 11px; background: #f5f6f7; }
.risk-tabs button { min-width: 59px; border: 0; border-radius: 8px; color: #858b94; background: transparent; font-size: 8px; font-weight: 800; cursor: pointer; }
.risk-tabs button:hover { color: #4b515a; }.risk-tabs button.active { color: #fff; background: #1d2024; box-shadow: 0 2px 7px rgba(20,23,29,.12); }
.filter-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 11px 13px; }
.filter-controls label { display: flex; align-items: center; gap: 7px; min-height: 36px; padding: 0 9px; border: 1px solid var(--rx-border); border-radius: 10px; background: #fafafb; }
.filter-controls label > span { color: #9da2aa; font-size: 7.5px; font-weight: 850; text-transform: uppercase; letter-spacing: .06em; }
.filter-controls select { min-width: 88px; border: 0; outline: 0; color: #4a5058; background: transparent; font-size: 9px; font-weight: 750; }
.result-count { margin-left: auto; color: #969ba4; font-size: 8.5px; }.result-count strong { color: #464c54; }
.reset-button { min-height: 36px; padding: 0 11px; border: 1px solid var(--rx-border); border-radius: 10px; color: #777e87; background: #fff; font-size: 8px; font-weight: 800; cursor: pointer; }
.reset-button:hover { border-color: #c9ccd1; color: #4e545c; }
.customer-table-panel { overflow: hidden; border: 1px solid var(--rx-border); border-radius: 20px; background: var(--rx-surface); box-shadow: var(--rx-shadow-sm); }
.table-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 18px 20px 14px; border-bottom: 1px solid #eff0f2; }
.table-heading h3 { margin: 5px 0 0; color: #2d3137; font-size: 14px; letter-spacing: -.02em; }
.table-heading p { margin: 4px 0 0; color: #9da2aa; font-size: 8.5px; }
.legend { display: flex; align-items: center; gap: 5px; color: #969ca5; font-size: 8px; }
.legend span { width: 7px; height: 7px; margin-left: 7px; border-radius: 50%; }.legend .high { background: var(--rx-danger); }.legend .medium { background: var(--rx-warning); }.legend .low { background: var(--rx-success); }
@media (max-width: 900px) { .page-intro { align-items: flex-start; flex-direction: column; } .intro-actions { width: 100%; } .portfolio-chip { flex: 1; } .filter-topline { flex-direction: column; } .risk-tabs button { flex: 1; min-height: 33px; } }
@media (max-width: 700px) { .customers-page { padding: 17px 14px 30px; } .portfolio-chip { display: none; } .export-button { min-height: 39px; } .table-heading { align-items: flex-start; } .legend { display: none; } .filter-controls label { flex: 1 1 120px; } .filter-controls select { width: 100%; } .result-count { width: 100%; margin: 4px 0 0; } }
</style>
