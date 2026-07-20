<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import TopBar from '@/components/TopBar.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import OverviewView from '@/views/OverviewView.vue'
import CustomersView from '@/views/CustomersView.vue'
import CustomerDetailView from '@/views/CustomerDetailView.vue'
import InsightsView from '@/views/InsightsView.vue'
import RecommendationsView from '@/views/RecommendationsView.vue'
import ScenarioLabView from '@/views/ScenarioLabView.vue'
import DataStudioView from '@/views/DataStudioView.vue'
import type { ViewId } from '@/types/navigation'
import type { ActionStatus, ActionStatusMap } from '@/types/action'
import type { Customer } from '@/types/customer'
import { customers as demoCustomers } from '@/data/customers'
import { generateRecommendation } from '@/utils/recommendationEngine'

const ACTION_STORAGE_KEY = 'retentionx-action-statuses-v8'
const DATA_STORAGE_KEY = 'retentionx-customer-dataset-v8'
const DATA_SOURCE_KEY = 'retentionx-data-source-v8'
const SIDEBAR_STORAGE_KEY = 'retentionx-sidebar-collapsed-v8'

const activeView = ref<ViewId>('overview')
const previousView = ref<ViewId>('customers')
const selectedCustomerId = ref<number | null>(null)
const scenarioCustomerId = ref<number | null>(null)
const mobileNavOpen = ref(false)
const commandOpen = ref(false)
const sidebarCollapsed = ref(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true')
const toastMessage = ref('')
let toastTimer: number | undefined

function loadCustomers(): Customer[] {
  try {
    const stored = window.localStorage.getItem(DATA_STORAGE_KEY)
    return stored ? JSON.parse(stored) as Customer[] : demoCustomers
  } catch {
    return demoCustomers
  }
}

function loadActionStatuses(): ActionStatusMap {
  try {
    const stored = window.localStorage.getItem(ACTION_STORAGE_KEY)
    return stored ? JSON.parse(stored) as ActionStatusMap : {}
  } catch {
    return {}
  }
}

const customers = ref<Customer[]>(loadCustomers())
const dataSourceLabel = ref(window.localStorage.getItem(DATA_SOURCE_KEY) ?? 'Curated hackathon demo')
const actionStatuses = ref<ActionStatusMap>(loadActionStatuses())
const recommendations = computed(() => customers.value.map(generateRecommendation))
const priorityCount = computed(() => recommendations.value.filter((item) => item.priority !== 'Normal' && actionStatuses.value[String(item.customerId)] !== 'Completed').length)
const selectedCustomer = computed(() => customers.value.find((customer) => customer.id === selectedCustomerId.value) ?? null)
const selectedRecommendation = computed(() => recommendations.value.find((item) => item.customerId === selectedCustomerId.value) ?? null)

watch(actionStatuses, (value: ActionStatusMap) => window.localStorage.setItem(ACTION_STORAGE_KEY, JSON.stringify(value)), { deep: true })
watch(customers, (value: Customer[]) => window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(value)), { deep: true })
watch(dataSourceLabel, (value: string) => window.localStorage.setItem(DATA_SOURCE_KEY, value))
watch(sidebarCollapsed, (value: boolean) => window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value)))

const pageMeta = computed(() => {
  if (activeView.value === 'customers') return { eyebrow: 'Portfolio', title: 'Customers', subtitle: 'Account health, churn risk and explainable signals' }
  if (activeView.value === 'customerDetail') return { eyebrow: 'Customer intelligence', title: selectedCustomer.value?.companyName ?? 'Customer 360', subtitle: 'Risk signals, account context and recommended intervention' }
  if (activeView.value === 'insights') return { eyebrow: 'Intelligence', title: 'Strategic insights', subtitle: 'Risk-value segmentation, renewals and portfolio hotspots' }
  if (activeView.value === 'recommendations') return { eyebrow: 'Workflow', title: 'Retention actions', subtitle: 'Prioritised customer-success interventions and ownership' }
  if (activeView.value === 'scenarios') return { eyebrow: 'Decision lab', title: 'Scenario lab', subtitle: 'Compare intervention cost, projected risk and revenue impact' }
  if (activeView.value === 'data') return { eyebrow: 'Operations', title: 'Data studio', subtitle: 'Import, validate and activate customer subscription data' }
  return { eyebrow: 'Executive workspace', title: 'Retention overview', subtitle: 'Subscription retention intelligence for customer-success teams' }
})

