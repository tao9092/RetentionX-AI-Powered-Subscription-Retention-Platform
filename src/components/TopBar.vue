<script setup lang="ts">
defineProps<{ title: string; subtitle: string ;mobileNavOpen: boolean}>()
defineEmits<{ toggleNav: [] }>()
</script>

<template>
  <header class="topbar">
    <div class="title-area">
      <button class="menu-button" v-if="!mobileNavOpen" type="button" aria-label="Open navigation" @click="$emit('toggleNav')">
        <span></span><span></span><span></span>
      </button>
      <div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>
    </div>
    <div class="topbar-actions">
      <span class="prototype-badge"><i></i> Prototype · Simulated data</span>
      <button class="user-chip" type="button"><span>CS</span><div><strong>Customer Success</strong><small>Demo workspace</small></div></button>
    </div>
  </header>
</template>

<style scoped>
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
</style>
