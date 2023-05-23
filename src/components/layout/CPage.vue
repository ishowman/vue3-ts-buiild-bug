<template>
  <c-header></c-header>
  <c-nav></c-nav>

  <main class="layout-contents overflow-auto">
    <div class="grid layout-container comiru-contents">
      <c-breadcrumb />
      <router-view></router-view>
    </div>
  </main>
</template>
<script setup lang="ts">
  import CHeader from '@/components/layout/CHeader.vue';
  import CNav from '@/components/layout/CNav.vue';
  import CBreadcrumb from '@/components/layout/CBreadcrumb.vue';
</script>
<style scoped lang="postcss">
  .layout-contents {
    background-color: var(--color-bg-gray);
    overflow: auto;
  }
</style>
