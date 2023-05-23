<template>
  <nav class="layout-navs overflow-auto px-5">
    <div class="layout-container">
      <c-menu-list :menus="routes" />
    </div>
  </nav>
</template>

<script lang="ts" setup>
  import { routes } from '@/router/routerMap';
</script>
<style scoped lang="postcss">
  .layout-navs {
    background-color: var(--el-color-white);
  }
</style>
