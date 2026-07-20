<script setup lang="ts">
import type { RiskLevel } from '@/types/customer'
defineProps<{ level: RiskLevel; probability?: number }>()
</script>

<template>
  <span class="risk-badge" :class="level.toLowerCase()">
    <i></i><strong>{{ probability !== undefined ? `${probability}%` : level }}</strong><small v-if="probability !== undefined">{{ level }}</small>
  </span>
</template>

<style scoped>
.risk-badge { display: inline-flex; align-items: center; gap: 6px; width: fit-content; min-height: 27px; padding: 0 8px; border: 1px solid; border-radius: 9px; font-size: 9px; }
.risk-badge i { width: 6px; height: 6px; border-radius: 50%; }
.risk-badge strong { font-size: 9px; }
.risk-badge small { font-size: 7px; font-weight: 850; text-transform: uppercase; letter-spacing: .06em; opacity: .7; }
.risk-badge.high { color: var(--rx-danger); border-color: #f5cbd3; background: var(--rx-danger-soft); }.risk-badge.high i { background: var(--rx-danger); box-shadow: 0 0 0 3px rgba(223,75,100,.09); }
.risk-badge.medium { color: var(--rx-warning); border-color: #f2d9ab; background: var(--rx-warning-soft); }.risk-badge.medium i { background: var(--rx-warning); }
.risk-badge.low { color: var(--rx-success); border-color: #c8eadf; background: var(--rx-success-soft); }.risk-badge.low i { background: var(--rx-success); }
</style>
