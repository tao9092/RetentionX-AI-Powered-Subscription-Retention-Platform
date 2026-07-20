<script setup lang="ts">
<<<<<<< HEAD
import { computed, ref,watchEffect, watch } from 'vue'
=======
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
>>>>>>> 6f53d89 (UI improve)
import Sidebar from '@/components/Sidebar.vue'
import type { ViewId } from '@/types/navigation'
import type { ActionStatus, ActionStatusMap } from '@/types/action'
import type { Customer } from '@/types/customer'
import TopBar from '@/components/TopBar.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import CustomerDetailDrawer from '@/components/CustomerDetailDrawer.vue'
import OverviewView from '@/views/OverviewView.vue'
import CustomersView from '@/views/CustomersView.vue'
import InsightsView from '@/views/InsightsView.vue'
import RecommendationsView from '@/views/RecommendationsView.vue'
import ScenarioLabView from '@/views/ScenarioLabView.vue'
import DataStudioView from '@/views/DataStudioView.vue'
import { customers as demoCustomers } from '@/data/customers'
import { generateRecommendation } from '@/utils/recommendationEngine'

<<<<<<< HEAD
const STORAGE_KEY = 'retentionx-action-statuses-v2'
import { useResponsive } from '@/utils/mobileOrPc'

const { isDesktop } = useResponsive()
const mobileOrPc = ref(isDesktop.value ? true : false)
const activeView = ref<ViewId>('overview')
const selectedCustomerId = ref<number | null>(null)
const scenarioCustomerId = ref<number | null>(null)
const mobileNavOpen = ref(true)

watchEffect(() => {
  mobileNavOpen.value = isDesktop.value
  mobileOrPc.value = isDesktop.value ? true : false
})
const recommendations = customers.map(generateRecommendation)
=======
const ACTION_STORAGE_KEY = 'retentionx-action-statuses-v5'
const DATA_STORAGE_KEY = 'retentionx-customer-dataset-v5'
const DATA_SOURCE_KEY = 'retentionx-data-source-v5'
const activeView = ref<ViewId>('overview')
const selectedCustomerId = ref<number | null>(null)
const scenarioCustomerId = ref<number | null>(null)
const mobileNavOpen = ref(false)
const commandOpen = ref(false)
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
>>>>>>> 6f53d89 (UI improve)

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

watch(actionStatuses, (value: ActionStatusMap) => {
  window.localStorage.setItem(ACTION_STORAGE_KEY, JSON.stringify(value))
}, { deep: true })

watch(customers, (value: Customer[]) => {
  window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(value))
}, { deep: true })

watch(dataSourceLabel, (value: string) => {
  window.localStorage.setItem(DATA_SOURCE_KEY, value)
})

const selectedCustomer = computed(() => customers.value.find((customer) => customer.id === selectedCustomerId.value) ?? null)
const selectedRecommendation = computed(() => recommendations.value.find((item) => item.customerId === selectedCustomerId.value) ?? null)

const pageMeta = computed(() => {
  if (activeView.value === 'customers') return { eyebrow: 'Portfolio', title: 'Customers', subtitle: 'Account health, churn risk and explainable signals' }
  if (activeView.value === 'insights') return { eyebrow: 'Intelligence', title: 'Strategic insights', subtitle: 'Risk-value segmentation, renewals and portfolio hotspots' }
  if (activeView.value === 'recommendations') return { eyebrow: 'Workflow', title: 'Retention actions', subtitle: 'Prioritised customer-success interventions and ownership' }
  if (activeView.value === 'scenarios') return { eyebrow: 'Decision lab', title: 'Scenario lab', subtitle: 'Compare intervention cost, projected risk and revenue impact' }
  if (activeView.value === 'data') return { eyebrow: 'Operations', title: 'Data studio', subtitle: 'Import, validate and activate customer subscription data' }
  return { eyebrow: 'Morning briefing', title: 'Executive overview', subtitle: 'Subscription retention intelligence for customer-success teams' }
})

function showToast(message: string) {
  toastMessage.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMessage.value = '' }, 2600)
}

function navigate(view: ViewId) {
  activeView.value = view
  commandOpen.value = false
}

function openCustomer(customerId: number) {
  selectedCustomerId.value = customerId
  commandOpen.value = false
}

