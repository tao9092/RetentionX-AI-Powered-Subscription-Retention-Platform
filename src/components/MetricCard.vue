<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
  helper: string
  icon: 'customers' | 'risk' | 'usage' | 'revenue'
  tone: 'purple' | 'red' | 'amber' | 'blue'
}>()

const trendText = props.icon === 'customers'
  ? 'Portfolio'
  : props.icon === 'risk'
    ? 'Needs action'
    : props.icon === 'usage'
      ? 'Opportunity'
      : 'Exposure'
</script>

<template>
  <article class="metric-card" :class="tone">
    <header>
      <span class="metric-label">{{ label }}</span>
      <span class="metric-icon">
        <svg v-if="icon === 'customers'" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <svg v-else-if="icon === 'risk'" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 2.86 1.82 17a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 2.86a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01"/></svg>
        <svg v-else-if="icon === 'usage'" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19V2"/></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg>
      </span>
    </header>
    <strong>{{ value }}</strong>
    <footer><span>{{ helper }}</span><i>{{ trendText }}</i></footer>
  </article>
</template>

<style scoped>
.metric-card { position: relative; overflow: hidden; min-height: 132px; padding: 17px; border: 1px solid var(--rx-border); border-radius: 18px; background: var(--rx-surface); box-shadow: var(--rx-shadow-sm); }
.metric-card::after { content: ''; position: absolute; right: -26px; bottom: -34px; width: 85px; height: 85px; border-radius: 50%; background: currentColor; opacity: .035; }
.metric-card header { display: flex; align-items: center; justify-content: space-between; }
.metric-label { color: #727984; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; }
.metric-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 11px; }
.metric-icon svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.metric-card.purple { color: var(--rx-primary); }.metric-card.purple .metric-icon { background: var(--rx-primary-soft); }
.metric-card.red { color: var(--rx-danger); }.metric-card.red .metric-icon { background: var(--rx-danger-soft); }
.metric-card.amber { color: var(--rx-warning); }.metric-card.amber .metric-icon { background: var(--rx-warning-soft); }
.metric-card.blue { color: var(--rx-blue); }.metric-card.blue .metric-icon { background: var(--rx-blue-soft); }
.metric-card > strong { display: block; margin-top: 12px; color: var(--rx-ink); font-size: clamp(24px, 2.2vw, 32px); line-height: 1; letter-spacing: -.05em; }
.metric-card footer { display: flex; align-items: end; justify-content: space-between; gap: 8px; margin-top: 11px; }
.metric-card footer > span { color: #959aa3; font-size: 8.5px; line-height: 1.35; }
.metric-card footer i { flex: 0 0 auto; padding: 5px 7px; border: 1px solid currentColor; border-radius: 7px; font-size: 7px; font-style: normal; font-weight: 850; text-transform: uppercase; letter-spacing: .05em; opacity: .75; }
</style>
