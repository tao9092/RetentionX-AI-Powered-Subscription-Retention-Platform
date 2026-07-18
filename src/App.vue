<script setup lang="ts">
import { ref } from 'vue'
import LeftNav from './component/leftNavigater.vue'
// 1. 组件引入改用大驼峰命名
import Dashboard from './component/dashboard.vue'
import Homepage from './component/homepage.vue'

const selectedMenuId = ref('home')

function handleTabSwitch(id: string) {
  console.log(`当前选中的菜单项 ID: ${id}`)
  selectedMenuId.value = id
}
</script>

<template>
  <div class="app-layout">
    <!-- 左侧导航栏组件 -->
    <LeftNav :defaultCollapsed="false" @change="handleTabSwitch"/>

    <!-- 右侧主区域 -->
    <main class="main-content">
      <header class="content-header">
        <h2>系统顶部栏 (Top Bar)</h2>
      </header>
      
      <section class="content-body">
        <!-- 2. 使用大驼峰标签，并换成 v-if / v-else-if 结构 -->
        <Homepage v-if="selectedMenuId === 'home'" />
        
        <Dashboard v-else-if="selectedMenuId === 'dashboard'" />
        
        <!-- 未来还可以继续优雅地往下加 -->
        <!-- <Settings v-else-if="selectedMenuId === 'settings'" /> -->
      </section>
    </main>
  </div>
</template>

<style>
/* 清除浏览器默认边距 */


/* 整个页面的 Flex 弹性布局 */
.app-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f7;
}
/* 右侧主区域占满剩余空间 */
.main-content {
  flex: 1;
  background-color: #f4f5fc; /* 🌟 核心：微紫浅灰 */
  color: #313244;
}

/* 里面的白色卡片 */
.stat-card, .chart-section, .log-section {
  background-color: #ffffff;
  border: 1px solid #e6e9ef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); /* 极淡的阴影 */
}

.content-header {
  background-color: #ffffff;
  padding: 15px 30px;
  border-bottom: 1px solid #e5e5e7;
}

.content-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}



</style>