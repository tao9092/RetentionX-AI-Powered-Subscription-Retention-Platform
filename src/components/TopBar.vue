<script setup lang="ts">
<<<<<<< HEAD
defineProps<{ title: string; subtitle: string ;mobileNavOpen: boolean}>()
defineEmits<{ toggleNav: [] }>()
=======
defineProps<{ eyebrow: string; title: string; subtitle: string; sourceLabel: string; priorityCount: number }>()
defineEmits<{ toggleNav: []; openCommand: []; reviewRisk: [] }>()
>>>>>>> 6f53d89 (UI improve)
</script>

<template>
  <header class="topbar">
    <div class="title-area">
      <button class="menu-button" v-if="!mobileNavOpen" type="button" aria-label="Open navigation" @click="$emit('toggleNav')">
        <span></span><span></span><span></span>
      </button>
      <div class="title-copy"><span>{{ eyebrow }}</span><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>
    </div>

    <div class="topbar-actions">
      <button class="search-trigger" type="button" @click="$emit('openCommand')">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
        <span>Search customers</span><kbd>Ctrl K</kbd>
      </button>
      <span class="source-chip"><i></i><span><small>Data source</small><strong>{{ sourceLabel }}</strong></span></span>
      <button class="review-button" type="button" @click="$emit('reviewRisk')"><span>Review risk</span><strong>{{ priorityCount }}</strong></button>
      <button class="user-chip" type="button" aria-label="Customer Success profile"><span>CS</span><i></i></button>
    </div>
  </header>
</template>

<style scoped>
<<<<<<< HEAD
.topbar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; min-height: 76px; padding: 0 28px; border-bottom: 1px solid rgba(225, 229, 239, .86); background: rgba(255,255,255,.9); backdrop-filter: blur(14px); }
.title-area { display: flex; align-items: center; gap: 13px; }
h1 { margin: 0; color: #151a2b; font-size: 18px; letter-spacing: -.025em; }
p { margin: 4px 0 0; color: #9298aa; font-size: 11px; }
.topbar-actions { display: flex; align-items: center; gap: 12px; }
.prototype-badge { display: inline-flex; align-items: center; gap: 7px; padding: 8px 10px; border: 1px solid #e7e3ff; border-radius: 999px; color: #6857bf; background: #f7f5ff; font-size: 10px; font-weight: 750; }
.prototype-badge i { width: 7px; height: 7px; border-radius: 50%; background: #22b37d; }
.user-chip { display: flex; align-items: center; gap: 9px; padding: 5px 8px 5px 5px; border: 1px solid #e7eaf1; border-radius: 12px; background: #fff; cursor: default; }
.user-chip > span { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; color: #fff; background: linear-gradient(135deg, #795aff, #31b7e7); font-size: 10px; font-weight: 850; }
.user-chip strong, .user-chip small { display: block; text-align: left; }
.user-chip strong { color: #343a4d; font-size: 10px; }
.user-chip small { margin-top: 2px; color: #9ca1b2; font-size: 9px; }
.menu-button { display: block; width: 38px; height: 38px; padding: 9px; border: 1px solid #e5e8f0; border-radius: 11px; background: #fff; cursor: pointer; }
.menu-button span { display: block; height: 2px; margin: 4px 0; border-radius: 2px; background: #3d4459; }
@media (max-width: 900px) { .menu-button { display: block; } .prototype-badge { display: none; } }
@media (max-width: 620px) { .topbar { padding: 0 16px; } .user-chip div { display: none; } .title-area p { display: none; } }
=======
.topbar { position: sticky; z-index: 25; top: 0; display: flex; align-items: center; justify-content: space-between; min-height: 82px; padding: 13px 26px; border-bottom: 1px solid rgba(218,221,225,.9); background: rgba(244,245,247,.88); backdrop-filter: blur(18px); }
.title-area { display: flex; align-items: center; gap: 13px; min-width: 0; }
.title-copy { min-width: 0; }
.title-copy > span { display: block; color: var(--rx-primary); font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .14em; }
h1 { margin: 3px 0 0; color: var(--rx-ink); font-size: 20px; line-height: 1.15; letter-spacing: -.035em; }
p { margin: 4px 0 0; overflow: hidden; color: var(--rx-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.topbar-actions { display: flex; align-items: center; gap: 9px; }
.search-trigger { display: flex; align-items: center; gap: 8px; min-height: 39px; padding: 0 9px; border: 1px solid var(--rx-border-strong); border-radius: 11px; color: #737983; background: #fff; box-shadow: 0 1px 2px rgba(20,23,29,.025); cursor: pointer; }
.search-trigger:hover { border-color: #c6c9cf; color: #4d535c; }
.search-trigger svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; }
.search-trigger > span { font-size: 9px; }
kbd { padding: 4px 6px; border: 1px solid #e0e2e5; border-bottom-color: #cdd0d4; border-radius: 6px; color: #8a9098; background: #f8f8f9; box-shadow: 0 1px 0 #d7dade; font: 750 7.5px/1 Inter, sans-serif; }
.source-chip { display: flex; align-items: center; gap: 8px; min-height: 39px; padding: 0 11px; border: 1px solid var(--rx-border); border-radius: 11px; background: rgba(255,255,255,.65); }
.source-chip > i { width: 7px; height: 7px; border-radius: 50%; background: var(--rx-success); box-shadow: 0 0 0 4px rgba(30,157,114,.09); }
.source-chip small, .source-chip strong { display: block; }
.source-chip small { color: #a0a5ad; font-size: 7px; font-weight: 850; text-transform: uppercase; letter-spacing: .08em; }
.source-chip strong { max-width: 135px; margin-top: 2px; overflow: hidden; color: #515760; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.review-button { display: flex; align-items: center; gap: 8px; min-height: 39px; padding: 0 8px 0 12px; border: 0; border-radius: 11px; color: #f8f9fa; background: #181a1e; box-shadow: 0 5px 14px rgba(20,23,29,.12); cursor: pointer; }
.review-button:hover { background: #25282d; }
.review-button span { font-size: 9px; font-weight: 750; }
.review-button strong { display: grid; place-items: center; min-width: 23px; height: 23px; border-radius: 7px; color: var(--rx-lime-ink); background: var(--rx-lime); font-size: 8px; }
.user-chip { position: relative; display: grid; place-items: center; width: 39px; height: 39px; padding: 0; border: 1px solid var(--rx-border-strong); border-radius: 12px; color: #fff; background: linear-gradient(145deg, #7463ee, #5143cd); font-size: 9px; font-weight: 900; cursor: pointer; }
.user-chip i { position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px; border: 2px solid var(--rx-bg); border-radius: 50%; background: #3ac985; }
.menu-button { display: none; width: 39px; height: 39px; padding: 9px; border: 1px solid var(--rx-border-strong); border-radius: 11px; background: #fff; cursor: pointer; }
.menu-button span { display: block; height: 2px; margin: 4px 0; border-radius: 2px; background: #454b54; }
@media (max-width: 1120px) { .source-chip { display: none; } }
@media (max-width: 900px) { .menu-button { display: block; } }
@media (max-width: 680px) { .topbar { min-height: 70px; padding: 10px 14px; } .search-trigger span, .search-trigger kbd, .review-button span { display: none; } .search-trigger { width: 39px; justify-content: center; } .review-button { width: 39px; justify-content: center; padding: 0; } .title-copy p { display: none; } h1 { font-size: 17px; } }
@media (max-width: 430px) { .review-button { display: none; } }
>>>>>>> 6f53d89 (UI improve)
</style>
