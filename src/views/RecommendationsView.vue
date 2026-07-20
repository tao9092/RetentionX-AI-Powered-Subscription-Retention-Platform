<script setup lang="ts">
import { computed, ref } from 'vue'
import RiskBadge from '@/components/RiskBadge.vue'
import type { Customer, Recommendation } from '@/types/customer'
import type { ActionStatus, ActionStatusMap } from '@/types/action'

const props = defineProps<{ customers: Customer[]; recommendations: Recommendation[]; actionStatuses: ActionStatusMap }>()
const emit = defineEmits<{
  openCustomer: [customerId: number]
  openScenario: [customerId: number]
  updateStatus: [customerId: number, status: ActionStatus]
}>()

const filter = ref<'Priority' | 'All' | 'Critical' | 'High'>('Priority')
const statusFilter = ref<'All' | ActionStatus>('All')
const customerMap = computed(() => new Map(props.customers.map((customer) => [customer.id, customer])))
const statusOptions: ActionStatus[] = ['Not started', 'Planned', 'In progress', 'Completed']

function statusFor(customerId: number): ActionStatus {
  return props.actionStatuses[String(customerId)] ?? 'Not started'
}

const sortedRecommendations = computed(() => props.recommendations
  .filter((item) => filter.value === 'All' || (filter.value === 'Priority' ? item.priority !== 'Normal' : item.priority === filter.value))
  .filter((item) => statusFilter.value === 'All' || statusFor(item.customerId) === statusFilter.value)
  .sort((a, b) => b.priorityScore - a.priorityScore))

const protectedRevenue = computed(() => props.recommendations.reduce((sum, item) => sum + item.potentialRevenueProtected, 0))
const urgentCount = computed(() => props.recommendations.filter((item) => item.timeframe.includes('24') || item.timeframe.includes('48')).length)
const activeCount = computed(() => Object.values(props.actionStatuses).filter((status) => status === 'Planned' || status === 'In progress').length)
const completedCount = computed(() => Object.values(props.actionStatuses).filter((status) => status === 'Completed').length)
const formatMoney = (amount: number) => `RM ${amount.toLocaleString('en-MY')}`

function onStatusChange(customerId: number, event: Event) {
  emit('updateStatus', customerId, (event.target as HTMLSelectElement).value as ActionStatus)
}
</script>

<template>
  <div class="actions-page">
    <section class="page-intro">
      <div><span class="eyebrow">Decision support</span><h2>Prioritised retention actions</h2><p>Turn churn intelligence into a trackable work queue with evidence, ownership status and scenario comparison.</p></div>
      <div class="page-filters">
        <label class="filter-select"><span>Priority</span><select v-model="filter"><option>Priority</option><option>All</option><option>Critical</option><option>High</option></select></label>
        <label class="filter-select"><span>Status</span><select v-model="statusFilter"><option>All</option><option v-for="status in statusOptions" :key="status">{{ status }}</option></select></label>
      </div>
    </section>

    <section class="action-metrics">
      <article><span class="metric-icon critical">!</span><div><small>Critical actions</small><strong>{{ recommendations.filter((item) => item.priority === 'Critical').length }}</strong></div></article>
      <article><span class="metric-icon clock">↗</span><div><small>Actions due within 48h</small><strong>{{ urgentCount }}</strong></div></article>
      <article><span class="metric-icon revenue">RM</span><div><small>Potential annual revenue protected</small><strong>{{ formatMoney(protectedRevenue) }}</strong></div></article>
      <article><span class="metric-icon planned">✓</span><div><small>Active / completed</small><strong>{{ activeCount }} / {{ completedCount }}</strong></div></article>
    </section>

    <section class="action-list">
      <article v-for="(item, index) in sortedRecommendations" :key="item.customerId" class="action-card" :class="{ completed: statusFor(item.customerId) === 'Completed' }">
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
          <label class="status-control" :class="statusFor(item.customerId).toLowerCase().replace(' ', '-')">
            <span>Status</span>
            <select :value="statusFor(item.customerId)" @change="onStatusChange(item.customerId, $event)">
              <option v-for="status in statusOptions" :key="status">{{ status }}</option>
            </select>
          </label>
          <button class="view-button" type="button" @click="emit('openCustomer', item.customerId)">View evidence</button>
          <button class="scenario-button" type="button" @click="emit('openScenario', item.customerId)">Compare scenarios</button>
        </div>
      </article>
      <div v-if="sortedRecommendations.length === 0" class="empty-state">No actions match the current priority and status filters.</div>
    </section>

    <p class="disclaimer">Action status is stored in this browser for the demo. Scenario estimates are directional prototype values, not causal guarantees.</p>
  </div>
