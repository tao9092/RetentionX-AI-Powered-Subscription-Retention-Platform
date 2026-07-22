<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { ViewId } from '@/types/navigation'

const props = defineProps<{
  activeView: ViewId
  mobileOpen: boolean
  collapsed: boolean
  priorityCount: number
}>()

const emit = defineEmits<{
  navigate: [view: ViewId]
  close: []
  openCommand: []
  toggleCollapse: []
}>()

const moreOpen = ref(false)
const moreWrap = ref<HTMLElement | null>(null)

const primaryItems: Array<{ id: ViewId; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'customers', label: 'Customers', icon: 'customers' },
  { id: 'recommendations', label: 'Action queue', icon: 'actions' },
  { id: 'scenarios', label: 'Scenario lab', icon: 'scenarios' },
]

const moreItems: Array<{ id: ViewId; label: string; description: string; icon: string }> = [
  { id: 'insights', label: 'Strategic insights', description: 'Segments, drivers and renewals', icon: 'insights' },
  { id: 'data', label: 'Data studio', description: 'Import and validate customer data', icon: 'data' },
  { id: 'model', label: 'Model transparency', description: 'Rules, sources and score breakdown', icon: 'data' },
  { id: 'experiments', label: 'Experiments', description: 'Control and treatment tracking', icon: 'insights' },
  { id: 'campaigns', label: 'Campaign simulation', description: 'Simulated retention outreach', icon: 'data' },
]

function navigate(id: ViewId) {
  emit('navigate', id)
  emit('close')
  moreOpen.value = false
}

