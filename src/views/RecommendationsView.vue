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
.actions-page{display:grid;gap:17px;width:min(100%,1540px);margin:0 auto;padding:24px 26px 42px}.page-intro{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.eyebrow{display:block;color:var(--rx-primary);font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.14em}h2{margin:8px 0 7px;color:var(--rx-ink);font-size:clamp(25px,3vw,34px);letter-spacing:-.05em}.page-intro p{margin:0;max-width:650px;color:var(--rx-muted);font-size:10px;line-height:1.55}.page-filters{display:flex;gap:8px}.filter-select{display:flex;align-items:center;gap:8px;min-height:39px;padding:0 10px;border:1px solid var(--rx-border);border-radius:11px;background:#fff}.filter-select span{color:#9a9fa8;font-size:7px;font-weight:850;text-transform:uppercase}.filter-select select{border:0;outline:0;color:#474d55;background:transparent;font-size:9px;font-weight:750}.action-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.action-metrics article{display:flex;align-items:center;gap:11px;min-height:86px;padding:15px;border:1px solid var(--rx-border);border-radius:17px;background:#fff;box-shadow:var(--rx-shadow-sm)}.metric-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;font-size:9px;font-weight:900}.metric-icon.critical{color:var(--rx-danger);background:var(--rx-danger-soft)}.metric-icon.clock{color:var(--rx-warning);background:var(--rx-warning-soft)}.metric-icon.revenue{color:var(--rx-blue);background:var(--rx-blue-soft)}.metric-icon.planned{color:var(--rx-success);background:var(--rx-success-soft)}.action-metrics small,.action-metrics strong{display:block}.action-metrics small{color:#989da6;font-size:7.5px;font-weight:850;text-transform:uppercase;letter-spacing:.05em}.action-metrics strong{margin-top:6px;color:#30343a;font-size:16px}.action-list{display:grid;gap:10px}.action-card{display:grid;grid-template-columns:44px minmax(145px,.7fr) minmax(250px,1.25fr) minmax(170px,.7fr) minmax(138px,auto);gap:14px;align-items:center;padding:15px;border:1px solid var(--rx-border);border-radius:17px;background:#fff;box-shadow:var(--rx-shadow-sm);transition:.16s ease}.action-card:hover{transform:translateY(-1px);border-color:#d5d0fb;box-shadow:0 14px 36px rgba(20,23,29,.08)}.action-card.completed{opacity:.7;background:#f8fbfa}.priority-rank{align-self:stretch;display:flex;flex-direction:column;align-items:center;gap:7px}.priority-rank span{color:var(--rx-primary);font-size:8px;font-weight:900}.priority-rank i{width:1px;flex:1;background:linear-gradient(#d9d4fb,transparent)}.action-customer{display:flex;align-items:center;gap:9px}.avatar{display:grid;place-items:center;width:36px;height:36px;border:1px solid #e1ddfb;border-radius:11px;color:#5143bd;background:var(--rx-primary-soft);font-size:9px;font-weight:900}.action-customer strong,.action-customer small{display:block}.action-customer strong{color:#343940;font-size:10px}.action-customer small{margin-top:4px;color:#999fa8;font-size:8px}.action-tags{display:flex;gap:6px}.type-tag,.priority-tag{padding:5px 7px;border:1px solid;border-radius:7px;font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}.type-tag{color:#5649bb;border-color:#e0dcfb;background:var(--rx-primary-soft)}.priority-tag.critical{color:var(--rx-danger);border-color:#f3cbd3;background:var(--rx-danger-soft)}.priority-tag.high{color:var(--rx-warning);border-color:#efd7aa;background:var(--rx-warning-soft)}.priority-tag.normal{color:var(--rx-success);border-color:#c8e8dc;background:var(--rx-success-soft)}.action-main h3{margin:7px 0 5px;color:#30343a;font-size:11px}.action-main p{margin:0;color:#858c95;font-size:8.5px;line-height:1.5}.action-impact{display:grid;gap:8px;padding-left:13px;border-left:1px solid #eff0f2}.action-impact>div{display:flex;align-items:center;justify-content:space-between;gap:8px}.action-impact>div>span{color:#9ca1aa;font-size:7px;font-weight:850;text-transform:uppercase}.action-impact strong{color:#454b53;font-size:8px}.revenue-value{color:var(--rx-success)!important}.action-buttons{display:grid;gap:7px}.status-control{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:34px;padding:0 8px;border:1px solid var(--rx-border);border-radius:9px;background:#fafafb}.status-control span{color:#9ca1aa;font-size:7px;text-transform:uppercase}.status-control select{max-width:90px;border:0;outline:0;color:#4d535b;background:transparent;font-size:8px;font-weight:750}.view-button,.scenario-button{min-height:33px;border-radius:9px;font-size:8px;font-weight:850;cursor:pointer}.view-button{border:1px solid var(--rx-border-strong);color:#555c65;background:#fff}.scenario-button{border:0;color:var(--rx-lime-ink);background:var(--rx-lime)}.empty-state{padding:50px;border:1px dashed var(--rx-border-strong);border-radius:16px;color:#9197a0;text-align:center;font-size:9px}.disclaimer{margin:0 3px;color:#9ba0a9;font-size:8px;line-height:1.5}@media(max-width:1200px){.action-card{grid-template-columns:38px 160px 1fr 160px}.action-buttons{grid-column:2/-1;display:flex}.action-buttons>*{flex:1}}@media(max-width:900px){.action-metrics{grid-template-columns:1fr 1fr}.page-intro{align-items:flex-start;flex-direction:column}.action-card{grid-template-columns:38px 1fr}.action-main,.action-impact,.action-buttons{grid-column:2}.action-impact{padding:10px 0 0;border-left:0;border-top:1px solid #eff0f2}}@media(max-width:620px){.actions-page{padding:17px 14px 30px}.action-metrics{grid-template-columns:1fr}.page-filters{width:100%}.filter-select{flex:1}.action-buttons{flex-direction:column}.action-customer{grid-column:2}}
</style>