</template>

<style scoped>
.actions-page { display: grid; gap: 17px; padding: 25px 28px 38px; }
.page-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.eyebrow { display: block; color: #7c64e5; font-size: 9px; font-weight: 850; text-transform: uppercase; letter-spacing: .13em; }
h2 { margin: 7px 0 6px; color: #171c2e; font-size: 25px; letter-spacing: -.04em; }
.page-intro p { margin: 0; color: #858c9f; font-size: 11px; }
.page-filters { display: flex; gap: 8px; }
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
.action-card { display: grid; grid-template-columns: 50px minmax(150px, .72fr) minmax(250px, 1.22fr) minmax(170px, .7fr) minmax(130px, auto); gap: 16px; align-items: center; padding: 17px; border: 1px solid #e5e8f0; border-radius: 17px; background: #fff; box-shadow: 0 7px 24px rgba(31, 39, 69, .035); transition: .18s ease; }
.action-card:hover { transform: translateY(-1px); border-color: #d9d3ff; box-shadow: 0 12px 30px rgba(43, 47, 96, .07); }
.action-card.completed { opacity: .72; background: #f7fbf9; }
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
.action-buttons button { min-width: 112px; padding: 8px 10px; border-radius: 9px; font-size: 9px; font-weight: 750; cursor: pointer; }
.view-button { border: 1px solid #e1e4ec; color: #646b7f; background: #fff; }
.scenario-button { border: 0; color: #fff; background: #6f56df; }
.status-control { display: flex; align-items: center; justify-content: space-between; gap: 7px; min-width: 112px; padding: 5px 8px; border: 1px solid #e2e5ed; border-radius: 9px; background: #fafbfc; }
.status-control span { color: #969cad; font-size: 7px; text-transform: uppercase; }
.status-control select { min-width: 0; border: 0; outline: 0; color: #4d5468; background: transparent; font-size: 8px; font-weight: 750; }
.status-control.planned { border-color: #ded8ff; background: #f6f3ff; } .status-control.in-progress { border-color: #d5ebff; background: #f1f8ff; } .status-control.completed { border-color: #d2eee4; background: #effaf6; }
.empty-state { padding: 45px 20px; border: 1px dashed #dfe3ec; border-radius: 16px; color: #9097a9; background: #fff; text-align: center; font-size: 11px; }
.disclaimer { margin: 2px 4px 0; color: #9ba1b1; font-size: 9px; line-height: 1.45; }
@media (max-width: 1240px) { .action-card { grid-template-columns: 45px .75fr 1.25fr .75fr; } .action-buttons { grid-column: 2 / -1; grid-template-columns: 1fr auto auto; } }
@media (max-width: 940px) { .action-metrics { grid-template-columns: 1fr 1fr; } .action-card { grid-template-columns: 40px 1fr; align-items: start; } .action-customer, .action-main, .action-impact, .action-buttons { grid-column: 2; } .action-impact { padding: 10px 0 0; border-top: 1px solid #eef0f5; border-left: 0; } .action-buttons { grid-template-columns: 1fr 1fr; } .status-control { grid-column: 1 / -1; } }
@media (max-width: 700px) { .page-intro { align-items: flex-start; flex-direction: column; } .page-filters { width: 100%; flex-wrap: wrap; } .filter-select { flex: 1; } }
@media (max-width: 620px) { .actions-page { padding: 18px 14px 28px; } .action-metrics { grid-template-columns: 1fr; } .action-card { padding: 14px 12px; } .action-buttons { grid-template-columns: 1fr; } .status-control { grid-column: auto; } }
</style>
