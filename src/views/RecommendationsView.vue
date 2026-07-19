<script setup lang="ts">
import { computed, ref } from 'vue'
import RiskBadge from '@/components/RiskBadge.vue'
import type { Customer, Recommendation } from '@/types/customer'

const props = defineProps<{ customers: Customer[]; recommendations: Recommendation[] }>()
const emit = defineEmits<{ openCustomer: [customerId: number] }>()

const planned = ref<Set<number>>(new Set())
const filter = ref<'Priority' | 'All' | 'Critical' | 'High'>('Priority')
const customerMap = computed(() => new Map(props.customers.map((customer) => [customer.id, customer])))
const sortedRecommendations = computed(() => props.recommendations
  .filter((item) => filter.value === 'All' || filter.value === 'Priority' || item.priority === filter.value)
  .sort((a, b) => b.priorityScore - a.priorityScore))
const protectedRevenue = computed(() => props.recommendations.reduce((sum, item) => sum + item.potentialRevenueProtected, 0))
const urgentCount = computed(() => props.recommendations.filter((item) => item.timeframe.includes('24') || item.timeframe.includes('48')).length)
const formatMoney = (amount: number) => `RM ${amount.toLocaleString('en-MY')}`

function togglePlanned(customerId: number) {
  const next = new Set(planned.value)
  next.has(customerId) ? next.delete(customerId) : next.add(customerId)
  planned.value = next
}
</script>

<template>
  <div class="actions-page">
    <section class="page-intro">
      <div><span class="eyebrow">Decision support</span><h2>Prioritised retention actions</h2><p>Move from churn prediction to a clear next step, timeframe and estimated revenue impact.</p></div>
      <label class="filter-select"><span>View</span><select v-model="filter"><option>Priority</option><option>All</option><option>Critical</option><option>High</option></select></label>
    </section>

    <section class="action-metrics">
      <article><span class="metric-icon critical">!</span><div><small>Critical actions</small><strong>{{ recommendations.filter((item) => item.priority === 'Critical').length }}</strong></div></article>
      <article><span class="metric-icon clock">↗</span><div><small>Actions due within 48h</small><strong>{{ urgentCount }}</strong></div></article>
      <article><span class="metric-icon revenue">RM</span><div><small>Potential annual revenue protected</small><strong>{{ formatMoney(protectedRevenue) }}</strong></div></article>
      <article><span class="metric-icon planned">✓</span><div><small>Marked as planned</small><strong>{{ planned.size }}</strong></div></article>
    </section>

    <section class="action-list">
      <article v-for="(item, index) in sortedRecommendations" :key="item.customerId" class="action-card" :class="{ completed: planned.has(item.customerId) }">
        <div class="priority-rank"><span>#{{ String(index + 1).padStart(2, '0') }}</span><i></i></div>
        <div class="action-customer">
          <span class="avatar">{{ customerMap.get(item.customerId)?.companyName.slice(0, 2).toUpperCase() }}</span>
          <div><strong>{{ customerMap.get(item.customerId)?.companyName }}</strong><small>{{ customerMap.get(item.customerId)?.plan }} · {{ formatMoney(customerMap.get(item.customerId)?.monthlyRevenue ?? 0) }} MRR</small></div>
        </div>
        <div class="action-main">
          <div class="action-tags"><span class="type-tag">{{ item.actionType }}</span><span class="priority-tag" :class="item.priority.toLowerCase()">{{ item.priority }}</span></div>
          <h3>{{ item.action }}</h3>
          <p>{{ item.explanation }}</p>
        </div>
        <div class="action-impact">
          <div><span>Churn risk</span><RiskBadge v-if="customerMap.get(item.customerId)" :level="customerMap.get(item.customerId)?.riskLevel ?? 'Low'" :probability="customerMap.get(item.customerId)?.churnProbability ?? 0" /></div>
          <div><span>Target</span><strong>{{ item.timeframe }}</strong></div>
          <div><span>Revenue protected</span><strong class="revenue-value">{{ formatMoney(item.potentialRevenueProtected) }}</strong></div>
        </div>
        <div class="action-buttons">
          <button class="view-button" type="button" @click="emit('openCustomer', item.customerId)">View evidence</button>
          <button class="plan-button" :class="{ active: planned.has(item.customerId) }" type="button" @click="togglePlanned(item.customerId)">{{ planned.has(item.customerId) ? 'Planned ✓' : 'Mark as planned' }}</button>
        </div>
      </article>
    </section>

    <p class="disclaimer">Scenario estimates are directional prototype values, not causal guarantees. Production deployment should validate intervention uplift with historical outcomes or controlled experiments.</p>
  </div>
</template>

