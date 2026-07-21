<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  subtitle: string
  priorityCount: number
}>()

defineEmits<{
  toggleNav: []
  openCommand: []
  reviewRisk: []
}>()
</script>

<template>
  <header class="topbar">
    <div class="title-area">
      <button class="menu-button" type="button" aria-label="Open navigation" @click="$emit('toggleNav')">
        <span></span><span></span><span></span>
      </button>
      <div class="title-copy">
        <span>{{ eyebrow }}</span>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
    </div>

    <div class="topbar-actions">
      <button class="search-trigger" type="button" @click="$emit('openCommand')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
        <span>Search</span>
        <kbd>Ctrl K</kbd>
      </button>
      <button class="review-button" type="button" @click="$emit('reviewRisk')">
        <span>Review actions</span>
        <strong>{{ priorityCount }}</strong>
      </button>
      <button class="user-chip" type="button" aria-label="Customer Success profile">CS</button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  z-index: 25;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96px;
  padding: 18px clamp(24px, 3vw, 48px);
  border-bottom: 1px solid #e4e8f1;
  background: rgba(255, 255, 255, .86);
  backdrop-filter: blur(18px);
}
.title-area { display: flex; align-items: center; gap: 16px; min-width: 0; }
.title-copy { min-width: 0; }
.title-copy > span { display: block; color: #5c6b91; font-size: 13px; font-weight: 850; text-transform: uppercase; letter-spacing: .13em; }
h1 { margin: 5px 0 0; color: #172033; font-size: clamp(28px, 2.2vw, 36px); line-height: 1.05; letter-spacing: -.04em; }
p { margin: 9px 0 0; overflow: hidden; color: #64729a; font-size: 16px; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.topbar-actions { display: flex; align-items: center; gap: 11px; }
.search-trigger, .review-button, .user-chip { min-height: 50px; border-radius: 14px; cursor: pointer; }
.search-trigger { display: flex; align-items: center; gap: 10px; padding: 0 13px; border: 1px solid #d9deed; color: #5c6b91; background: #ffffff; }
.search-trigger:hover { color: #5b5bd6; border-color: #9bb1c8; }
.search-trigger svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.9; }
.search-trigger > span { font-size: 15px; font-weight: 750; }
kbd { padding: 6px 8px; border: 1px solid #dce1ef; border-radius: 8px; color: #69769a; background: #f4f6fb; font: 750 11px/1 ui-sans-serif, sans-serif; }
.review-button { display: flex; align-items: center; gap: 12px; padding: 0 11px 0 17px; border: 0; color: #fff; background: #172033; box-shadow: 0 10px 24px rgba(23,32,51,.14); }
.review-button:hover { transform: translateY(-1px); background: #2a3650; }
.review-button span { font-size: 15px; font-weight: 800; }
.review-button strong { display: grid; place-items: center; min-width: 31px; height: 31px; padding: 0 8px; border-radius: 10px; color: #1f2753; background: #39d0c2; font-size: 13px; }
.user-chip { display: grid; place-items: center; width: 50px; padding: 0; border: 1px solid #dce1ef; color: #5b5bd6; background: #dff7f3; font-size: 14px; font-weight: 900; }
.menu-button { display: none; width: 50px; height: 50px; padding: 12px; border: 1px solid #dce1ef; border-radius: 14px; background: #ffffff; cursor: pointer; }
.menu-button span { display: block; height: 2px; margin: 5px 0; border-radius: 2px; background: #3b4774; }
@media (max-width: 980px) {
  .menu-button { display: block; }
}
@media (max-width: 760px) {
  .topbar { min-height: 92px; padding: 15px 18px; }
  .title-copy > span, .title-copy p { display: none; }
  h1 { margin: 0; font-size: 30px; }
  .search-trigger > span, .search-trigger kbd, .review-button span { display: none; }
  .search-trigger, .review-button { width: 50px; justify-content: center; padding: 0; }
}
@media (max-width: 480px) {
  .review-button { display: none; }
  h1 { font-size: 26px; }
}
</style>
