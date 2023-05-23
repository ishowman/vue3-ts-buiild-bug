<template>
  <el-config-provider :locale="ja">
    <div class="h-full">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
  import ja from 'element-plus/dist/locale/ja.mjs';
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100%;
    height: 100vh;
    background-color: var(--color-bg-gray);
  }
</style>
