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
          <td><button class="row-action" type="button" aria-label="View customer" @click.stop="emit('select', customer.id)">→</button></td>
        </tr>
      </tbody>
    </table>
    <div v-if="customers.length === 0" class="empty-table"><span>⌕</span><strong>No accounts found</strong><p>Adjust your search or reset the active filters.</p></div>
  </div>
</template>

<style scoped>
.table-shell { width: 100%; overflow-x: auto; }
table { width: 100%; min-width: 900px; border-collapse: collapse; }
th { padding: 17px 22px; color: #69769a; background: #f4f6fb; font-size: 13px; font-weight: 850; text-align: left; text-transform: uppercase; letter-spacing: .08em; border-bottom: 1px solid #e2e6f2; }
td { padding: 19px 22px; color: #4b625a; font-size: 16px; border-bottom: 1px solid #e9ecf5; vertical-align: middle; }
tbody tr { cursor: pointer; transition: background .15s ease, transform .15s ease; }
tbody tr:hover, tbody tr:focus-visible { outline: 0; background: #f0f2ff; }
tbody tr:last-child td { border-bottom: 0; }
.company-cell { display: flex; align-items: center; gap: 14px; min-width: 250px; }
.company-avatar { display: grid; place-items: center; width: 48px; height: 48px; border: 1px solid #b7c8df; border-radius: 15px; color: #5b5bd6; background: #e9edff; font-size: 13px; font-weight: 900; }
.company-cell strong, .company-cell small { display: block; }
.company-cell strong { color: #27305f; font-size: 16px; }
.company-cell small { margin-top: 5px; color: #7a86a6; font-size: 13px; }
.plan-tag { padding: 8px 11px; border: 1px solid; border-radius: 999px; font-size: 12px; font-weight: 850; }
.plan-tag.basic { color: #0f7e73; border-color: #bce8e1; background: #eaf3ee; }
.plan-tag.pro { color: #825d22; border-color: #f2dba7; background: #fbf0d4; }
.plan-tag.enterprise { color: #a94355; border-color: #edc7c4; background: #fff0f2; }
.health-cell { display: flex; align-items: center; gap: 11px; }
.health-cell > span { width: 34px; color: #34406e; font-size: 15px; font-weight: 850; }
.health-cell > div { width: 92px; height: 9px; overflow: hidden; border-radius: 99px; background: #e7eaf4; }
.health-cell i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #e45768, #d9a94e 52%, #16b8a6); }
.usage-value { color: #34406e; font-size: 15px; font-weight: 850; }.usage-value.weak { color: #d94456; }
.money { color: #27305f; font-size: 15px; white-space: nowrap; }
.row-action { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid #d8deed; border-radius: 13px; color: #34406e; background: #ffffff; font-size: 20px; cursor: pointer; }
.row-action:hover { color: #fff; border-color: #5b5bd6; background: #5b5bd6; }
.empty-table { display: grid; place-items: center; padding: 72px 24px; color: #69769a; text-align: center; }
.empty-table > span { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 17px; background: #e9edf7; font-size: 26px; }
.empty-table strong { margin-top: 14px; color: #34406e; font-size: 18px; }.empty-table p { margin: 7px 0 0; font-size: 15px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
@media (max-width: 700px) {
  .table-shell { overflow: visible; }
  table, thead, tbody, tr, td { display: block; min-width: 0; }
  thead { display: none; }
  tbody { display: grid; gap: 14px; padding: 14px; }
  tbody tr { position: relative; padding: 18px; border: 1px solid #dfe3f1; border-radius: 18px; background: #ffffff; }
  td { display: flex; align-items: center; justify-content: space-between; min-height: 43px; padding: 7px 0; border: 0; }
  td::before { content: attr(data-label); color: #69769a; font-size: 12px; font-weight: 850; text-transform: uppercase; letter-spacing: .06em; }
  td:first-child { display: block; padding-bottom: 14px; border-bottom: 1px solid #e8ebf4; }
  td:first-child::before, td:last-child::before { display: none; }
  td:last-child { position: absolute; top: 18px; right: 18px; }
  .company-cell { min-width: 0; padding-right: 50px; }
}
</style>