async function toggleMore() {
  moreOpen.value = !moreOpen.value
  if (moreOpen.value && !props.collapsed) {
    await nextTick()
    moreWrap.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

function isMoreActive() {
  return ['insights','data','model','experiments','campaigns'].includes(props.activeView)
}
</script>

<template>
  <div v-if="mobileOpen" class="nav-overlay" @click="emit('close')"></div>

  <aside class="sidebar" :class="{ open: mobileOpen, collapsed }">
    <div class="brand-row">
      <button class="brand" type="button" title="RetentionX" @click="navigate('overview')">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 42 42"><path d="M10 28V18M21 31V10M32 25V15"/><path d="M7 34h28"/></svg>
        </span>
        <span class="brand-copy">
          <strong>RetentionX</strong>
        </span>
      </button>

      <button class="collapse-button desktop-only" type="button" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" @click="emit('toggleCollapse')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="collapsed ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'"/></svg>
      </button>
      <button class="close-nav" type="button" aria-label="Close navigation" @click="emit('close')">×</button>
    </div>

    <div class="sidebar-scroll">
      <button class="command-button" type="button" title="Search customers" @click="emit('openCommand')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
        <span>Search customers</span>
        <kbd>Ctrl K</kbd>
      </button>

      <nav aria-label="Primary navigation">
      <p class="nav-section-label">Workspace</p>
      <button
        v-for="item in primaryItems"
        :key="item.id"
        type="button"
        class="nav-item"
        :class="{ active: activeView === item.id || (activeView === 'customerDetail' && item.id === 'customers') }"
        :title="collapsed ? item.label : undefined"
        @click="navigate(item.id)"
      >
        <span class="nav-icon" aria-hidden="true">
          <svg v-if="item.icon === 'overview'" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="4" rx="2"/><rect x="14" y="11" width="7" height="10" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></svg>
          <svg v-else-if="item.icon === 'customers'" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <svg v-else-if="item.icon === 'actions'" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <svg v-else viewBox="0 0 24 24"><path d="M4 19V8M10 19V4M16 19v-7M22 19H2M3 7l7-4 6 7 6-5"/></svg>
        </span>
        <span class="nav-copy">{{ item.label }}</span>
        <span v-if="item.id === 'recommendations' && priorityCount > 0" class="nav-count">{{ priorityCount }}</span>
      </button>

      <div ref="moreWrap" class="more-wrap">
        <button
          class="nav-item more-trigger"
          :class="{ active: isMoreActive(), expanded: moreOpen }"
          type="button"
          :title="collapsed ? 'More tools' : undefined"
          @click="toggleMore"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>
          </span>
          <span class="nav-copy">More tools</span>
          <svg class="chevron" viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></svg>
        </button>

        <div v-if="moreOpen" class="more-menu" :class="{ floating: collapsed }">
          <button v-for="item in moreItems" :key="item.id" type="button" :class="{ active: activeView === item.id }" @click="navigate(item.id)">
            <span class="more-icon">
              <svg v-if="item.icon === 'insights'" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2M3 9l7-5 6 7 6-5"/></svg>
              <svg v-else viewBox="0 0 24 24"><path d="M4 4h16v5H4zM4 13h16v7H4zM8 9v4M16 9v4"/></svg>
            </span>
            <span><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span>
          </button>
        </div>
      </div>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  z-index: 40;
  top: 0;
  display: flex;
  flex-direction: column;
  width: 284px;
  min-width: 284px;
  height: 100vh;
  padding: 24px 18px 18px;
  color: #d8deec;
  background: #111827;
  border-right: 1px solid #202b3e;
  transition: width .22s ease, min-width .22s ease, transform .22s ease;
}
.sidebar-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: #c9ccef transparent;
}
.sidebar-scroll::-webkit-scrollbar { width: 7px; }
.sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
.sidebar-scroll::-webkit-scrollbar-thumb { border-radius: 999px; background: #c9ccef; }
.sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #9ea3de; }
.sidebar.collapsed { width: 88px; min-width: 88px; padding-inline: 14px; }
.brand-row { display: flex; align-items: center; gap: 10px; min-height: 54px; margin-bottom: 24px; }
.brand { display: flex; flex: 1; align-items: center; gap: 12px; min-width: 0; padding: 0; border: 0; color: inherit; background: transparent; cursor: pointer; }
.brand-mark { display: grid; flex: 0 0 48px; place-items: center; width: 48px; height: 48px; border-radius: 16px; color: #ffffff; background: #171717; box-shadow: 0 10px 24px rgba(98,92,246,.20); }
.brand-mark svg { width: 30px; height: 30px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
.brand-copy { min-width: 0; transition: opacity .14s ease; }
.brand-copy strong, .brand-copy small { display: block; text-align: left; white-space: nowrap; }
.brand-copy strong { color: #ffffff; font-size: 21px; line-height: 1.05; letter-spacing: -.04em; }
.brand-copy small { margin-top: 6px; color: #8895ab; font-size: 13px; font-weight: 650; }
.collapse-button, .close-nav { display: grid; flex: 0 0 auto; place-items: center; width: 38px; height: 38px; padding: 0; border: 1px solid #dedacd; border-radius: 12px; color: #59688d; background: #ffffff; cursor: pointer; }
.collapse-button:hover, .close-nav:hover { color: #fff; border-color: #171717; background: #171717; }
.collapse-button svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; }
.close-nav { display: none; font-size: 26px; }
.command-button { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; width: 100%; min-height: 54px; margin-bottom: 28px; padding: 0 14px; border: 1px solid #2d394e; border-radius: 15px; color: #aeb8ca; background: #192235; text-align: left; cursor: pointer; }
.command-button:hover { color: #171717; border-color: #a2b5cd; background: #f3f2f0; }
.command-button svg { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-width: 1.9; }
.command-button span { overflow: hidden; font-size: 15px; font-weight: 700; white-space: nowrap; }
kbd { min-width: 47px; padding: 6px 8px; border: 1px solid #d9deed; border-radius: 8px; color: #64729a; background: #ffffff; font: 750 11px/1 ui-sans-serif, sans-serif; text-align: center; }
nav { display: grid; gap: 8px; min-height: 0; overflow: visible; }
.nav-section-label { margin: 0 0 8px; padding: 0 12px; color: #69758b; font-size: 11px; font-weight: 850; text-transform: uppercase; letter-spacing: .12em; }
.nav-item { display: grid; grid-template-columns: auto 1fr auto; gap: 13px; align-items: center; width: 100%; min-height: 52px; padding: 0 12px; border: 1px solid transparent; border-radius: 13px; color: #aeb8ca; background: transparent; text-align: left; cursor: pointer; transition: .16s ease; }
.nav-item:hover { color: #fff; background: #1d293c; }
.nav-item.active { color: #fff; border-color: #171717; background: #171717; box-shadow: 0 10px 24px rgba(98,92,246,.20); }
.nav-icon { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 12px; color: inherit; background: rgba(23,76,63,.06); }
.nav-item.active .nav-icon { background: rgba(255,255,255,.13); }
.nav-icon svg, .chevron, .more-icon svg { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.nav-copy { overflow: hidden; font-size: 16px; font-weight: 750; white-space: nowrap; }
.nav-count { display: grid; place-items: center; min-width: 28px; height: 28px; padding: 0 8px; border-radius: 9px; color: #171717; background: #dff7f3; font-size: 12px; font-weight: 850; }
.nav-item.active .nav-count { color: #171717; background: #69ded2; }
.chevron { width: 18px; height: 18px; transition: transform .18s ease; }
.more-trigger.expanded .chevron { transform: rotate(180deg); }
.more-wrap { position: relative; }
.more-menu { display: grid; gap: 7px; margin-top: 8px; padding: 8px; border: 1px solid #dfe3f0; border-radius: 16px; background: #ffffff; box-shadow: 0 18px 45px rgba(35,56,49,.14); }
.more-menu button { display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center; width: 100%; padding: 12px; border: 0; border-radius: 12px; color: #59688d; background: transparent; text-align: left; cursor: pointer; }
.more-menu button:hover, .more-menu button.active { color: #171717; background: #f3f2f0; }
.more-icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; background: #eef1fa; }
.more-menu strong, .more-menu small { display: block; }
.more-menu strong { font-size: 14px; }
.more-menu small { margin-top: 4px; color: #7a86a6; font-size: 12px; }
.more-menu.floating { position: absolute; top: 0; left: 66px; width: 270px; margin: 0; }
.nav-overlay { display: none; }
.sidebar.collapsed .brand-copy,
.sidebar.collapsed .command-button span,
.sidebar.collapsed .command-button kbd,
.sidebar.collapsed .nav-copy,
.sidebar.collapsed .nav-count,
.sidebar.collapsed .nav-section-label,
.sidebar.collapsed .chevron { display: none; }
.sidebar.collapsed .sidebar-scroll { overflow: visible; padding-right: 0; }
.sidebar.collapsed .brand-row { justify-content: center; }
.sidebar.collapsed .brand { flex: 0 0 auto; }
.sidebar.collapsed .collapse-button { position: absolute; top: 72px; right: -15px; width: 31px; height: 31px; border-radius: 10px; box-shadow: 0 6px 18px rgba(35,56,49,.14); }
.sidebar.collapsed .command-button { display: grid; grid-template-columns: 1fr; place-items: center; padding: 0; }
.sidebar.collapsed .nav-item { display: grid; grid-template-columns: 1fr; place-items: center; padding: 0; }
@media (max-width: 980px) {
  .sidebar, .sidebar.collapsed { position: fixed; inset: 0 auto 0 0; width: min(324px, 90vw); min-width: 0; padding: 24px 18px 18px; transform: translateX(-104%); box-shadow: 24px 0 70px rgba(24,48,40,.22); }
  .sidebar.open { transform: translateX(0); }
  .desktop-only { display: none; }
  .sidebar.collapsed .sidebar-scroll { overflow-y: auto; overflow-x: hidden; padding-right: 4px; }
  .close-nav { display: grid; }
  .sidebar.collapsed .brand-copy,
  .sidebar.collapsed .command-button span,
  .sidebar.collapsed .command-button kbd,
  .sidebar.collapsed .nav-copy,
  .sidebar.collapsed .nav-count,
  .sidebar.collapsed .nav-section-label,
  .sidebar.collapsed .chevron { display: initial; }
  .sidebar.collapsed .brand-row { justify-content: initial; }
  .sidebar.collapsed .brand { flex: 1; }
  .sidebar.collapsed .command-button { display: grid; grid-template-columns: auto 1fr auto; place-items: initial; padding: 0 14px; }
  .sidebar.collapsed .nav-item { display: grid; grid-template-columns: auto 1fr auto; place-items: initial; padding: 0 12px; }
  .nav-overlay { position: fixed; z-index: 39; inset: 0; display: block; background: rgba(18,48,40,.42); backdrop-filter: blur(5px); }
}
</style>
