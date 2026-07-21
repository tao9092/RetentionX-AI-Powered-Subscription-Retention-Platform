<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import RiskBadge from '@/components/RiskBadge.vue'
import type { Customer } from '@/types/customer'
import { buildRetentionScenarios, getBestScenario, type RetentionScenario, type ScenarioId } from '@/utils/scenarioEngine'

const props = defineProps<{ customers: Customer[]; initialCustomerId?: number | null }>()
const emit = defineEmits<{ openCustomer: [customerId: number]; createAction: [customerId: number] }>()

const highestPriority = [...props.customers].sort((a, b) => b.monthlyRevenueAtRisk - a.monthlyRevenueAtRisk)[0]
const selectedCustomerId = ref(props.initialCustomerId ?? highestPriority?.id ?? props.customers[0]?.id ?? 0)
const selectedScenarioId = ref<ScenarioId>('combined')

watch(() => props.initialCustomerId, (value: number | null | undefined) => {
  if (value) selectedCustomerId.value = value
})

const customer = computed(() => props.customers.find((item) => item.id === selectedCustomerId.value) ?? props.customers[0]!)
const scenarios = computed(() => buildRetentionScenarios(customer.value))
const bestScenario = computed(() => getBestScenario(customer.value))
const selectedScenario = computed<RetentionScenario>(() => scenarios.value.find((item) => item.id === selectedScenarioId.value) ?? bestScenario.value)

watch(customer, () => {
  selectedScenarioId.value = bestScenario.value.id
}, { immediate: true })

const formatMoney = (amount: number) => `RM ${Math.round(amount).toLocaleString('en-MY')}`
const roiLabel = (roi: number | null) => roi === null ? '—' : `${roi.toFixed(1)}×`

function chooseScenario(scenario: RetentionScenario) {
  if (scenario.eligible) selectedScenarioId.value = scenario.id
}
</script>