function showToast(message: string) {
  toastMessage.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMessage.value = '' }, 2600)
}

function navigate(view: ViewId) {
  activeView.value = view
  if (view !== 'customerDetail') selectedCustomerId.value = null
  commandOpen.value = false
}

function openCustomer(customerId: number) {
  if (activeView.value !== 'customerDetail') previousView.value = activeView.value
  selectedCustomerId.value = customerId
  activeView.value = 'customerDetail'
  commandOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function backFromCustomer() {
  activeView.value = previousView.value === 'customerDetail' ? 'customers' : previousView.value
  selectedCustomerId.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openScenario(customerId?: number) {
  scenarioCustomerId.value = customerId ?? scenarioCustomerId.value
  selectedCustomerId.value = null
  activeView.value = 'scenarios'
  commandOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function updateActionStatus(customerId: number, status: ActionStatus) {
  actionStatuses.value = { ...actionStatuses.value, [String(customerId)]: status }
  const customer = customers.value.find((item) => item.id === customerId)
  showToast(`${customer?.companyName ?? 'Account'} moved to ${status}`)
}

function addToActionQueue(customerId: number) {
  updateActionStatus(customerId, 'Planned')
  activeView.value = 'recommendations'
}

function applyCustomers(importedCustomers: Customer[], sourceLabel: string) {
  customers.value = importedCustomers
  dataSourceLabel.value = sourceLabel
  actionStatuses.value = {}
  selectedCustomerId.value = null
  scenarioCustomerId.value = importedCustomers[0]?.id ?? null
  activeView.value = 'overview'
  showToast(`${importedCustomers.length} customer records activated`)
}

function resetData() {
  customers.value = demoCustomers
  dataSourceLabel.value = 'Curated hackathon demo'
  actionStatuses.value = {}
  selectedCustomerId.value = null
  scenarioCustomerId.value = null
  activeView.value = 'overview'
  showToast('Demo portfolio restored')
}

function handleKeyboard(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    commandOpen.value = !commandOpen.value
  }
  if (event.key === 'Escape') commandOpen.value = false
}

onMounted(() => window.addEventListener('keydown', handleKeyboard))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyboard)
  window.clearTimeout(toastTimer)
})
</script>

<template>
  <div class="app-shell">
    <Sidebar
      :active-view="activeView"
      :mobile-open="mobileNavOpen"
      :collapsed="sidebarCollapsed"
      :priority-count="priorityCount"
      @navigate="navigate"
      @close="mobileNavOpen = false"
      @open-command="commandOpen = true"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <main class="main-area">
      <TopBar
        :eyebrow="pageMeta.eyebrow"
        :title="pageMeta.title"
        :subtitle="pageMeta.subtitle"
        :priority-count="priorityCount"
        @toggle-nav="mobileNavOpen = true"
        @open-command="commandOpen = true"
        @review-risk="navigate('recommendations')"
      />

      <OverviewView
        v-if="activeView === 'overview'"
        :customers="customers"
        :recommendations="recommendations"
        :action-statuses="actionStatuses"
        @open-customer="openCustomer"
        @view-customers="navigate('customers')"
        @view-actions="navigate('recommendations')"
        @view-scenarios="openScenario()"
      />
      <CustomersView v-else-if="activeView === 'customers'" :customers="customers" @open-customer="openCustomer" />
      <CustomerDetailView
        v-else-if="activeView === 'customerDetail' && selectedCustomer && selectedRecommendation"
        :customer="selectedCustomer"
        :recommendation="selectedRecommendation"
        :action-status="actionStatuses[String(selectedCustomer.id)] ?? 'Not started'"
        @back="backFromCustomer"
        @open-scenario="openScenario"
        @update-status="updateActionStatus"
      />
      <InsightsView
        v-else-if="activeView === 'insights'"
        :customers="customers"
        :action-statuses="actionStatuses"
        @open-customer="openCustomer"
        @view-actions="navigate('recommendations')"
      />
      <RecommendationsView
        v-else-if="activeView === 'recommendations'"
        :customers="customers"
        :recommendations="recommendations"
        :action-statuses="actionStatuses"
        @open-customer="openCustomer"
        @open-scenario="openScenario"
        @update-status="updateActionStatus"
      />
      <ScenarioLabView
        v-else-if="activeView === 'scenarios'"
        :customers="customers"
        :initial-customer-id="scenarioCustomerId"
        @open-customer="openCustomer"
        @create-action="addToActionQueue"
      />
      <DataStudioView
        v-else
        :customers="customers"
        :source-label="dataSourceLabel"
        @apply-customers="applyCustomers"
        @reset-data="resetData"
      />
    </main>

    <CommandPalette
      :open="commandOpen"
      :customers="customers"
      :active-view="activeView"
      @close="commandOpen = false"
      @navigate="navigate"
      @open-customer="openCustomer"
    />

    <transition name="toast">
      <div v-if="toastMessage" class="toast-message" role="status">
        <span class="toast-icon">✓</span>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<style>

