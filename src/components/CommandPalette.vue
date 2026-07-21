<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { Customer } from '@/types/customer'
import type { ViewId } from '@/types/navigation'

const props = defineProps<{ open: boolean; customers: Customer[]; activeView: ViewId }>()
const emit = defineEmits<{ close: []; navigate: [view: ViewId]; openCustomer: [customerId: number] }>()
const query = ref('')
const input = ref<HTMLInputElement | null>(null)

const pages: Array<{ id: ViewId; label: string; helper: string; shortcut: string }> = [
  { id: 'overview', label: 'Executive overview', helper: 'Portfolio briefing and priority signals', shortcut: 'G O' },
  { id: 'customers', label: 'Customers', helper: 'Search customer health and churn risk', shortcut: 'G C' },
  { id: 'insights', label: 'Strategic insights', helper: 'Segments, hotspots and renewals', shortcut: 'G I' },
  { id: 'recommendations', label: 'Retention actions', helper: 'Review intervention work queue', shortcut: 'G A' },
  { id: 'scenarios', label: 'Scenario lab', helper: 'Compare intervention outcomes', shortcut: 'G S' },
  { id: 'data', label: 'Data studio', helper: 'Import and validate CSV data', shortcut: 'G D' },
  { id: 'model', label: 'Model transparency', helper: 'Inspect exact heuristic scoring rules', shortcut: 'G M' },
  { id: 'experiments', label: 'Experiments', helper: 'Track control and treatment groups', shortcut: 'G E' },
  { id: 'campaigns', label: 'Campaign simulation', helper: 'Compose simulated outreach', shortcut: 'G P' },
]

const normalised = computed(() => query.value.trim().toLowerCase())
const matchingPages = computed(() => pages.filter((page) => !normalised.value || `${page.label} ${page.helper}`.toLowerCase().includes(normalised.value)))
const matchingCustomers = computed(() => props.customers
  .filter((customer) => !normalised.value || `${customer.companyName} ${customer.industry} ${customer.plan}`.toLowerCase().includes(normalised.value))
  .sort((a, b) => b.churnProbability - a.churnProbability)
  .slice(0, normalised.value ? 8 : 5))

watch(() => props.open, async (value) => {
  if (value) {
    query.value = ''
    await nextTick()
    input.value?.focus()
  }
})

function riskLabel(customer: Customer) {
  return `${customer.churnProbability}% risk · ${customer.healthScore} health`
}
</script>

<template>
  <div v-if="open" class="command-overlay" @mousedown.self="emit('close')">
    <section class="command-panel" role="dialog" aria-modal="true" aria-label="Search RetentionX">
      <header>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
        <input ref="input" v-model="query" type="search" placeholder="Search customers or jump to a page…" />
        <kbd>Esc</kbd>
      </header>

      <div class="command-results">
        <section v-if="matchingCustomers.length">
          <p class="section-label">Priority customers</p>
          <button v-for="customer in matchingCustomers" :key="customer.id" type="button" @click="emit('openCustomer', customer.id)">
            <span class="customer-avatar">{{ customer.companyName.slice(0, 2).toUpperCase() }}</span>
            <span class="result-copy"><strong>{{ customer.companyName }}</strong><small>{{ customer.industry }} · {{ customer.plan }}</small></span>
            <span class="risk-copy" :class="customer.riskLevel.toLowerCase()"><strong>{{ riskLabel(customer) }}</strong><small>Open customer 360 →</small></span>
          </button>
        </section>

        <section v-if="matchingPages.length">
          <p class="section-label">Navigate</p>
          <button v-for="page in matchingPages" :key="page.id" type="button" :class="{ current: page.id === activeView }" @click="emit('navigate', page.id)">
            <span class="page-icon">→</span>
            <span class="result-copy"><strong>{{ page.label }}</strong><small>{{ page.helper }}</small></span>
            <kbd>{{ page.shortcut }}</kbd>
          </button>
        </section>

        <div v-if="!matchingCustomers.length && !matchingPages.length" class="empty-state">
          <span>⌕</span><strong>No results found</strong><p>Try a company, industry, plan or page name.</p>
        </div>
      </div>

      <footer><span><kbd>↵</kbd> Open</span><span><kbd>↵</kbd><kbd>↵</kbd> Browse</span><span>Press <strong>Ctrl K</strong> anywhere to search</span></footer>
    </section>
  </div>