<template>
  <div class="scenario-page">
    <section class="page-intro">
      <div>
        <span class="eyebrow">What-if decision lab</span>
        <h2>Compare retention actions before committing budget.</h2>
        <p>Select an account, test practical interventions and compare projected risk, cost and revenue protection.</p>
      </div>
      <label class="customer-select">
        <span>Customer account</span>
        <select v-model.number="selectedCustomerId">
          <option v-for="item in customers" :key="item.id" :value="item.id">{{ item.companyName }}</option>
        </select>
      </label>
    </section>

    <section class="customer-banner">
      <div class="customer-identity">
        <span class="avatar">{{ customer.companyName.slice(0, 2).toUpperCase() }}</span>
        <div><small>{{ customer.industry }} · {{ customer.plan }} plan</small><h3>{{ customer.companyName }}</h3><p>{{ formatMoney(customer.monthlyRevenue) }} monthly recurring revenue</p></div>
      </div>
      <div class="baseline-metrics">
        <div><span>Current churn risk</span><RiskBadge :level="customer.riskLevel" :probability="customer.churnProbability" /></div>
        <div><span>Annual revenue at risk</span><strong>{{ formatMoney(customer.annualRevenueAtRisk) }}</strong></div>
        <div><span>Health score</span><strong>{{ customer.healthScore }}/100</strong></div>
      </div>
      <button type="button" @click="emit('openCustomer', customer.id)">View risk evidence</button>
    </section>

    <section class="lab-layout">
      <article class="scenario-list panel">
        <div class="panel-heading"><div><span class="eyebrow">Available interventions</span><h3>Choose a scenario</h3></div><span class="directional-chip">Directional estimate</span></div>
        <button
          v-for="scenario in scenarios"
          :key="scenario.id"
          type="button"
          class="scenario-option"
          :class="{ active: selectedScenario.id === scenario.id, unavailable: !scenario.eligible, best: bestScenario.id === scenario.id }"
          :disabled="!scenario.eligible"
          @click="chooseScenario(scenario)"
        >
          <span class="option-radio"><i></i></span>
          <span class="option-copy"><strong>{{ scenario.shortName }}</strong><small>{{ scenario.eligible ? scenario.description : scenario.ineligibleReason }}</small></span>
          <span v-if="bestScenario.id === scenario.id" class="best-chip">Best value</span>
          <span v-else class="risk-change">-{{ scenario.riskReduction }} pts</span>
        </button>
      </article>

      <article class="result-panel panel">
        <div class="validation-banner"><strong>Estimation basis: Prototype rule</strong><strong>Validation status: Not causally validated</strong><span>Directional estimate only</span></div>
        <div class="result-heading">
          <div><span class="eyebrow">Selected strategy</span><h3>{{ selectedScenario.name }}</h3><p>{{ selectedScenario.description }}</p></div>
          <span class="strategy-icon">✓</span>
        </div>

        <div class="risk-comparison">
          <div class="risk-value baseline"><span>Before action</span><strong>{{ customer.churnProbability }}%</strong><div><i :style="{ width: `${customer.churnProbability}%` }"></i></div></div>
          <span class="arrow">→</span>
          <div class="risk-value projected"><span>Projected after action</span><strong>{{ selectedScenario.projectedRisk }}%</strong><div><i :style="{ width: `${selectedScenario.projectedRisk}%` }"></i></div></div>
        </div>

        <div class="impact-grid">
          <div><span>Risk reduction</span><strong class="positive">-{{ selectedScenario.riskReduction }} points</strong></div>
          <div><span>Estimated action cost</span><strong>{{ formatMoney(selectedScenario.interventionCost) }}</strong></div>
          <div><span>Annual revenue protected</span><strong class="positive">{{ formatMoney(selectedScenario.annualRevenueProtected) }}</strong></div>
          <div><span>Estimated net benefit</span><strong :class="{ positive: selectedScenario.netBenefit >= 0, negative: selectedScenario.netBenefit < 0 }">{{ formatMoney(selectedScenario.netBenefit) }}</strong></div>
          <div><span>Return on intervention</span><strong>{{ roiLabel(selectedScenario.roi) }}</strong></div>
          <div><span>Decision confidence</span><strong>Scenario estimate</strong></div>
        </div>

        <div class="execution-plan">
          <div class="execution-heading"><span>Recommended execution plan</span><small>{{ selectedScenario.steps.length }} steps</small></div>
          <ol><li v-for="step in selectedScenario.steps" :key="step"><i>✓</i><span>{{ step }}</span></li></ol>
        </div>

        <div class="result-actions">
          <button class="secondary-button" type="button" @click="emit('openCustomer', customer.id)">Review evidence</button>
          <button class="primary-button" type="button" @click="emit('createAction', customer.id)">Add to action queue</button>
        </div>
      </article>
    </section>

    <section class="comparison-panel panel">
      <div class="panel-heading"><div><span class="eyebrow">Decision comparison</span><h3>All eligible scenarios</h3></div></div>
      <div class="comparison-table">
        <div class="comparison-row header"><span>Scenario</span><span>Projected risk</span><span>Cost</span><span>Revenue protected</span><span>Net benefit</span><span>ROI</span></div>
        <button v-for="scenario in scenarios.filter((item) => item.eligible)" :key="scenario.id" type="button" class="comparison-row" :class="{ active: selectedScenario.id === scenario.id }" @click="chooseScenario(scenario)">
          <strong>{{ scenario.shortName }}</strong><span>{{ scenario.projectedRisk }}%</span><span>{{ formatMoney(scenario.interventionCost) }}</span><span class="positive">{{ formatMoney(scenario.annualRevenueProtected) }}</span><span :class="{ positive: scenario.netBenefit >= 0, negative: scenario.netBenefit < 0 }">{{ formatMoney(scenario.netBenefit) }}</span><span>{{ roiLabel(scenario.roi) }}</span>
        </button>
      </div>
    </section>

    <p class="disclaimer">These values are transparent scenario estimates for prototype decision support. They are not causal guarantees. A production deployment should validate intervention uplift using historical outcomes or controlled experiments.</p>
  </div>
</template>

