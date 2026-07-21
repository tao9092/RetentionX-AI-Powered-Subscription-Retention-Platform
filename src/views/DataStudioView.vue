<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Customer } from '@/types/customer'
import { customersToCsv, demoTemplateCsv, parseCustomerCsv, type CsvIssue } from '@/utils/csvParser'

const props = defineProps<{ customers: Customer[]; sourceLabel: string }>()
const emit = defineEmits<{ applyCustomers: [customers: Customer[], sourceLabel: string]; resetData: [] }>()

const dragActive = ref(false)
const fileName = ref('')
const parsedCustomers = ref<Customer[]>([])
const issues = ref<CsvIssue[]>([])
const totalRows = ref(0)
const parseMessage = ref('')

const validRate = computed(() => totalRows.value === 0 ? 0 : Math.round((parsedCustomers.value.length / totalRows.value) * 100))
const highRiskImported = computed(() => parsedCustomers.value.filter((customer) => customer.riskLevel === 'High').length)
const importRevenue = computed(() => parsedCustomers.value.reduce((sum, customer) => sum + customer.monthlyRevenue, 0))
const previewRows = computed(() => parsedCustomers.value.slice(0, 6))
const formatMoney = (amount: number) => `RM ${amount.toLocaleString('en-MY')}`

function downloadFile(content: string, name: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function downloadTemplate() {
  downloadFile(demoTemplateCsv(), 'retentionx-customer-template.csv')
}

function exportCurrent() {
  downloadFile(customersToCsv(props.customers), 'retentionx-current-portfolio.csv')
}

async function processFile(file?: File) {
  if (!file) return
  fileName.value = file.name
  parseMessage.value = ''
  parsedCustomers.value = []
  issues.value = []
  totalRows.value = 0

  if (!file.name.toLowerCase().endsWith('.csv')) {
    issues.value = [{ row: 0, message: 'Please select a .csv file.' }]
    return
  }

  try {
    const result = parseCustomerCsv(await file.text())
    parsedCustomers.value = result.customers
    issues.value = result.issues
    totalRows.value = result.totalRows
    parseMessage.value = result.customers.length > 0
      ? `${result.customers.length} valid customer records are ready to analyse.`
      : 'No valid customer records were found.'
  } catch (error) {
    issues.value = [{ row: 0, message: error instanceof Error ? error.message : 'The CSV file could not be read.' }]
  }
}

function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  void processFile(input.files?.[0])
  input.value = ''
}

function onDrop(event: DragEvent) {
  dragActive.value = false
  void processFile(event.dataTransfer?.files?.[0])
}

function applyDataset() {
  if (parsedCustomers.value.length === 0) return
  emit('applyCustomers', parsedCustomers.value, fileName.value || 'Imported CSV')
  parseMessage.value = `${parsedCustomers.value.length} customers are now active across the RetentionX workspace.`
}

function clearPreview() {
  fileName.value = ''
  parsedCustomers.value = []
  issues.value = []
  totalRows.value = 0
  parseMessage.value = ''
}
</script>

