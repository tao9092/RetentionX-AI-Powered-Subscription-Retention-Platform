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
const roiLabel = (roi: number | null) => roi === null ? '—' : roi >= 0 ? `${roi.toFixed(1)}×` : `${roi.toFixed(1)}×`

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
        <div class="result-heading">
          <div><span class="eyebrow">Selected strategy</span><h3>{{ selectedScenario.name }}</h3><p>{{ selectedScenario.description }}</p></div>
          <span class="strategy-icon">✦</span>
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
.scenario-page { display: grid; gap: 17px; padding: 25px 28px 38px; }
.page-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; }
.eyebrow { display: block; color: #7c64e5; font-size: 9px; font-weight: 850; text-transform: uppercase; letter-spacing: .13em; }
h2 { margin: 7px 0 6px; color: #171c2e; font-size: 25px; letter-spacing: -.04em; }
.page-intro p, .result-heading p { margin: 0; color: #858c9f; font-size: 11px; line-height: 1.55; }
.customer-select { display: grid; gap: 6px; min-width: 270px; padding: 11px 13px; border: 1px solid #e5e8f0; border-radius: 14px; background: #fff; }
.customer-select span { color: #949bad; font-size: 9px; text-transform: uppercase; letter-spacing: .08em; }
.customer-select select { border: 0; outline: 0; color: #33394d; background: #fff; font-size: 11px; font-weight: 750; }
.customer-banner { display: grid; grid-template-columns: 1fr auto auto; gap: 22px; align-items: center; padding: 17px 19px; border: 1px solid #e4e7f0; border-radius: 18px; background: linear-gradient(115deg, #fff, #faf9ff); box-shadow: 0 8px 27px rgba(30, 38, 66, .04); }
.customer-identity { display: flex; align-items: center; gap: 12px; }
.avatar { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; color: #5c46cc; background: #efedff; font-size: 11px; font-weight: 900; }
.customer-identity small, .customer-identity p { color: #9298aa; font-size: 9px; }
.customer-identity h3 { margin: 3px 0; color: #262c3e; font-size: 15px; }
.customer-identity p { margin: 0; }
.baseline-metrics { display: flex; align-items: center; gap: 24px; }
.baseline-metrics > div { display: grid; gap: 6px; }
.baseline-metrics span { color: #989eaf; font-size: 8px; text-transform: uppercase; letter-spacing: .06em; }
.baseline-metrics strong { color: #303649; font-size: 12px; }
.customer-banner > button { padding: 9px 12px; border: 1px solid #dfdcf7; border-radius: 10px; color: #6753ce; background: #f8f6ff; font-size: 9px; font-weight: 750; cursor: pointer; }
.lab-layout { display: grid; grid-template-columns: minmax(330px, .8fr) minmax(470px, 1.2fr); gap: 15px; }
.panel { border: 1px solid #e4e7ef; border-radius: 18px; background: #fff; box-shadow: 0 8px 27px rgba(30, 38, 66, .04); }
.scenario-list, .result-panel { padding: 19px; }
.panel-heading, .result-heading, .execution-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.panel-heading h3, .result-heading h3 { margin: 5px 0 0; color: #252b3e; font-size: 15px; }
.directional-chip, .best-chip { padding: 5px 7px; border-radius: 7px; color: #6b58ca; background: #f0edff; font-size: 8px; font-weight: 850; text-transform: uppercase; }
.scenario-option { position: relative; display: flex; align-items: center; gap: 11px; width: 100%; margin-top: 9px; padding: 13px; border: 1px solid #e8eaf1; border-radius: 13px; color: inherit; background: #fff; text-align: left; cursor: pointer; transition: .16s ease; }
.scenario-option:hover:not(:disabled) { border-color: #cfc8fb; transform: translateY(-1px); }
.scenario-option.active { border-color: #8773ef; background: #f8f6ff; box-shadow: 0 0 0 3px rgba(113, 86, 223, .08); }
.scenario-option.unavailable { opacity: .48; cursor: not-allowed; }
.option-radio { display: grid; place-items: center; width: 19px; height: 19px; flex: 0 0 auto; border: 1px solid #cdd2dd; border-radius: 50%; }
.active .option-radio { border-color: #7359e7; }
.active .option-radio i { width: 9px; height: 9px; border-radius: 50%; background: #7359e7; }
.option-copy { min-width: 0; flex: 1; }
.option-copy strong, .option-copy small { display: block; }
.option-copy strong { color: #303649; font-size: 11px; }
.option-copy small { margin-top: 4px; color: #9298a9; font-size: 9px; line-height: 1.4; }
.risk-change { color: #168164; font-size: 9px; font-weight: 850; white-space: nowrap; }
.strategy-icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; color: #fff; background: linear-gradient(135deg, #7458ee, #2cb8e7); }
.risk-comparison { display: grid; grid-template-columns: 1fr auto 1fr; gap: 14px; align-items: center; margin-top: 17px; padding: 16px; border-radius: 15px; background: #f8f9fc; }
.risk-value span { color: #9298aa; font-size: 9px; }
.risk-value strong { display: block; margin: 5px 0 7px; font-size: 24px; }
.risk-value.baseline strong { color: #d94464; } .risk-value.projected strong { color: #168164; }
.risk-value > div { height: 7px; overflow: hidden; border-radius: 99px; background: #e7eaf0; }
.risk-value i { display: block; height: 100%; border-radius: inherit; }
.baseline i { background: #e0506d; } .projected i { background: #22ae83; }
.arrow { color: #9ba1b2; font-size: 20px; }
.impact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
.impact-grid > div { padding: 12px; border: 1px solid #e8eaf1; border-radius: 12px; }
.impact-grid span { display: block; color: #969cad; font-size: 8px; text-transform: uppercase; letter-spacing: .04em; }
.impact-grid strong { display: block; margin-top: 6px; color: #33394c; font-size: 12px; }
.positive { color: #168164 !important; } .negative { color: #d94464 !important; }
.execution-plan { margin-top: 12px; padding: 14px; border: 1px solid #e5e1ff; border-radius: 14px; background: #faf9ff; }
.execution-heading span { color: #444a5d; font-size: 10px; font-weight: 800; } .execution-heading small { color: #8f85c5; font-size: 9px; }
.execution-plan ol { display: grid; gap: 8px; margin: 11px 0 0; padding: 0; list-style: none; }
.execution-plan li { display: flex; align-items: center; gap: 8px; color: #6f7588; font-size: 10px; }
.execution-plan li i { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 6px; color: #168164; background: #e6f7f1; font-size: 9px; font-style: normal; }
.result-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 13px; }
.primary-button, .secondary-button { padding: 9px 13px; border-radius: 10px; font-size: 9px; font-weight: 800; cursor: pointer; }
.primary-button { border: 0; color: #fff; background: #6f56df; } .secondary-button { border: 1px solid #e0e3ec; color: #62697d; background: #fff; }
.comparison-panel { padding: 19px; overflow: hidden; }
.comparison-table { margin-top: 11px; overflow-x: auto; }
.comparison-row { display: grid; grid-template-columns: 1.25fr repeat(5, .8fr); align-items: center; width: 100%; min-width: 780px; padding: 11px 12px; border: 0; border-bottom: 1px solid #eff1f5; color: #62697c; background: #fff; text-align: left; font-size: 10px; cursor: pointer; }
.comparison-row.header { color: #989eaf; font-size: 8px; text-transform: uppercase; cursor: default; }
.comparison-row:not(.header):hover, .comparison-row.active { background: #faf9ff; }
.comparison-row strong { color: #343a4d; font-size: 10px; }
.disclaimer { margin: 0 3px; color: #9ba1b1; font-size: 9px; line-height: 1.45; }
@media (max-width: 1080px) { .lab-layout { grid-template-columns: 1fr; } .customer-banner { grid-template-columns: 1fr auto; } .baseline-metrics { grid-column: 1 / -1; } }
@media (max-width: 720px) { .scenario-page { padding: 18px 14px 28px; } .page-intro { align-items: flex-start; flex-direction: column; } .customer-select { width: 100%; min-width: 0; } .customer-banner { grid-template-columns: 1fr; } .baseline-metrics { flex-wrap: wrap; gap: 14px; } .customer-banner > button { justify-self: start; } .impact-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .impact-grid { grid-template-columns: 1fr; } .risk-comparison { grid-template-columns: 1fr; } .arrow { transform: rotate(90deg); justify-self: center; } }
</style>