:root {
  color-scheme: light;
  font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --rx-bg: #f6f7fc;
  --rx-surface: #ffffff;
  --rx-surface-soft: #f4f6fb;
  --rx-sidebar: #ffffff;
  --rx-sidebar-soft: #f1f3fb;
  --rx-ink: #1f2753;
  --rx-ink-soft: #3b4774;
  --rx-muted: #69769a;
  --rx-faint: #8792af;
  --rx-border: #dfe3f1;
  --rx-border-strong: #cfd5e6;
  --rx-primary: #625cf6;
  --rx-primary-dark: #4b46c9;
  --rx-primary-soft: #ecebff;
  --rx-lime: #39d0c2;
  --rx-lime-ink: #123f49;
  --rx-danger: #e45768;
  --rx-danger-soft: #fff0f2;
  --rx-warning: #d8942c;
  --rx-warning-soft: #fff3d6;
  --rx-success: #16b8a6;
  --rx-success-soft: #ddf8f4;
  --rx-blue: #2d7ff9;
  --rx-blue-soft: #e5f0ff;
  --rx-radius-sm: 13px;
  --rx-radius-md: 19px;
  --rx-radius-lg: 26px;
  --rx-shadow-sm: 0 12px 34px rgba(48,46,129,.08);
  --rx-shadow-md: 0 24px 70px rgba(48,46,129,.17);
  background: var(--rx-bg);
}
* { box-sizing: border-box; }
html { min-width: 320px; background: var(--rx-bg); scroll-behavior: smooth; }
body { min-width: 320px; min-height: 100vh; margin: 0; color: var(--rx-ink); background: var(--rx-bg); font-size: 18px; }
button, input, select, textarea { font: inherit; }
button { -webkit-tap-highlight-color: transparent; }
button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 3px solid rgba(98,92,246,.26); outline-offset: 2px; }
.app-shell { display: flex; min-height: 100vh; }
.main-area { min-width: 0; flex: 1; min-height: 100vh; background: radial-gradient(circle at 100% 0%, rgba(98,92,246,.10), transparent 30%), radial-gradient(circle at 8% 96%, rgba(22,184,166,.08), transparent 26%), var(--rx-bg); }
::selection { color: #fff; background: var(--rx-primary); }
::-webkit-scrollbar { width: 11px; height: 11px; }
::-webkit-scrollbar-thumb { border: 3px solid transparent; border-radius: 99px; background: #aab2c8; background-clip: padding-box; }
::-webkit-scrollbar-track { background: transparent; }
.toast-message { position: fixed; z-index: 150; right: 28px; bottom: 28px; display: flex; align-items: center; gap: 12px; max-width: min(440px, calc(100vw - 32px)); padding: 17px 20px; border: 1px solid #4d4db8; border-radius: 17px; color: #fff; background: #1f2753; box-shadow: var(--rx-shadow-md); font-size: 15px; font-weight: 750; }
.toast-icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 10px; color: #1f2753; background: #39d0c2; font-size: 15px; }
.toast-enter-active, .toast-leave-active { transition: .2s ease; }
.toast-enter-from, .toast-leave-to { transform: translateY(10px); opacity: 0; }
@media (max-width: 700px) { .toast-message { right: 16px; bottom: 16px; left: 16px; } }
</style>
