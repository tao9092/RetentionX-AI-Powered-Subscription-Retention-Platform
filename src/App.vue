<script setup lang="ts">
import { computed, ref,watchEffect, watch } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import type { ViewId } from '@/types/navigation'
import type { ActionStatus, ActionStatusMap } from '@/types/action'
import TopBar from '@/components/TopBar.vue'
import CustomerDetailDrawer from '@/components/CustomerDetailDrawer.vue'
import OverviewView from '@/views/OverviewView.vue'
import CustomersView from '@/views/CustomersView.vue'
import RecommendationsView from '@/views/RecommendationsView.vue'
import ScenarioLabView from '@/views/ScenarioLabView.vue'
import { customers } from '@/data/customers'
import { generateRecommendation } from '@/utils/recommendationEngine'

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

function loadActionStatuses(): ActionStatusMap {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as ActionStatusMap : {}
  } catch {
    return {}
  }
}

const actionStatuses = ref<ActionStatusMap>(loadActionStatuses())

watch(actionStatuses, (value: ActionStatusMap) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}, { deep: true })

const selectedCustomer = computed(() => customers.find((customer) => customer.id === selectedCustomerId.value) ?? null)
const selectedRecommendation = computed(() => recommendations.find((item) => item.customerId === selectedCustomerId.value) ?? null)

const pageMeta = computed(() => {
  if (activeView.value === 'customers') return { title: 'Customers', subtitle: 'Account health, churn risk and explainable signals' }
  if (activeView.value === 'recommendations') return { title: 'Retention Actions', subtitle: 'A persistent work queue for customer-success intervention' }
  if (activeView.value === 'scenarios') return { title: 'Scenario Lab', subtitle: 'Compare intervention cost, projected risk and revenue impact' }
  return { title: 'Executive Overview', subtitle: 'Subscription retention intelligence for customer-success teams' }
})

function navigate(view: ViewId) {
  activeView.value = view
}

function openCustomer(customerId: number) {
  selectedCustomerId.value = customerId
}

function openScenario(customerId?: number) {
  scenarioCustomerId.value = customerId ?? scenarioCustomerId.value
  selectedCustomerId.value = null
  activeView.value = 'scenarios'
}

function updateActionStatus(customerId: number, status: ActionStatus) {
  actionStatuses.value = { ...actionStatuses.value, [String(customerId)]: status }
}

function addToActionQueue(customerId: number) {
  updateActionStatus(customerId, 'Planned')
  activeView.value = 'recommendations'
}
</script>

<template>
  <div class="app-shell">
    <Sidebar :active-view="activeView" :mobile-or-pc="mobileOrPc" :mobile-open="mobileNavOpen" @navigate="navigate" @close="mobileNavOpen = false" />
    <main class="main-area">
      <TopBar :title="pageMeta.title" :mobile-nav-open="mobileNavOpen" :subtitle="pageMeta.subtitle" @toggle-nav="mobileNavOpen = true" />
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
        v-else
        :customers="customers"
        :initial-customer-id="scenarioCustomerId"
        @open-customer="openCustomer"
        @create-action="addToActionQueue"
      />
    </main>

    <CustomerDetailDrawer
      v-if="selectedCustomer && selectedRecommendation"
      :customer="selectedCustomer"
      :recommendation="selectedRecommendation"
      :action-status="actionStatuses[String(selectedCustomer.id)] ?? 'Not started'"
      @close="selectedCustomerId = null"
      @open-scenario="openScenario"
      @update-status="updateActionStatus"
    />
  </div>
</template>

<style>
:root {
  color-scheme: light;
  font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  background: #f5f6fa;
}
* { box-sizing: border-box; }
html { min-width: 320px; background: #f5f6fa; }
body { min-width: 320px; min-height: 100vh; margin: 0; background: #f5f6fa; }
button, input, select { font: inherit; }
button:focus-visible, input:focus-visible, select:focus-visible { outline: 3px solid rgba(112, 86, 223, .25); outline-offset: 2px; }
.app-shell { display: flex; min-height: 100vh; }
.main-area { min-width: 0; flex: 1; min-height: 100vh; background: linear-gradient(180deg, #f7f8fc, #f4f5f9);}
::selection { color: #fff; background: #6d55dd; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { border: 3px solid transparent; border-radius: 99px; background: #c9cdd9; background-clip: padding-box; }
</style>