function openScenario(customerId?: number) {
  scenarioCustomerId.value = customerId ?? scenarioCustomerId.value
  selectedCustomerId.value = null
  activeView.value = 'scenarios'
  commandOpen.value = false
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
<<<<<<< HEAD
    <Sidebar :active-view="activeView" :mobile-or-pc="mobileOrPc" :mobile-open="mobileNavOpen" @navigate="navigate" @close="mobileNavOpen = false" />
    <main class="main-area">
      <TopBar :title="pageMeta.title" :mobile-nav-open="mobileNavOpen" :subtitle="pageMeta.subtitle" @toggle-nav="mobileNavOpen = true" />
=======
    <Sidebar
      :active-view="activeView"
      :mobile-open="mobileNavOpen"
      :priority-count="priorityCount"
      @navigate="navigate"
      @close="mobileNavOpen = false"
      @open-command="commandOpen = true"
    />

    <main class="main-area">
      <TopBar
        :eyebrow="pageMeta.eyebrow"
        :title="pageMeta.title"
        :subtitle="pageMeta.subtitle"
        :source-label="dataSourceLabel"
        :priority-count="priorityCount"
        @toggle-nav="mobileNavOpen = true"
        @open-command="commandOpen = true"
        @review-risk="navigate('recommendations')"
      />

>>>>>>> 6f53d89 (UI improve)
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

    <CustomerDetailDrawer
      v-if="selectedCustomer && selectedRecommendation"
      :customer="selectedCustomer"
      :recommendation="selectedRecommendation"
      :action-status="actionStatuses[String(selectedCustomer.id)] ?? 'Not started'"
      @close="selectedCustomerId = null"
      @open-scenario="openScenario"
      @update-status="updateActionStatus"
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
  --rx-bg: #f4f5f7;
  --rx-surface: #ffffff;
  --rx-surface-soft: #f8f8fa;
  --rx-sidebar: #111316;
  --rx-sidebar-soft: #1a1d21;
  --rx-ink: #17191d;
  --rx-ink-soft: #3f454e;
  --rx-muted: #7c838e;
  --rx-faint: #a3a8b1;
  --rx-border: #e4e6e9;
  --rx-border-strong: #d7dade;
  --rx-primary: #6656e8;
  --rx-primary-dark: #4d3fd1;
  --rx-primary-soft: #f0edff;
  --rx-lime: #d8ff72;
  --rx-lime-ink: #253108;
  --rx-danger: #df4b64;
  --rx-danger-soft: #fff0f3;
  --rx-warning: #d98a16;
  --rx-warning-soft: #fff5df;
  --rx-success: #1e9d72;
  --rx-success-soft: #eaf8f3;
  --rx-blue: #277fe8;
  --rx-blue-soft: #edf5ff;
  --rx-radius-sm: 10px;
  --rx-radius-md: 16px;
  --rx-radius-lg: 22px;
  --rx-shadow-sm: 0 1px 2px rgba(20, 23, 29, .04), 0 8px 24px rgba(20, 23, 29, .035);
  --rx-shadow-md: 0 20px 60px rgba(20, 23, 29, .12);
  background: var(--rx-bg);
}

* { box-sizing: border-box; }
html { min-width: 320px; background: var(--rx-bg); }
body { min-width: 320px; min-height: 100vh; margin: 0; color: var(--rx-ink); background: var(--rx-bg); }
button, input, select, textarea { font: inherit; }
button { -webkit-tap-highlight-color: transparent; }
button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 3px solid rgba(102, 86, 232, .22);
  outline-offset: 2px;
}
.app-shell { display: flex; min-height: 100vh; }
<<<<<<< HEAD
.main-area { min-width: 0; flex: 1; min-height: 100vh; background: linear-gradient(180deg, #f7f8fc, #f4f5f9);}
::selection { color: #fff; background: #6d55dd; }
=======
.main-area { min-width: 0; flex: 1; min-height: 100vh; background: var(--rx-bg); }
::selection { color: #fff; background: var(--rx-primary); }
>>>>>>> 6f53d89 (UI improve)
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { border: 3px solid transparent; border-radius: 99px; background: #c3c7ce; background-clip: padding-box; }
::-webkit-scrollbar-track { background: transparent; }
.toast-message { position: fixed; z-index: 150; right: 26px; bottom: 26px; display: flex; align-items: center; gap: 10px; max-width: min(360px, calc(100vw - 32px)); padding: 12px 15px; border: 1px solid #2d3137; border-radius: 14px; color: #f6f7f8; background: #17191d; box-shadow: var(--rx-shadow-md); font-size: 12px; font-weight: 700; }
.toast-icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 8px; color: var(--rx-lime-ink); background: var(--rx-lime); font-size: 12px; }
.toast-enter-active, .toast-leave-active { transition: .2s ease; }
.toast-enter-from, .toast-leave-to { transform: translateY(10px); opacity: 0; }
@media (max-width: 700px) { .toast-message { right: 16px; bottom: 16px; left: 16px; } }
</style>