<style scoped>
.validation-banner{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;padding:16px;border-radius:14px;color:var(--color-brown);background:var(--color-peach)}.validation-banner span{grid-column:1/-1;font-weight:700}
.scenario-page{display:grid;gap:17px;width:min(100%,1540px);margin:0 auto;padding:24px 26px 42px}.page-intro{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.eyebrow{display:block;color:var(--rx-primary);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.14em}h2{margin:8px 0 7px;color:var(--rx-ink);font-size:clamp(25px,3vw,34px);letter-spacing:-.05em}.page-intro p{max-width:660px;margin:0;color:var(--rx-muted);font-size:12px;line-height:1.55}.customer-select{min-width:240px;padding:10px 12px;border:1px solid var(--rx-border);border-radius:13px;background:#fff;box-shadow:var(--rx-shadow-sm)}.customer-select span{display:block;color:#9aa0a8;font-size:12px;font-weight:850;text-transform:uppercase}.customer-select select{width:100%;margin-top:5px;border:0;outline:0;color:#363b42;background:transparent;font-size:12px;font-weight:800}.customer-banner{display:grid;grid-template-columns:minmax(220px,1fr) minmax(330px,1fr) auto;gap:16px;align-items:center;padding:16px 18px;border:1px solid var(--rx-border);border-radius:18px;background:#fff;box-shadow:var(--rx-shadow-sm)}.customer-identity{display:flex;align-items:center;gap:11px}.avatar{display:grid;place-items:center;width:43px;height:43px;border-radius:13px;color:#171717;background:var(--rx-primary-soft);font-size:12px;font-weight:900}.customer-identity small,.customer-identity h3,.customer-identity p{display:block;margin:0}.customer-identity small{color:#999fa8;font-size:12px}.customer-identity h3{margin-top:3px;color:#2e3238;font-size:13px}.customer-identity p{margin-top:3px;color:#838a93;font-size:12px}.baseline-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.baseline-metrics>div{padding:10px;border-left:1px solid #eff0f2}.baseline-metrics span,.baseline-metrics strong{display:block}.baseline-metrics>div>span{margin-bottom:7px;color:#9ca1a9;font-size:12px;font-weight:850;text-transform:uppercase}.baseline-metrics strong{color:#393e45;font-size:12px}.customer-banner>button{min-height:36px;padding:0 11px;border:1px solid var(--rx-border-strong);border-radius:10px;color:#4f555e;background:#fbfcff;font-size:12px;font-weight:850;cursor:pointer}.lab-layout{display:grid;grid-template-columns:minmax(300px,.78fr) minmax(0,1.22fr);gap:14px}.panel{border:1px solid var(--rx-border);border-radius:19px;background:#fff;box-shadow:var(--rx-shadow-sm)}.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 18px 12px}.panel-heading h3,.result-heading h3{margin:5px 0 0;color:#30343a;font-size:13px}.directional-chip{padding:6px 8px;border:1px solid #e4e2ff;border-radius:8px;color:#171717;background:var(--rx-primary-soft);font-size:12px;font-weight:850}.scenario-list{padding-bottom:9px}.scenario-option{position:relative;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;width:calc(100% - 18px);margin:0 9px 6px;padding:11px;border:1px solid transparent;border-radius:12px;color:inherit;background:transparent;text-align:left;cursor:pointer}.scenario-option:hover{background:#f8f9fe}.scenario-option.active{border-color:#cbc6c0;background:#f3f2f0}.scenario-option.best{box-shadow:inset 3px 0 0 var(--rx-lime)}.scenario-option.unavailable{opacity:.45;cursor:not-allowed}.option-radio{display:grid;place-items:center;width:20px;height:20px;border:1px solid #d4d7dc;border-radius:50%;background:#fff}.option-radio i{width:8px;height:8px;border-radius:50%}.scenario-option.active .option-radio{border-color:var(--rx-primary)}.scenario-option.active .option-radio i{background:var(--rx-primary)}.option-copy strong,.option-copy small{display:block}.option-copy strong{color:#383d44;font-size:12px}.option-copy small{margin-top:3px;color:#959ba4;font-size:12px;line-height:1.4}.best-chip,.risk-change{padding:5px 7px;border-radius:7px;font-size:12px;font-weight:900}.best-chip{color:var(--rx-lime-ink);background:var(--rx-lime)}.risk-change{color:var(--rx-success);background:var(--rx-success-soft)}.result-panel{padding:19px;background:radial-gradient(circle at 100% 0%,rgba(102,86,232,.08),transparent 28%),#fff}.result-heading{display:flex;justify-content:space-between;gap:12px}.result-heading p{margin:6px 0 0;color:#878e97;font-size:12px;line-height:1.5}.strategy-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;color:var(--rx-lime-ink);background:var(--rx-lime)}.risk-comparison{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-top:18px}.risk-value{padding:14px;border:1px solid var(--rx-border);border-radius:14px;background:#fbfcff}.risk-value span,.risk-value strong{display:block}.risk-value span{color:#9ba0a9;font-size:12px;font-weight:850;text-transform:uppercase}.risk-value strong{margin-top:7px;color:#33383f;font-size:22px}.risk-value>div{height:6px;margin-top:10px;overflow:hidden;border-radius:99px;background:#e9ebee}.risk-value i{display:block;height:100%;border-radius:inherit}.baseline i{background:var(--rx-danger)}.projected i{background:var(--rx-success)}.arrow{color:#a3a8b0;font-size:18px}.impact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.impact-grid>div{padding:11px;border:1px solid var(--rx-border);border-radius:11px}.impact-grid span,.impact-grid strong{display:block}.impact-grid span{color:#9da2aa;font-size:12px;text-transform:uppercase}.impact-grid strong{margin-top:6px;color:#40464e;font-size:12px}.positive{color:var(--rx-success)}.negative{color:var(--rx-danger)}.execution-plan{margin-top:13px;padding:13px;border:1px solid #e8e6ff;border-radius:13px;background:#f5f3ff}.execution-heading{display:flex;justify-content:space-between;color:#171717;font-size:12px;font-weight:850}.execution-heading small{color:#8d85bd}.execution-plan ol{display:grid;gap:7px;margin:10px 0 0;padding:0;list-style:none}.execution-plan li{display:flex;gap:8px;color:#666d76;font-size:12px}.execution-plan li i{display:grid;place-items:center;width:17px;height:17px;flex:0 0 auto;border-radius:6px;color:var(--rx-lime-ink);background:var(--rx-lime);font-size:12px;font-style:normal}.result-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.primary-button,.secondary-button{min-height:36px;padding:0 11px;border-radius:10px;font-size:12px;font-weight:850;cursor:pointer}.primary-button{border:0;color:var(--rx-lime-ink);background:var(--rx-lime)}.secondary-button{border:1px solid var(--rx-border-strong);color:#555b64;background:#fff}.comparison-panel{overflow:hidden}.comparison-table{overflow-x:auto}.comparison-row{display:grid;grid-template-columns:1.2fr repeat(5,.8fr);gap:10px;align-items:center;min-width:760px;width:100%;padding:11px 18px;border:0;border-top:1px solid #eff0f2;color:#59606a;background:#fff;text-align:left;font-size:12px;cursor:pointer}.comparison-row.header{color:#9ba0a8;background:#fbfcff;font-size:12px;font-weight:850;text-transform:uppercase;cursor:default}.comparison-row.active{background:#f3f2f0}.comparison-row strong{color:#353a41}.disclaimer{margin:0 3px;color:#9ba0a9;font-size:12px;line-height:1.5}@media(max-width:1000px){.lab-layout{grid-template-columns:1fr}.customer-banner{grid-template-columns:1fr}.baseline-metrics>div:first-child{padding-left:0;border-left:0}}@media(max-width:700px){.scenario-page{padding:17px 14px 30px}.page-intro{align-items:flex-start;flex-direction:column}.customer-select{width:100%}.baseline-metrics,.impact-grid{grid-template-columns:1fr 1fr}.risk-comparison{grid-template-columns:1fr}.arrow{transform:rotate(90deg);text-align:center}}
</style>
