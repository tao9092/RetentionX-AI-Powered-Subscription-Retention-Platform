<script setup lang="ts">
import type { ViewId } from '@/types/navigation'

defineProps<{ activeView: ViewId; mobileOpen: boolean }>()
const emit = defineEmits<{ navigate: [view: ViewId]; close: [] }>()

const navItems: Array<{ id: ViewId; label: string; helper: string; icon: string }> = [
  { id: 'overview', label: 'Overview', helper: 'Revenue command centre', icon: 'dashboard' },
  { id: 'customers', label: 'Customers', helper: 'Health and churn risk', icon: 'customers' },
  { id: 'recommendations', label: 'Actions', helper: 'Retention playbook', icon: 'actions' },
]

function navigate(id: ViewId) {
  emit('navigate', id)
  emit('close')
}
</script>

<template>
  <div v-if="mobileOpen" class="nav-overlay" @click="emit('close')"></div>
  <aside class="sidebar" :class="{ open: mobileOpen }">
    <div class="brand">
      <div class="brand-mark">RX</div>
      <div><strong>RetentionX</strong><span>Retention Intelligence</span></div>
      <button class="close-nav" type="button" @click="emit('close')">×</button>
    </div>

    <div class="workspace-label">Workspace</div>
    <nav>
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        :class="{ active: activeView === item.id }"
        @click="navigate(item.id)"
      >
        <span class="nav-icon">
          <svg v-if="item.icon === 'dashboard'" viewBox="0 0 24 24"><path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z"/></svg>
          <svg v-else-if="item.icon === 'customers'" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <svg v-else viewBox="0 0 24 24"><path d="m9 18 6-6-6-6M4 4v16M20 4v16"/></svg>
        </span>
        <span><strong>{{ item.label }}</strong><small>{{ item.helper }}</small></span>
      </button>
    </nav>

    <div class="side-insight">
      <span class="insight-kicker">Preliminary MVP</span>
      <strong>Explain. Prioritise. Retain.</strong>
      <p>Prototype scoring uses transparent customer signals and simulated SaaS data.</p>
    </div>

    <div class="side-footer">
      <span class="status-dot"></span>
      <span><strong>Model online</strong><small>Demo dataset connected</small></span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar { position: relative; z-index: 30; display: flex; flex-direction: column; width: 268px; min-width: 268px; min-height: 100vh; padding: 22px 17px; color: #dfe4f7; background: radial-gradient(circle at 20% 0%, #202753 0, transparent 34%), #0b1020; box-sizing: border-box; }
.brand { position: relative; display: flex; align-items: center; gap: 12px; padding: 3px 7px 27px; }
.brand-mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; color: #fff; background: linear-gradient(135deg, #7a5cff, #22bce9); box-shadow: 0 10px 24px rgba(80, 92, 232, .35); font-size: 13px; font-weight: 900; letter-spacing: -.03em; }
.brand strong, .brand span { display: block; }
.brand strong { color: #fff; font-size: 16px; letter-spacing: -.02em; }
.brand span { margin-top: 3px; color: #7f8aa8; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
.close-nav { display: none; margin-left: auto; border: 0; color: #cfd6eb; background: transparent; font-size: 27px; cursor: pointer; }
.workspace-label { padding: 0 12px 9px; color: #606c8a; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
nav { display: grid; gap: 7px; }
nav button { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 12px; border: 1px solid transparent; border-radius: 13px; color: #98a3bf; background: transparent; text-align: left; cursor: pointer; transition: .18s ease; }
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
.side-footer strong, .side-footer small { display: block; }
.side-footer strong { color: #cfd6e9; font-size: 11px; }
.side-footer small { margin-top: 2px; color: #65708d; font-size: 9px; }
.nav-overlay { display: none; }
@media (max-width: 900px) {
  .sidebar { position: fixed; inset: 0 auto 0 0; transform: translateX(-102%); box-shadow: 20px 0 50px rgba(0,0,0,.25); transition: transform .22s ease; }
  .sidebar.open { transform: translateX(0); }
  .close-nav { display: block; }
  .nav-overlay { position: fixed; z-index: 29; inset: 0; display: block; background: rgba(9, 13, 28, .5); backdrop-filter: blur(4px); }
}
</style>
