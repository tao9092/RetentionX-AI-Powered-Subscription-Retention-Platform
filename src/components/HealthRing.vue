<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ score: number }>()
const tone = computed(() => props.score < 40 ? 'critical' : props.score < 65 ? 'warning' : 'healthy')
</script>

<template>
  <div class="health-ring" :class="tone" :style="{ '--score': `${score * 3.6}deg` }">
    <div><strong>{{ score }}</strong><span>health</span></div>
  </div>
</template>

<style scoped>
.health-ring { position: relative; --ring: var(--rx-success); display: grid; place-items: center; width: 92px; height: 92px; flex: 0 0 auto; border-radius: 50%; background: conic-gradient(var(--ring) var(--score), #eceef0 0); }
.health-ring::before { content: ''; position: absolute; width: 70px; height: 70px; border-radius: 50%; background: #fff; }
.health-ring > div { position: relative; z-index: 1; text-align: center; }
.health-ring strong, .health-ring span { display: block; }
.health-ring strong { color: #2c3036; font-size: 24px; line-height: 1; letter-spacing: -.05em; }
.health-ring span { margin-top: 4px; color: #9298a1; font-size: 7px; font-weight: 850; text-transform: uppercase; letter-spacing: .08em; }
.health-ring.critical { --ring: var(--rx-danger); }.health-ring.warning { --ring: var(--rx-warning); }
</style>
