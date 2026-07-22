<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Customer } from '@/types/customer'
import type { LogisticArtifact, RiskEngine } from '@/types/advanced'
import { logisticScore } from '@/utils/modelEngine'
import { BASE_RISK, MAX_RISK, MIN_RISK, RISK_THRESHOLDS } from '@/utils/riskCalculator'

const props = defineProps<{ customers: Customer[]; requestedEngine: RiskEngine; activeEngine: RiskEngine; artifact: LogisticArtifact|null }>()
const emit = defineEmits<{ changeEngine: [engine: RiskEngine] }>()
const selectedId = ref(props.customers[0]?.id ?? 0)
const customer = computed(() => props.customers.find((item) => item.id === selectedId.value) ?? props.customers[0])
const rawTotal = computed(() => customer.value?.riskContributions.reduce((sum, item) => sum + item.points, 0) ?? 0)
const rules = [
  'Usage decline: 20–39% +10; 40–59% +18; 60%+ +25',
  'Feature adoption: below 50% +8; 35% or below +15; 20% or below +20',
  'Seat utilisation: below 50% +4; below 30% +7',
  'Unresolved tickets: one +7; two +14; three or more +18',
  'Satisfaction: 6–7 +5; 4–5 +12; 1–3 +17',
  'Late payments: one +5; two or more +10',
  'Renewal proximity: 31–60 days +3; 15–30 +7; 14 or fewer +10',
]
const trainedScore = computed(() => customer.value && props.artifact ? logisticScore(customer.value, props.artifact) : null)
</script>

<template>
  <div class="model-page page-stack">
    <section class="page-intro">
      <div><span class="eyebrow">Model transparency</span><h2>Every point, explained.</h2><p>Inspect the exact scoring rules and the source behind every customer signal.</p></div>
      <label class="field"><span>Customer</span><select v-model.number="selectedId"><option v-for="item in customers" :key="item.id" :value="item.id">{{ item.companyName }}</option></select></label>
    </section>

    <section class="prototype-notice"><strong>Transparent heuristic scoring</strong><p>This score is a rule-based risk indicator and is not a calibrated probability from a trained ML model.</p></section>
    <section class="panel engine-switch"><div><span class="eyebrow">Risk engine</span><h3>{{ activeEngine === 'logistic' ? 'Trained logistic model' : 'Transparent heuristic model' }}</h3><p v-if="requestedEngine==='logistic'&&activeEngine==='heuristic'">Fallback active: the trained artifact is unavailable or invalid.</p><p v-else-if="artifact?.synthetic">The loaded artifact was evaluated on sample data and does not represent live performance.</p></div><div><button :class="{active:requestedEngine==='heuristic'}" @click="emit('changeEngine','heuristic')">Heuristic</button><button :class="{active:requestedEngine==='logistic'}" @click="emit('changeEngine','logistic')">Trained logistic</button></div></section>
    <section v-if="artifact" class="model-facts card-grid"><article><span>Artifact</span><strong>{{artifact.datasetLabel}}</strong></article><article><span>Trained at</span><strong>{{new Date(artifact.trainedAt).toLocaleDateString('en-MY')}}</strong></article><article><span>Features</span><strong>{{artifact.featureOrder.length}}</strong></article><article><span>Selected customer score</span><strong>{{trainedScore}} / 100</strong></article></section>

    <section class="model-facts card-grid">
      <article><span>Prediction window</span><strong>30-day directional churn risk</strong></article>
      <article><span>Base risk</span><strong>{{ BASE_RISK }} points</strong></article>
      <article><span>Thresholds</span><strong>Medium {{ RISK_THRESHOLDS.medium }} · High {{ RISK_THRESHOLDS.high }}</strong></article>
      <article><span>Clamping</span><strong>{{ MIN_RISK }}–{{ MAX_RISK }} points</strong></article>
    </section>

    <section v-if="customer" class="panel breakdown">
      <div class="panel-heading"><div><span class="eyebrow">Customer-level calculation</span><h3>{{ customer.companyName }}</h3></div><strong class="score">{{ customer.churnProbability }} / 100</strong></div>
      <div class="contribution-table">
        <div class="row header"><span>Rule</span><span>Observed value</span><span>Source</span><span>Points</span></div>
        <div v-for="item in customer.riskContributions" :key="item.id" class="row"><span><strong>{{ item.label }}</strong><small>{{ item.explanation }}</small></span><span>{{ item.observedValue }}</span><span class="source">{{ item.source }}</span><strong>+{{ item.points }}</strong></div>
        <div class="row total"><strong>Raw contribution total</strong><span></span><span>Clamped to {{ MIN_RISK }}–{{ MAX_RISK }}</span><strong>{{ rawTotal }} → {{ customer.churnProbability }}</strong></div>
      </div>
    </section>

    <section class="panel limitations"><div><span class="eyebrow">All scoring rules</span><h3>Deterministic point schedule</h3></div><ul><li v-for="rule in rules" :key="rule">{{ rule }}</li></ul></section>

    <section class="limitations panel"><div><span class="eyebrow">Known limitations</span><h3>Model scope and boundaries</h3></div><ul><li>No training against historical churn labels.</li><li>No calibration, confidence interval, or causal intervention estimate.</li><li>Missing inputs can reduce the evidence available to the rules.</li></ul><div><span class="eyebrow">Trained-model architecture</span><p>Validated labelled outcomes, time-aware feature engineering, leakage-safe train/test evaluation, calibrated predictions, monitored drift, and human review.</p></div></section>
  </div>
