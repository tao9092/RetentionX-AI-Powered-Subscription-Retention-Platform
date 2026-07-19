<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ score: number; size?: 'sm' | 'lg' }>()
const levelClass = computed(() => props.score >= 70 ? 'healthy' : props.score >= 40 ? 'attention' : 'critical')
</script>

<template>
  <div class="health-ring" :class="[levelClass, size ?? 'lg']" :style="{ '--score': `${score * 3.6}deg` }">
    <div class="health-ring__inner">
      <strong>{{ score }}</strong>
      <span>/100</span>
    </div>
  </div>
</template>

<style scoped>
.health-ring { --ring-color: #ef476f; position: relative; display: grid; place-items: center; border-radius: 50%; background: conic-gradient(var(--ring-color) var(--score), #edf0f7 0); flex: 0 0 auto; }
.health-ring::before { content: ''; position: absolute; inset: 7px; border-radius: 50%; background: #fff; }
.health-ring.lg { width: 112px; height: 112px; }
.health-ring.sm { width: 52px; height: 52px; }
.health-ring.sm::before { inset: 5px; }
.health-ring.healthy { --ring-color: #13a579; }
.health-ring.attention { --ring-color: #e6a11d; }
.health-ring.critical { --ring-color: #e24a68; }
.health-ring__inner { position: relative; z-index: 1; text-align: center; line-height: 1; }
.health-ring__inner strong { display: block; font-size: 27px; color: #151a2d; }
.health-ring__inner span { display: block; margin-top: 5px; font-size: 11px; color: #858ba0; }
.health-ring.sm .health-ring__inner strong { font-size: 14px; }
.health-ring.sm .health-ring__inner span { display: none; }
</style>
