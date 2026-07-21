<script setup lang="ts">
import type { RiskLevel } from '@/types/customer'
defineProps<{ level: RiskLevel; probability?: number }>()
</script>

<template>
  <span class="risk-badge" :class="level.toLowerCase()">
    <i></i>
    <strong>{{ probability !== undefined ? `${probability}%` : level }}</strong>
    <small v-if="probability !== undefined">{{ level }}</small>
  </span>
</template>

<style scoped>
.risk-badge { display: inline-flex; align-items: center; gap: 8px; width: fit-content; min-height: 38px; padding: 0 12px; border: 1px solid; border-radius: 999px; font-size: 13px; white-space: nowrap; }
.risk-badge i { width: 8px; height: 8px; border-radius: 50%; }
.risk-badge strong { font-size: 13px; }.risk-badge small { font-size: 11px; font-weight: 850; text-transform: uppercase; letter-spacing: .06em; opacity: .72; }
.risk-badge.high { color: #b93648; border-color: #edc8c5; background: #fff0f2; }.risk-badge.high i { background: #e45768; box-shadow: 0 0 0 4px rgba(207,86,91,.1); }
.risk-badge.medium { color: #8a5d1a; border-color: #f2dba7; background: #fff3d6; }.risk-badge.medium i { background: #d8942c; }
.risk-badge.low { color: #0f7e73; border-color: #bce8e1; background: #ddf8f4; }.risk-badge.low i { background: #28633d; }
</style>
