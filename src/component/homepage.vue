<script setup lang="ts"></script>

<template>
  <div class="home-container">
     <h3>欢迎来到主工作区</h3>
        <p>这里会根据你在左侧点击的菜单，动态展示不同的内容。</p>
        <div class="card-demo">
          项目内容展示区域...
        </div>
  </div>
</template>


<style scoped>
.card-demo {
  background-color: #fff;
  padding: 40px;
  margin-top: 20px;
  border-radius: 8px;
  border: 1px solid #e5e5e7;
  color: #666;
}
.home-container {
  padding: 30px;
}
</style>