</template>

<style scoped>
.command-overlay { position: fixed; z-index: 140; inset: 0; display: grid; place-items: start center; padding: min(12vh, 100px) 18px 28px; background: rgba(14, 16, 20, .48); backdrop-filter: blur(10px); }
.command-panel { width: min(680px, 100%); overflow: hidden; border: 1px solid rgba(255,255,255,.18); border-radius: 20px; background: #fff; box-shadow: 0 34px 100px rgba(10, 12, 16, .34); animation: command-in .16s ease-out; }
@keyframes command-in { from { transform: translateY(-10px) scale(.985); opacity: 0; } }
.command-panel > header { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; min-height: 64px; padding: 0 18px; border-bottom: 1px solid var(--rx-border); }
.command-panel > header svg { width: 20px; height: 20px; fill: none; stroke: #6b717c; stroke-width: 1.8; }
.command-panel > header input { width: 100%; border: 0; outline: 0; color: var(--rx-ink); background: transparent; font-size: 15px; }
kbd { display: inline-grid; place-items: center; min-width: 25px; min-height: 23px; padding: 0 6px; border: 1px solid #dfe1e5; border-bottom-color: #c9ccd1; border-radius: 7px; color: #717782; background: #f7f7f8; box-shadow: 0 1px 0 #d7dade; font: 700 9px/1 Inter, sans-serif; }
.command-results { max-height: min(65vh, 560px); overflow-y: auto; padding: 10px; }
.command-results section + section { margin-top: 8px; padding-top: 8px; border-top: 1px solid #f0f1f3; }
.section-label { margin: 0; padding: 8px 10px; color: #959aa3; font-size:12px; font-weight: 850; text-transform: uppercase; letter-spacing: .12em; }
.command-results button { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; width: 100%; padding: 11px 10px; border: 0; border-radius: 12px; color: inherit; background: transparent; text-align: left; cursor: pointer; }
.command-results button:hover, .command-results button.current { background: #f5f4fb; }
.customer-avatar, .page-icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; font-size: 11px; font-weight: 900; }
.customer-avatar { color: #171717; background: var(--rx-primary-soft); }
.page-icon { color: #47505b; background: #f0f1f3; font-size: 15px; }
.result-copy { min-width: 0; }
.result-copy strong, .result-copy small, .risk-copy strong, .risk-copy small { display: block; }
.result-copy strong { overflow: hidden; color: #25282d; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.result-copy small { margin-top: 4px; overflow: hidden; color: #9297a0; font-size:12px; text-overflow: ellipsis; white-space: nowrap; }
.risk-copy { text-align: right; }
.risk-copy strong { color: #5f6570; font-size:12px; }
.risk-copy small { margin-top: 4px; color: #a0a5ad; font-size:12px; }
.risk-copy.high strong { color: var(--rx-danger); }
.risk-copy.medium strong { color: var(--rx-warning); }
.risk-copy.low strong { color: var(--rx-success); }
.empty-state { display: grid; place-items: center; padding: 55px 20px; color: #9297a0; text-align: center; }
.empty-state > span { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 15px; background: #f1f2f4; font-size: 24px; }
.empty-state strong { margin-top: 12px; color: #3d4249; font-size: 13px; }
.empty-state p { margin: 5px 0 0; font-size:12px; }
.command-panel > footer { display: flex; align-items: center; gap: 16px; min-height: 42px; padding: 0 16px; border-top: 1px solid var(--rx-border); color: #9a9fa7; background: #fafafa; font-size:12px; }
.command-panel > footer span { display: inline-flex; align-items: center; gap: 5px; }
.command-panel > footer span:last-child { margin-left: auto; }
.command-panel > footer strong { color: #666c76; }
@media (max-width: 620px) { .risk-copy { display: none; } .command-panel > footer span:not(:last-child) { display: none; } .command-panel > footer span:last-child { margin: 0 auto; } }
</style>