</template>

<style scoped>
.engine-switch{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px;border-radius:20px}.engine-switch h3{margin:5px 0}.engine-switch p{margin:4px 0;color:var(--color-danger)}.engine-switch>div:last-child{display:flex;gap:8px}.engine-switch button{padding:10px 14px;border:1px solid var(--color-border);border-radius:999px;background:#fff}.engine-switch button.active{color:#fff;background:#171717}
.model-page{max-width:1280px;margin:auto;padding:40px clamp(20px,3vw,48px) 64px}.page-intro{display:flex;align-items:end;justify-content:space-between;gap:24px}.page-intro p{max-width:650px}.field{min-width:260px}.prototype-notice{padding:28px;border-radius:24px;color:var(--color-brown);background:var(--color-peach)}.prototype-notice p{margin:8px 0 0}.model-facts{grid-template-columns:repeat(4,1fr)}.model-facts article{padding:20px;border-radius:20px;background:var(--color-mist)}.model-facts span,.model-facts strong{display:block}.model-facts span{color:var(--color-muted);font-size:13px}.model-facts strong{margin-top:8px;font-size:16px}.panel{overflow:hidden}.panel-heading{display:flex;align-items:center;justify-content:space-between;padding:28px}.score{font:400 36px var(--font-display)}.row{display:grid;grid-template-columns:1.3fr 1fr .5fr .3fr;gap:16px;padding:16px 28px;border-top:1px solid var(--color-border);font-size:14px}.row span strong,.row small{display:block}.row small{margin-top:5px;color:var(--color-muted);font-size:13px}.row.header{color:var(--color-muted);font-size:12px;text-transform:uppercase}.source{width:max-content;padding:5px 9px;border-radius:999px;background:#fff}.row.total{background:#fff}.limitations{display:grid;grid-template-columns:1fr 1fr;gap:32px;padding:28px}.limitations h3{margin:8px 0}.limitations li,.limitations p{color:var(--color-muted);line-height:1.6}@media(max-width:850px){.page-intro{align-items:stretch;flex-direction:column}.field{min-width:0}.model-facts{grid-template-columns:1fr 1fr}.row{grid-template-columns:1fr auto}.row>*:nth-child(2),.row>*:nth-child(3){display:none}.limitations{grid-template-columns:1fr}}@media(max-width:520px){.model-facts{grid-template-columns:1fr}}
</style>
