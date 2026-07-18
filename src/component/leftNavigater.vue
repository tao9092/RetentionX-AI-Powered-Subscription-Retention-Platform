<script setup lang="ts">
import { ref } from 'vue'

// 1. 定义可选的属性（Props）：允许父组件控制默认是否折叠
interface Props {
  defaultCollapsed?: boolean
}
const emit = defineEmits<{
  (e: 'change', id: string): void
}>()

const props = withDefaults(defineProps<Props>(), {
  defaultCollapsed: false
})

// 2. 控制导航栏展开/折叠的状态
const isCollapsed = ref(props.defaultCollapsed)

// 3. 当前选中的菜单项（用来高亮显示）
const activeMenu = ref('home')

// 4. 模拟菜单数据
const menuItems = ref([
  { id: 'home', name: 'home', icon: '🏠' },
  { id: 'dashboard', name: 'dashboard', icon: '📊' },

])

// 5. 切换折叠状态的方法
function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

// 6. 点击菜单项的方法
function handleMenuClick(id: string) {
  activeMenu.value = id
  emit('change', id)
}
</script>

<template>
  <!-- 
    通过模板字符串动态绑定 Class：
    如果 isCollapsed 为 true，则追加 'collapsed' 样式 
  -->
  <div :class="['sidebar', { 'collapsed': isCollapsed }]">
    
    <!-- 头部：标志与折叠按钮 -->
    <div class="sidebar-header">
      <span v-if="!isCollapsed" class="logo-text">Smart Subscription</span>
      <button class="toggle-btn" @click="toggleSidebar">
        {{ isCollapsed ? '➡️' : '⬅️' }}
      </button>
    </div>

    <!-- 菜单列表 -->
    <ul class="menu-list">
      <li 
        v-for="item in menuItems" 
        :key="item.id"
        :class="['menu-item', { 'active': activeMenu === item.id }]"
        @click="handleMenuClick(item.id)"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <!-- 当折叠时，隐藏文字，只留图标 -->
        <span v-if="!isCollapsed" class="menu-name">{{ item.name }}</span>
      </li>
    </ul>

  </div>
</template>

<style scoped>
/* 侧边栏基础样式 */
.sidebar {
  width: 240px;
  height: 100vh; /* 撑满视口高度 */
  background-color: #1e1e2e;
  color: #cdd6f4;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease; /* 顺滑的动画过渡效果 */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

/* 折叠后的宽度 */
.sidebar.collapsed {
  width: 64px;
}

/* 头部样式 */
.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #313244;
}

.logo-text {
  font-weight: bold;
  font-size: 18px;
  color: #a6e3a1; /* Vue 标志绿 */
  white-space: nowrap;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #cdd6f4;
  padding: 5px;
}

/* 菜单列表样式 */
.menu-list {
  list-style: none;
  padding: 10px 0;
  margin: 0;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: #313244;
  color: #f5c2e7;
}

/* 当前激活高亮的菜单 */
.menu-item.active {
  background-color: #45475a;
  color: #a6e3a1;
  border-left: 4px solid #a6e3a1;
}

.menu-icon {
  font-size: 18px;
  margin-right: 15px;
  min-width: 24px;
  text-align: center;
}

/* 当折叠时，移除右侧边距以居中图标 */
.sidebar.collapsed .menu-icon {
  margin-right: 0;
}

.menu-name {
  font-size: 14px;
}
</style>