<script setup lang="ts">
import type { ViewId } from '@/types/navigation'

<<<<<<< HEAD
const props = defineProps<{ activeView: ViewId; mobileOpen: boolean; mobileOrPc: boolean }>()
const emit = defineEmits<{ navigate: [view: ViewId]; close: [] }>()
=======
defineProps<{ activeView: ViewId; mobileOpen: boolean; priorityCount: number }>()
const emit = defineEmits<{ navigate: [view: ViewId]; close: []; openCommand: [] }>()
>>>>>>> 6f53d89 (UI improve)

const navGroups: Array<{ label: string; items: Array<{ id: ViewId; label: string; helper: string; icon: string }> }> = [
  {
    label: 'Monitor',
    items: [
      { id: 'overview', label: 'Overview', helper: 'Portfolio briefing', icon: 'overview' },
      { id: 'customers', label: 'Customers', helper: 'Health and churn', icon: 'customers' },
      { id: 'insights', label: 'Insights', helper: 'Segments and renewals', icon: 'insights' },
    ],
  },
  {
    label: 'Act',
    items: [
      { id: 'recommendations', label: 'Actions', helper: 'Retention work queue', icon: 'actions' },
      { id: 'scenarios', label: 'Scenario lab', helper: 'Compare interventions', icon: 'scenarios' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { id: 'data', label: 'Data studio', helper: 'Import and validate', icon: 'data' },
    ],
  },
]

function navigate(id: ViewId) {
  emit('navigate', id)
  if (props.mobileOrPc === false) {
    emit('close')
  }
}
</script>

<template>
  <div v-if="mobileOpen" class="nav-overlay" @click="emit('close')"></div>
<<<<<<< HEAD
  <transition name="slide">
  
 
  <aside v-if="mobileOpen" class="sidebar" >
    <div class="brand">
      <div class="brand-mark">RX</div>
      <div><strong>RetentionX</strong><span>Retention Intelligence</span></div>
      <button class="close-nav" type="button" @click="emit('close')">×</button>
=======
  <aside class="sidebar" :class="{ open: mobileOpen }">
    <div class="brand-row">
      <button class="brand" type="button" @click="navigate('overview')">
        <span class="brand-mark"><i></i><i></i><i></i></span>
        <span class="brand-copy"><strong>RetentionX</strong><small>Retention workspace</small></span>
      </button>
      <button class="close-nav" type="button" aria-label="Close navigation" @click="emit('close')">×</button>
>>>>>>> 6f53d89 (UI improve)
    </div>

    <button class="workspace-card" type="button" @click="navigate('overview')">
      <span class="workspace-avatar">CS</span>
      <span><small>Workspace</small><strong>Customer Success</strong></span>
      <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
    </button>

    <button class="command-button" type="button" @click="emit('openCommand')">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
      <span>Search workspace</span>
      <kbd>Ctrl K</kbd>
    </button>

    <nav>
      <section v-for="group in navGroups" :key="group.label" class="nav-group">
        <p>{{ group.label }}</p>
        <button
          v-for="item in group.items"
          :key="item.id"
          type="button"
          :class="{ active: activeView === item.id }"
          @click="navigate(item.id)"
        >
          <span class="nav-icon">
            <svg v-if="item.icon === 'overview'" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="4" rx="2"/><rect x="14" y="11" width="7" height="10" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></svg>
            <svg v-else-if="item.icon === 'customers'" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <svg v-else-if="item.icon === 'insights'" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2M3 9l7-5 6 7 6-5"/></svg>
            <svg v-else-if="item.icon === 'actions'" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <svg v-else-if="item.icon === 'scenarios'" viewBox="0 0 24 24"><path d="M4 19V8M10 19V4M16 19v-7M22 19H2M3 7l7-4 6 7 6-5"/></svg>
            <svg v-else viewBox="0 0 24 24"><path d="M4 4h16v5H4zM4 13h16v7H4zM8 9v4M16 9v4"/></svg>
          </span>
          <span class="nav-copy"><strong>{{ item.label }}</strong><small>{{ item.helper }}</small></span>
          <span v-if="item.id === 'recommendations'" class="nav-count">{{ priorityCount }}</span>
        </button>
      </section>
    </nav>

    <div class="sidebar-spacer"></div>

    <section class="signal-card">
      <div class="signal-card__head"><span>Preliminary build</span><strong>Ready</strong></div>
      <div class="signal-progress"><i></i></div>
      <p>Core demo flow is complete. Import real subscription data when it becomes available.</p>
      <span class="version-chip"><i></i> Comfort UI v5</span>
    </section>

    <div class="side-footer">
      <span class="status-dot"></span>
      <span><strong>Decision engine online</strong><small>24 accounts · live demo</small></span>
      <button type="button" aria-label="More options">•••</button>
    </div>
  </aside>
   </transition>
</template>

<style scoped>
<<<<<<< HEAD
.sidebar { position: relative; z-index: 30; display: flex; flex-direction: column; width: 268px; min-width: 268px; min-height: 100vh; padding: 22px 17px; color: #dfe4f7; background: radial-gradient(circle at 20% 0%, #202753 0, transparent 34%), #0b1020; box-sizing: border-box;}
.brand { position: relative; display: flex; align-items: center; gap: 12px; padding: 3px 7px 27px; }
.brand-mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; color: #fff; background: linear-gradient(135deg, #7a5cff, #22bce9); box-shadow: 0 10px 24px rgba(80, 92, 232, .35); font-size: 13px; font-weight: 900; letter-spacing: -.03em; }
.brand strong, .brand span { display: block; }
.brand strong { color: #fff; font-size: 16px; letter-spacing: -.02em; }
.brand span { margin-top: 3px; color: #7f8aa8; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
.close-nav {  margin-left: auto; border: 0; color: #cfd6eb; background: transparent; font-size: 27px; cursor: pointer; }
.workspace-label { padding: 0 12px 9px; color: #606c8a; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
nav { display: grid; gap: 7px; }
nav button { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; border: 1px solid transparent; border-radius: 13px; color: #98a3bf; background: transparent; text-align: left; cursor: pointer; transition: .18s ease; }
nav button:hover { color: #e4e8f6; background: rgba(255, 255, 255, .045); }
nav button.active { color: #fff; border-color: rgba(137, 118, 255, .25); background: linear-gradient(90deg, rgba(113, 86, 245, .22), rgba(69, 108, 222, .08)); }
.nav-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; background: rgba(255, 255, 255, .04); }
nav button.active .nav-icon { color: #b9adff; background: rgba(124, 92, 255, .2); }
.nav-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
nav button span:last-child strong, nav button span:last-child small { display: block; }
nav button span:last-child strong { font-size: 13px; }
nav button span:last-child small { margin-top: 3px; color: #66718e; font-size: 10px; }
nav button.active span:last-child small { color: #8f9ab7; }
.side-insight { margin: auto 5px 18px; padding: 17px; border: 1px solid rgba(147, 129, 255, .18); border-radius: 17px; background: linear-gradient(145deg, rgba(122, 92, 255, .15), rgba(34, 188, 233, .045)); }
.insight-kicker { display: block; color: #9688fa; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: .13em; }
.side-insight strong { display: block; margin-top: 9px; color: #fff; font-size: 13px; }
.side-insight p { margin: 8px 0 0; color: #818ca8; font-size: 10px; line-height: 1.55; }
.side-footer { display: flex; align-items: center; gap: 10px; padding: 13px 11px 5px; border-top: 1px solid rgba(255,255,255,.06); }
.status-dot { width: 9px; height: 9px; border-radius: 50%; background: #23c487; box-shadow: 0 0 0 4px rgba(35, 196, 135, .12); }
=======
.sidebar { position: sticky; z-index: 40; top: 0; display: flex; flex-direction: column; width: 252px; min-width: 252px; height: 100vh; padding: 18px 14px 14px; color: #d9dde3; background: var(--rx-sidebar); border-right: 1px solid #26292e; }
.brand-row { display: flex; align-items: center; justify-content: space-between; padding: 0 4px 17px; }
.brand { display: flex; align-items: center; gap: 11px; padding: 0; border: 0; color: inherit; background: transparent; cursor: pointer; }
.brand-mark { position: relative; display: flex; align-items: end; gap: 3px; width: 37px; height: 37px; padding: 9px; border-radius: 12px; color: var(--rx-lime-ink); background: var(--rx-lime); box-shadow: inset 0 0 0 1px rgba(255,255,255,.26); }
.brand-mark i { width: 4px; border-radius: 3px; background: #252a14; }
.brand-mark i:nth-child(1) { height: 8px; opacity: .65; }
.brand-mark i:nth-child(2) { height: 16px; }
.brand-mark i:nth-child(3) { height: 12px; opacity: .8; }
.brand-copy strong, .brand-copy small { display: block; text-align: left; }
.brand-copy strong { color: #fff; font-size: 15px; letter-spacing: -.025em; }
.brand-copy small { margin-top: 3px; color: #747b84; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
.close-nav { display: none; width: 32px; height: 32px; border: 1px solid #32353b; border-radius: 9px; color: #c7cbd1; background: #1a1d21; font-size: 21px; cursor: pointer; }
.workspace-card { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; width: 100%; padding: 10px; border: 1px solid #2b2e33; border-radius: 13px; color: inherit; background: #191c20; text-align: left; cursor: pointer; }
.workspace-card:hover { border-color: #3a3e44; background: #1c1f24; }
.workspace-avatar { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; color: #fff; background: linear-gradient(145deg, #6f5af0, #4b3dc7); font-size: 9px; font-weight: 900; }
.workspace-card small, .workspace-card strong { display: block; }
.workspace-card small { color: #727981; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.workspace-card strong { margin-top: 3px; color: #e7e9ed; font-size: 10px; }
.workspace-card svg { width: 15px; height: 15px; fill: none; stroke: #737a83; stroke-width: 1.8; }
.command-button { display: grid; grid-template-columns: auto 1fr auto; gap: 9px; align-items: center; width: 100%; margin: 10px 0 13px; padding: 9px 10px; border: 1px solid #2a2d32; border-radius: 11px; color: #8c939d; background: #15181b; text-align: left; cursor: pointer; }
.command-button:hover { color: #b9bec6; border-color: #3a3e44; }
.command-button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; }
.command-button span { font-size: 10px; }
kbd { min-width: 39px; padding: 4px 6px; border: 1px solid #373a40; border-radius: 6px; color: #767d86; background: #202328; font: 750 8px/1 Inter, sans-serif; text-align: center; }
nav { display: grid; gap: 15px; min-height: 0; overflow-y: auto; padding-right: 2px; }
.nav-group > p { margin: 0 0 6px; padding: 0 10px; color: #5e656e; font-size: 8px; font-weight: 850; text-transform: uppercase; letter-spacing: .13em; }
.nav-group { display: grid; gap: 3px; }
.nav-group button { position: relative; display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; width: 100%; padding: 9px 10px; border: 1px solid transparent; border-radius: 11px; color: #8e959e; background: transparent; text-align: left; cursor: pointer; transition: .16s ease; }
.nav-group button:hover { color: #d6dae0; background: #191c20; }
.nav-group button.active { color: #fff; border-color: #30343a; background: #202328; box-shadow: inset 3px 0 0 var(--rx-lime); }
.nav-icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; color: #858c95; background: #191c20; }
.nav-group button.active .nav-icon { color: var(--rx-lime); background: #292d32; }
.nav-icon svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.nav-copy strong, .nav-copy small { display: block; }
.nav-copy strong { font-size: 11px; }
.nav-copy small { margin-top: 3px; color: #646b74; font-size: 8.5px; }
.nav-group button.active .nav-copy small { color: #8b929b; }
.nav-count { display: grid; place-items: center; min-width: 22px; height: 20px; padding: 0 6px; border-radius: 7px; color: var(--rx-lime-ink); background: var(--rx-lime); font-size: 8px; font-weight: 900; }
.sidebar-spacer { flex: 1; min-height: 16px; }
.signal-card { margin: 0 3px 12px; padding: 13px; border: 1px solid #2c3035; border-radius: 14px; background: linear-gradient(145deg, #1b1e22, #171a1e); }
.signal-card__head { display: flex; align-items: center; justify-content: space-between; color: #8a919a; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.signal-card__head strong { color: #eef0f3; font-size: 10px; }
.signal-progress { height: 5px; margin: 9px 0; overflow: hidden; border-radius: 99px; background: #2a2e33; }
.signal-progress i { display: block; width: 82%; height: 100%; border-radius: inherit; background: var(--rx-lime); }
.signal-card p { margin: 0; color: #727981; font-size: 8.5px; line-height: 1.5; }
.version-chip { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; padding: 5px 7px; border: 1px solid #30343a; border-radius: 7px; color: #9ca2aa; background: #202328; font-size: 8px; font-weight: 750; }
.version-chip i { width: 6px; height: 6px; border-radius: 50%; background: var(--rx-lime); box-shadow: 0 0 0 3px rgba(216,255,114,.08); }
.side-footer { display: grid; grid-template-columns: auto 1fr auto; gap: 9px; align-items: center; padding: 11px 7px 2px; border-top: 1px solid #272a2f; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #47cf91; box-shadow: 0 0 0 4px rgba(71,207,145,.09); }
>>>>>>> 6f53d89 (UI improve)
.side-footer strong, .side-footer small { display: block; }
.side-footer strong { color: #c6cbd1; font-size: 9px; }
.side-footer small { margin-top: 2px; color: #626973; font-size: 8px; }
.side-footer button { border: 0; color: #69717a; background: transparent; cursor: pointer; }
.nav-overlay { display: none; }
@media (max-width: 900px) {
<<<<<<< HEAD
  .sidebar { position: fixed; inset: 0 auto 0 0; box-shadow: 20px 0 50px rgba(0,0,0,.25); }
  .slide-enter-active, .slide-leave-active { transition: transform .22s ease; }
  .slide-enter-from, .slide-leave-to { transform: translateX(-102%); }
  .slide-enter-to, .slide-leave-from { transform: translateX(0);}
=======
  .sidebar { position: fixed; inset: 0 auto 0 0; transform: translateX(-102%); box-shadow: 22px 0 70px rgba(0,0,0,.3); transition: transform .22s ease; }
  .sidebar.open { transform: translateX(0); }
>>>>>>> 6f53d89 (UI improve)
  .close-nav { display: block; }
  .nav-overlay { position: fixed; z-index: 39; inset: 0; display: block; background: rgba(8, 10, 13, .55); backdrop-filter: blur(5px); }
}
.slide-enter-active, .slide-leave-active { transition: transform .22s ease; }
  .slide-enter-from, .slide-leave-to { transform: translateX(-102%); }
  .slide-enter-to, .slide-leave-from { transform: translateX(0);}

</style>
