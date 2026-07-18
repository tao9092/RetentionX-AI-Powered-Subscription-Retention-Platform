<script setup lang="ts">
import { ref } from 'vue'

// 模拟一些仪表盘的核心指标数据
const stats = ref([
  { title: '系统今日总请求数', value: '1,248,392', trend: '+12.5%', isUp: true, color: '#a6e3a1' },
  { title: 'CPU 平均负载', value: '42.8%', trend: '-3.2%', isUp: false, color: '#89b4fa' },
  { title: '当前并发连接', value: '8,431', trend: '+22.1%', isUp: true, color: '#f9e2af' },
  { title: '活跃异常告警', value: '2条', trend: '正常', isUp: false, color: '#f38ba8' }
])

// 模拟一些最近的系统日志/活动
const recentLogs = ref([
  { id: 1, time: '22:10:35', type: 'INFO', message: 'Vue Router 路由分发成功，路径：/dashboard', status: 'success' },
  { id: 2, time: '22:08:12', type: 'WARN', message: 'GNS3 模拟网络节点链路拓扑出现短暂抖动', status: 'warning' },
  { id: 3, time: '21:55:00', type: 'INFO', message: 'Spring Boot 虚拟线程池扩容完成，当前活跃线程：42', status: 'success' },
  { id: 4, time: '21:42:19', type: 'ERROR', message: 'Nginx 报错: 404 Not Found 尝试访问未经授权的 LFI 路径', status: 'danger' }
])
</script>

<template>
   
  <div class="dashboard-wrapper">
    <!-- 1. 顶部欢迎语 -->
    <div class="dash-welcome">
      <h1>控制台仪表盘</h1>
      <p>欢迎回来，系统当前运行状态良好。</p>
    </div>

    <!-- 2. 四大核心指标卡片区域 (使用 Grid 布局) -->
    <div class="stats-grid">
      <div v-for="(stat, index) in stats" :key="index" class="stat-card">
        <div class="card-header">
          <span class="card-title">{{ stat.title }}</span>
          <span class="card-badge" :style="{ backgroundColor: stat.color + '22', color: stat.color }">●</span>
        </div>
        <div class="card-value">{{ stat.value }}</div>
        <div class="card-footer">
          <span :class="['trend-tag', stat.isUp ? 'up' : 'down']">
            {{ stat.trend }}
          </span>
          <span class="footer-text">相比昨日</span>
        </div>
      </div>
    </div>

    <!-- 3. 中间大布局：左边是模拟图表占位，右边是最近动态 -->
    <div class="main-grid">
      <!-- 模拟数据图表组件占位 -->
      <div class="chart-section">
        <h3>📊 数据吞吐量趋势 (实时)</h3>
        <div class="mock-chart-placeholder">
          <p>💡 [提示] 此处留空，后续可以使用 ECharts / Chart.js 绑定真实的 Canvas 报表</p>
          <div class="mock-bars">
            <div class="bar" style="height: 40%"></div>
            <div class="bar" style="height: 60%"></div>
            <div class="bar" style="height: 50%"></div>
            <div class="bar" style="height: 85%"></div>
            <div class="bar" style="height: 70%"></div>
            <div class="bar" style="height: 95%"></div>
          </div>
        </div>
      </div>

      <!-- 最近活动日志 -->
      <div class="log-section">
        <h3>🔔 最近系统事件</h3>
        <div class="log-list">
          <div v-for="log in recentLogs" :key="log.id" class="log-item">
            <div class="log-meta">
              <span class="log-time">{{ log.time }}</span>
              <span :class="['log-type', log.status]">{{ log.type }}</span>
            </div>
            <div class="log-msg">{{ log.message }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  display: flex;
  padding: 30px;
  flex-direction: column;
  gap: 25px; /* 让模块之间有舒适的间距 */
}

.dash-welcome h1 {
  margin: 0 0 5px 0;
  font-size: 24px;
  color: #1e1e2e;
}

.dash-welcome p {
  margin: 0;
  color: #6c7086;
  font-size: 14px;
}

/* 一行 4 列的网格布局 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e6e9ef;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 14px;
  color: #6c7086;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #1e1e2e;
  margin-bottom: 8px;
}

.card-footer {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.trend-tag.up { color: #a6e3a1; font-weight: bold; }
.trend-tag.down { color: #f38ba8; font-weight: bold; }
.footer-text { color: #a6adc8; }

/* 主区域：两列网格布局，左宽右窄 */
.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr; /* 屏幕窄时自动变成上下两行 */
  }
}

.chart-section, .log-section {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e6e9ef;
}

.chart-section h3, .log-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #1e1e2e;
}

/* 模拟图表样式 */
.mock-chart-placeholder {
  height: 240px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.mock-chart-placeholder p {
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
  margin: 0;
}

.mock-bars {
  display: flex;
  align-items: flex-end;
  gap: 15px;
  width: 100%;
  height: 120px;
  padding: 0 20px;
  box-sizing: border-box;
}

.bar {
  flex: 1;
  background: linear-gradient(180deg, #89b4fa 0%, #cba6f7 100%);
  border-radius: 4px 4px 0 0;
  animation: grow 1s ease-out;
}

@keyframes grow {
  from { height: 0; }
}

/* 模拟日志样式 */
.log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  padding-bottom: 12px;
  border-bottom: 1px dashed #e6e9ef;
}

.log-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.log-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 4px;
}

.log-time {
  font-size: 12px;
  color: #a6adc8;
}

.log-type {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.log-type.success { background: #e8f5e9; color: #2e7d32; }
.log-type.warning { background: #fff3e0; color: #ef6c00; }
.log-type.danger { background: #ffebee; color: #c62828; }

.log-msg {
  font-size: 13px;
  color: #4c4f69;
  word-break: break-all;
}
</style>