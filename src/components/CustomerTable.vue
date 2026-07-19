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
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="customer in customers" :key="customer.id" @click="emit('select', customer.id)">
          <td>
            <div class="company-cell">
              <span class="company-avatar">{{ customer.companyName.slice(0, 2).toUpperCase() }}</span>
              <span><strong>{{ customer.companyName }}</strong><small>{{ customer.industry }}</small></span>
            </div>
          </td>
          <td><span class="plan-tag" :class="customer.plan.toLowerCase()">{{ customer.plan }}</span></td>
          <td>
            <div class="health-cell"><span>{{ customer.healthScore }}</span><div><i :style="{ width: `${customer.healthScore}%` }"></i></div></div>
          </td>
          <td><RiskBadge :level="customer.riskLevel" :probability="customer.churnProbability" /></td>
          <td v-if="!compact"><span :class="['usage-value', { weak: customer.featureUsagePct < 35 }]">{{ customer.featureUsagePct }}%</span></td>
          <td><strong class="money">{{ formatMoney(customer.monthlyRevenue) }}</strong></td>
          <td><button class="row-action" type="button" aria-label="View customer">→</button></td>
        </tr>
      </tbody>
    </table>
    <div v-if="customers.length === 0" class="empty-table">No customers match the current filters.</div>
  </div>
</template>

<style scoped>
.table-shell { width: 100%; overflow-x: auto; }
table { width: 100%; min-width: 790px; border-collapse: collapse; }
th { padding: 13px 16px; color: #8b91a4; font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: .075em; border-bottom: 1px solid #edf0f5; }
td { padding: 15px 16px; color: #444a5d; font-size: 13px; border-bottom: 1px solid #f0f2f7; vertical-align: middle; }
tbody tr { cursor: pointer; transition: background .16s ease, transform .16s ease; }
tbody tr:hover { background: #faf9ff; }
tbody tr:last-child td { border-bottom: 0; }
.company-cell { display: flex; align-items: center; gap: 11px; min-width: 220px; }
.company-avatar { display: grid; place-items: center; width: 35px; height: 35px; border-radius: 11px; color: #5c46cc; background: #efedff; font-size: 11px; font-weight: 800; }
.company-cell strong { display: block; color: #24293b; font-size: 13px; }
.company-cell small { display: block; margin-top: 3px; color: #989eaf; font-size: 11px; }
.plan-tag { padding: 6px 9px; border-radius: 8px; font-size: 11px; font-weight: 700; }
.plan-tag.basic { color: #3d6d95; background: #edf6fd; }
.plan-tag.pro { color: #6c4fd4; background: #f2efff; }
.plan-tag.enterprise { color: #9a5b00; background: #fff4da; }
.health-cell { display: flex; align-items: center; gap: 9px; }
.health-cell > span { width: 24px; color: #363c4e; font-weight: 750; }
.health-cell > div { width: 64px; height: 6px; overflow: hidden; border-radius: 99px; background: #eceff4; }
.health-cell i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ef5571, #f2a43a, #23b485); }
.usage-value { font-weight: 750; color: #3a4356; }
.usage-value.weak { color: #d84666; }
.money { color: #282e40; font-size: 12px; white-space: nowrap; }
.row-action { display: grid; place-items: center; width: 30px; height: 30px; border: 1px solid #e1e5ee; border-radius: 9px; color: #6750e7; background: #fff; cursor: pointer; }
.row-action:hover { border-color: #8c79f7; background: #f5f2ff; }
.empty-table { padding: 48px 20px; color: #8f95a7; text-align: center; }
</style>