<template>
  <div class="data-page">
    <section class="page-intro">
      <div>
        <span class="eyebrow">Data integration</span>
        <h2>Customer Data Studio</h2>
        <p>Load a customer portfolio, validate its structure and apply RetentionX risk scoring without changing the product workflow.</p>
      </div>
      <div class="source-chip"><span>Active dataset</span><strong>{{ sourceLabel }}</strong><small>{{ customers.length }} accounts</small></div>
    </section>

    <section class="data-grid">
      <article class="upload-panel panel">
        <div class="panel-heading">
          <div><span class="eyebrow">CSV ingestion</span><h3>Import customer records</h3></div>
          <button type="button" class="text-button" @click="downloadTemplate">Download template</button>
        </div>

        <label
          class="drop-zone"
          :class="{ active: dragActive }"
          @dragenter.prevent="dragActive = true"
          @dragover.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          @drop.prevent="onDrop"
        >
          <input type="file" accept=".csv,text/csv" @change="onFileInput" />
          <span class="upload-icon">⇧</span>
          <strong>{{ fileName || 'Drop a CSV file here' }}</strong>
          <p>or click to browse. RetentionX checks required columns, data types and value ranges before analysis.</p>
          <span class="browse-pill">Choose CSV</span>
        </label>

        <div class="schema-note">
          <strong>Required business signals</strong>
          <p>Company, industry, plan, MRR, licensed and active seats, current and previous logins, feature usage, support tickets, late payments, satisfaction and renewal days.</p>
        </div>

        <div class="panel-actions">
          <button type="button" class="secondary-button" @click="clearPreview">Clear preview</button>
          <button type="button" class="primary-button" :disabled="parsedCustomers.length === 0" @click="applyDataset">Apply to workspace</button>
        </div>
      </article>

      <article class="quality-panel panel">
        <div class="panel-heading"><div><span class="eyebrow">Validation</span><h3>Import readiness</h3></div><span class="quality-badge" :class="{ ready: parsedCustomers.length > 0 }">{{ parsedCustomers.length > 0 ? 'Ready' : 'Waiting' }}</span></div>
        <div class="quality-score">
          <div class="score-ring" :style="{ '--score': `${validRate * 3.6}deg` }"><span><strong>{{ validRate }}%</strong><small>valid rows</small></span></div>
          <div><strong>{{ parseMessage || 'Select a CSV to begin validation.' }}</strong><p>Invalid rows are skipped and listed below so the usable portfolio can still be reviewed.</p></div>
        </div>
        <div class="quality-metrics">
          <div><span>Rows detected</span><strong>{{ totalRows }}</strong></div>
          <div><span>Valid accounts</span><strong>{{ parsedCustomers.length }}</strong></div>
          <div><span>High risk</span><strong>{{ highRiskImported }}</strong></div>
          <div><span>Imported MRR</span><strong>{{ formatMoney(importRevenue) }}</strong></div>
        </div>
        <div class="issue-box">
          <div class="issue-heading"><strong>Validation messages</strong><span>{{ issues.length }}</span></div>
          <ul v-if="issues.length"><li v-for="issue in issues.slice(0, 7)" :key="`${issue.row}-${issue.message}`"><span>{{ issue.row ? `Row ${issue.row}` : 'File' }}</span>{{ issue.message }}</li></ul>
          <p v-else>No validation issues detected.</p>
          <small v-if="issues.length > 7">+ {{ issues.length - 7 }} more messages</small>
        </div>
      </article>
    </section>

    <section class="preview-panel panel">
      <div class="panel-heading">
        <div><span class="eyebrow">Preview</span><h3>Scored customer records</h3></div>
        <span>{{ parsedCustomers.length ? `${parsedCustomers.length} valid records` : 'No imported records' }}</span>
      </div>
      <div class="preview-table">
        <div class="preview-row header"><span>Customer</span><span>Plan</span><span>MRR</span><span>Health</span><span>Churn risk</span><span>Primary signal</span></div>
        <div v-for="customer in previewRows" :key="customer.id" class="preview-row">
          <span><strong>{{ customer.companyName }}</strong><small>{{ customer.industry }}</small></span>
          <span>{{ customer.plan }}</span><span>{{ formatMoney(customer.monthlyRevenue) }}</span><span>{{ customer.healthScore }}/100</span><span :class="customer.riskLevel.toLowerCase()">{{ customer.churnProbability }}%</span><span>{{ customer.riskReasons[0]?.label || 'Healthy account' }}</span>
        </div>
        <div v-if="previewRows.length === 0" class="empty-preview">Upload the provided template or your own compatible portfolio to preview the scored results.</div>
      </div>
    </section>

    <section class="dataset-actions panel">
      <div><span class="eyebrow">Workspace controls</span><h3>Current portfolio</h3><p>Export the active portfolio or return the workspace to the curated hackathon demo dataset.</p></div>
      <div><button type="button" class="secondary-button" @click="exportCurrent">Export active CSV</button><button type="button" class="danger-button" @click="emit('resetData')">Restore demo data</button></div>
    </section>

    <p class="disclaimer">Imported data remains in this browser only. No file is uploaded to an external server in this preliminary prototype.</p>
  </div>
</template>

