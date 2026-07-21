<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
  helper: string
  icon: 'customers' | 'risk' | 'usage' | 'revenue'
  tone: 'neutral' | 'red' | 'amber' | 'blue'
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
    <div class="metric-topline">
      <span class="metric-icon">
        <svg v-if="icon === 'customers'" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <svg v-else-if="icon === 'risk'" viewBox="0 0 24 24"><path d="M10.3 2.86 1.82 17a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 2.86a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01"/></svg>
        <svg v-else-if="icon === 'usage'" viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19V2"/></svg>
        <svg v-else viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg>
      </span>
      <span class="metric-kicker">{{ trendText }}</span>
    </div>
    <span class="metric-label">{{ label }}</span>
    <strong>{{ value }}</strong>
    <p>{{ helper }}</p>
  </article>
</template>

<style scoped>
.metric-card { position: relative; overflow: hidden; min-height: 198px; padding: 25px; border: 1px solid #dfe3f1; border-radius: 22px; background: #ffffff; box-shadow: 0 12px 32px rgba(44,65,57,.055); transition: transform .18s ease, box-shadow .18s ease; }
.metric-card:hover { transform: translateY(-3px); box-shadow: 0 18px 42px rgba(44,65,57,.1); }
.metric-card::after { content: ''; position: absolute; right: -35px; bottom: -50px; width: 150px; height: 150px; border-radius: 50%; background: currentColor; opacity: .07; }
.metric-topline { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; }
.metric-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 16px; }
.metric-icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.metric-kicker { padding: 8px 11px; border-radius: 999px; font-size: 12px; font-weight: 850; text-transform: uppercase; letter-spacing: .06em; background: #eef0ff; }
.metric-label { position: relative; z-index: 1; display: block; margin-top: 22px; color: #64729a; font-size: 16px; font-weight: 750; }
.metric-card > strong { position: relative; z-index: 1; display: block; margin-top: 8px; color: #171717; font-size: clamp(36px, 3vw, 48px); line-height: 1; letter-spacing: -.05em; }
.metric-card > p { position: relative; z-index: 1; margin: 13px 0 0; color: #7a86a6; font-size: 14px; line-height: 1.5; }
.metric-card.neutral { color: #5c6b91; }.metric-card.neutral .metric-icon { background: #f3f2f0; }.metric-card.neutral .metric-kicker { color: #0f7e73; }
.metric-card.red { color: #e45768; }.metric-card.red .metric-icon { background: #fff0f2; }.metric-card.red .metric-kicker { color: #b93648; background: #fff2f4; }
.metric-card.amber { color: #d8942c; }.metric-card.amber .metric-icon { background: #e2f9f5; }.metric-card.amber .metric-kicker { color: #93601b; background: #e7faf7; }
.metric-card.blue { color: #0f8f82; }.metric-card.blue .metric-icon { background: #dcece7; }.metric-card.blue .metric-kicker { color: #0f7e73; background: #ddf8f4; }
</style>
