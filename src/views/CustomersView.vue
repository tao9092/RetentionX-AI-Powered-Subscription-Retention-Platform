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

const filteredCustomers = computed(() => {
  const query = search.value.trim().toLowerCase()
  return props.customers
    .filter((customer) => !query || `${customer.companyName} ${customer.industry}`.toLowerCase().includes(query))
    .filter((customer) => risk.value === 'All' || customer.riskLevel === risk.value)
    .filter((customer) => plan.value === 'All' || customer.plan === plan.value)
    .filter((customer) => utilisation.value === 'All' || customer.underUtilized)
    .sort((a, b) => b.churnProbability - a.churnProbability || b.monthlyRevenue - a.monthlyRevenue)
})

const totalMRR = computed(() => filteredCustomers.value.reduce((sum, c) => sum + c.monthlyRevenue, 0))
const formatMoney = (amount: number) => `RM ${amount.toLocaleString('en-MY')}`
</script>

<template>
  <div class="customers-page">
    <section class="page-intro">
      <div><span class="eyebrow">Customer intelligence</span><h2>Customer health and churn risk</h2><p>Search the portfolio, filter important segments and open an explainable Customer 360 profile.</p></div>
      <div class="portfolio-chip"><span>Filtered MRR</span><strong>{{ formatMoney(totalMRR) }}</strong></div>
    </section>

    <section class="filter-bar">
      <label class="search-field"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg><input v-model="search" type="search" placeholder="Search company or industry" /></label>
      <label><span>Risk</span><select v-model="risk"><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></label>
      <label><span>Plan</span><select v-model="plan"><option>All</option><option>Basic</option><option>Pro</option><option>Enterprise</option></select></label>
      <label><span>Utilisation</span><select v-model="utilisation"><option>All</option><option>Under-utilised</option></select></label>
    </section>

    <section class="customer-table-panel">
      <div class="table-heading"><div><h3>{{ filteredCustomers.length }} accounts</h3><p>Sorted by churn probability and revenue impact</p></div><div class="legend"><span class="high"></span> High <span class="medium"></span> Medium <span class="low"></span> Low</div></div>
      <CustomerTable :customers="filteredCustomers" @select="emit('openCustomer', $event)" />
    </section>
  </div>
</template>

<style scoped>
.customers-page { display: grid; gap: 17px; padding: 25px 28px 38px; }
.page-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.eyebrow { display: block; color: #7c64e5; font-size: 9px; font-weight: 850; text-transform: uppercase; letter-spacing: .13em; }
h2 { margin: 7px 0 6px; color: #171c2e; font-size: 25px; letter-spacing: -.04em; }
.page-intro p { margin: 0; color: #858c9f; font-size: 11px; }
.portfolio-chip { min-width: 140px; padding: 12px 15px; border: 1px solid #e4e0ff; border-radius: 14px; background: #f8f6ff; }
.portfolio-chip span, .portfolio-chip strong { display: block; }
.portfolio-chip span { color: #8e83c5; font-size: 9px; }
.portfolio-chip strong { margin-top: 5px; color: #5d46cc; font-size: 16px; }
.filter-bar { display: flex; flex-wrap: wrap; gap: 9px; padding: 12px; border: 1px solid #e7eaf1; border-radius: 16px; background: #fff; box-shadow: 0 7px 23px rgba(31, 39, 69, .035); }
.filter-bar label { display: flex; align-items: center; gap: 7px; padding: 0 10px; border: 1px solid #e6e9f0; border-radius: 10px; background: #fafbfc; }
.filter-bar label > span { color: #9aa0b1; font-size: 9px; text-transform: uppercase; letter-spacing: .06em; }
.filter-bar select { min-width: 90px; height: 38px; border: 0; outline: 0; color: #444a5e; background: transparent; font-size: 11px; font-weight: 650; }
.search-field { flex: 1 1 260px; }
.search-field svg { width: 17px; height: 17px; fill: none; stroke: #8990a2; stroke-width: 1.7; }
.search-field input { width: 100%; height: 38px; border: 0; outline: 0; color: #394054; background: transparent; font-size: 11px; }
.customer-table-panel { overflow: hidden; border: 1px solid #e6e9f1; border-radius: 19px; background: #fff; box-shadow: 0 8px 28px rgba(30, 38, 66, .045); }
.table-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 19px 20px 14px; border-bottom: 1px solid #f0f2f6; }
.table-heading h3 { margin: 0; color: #292f42; font-size: 14px; }
.table-heading p { margin: 4px 0 0; color: #9aa0b0; font-size: 10px; }
.legend { display: flex; align-items: center; gap: 6px; color: #9298a9; font-size: 9px; }
.legend span { width: 7px; height: 7px; margin-left: 6px; border-radius: 50%; }
.legend .high { background: #e34c6a; } .legend .medium { background: #e7a42e; } .legend .low { background: #24af82; }
@media (max-width: 700px) { .customers-page { padding: 18px 14px 28px; } .page-intro { align-items: flex-start; } .portfolio-chip { display: none; } .table-heading { align-items: flex-start; } .legend { display: none; } }
</style>