<style scoped>
.data-page{display:grid;gap:17px;width:min(100%,1540px);margin:0 auto;padding:24px 26px 42px}.page-intro,.panel-heading,.dataset-actions{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.eyebrow{display:block;color:var(--rx-primary);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.14em}h2{margin:8px 0 7px;color:var(--rx-ink);font-size:clamp(25px,3vw,34px);letter-spacing:-.05em}.page-intro p,.dataset-actions p{max-width:650px;margin:0;color:var(--rx-muted);font-size:12px;line-height:1.55}.source-chip{min-width:215px;padding:11px 13px;border:1px solid var(--rx-border);border-radius:13px;background:#fff;box-shadow:var(--rx-shadow-sm)}.source-chip span,.source-chip strong,.source-chip small{display:block}.source-chip span{color:#9ca1a9;font-size:12px;font-weight:850;text-transform:uppercase}.source-chip strong{margin-top:5px;overflow:hidden;color:#373c43;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.source-chip small{margin-top:3px;color:var(--rx-success);font-size:12px}.data-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.panel{border:1px solid var(--rx-border);border-radius:19px;background:#fff;box-shadow:var(--rx-shadow-sm)}.upload-panel,.quality-panel,.preview-panel,.dataset-actions{padding:18px}.panel-heading{align-items:flex-start}.panel-heading h3,.dataset-actions h3{margin:5px 0 0;color:#30343a;font-size:13px}.text-button{border:0;color:var(--rx-primary);background:transparent;font-size:12px;font-weight:850;cursor:pointer}.drop-zone{display:grid;place-items:center;margin-top:14px;padding:30px 20px;border:1px dashed #cfd2d7;border-radius:16px;background:#fbfcff;text-align:center;cursor:pointer;transition:.16s ease}.drop-zone.active,.drop-zone:hover{border-color:var(--rx-primary);background:#f3f2f0}.drop-zone input{display:none}.upload-icon{display:grid;place-items:center;width:45px;height:45px;border-radius:14px;color:#fff;background:var(--rx-primary);font-size:21px}.drop-zone strong{margin-top:12px;color:#3c4148;font-size:11px}.drop-zone p{max-width:430px;margin:6px 0 0;color:#979ca5;font-size:12px;line-height:1.5}.browse-pill{margin-top:12px;padding:7px 10px;border:1px solid var(--rx-border-strong);border-radius:8px;color:#555b64;background:#fff;font-size:12px;font-weight:850}.schema-note{margin-top:12px;padding:12px;border:1px solid #e9e7ff;border-radius:12px;background:#f5f3ff}.schema-note strong{color:#171717;font-size:12px}.schema-note p{margin:5px 0 0;color:#8680ad;font-size:12px;line-height:1.5}.panel-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:13px}.primary-button,.secondary-button,.danger-button{min-height:35px;padding:0 11px;border-radius:9px;font-size:12px;font-weight:850;cursor:pointer}.primary-button{border:0;color:var(--rx-lime-ink);background:var(--rx-lime)}.primary-button:disabled{opacity:.45;cursor:not-allowed}.secondary-button{border:1px solid var(--rx-border-strong);color:#555c65;background:#fff}.danger-button{border:1px solid #ffdbe1;color:var(--rx-danger);background:var(--rx-danger-soft)}.quality-badge{padding:6px 8px;border:1px solid var(--rx-border);border-radius:8px;color:#8b919a;background:#f7f7f8;font-size:12px;font-weight:850;text-transform:uppercase}.quality-badge.ready{color:var(--rx-success);border-color:#c9f1eb;background:var(--rx-success-soft)}.quality-score{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;margin-top:16px}.score-ring{position:relative;display:grid;place-items:center;width:92px;height:92px;border-radius:50%;background:conic-gradient(var(--rx-success) var(--score),#eceef0 0)}.score-ring:before{content:'';position:absolute;width:68px;height:68px;border-radius:50%;background:#fff}.score-ring span{position:relative;z-index:1;text-align:center}.score-ring strong,.score-ring small{display:block}.score-ring strong{color:#30343a;font-size:20px}.score-ring small{margin-top:3px;color:#9ba0a8;font-size:12px;text-transform:uppercase}.quality-score>div:last-child>strong{color:#3a3f46;font-size:12px}.quality-score p{margin:5px 0 0;color:#959ba4;font-size:12px;line-height:1.5}.quality-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:14px}.quality-metrics>div{padding:10px;border:1px solid var(--rx-border);border-radius:10px}.quality-metrics span,.quality-metrics strong{display:block}.quality-metrics span{color:#9ca1aa;font-size:12px;text-transform:uppercase}.quality-metrics strong{margin-top:6px;color:#3d4249;font-size:12px}.issue-box{margin-top:12px;padding:12px;border:1px solid var(--rx-border);border-radius:12px;background:#fbfcff}.issue-heading{display:flex;justify-content:space-between;color:#4d535b;font-size:12px}.issue-heading span{display:grid;place-items:center;min-width:22px;height:20px;border-radius:7px;color:var(--rx-danger);background:var(--rx-danger-soft);font-size:12px}.issue-box ul{display:grid;gap:6px;margin:9px 0 0;padding:0;list-style:none}.issue-box li{color:#7f858e;font-size:12px}.issue-box li span{margin-right:7px;color:var(--rx-danger);font-weight:850}.issue-box p,.issue-box small{margin:8px 0 0;color:#959ba4;font-size:12px}.preview-panel{overflow:hidden;padding:0}.preview-panel .panel-heading{padding:18px}.preview-panel .panel-heading>span{color:#9ca1a9;font-size:12px}.preview-table{overflow-x:auto}.preview-row{display:grid;grid-template-columns:1.25fr .65fr .7fr .65fr .7fr 1.25fr;gap:10px;align-items:center;min-width:760px;padding:11px 18px;border-top:1px solid #eff0f2;color:#5d646d;font-size:12px}.preview-row.header{color:#9ba0a8;background:#fbfcff;font-size:12px;font-weight:850;text-transform:uppercase}.preview-row strong,.preview-row small{display:block}.preview-row strong{color:#343940}.preview-row small{margin-top:3px;color:#9ca1a9}.preview-row .high{color:var(--rx-danger)}.preview-row .medium{color:var(--rx-warning)}.preview-row .low{color:var(--rx-success)}.empty-preview{padding:46px;color:#979ca5;text-align:center;font-size:12px}.dataset-actions{align-items:center}.dataset-actions>div:last-child{display:flex;gap:8px}.disclaimer{margin:0 3px;color:#9ba0a9;font-size:12px;line-height:1.5}@media(max-width:1000px){.data-grid{grid-template-columns:1fr}}@media(max-width:700px){.data-page{padding:17px 14px 30px}.page-intro,.dataset-actions{align-items:flex-start;flex-direction:column}.source-chip{width:100%}.quality-metrics{grid-template-columns:1fr 1fr}.dataset-actions>div:last-child{width:100%}.dataset-actions button{flex:1}}
</style>