<style scoped>
.actions-page { display: grid; gap: 17px; padding: 25px 28px 38px; }
.page-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.eyebrow { display: block; color: #7c64e5; font-size: 9px; font-weight: 850; text-transform: uppercase; letter-spacing: .13em; }
h2 { margin: 7px 0 6px; color: #171c2e; font-size: 25px; letter-spacing: -.04em; }
.page-intro p { margin: 0; color: #858c9f; font-size: 11px; }
.filter-select { display: flex; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid #e4e7ef; border-radius: 11px; background: #fff; }
.filter-select span { color: #959bab; font-size: 9px; text-transform: uppercase; }
.filter-select select { height: 39px; border: 0; outline: 0; color: #454b5f; background: transparent; font-size: 11px; font-weight: 700; }
.action-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.action-metrics article { display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid #e7eaf1; border-radius: 16px; background: #fff; }
.metric-icon { display: grid; place-items: center; width: 39px; height: 39px; border-radius: 12px; font-size: 11px; font-weight: 900; }
.metric-icon.critical { color: #d53e5f; background: #ffedf1; } .metric-icon.clock { color: #b36b00; background: #fff5df; } .metric-icon.revenue { color: #187bb9; background: #eaf7ff; } .metric-icon.planned { color: #158264; background: #eaf9f3; }
.action-metrics small, .action-metrics strong { display: block; }
.action-metrics small { color: #9298aa; font-size: 9px; }
.action-metrics strong { margin-top: 5px; color: #2f3548; font-size: 17px; }
.action-list { display: grid; gap: 11px; }
.action-card { display: grid; grid-template-columns: 50px minmax(150px, .75fr) minmax(250px, 1.25fr) minmax(170px, .75fr) auto; gap: 16px; align-items: center; padding: 17px; border: 1px solid #e5e8f0; border-radius: 17px; background: #fff; box-shadow: 0 7px 24px rgba(31, 39, 69, .035); transition: .18s ease; }
.action-card:hover { transform: translateY(-1px); border-color: #d9d3ff; box-shadow: 0 12px 30px rgba(43, 47, 96, .07); }
.action-card.completed { opacity: .68; background: #f9fbfa; }
.priority-rank { align-self: stretch; display: flex; flex-direction: column; align-items: center; gap: 7px; }
.priority-rank span { color: #7762dc; font-size: 10px; font-weight: 850; }
.priority-rank i { width: 1px; flex: 1; min-height: 30px; background: linear-gradient(#d9d3ff, transparent); }
.action-customer { display: flex; align-items: center; gap: 9px; }
.avatar { display: grid; place-items: center; width: 37px; height: 37px; border-radius: 11px; color: #5d48c9; background: #eeeaff; font-size: 10px; font-weight: 850; }
.action-customer strong, .action-customer small { display: block; }
.action-customer strong { color: #303648; font-size: 11px; }
.action-customer small { margin-top: 4px; color: #979dae; font-size: 9px; }
.action-tags { display: flex; gap: 6px; }
.type-tag, .priority-tag { padding: 5px 7px; border-radius: 7px; font-size: 8px; font-weight: 850; text-transform: uppercase; letter-spacing: .05em; }
.type-tag { color: #6452c6; background: #f0edff; }
.priority-tag.critical { color: #cc3858; background: #ffebf0; } .priority-tag.high { color: #a76600; background: #fff1d6; } .priority-tag.normal { color: #14775d; background: #e8f8f2; }
.action-main h3 { margin: 7px 0 5px; color: #292f42; font-size: 12px; }
.action-main p { margin: 0; color: #848b9e; font-size: 9px; line-height: 1.5; }
.action-impact { display: grid; gap: 8px; padding-left: 14px; border-left: 1px solid #eef0f5; }
.action-impact > div { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.action-impact > div > span { color: #969cad; font-size: 8px; text-transform: uppercase; }
.action-impact strong { color: #4b5265; font-size: 9px; text-align: right; }
.action-impact .revenue-value { color: #117f61; font-size: 11px; }
.action-buttons { display: grid; gap: 7px; }
.action-buttons button { min-width: 105px; padding: 8px 10px; border-radius: 9px; font-size: 9px; font-weight: 750; cursor: pointer; }
.view-button { border: 1px solid #e1e4ec; color: #646b7f; background: #fff; }
.plan-button { border: 0; color: #fff; background: #6f56df; }
.plan-button.active { color: #17775e; background: #e7f7f1; }
.disclaimer { margin: 2px 4px 0; color: #9ba1b1; font-size: 9px; line-height: 1.45; }
@media (max-width: 1220px) { .action-card { grid-template-columns: 45px .75fr 1.25fr .75fr; } .action-buttons { grid-column: 2 / -1; grid-template-columns: auto auto; justify-content: end; } }
@media (max-width: 940px) { .action-metrics { grid-template-columns: 1fr 1fr; } .action-card { grid-template-columns: 40px 1fr; align-items: start; } .action-customer, .action-main, .action-impact, .action-buttons { grid-column: 2; } .action-impact { padding: 10px 0 0; border-top: 1px solid #eef0f5; border-left: 0; } .action-buttons { justify-content: stretch; } }
@media (max-width: 620px) { .actions-page { padding: 18px 14px 28px; } .action-metrics { grid-template-columns: 1fr; } .filter-select { display: none; } .action-card { padding: 14px 12px; } }
</style>
