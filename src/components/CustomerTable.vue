<script setup lang="ts">
import RiskBadge from './RiskBadge.vue'
import type { Customer } from '@/types/customer'

defineProps<{ customers: Customer[]; compact?: boolean }>()
const emit = defineEmits<{ select: [customerId: number] }>()
const formatMoney = (amount: number) => `RM ${amount.toLocaleString('en-MY')}`
</script>

<template>
  <div class="table-shell">
    <table>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Plan</th>
          <th>Health</th>
          <th>Churn risk</th>
          <th v-if="!compact">Usage</th>
          <th>MRR</th>
          <th><span class="sr-only">Action</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="customer in customers" :key="customer.id" tabindex="0" @click="emit('select', customer.id)" @keydown.enter="emit('select', customer.id)">
          <td data-label="Customer">
            <div class="company-cell">
              <span class="company-avatar">{{ customer.companyName.slice(0, 2).toUpperCase() }}</span>
              <span><strong>{{ customer.companyName }}</strong><small>{{ customer.industry }}</small></span>
            </div>
          </td>
          <td data-label="Plan"><span class="plan-tag" :class="customer.plan.toLowerCase()">{{ customer.plan }}</span></td>
          <td data-label="Health">
            <div class="health-cell"><span>{{ customer.healthScore }}</span><div><i :style="{ width: `${customer.healthScore}%` }"></i></div></div>
          </td>
          <td data-label="Risk"><RiskBadge :level="customer.riskLevel" :probability="customer.churnProbability" /></td>
          <td v-if="!compact" data-label="Usage"><span :class="['usage-value', { weak: customer.featureUsagePct < 35 }]">{{ customer.featureUsagePct }}%</span></td>
          <td data-label="MRR"><strong class="money">{{ formatMoney(customer.monthlyRevenue) }}</strong></td>
          <td><button class="row-action" type="button" aria-label="View customer" @click.stop="emit('select', customer.id)">↗</button></td>
        </tr>
      </tbody>
    </table>
    <div v-if="customers.length === 0" class="empty-table"><span>⌕</span><strong>No accounts found</strong><p>Adjust your search or reset the active filters.</p></div>
  </div>
</template>

<style scoped>
.table-shell { width: 100%; overflow-x: auto; }
table { width: 100%; min-width: 760px; border-collapse: collapse; }
th { padding: 11px 16px; color: #9ba0a8; background: #fbfbfc; font-size: 8px; font-weight: 850; text-align: left; text-transform: uppercase; letter-spacing: .09em; border-bottom: 1px solid #eceef0; }
td { padding: 13px 16px; color: #454b54; font-size: 10px; border-bottom: 1px solid #f0f1f3; vertical-align: middle; }
tbody tr { cursor: pointer; transition: background .15s ease; }
tbody tr:hover, tbody tr:focus-visible { outline: 0; background: #f8f7fc; }
tbody tr:last-child td { border-bottom: 0; }
.company-cell { display: flex; align-items: center; gap: 10px; min-width: 210px; }
.company-avatar { display: grid; place-items: center; width: 35px; height: 35px; border: 1px solid #e5e2fb; border-radius: 11px; color: #5143c0; background: var(--rx-primary-soft); font-size: 9px; font-weight: 900; }
.company-cell strong, .company-cell small { display: block; }
.company-cell strong { color: #292d33; font-size: 10px; }
.company-cell small { margin-top: 4px; color: #9ba0a8; font-size: 8px; }
.plan-tag { padding: 6px 8px; border: 1px solid; border-radius: 8px; font-size: 8px; font-weight: 850; }
.plan-tag.basic { color: #356c96; border-color: #d4e8f8; background: #eff8ff; }
.plan-tag.pro { color: #5849c2; border-color: #ddd8fb; background: var(--rx-primary-soft); }
.plan-tag.enterprise { color: #8c6507; border-color: #efdfb7; background: #fff8e8; }
.health-cell { display: flex; align-items: center; gap: 8px; }
.health-cell > span { width: 23px; color: #444a52; font-size: 9px; font-weight: 850; }
.health-cell > div { width: 62px; height: 5px; overflow: hidden; border-radius: 99px; background: #eceef0; }
.health-cell i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--rx-danger), #e5a52f 55%, var(--rx-success)); }
.usage-value { color: #424850; font-weight: 850; }.usage-value.weak { color: var(--rx-danger); }
.money { color: #292e35; font-size: 9px; white-space: nowrap; }
.row-action { display: grid; place-items: center; width: 29px; height: 29px; border: 1px solid #dfe1e4; border-radius: 9px; color: #606770; background: #fff; cursor: pointer; }
.row-action:hover { color: #fff; border-color: var(--rx-primary); background: var(--rx-primary); }
.empty-table { display: grid; place-items: center; padding: 52px 20px; color: #9298a1; text-align: center; }
.empty-table > span { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; background: #f0f1f3; font-size: 21px; }
.empty-table strong { margin-top: 11px; color: #454b54; font-size: 11px; }.empty-table p { margin: 5px 0 0; font-size: 9px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
@media (max-width: 640px) {
  .table-shell { overflow: visible; }
  table, thead, tbody, tr, td { display: block; min-width: 0; }
  thead { display: none; }
  tbody { display: grid; gap: 10px; padding: 10px; }
  tbody tr { position: relative; padding: 13px; border: 1px solid var(--rx-border); border-radius: 14px; background: #fff; }
  td { display: flex; align-items: center; justify-content: space-between; min-height: 34px; padding: 5px 0; border: 0; }
  td::before { content: attr(data-label); color: #9aa0a8; font-size: 8px; font-weight: 850; text-transform: uppercase; letter-spacing: .06em; }
  td:first-child { display: block; padding-bottom: 10px; border-bottom: 1px solid #eff0f2; }
  td:first-child::before, td:last-child::before { display: none; }
  td:last-child { position: absolute; top: 13px; right: 13px; }
  .company-cell { min-width: 0; padding-right: 42px; }
}
</style>
