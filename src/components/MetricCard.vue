<script setup lang="ts">
defineProps<{
  label: string
  value: string
  helper: string
  icon: 'customers' | 'risk' | 'usage' | 'revenue'
  tone: 'purple' | 'red' | 'amber' | 'blue'
}>()
</script>

<template>
  <article class="metric-card">
    <div class="metric-icon" :class="tone">
      <svg v-if="icon === 'customers'" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <svg v-else-if="icon === 'risk'" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 2.86 1.82 17a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 2.86a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01"/></svg>
      <svg v-else-if="icon === 'usage'" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19V2"/></svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg>
    </div>
    <div class="metric-copy">
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
      <small>{{ helper }}</small>
    </div>
  </article>
</template>

<style scoped>
.metric-card { display: flex; align-items: flex-start; gap: 15px; min-height: 128px; padding: 20px; border: 1px solid #e8ebf3; border-radius: 18px; background: #fff; box-shadow: 0 9px 28px rgba(23, 31, 56, .055); }
.metric-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; flex: 0 0 auto; }
.metric-icon svg { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.metric-icon.purple { color: #6c4ff7; background: #f1efff; }
.metric-icon.red { color: #df4566; background: #fff0f3; }
.metric-icon.amber { color: #b87000; background: #fff6e1; }
.metric-icon.blue { color: #1686d9; background: #ebf7ff; }
.metric-copy { min-width: 0; }
.metric-copy > span { display: block; color: #6f768b; font-size: 13px; font-weight: 650; }
.metric-copy strong { display: block; margin-top: 8px; color: #14192a; font-size: clamp(22px, 2vw, 29px); line-height: 1.05; letter-spacing: -.035em; }
.metric-copy small { display: block; margin-top: 8px; color: #9298aa; font-size: 12px; line-height: 1.35; }
</style>
