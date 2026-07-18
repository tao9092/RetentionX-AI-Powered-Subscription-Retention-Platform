<script setup lang="ts">
import { ref } from 'vue'

// 假设这是你想练习的前端技术栈列表
const skills = ref(['Vue 3', 'TypeScript', 'Vite'])
</script>

<template>
  <div class="skill-card">
    <h3>我的前端练习清单：</h3>
    <ul>
      <li v-for="(item, index) in skills" :key="index">
        ⚡ {{ item }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.skill-card {
  background: #f9f9f9;
  padding: 15px;
  margin-top: 15px;
  border-radius: 6px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 5px 0;
  color: #333;
}
</style>
