<script setup lang="ts">
import type { RiskLevel } from '@/types/customer'

defineProps<{ level: RiskLevel; probability?: number }>()
</script>

<template>
  <span class="risk-badge" :class="level.toLowerCase()">
    <span class="risk-dot"></span>
    {{ level }}<span v-if="probability !== undefined"> · {{ probability }}%</span>
  </span>
</template>

<style scoped>
.risk-badge { display: inline-flex; align-items: center; gap: 7px; width: fit-content; padding: 7px 10px; border-radius: 999px; font-size: 12px; font-weight: 750; letter-spacing: .01em; }
.risk-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 4px currentColor; opacity: .75; }
.risk-badge.high { color: #d83f63; background: #fff0f4; }
.risk-badge.medium { color: #ad6b00; background: #fff7e7; }
.risk-badge.low { color: #087f5b; background: #eafaf4; }
</style>
