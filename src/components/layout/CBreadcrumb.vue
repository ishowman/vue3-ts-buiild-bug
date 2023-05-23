<template>
  <div
    id="comiru-breadcrumb"
    class="w-full flex justify-between items-center pt-6 pb-4 comiru-ui"
  >
    <p
      v-if="!router.currentRoute.value.meta.back"
      class="text-[20px] font-bold"
    >
      {{ title }}
    </p>

    <el-page-header
      v-else
      title=" "
      @back="goBack(router.currentRoute.value.meta)"
    >
      <template #content>
        <p class="-ml-6 text-[20px] font-bold">{{ title }}</p>
      </template>
    </el-page-header>

    <el-breadcrumb class="page-breadcrumb">
      <template v-for="(routeItem, i) in route.matched" :key="routeItem.name">
        <el-breadcrumb-item v-if="i + 1 === route.matched.length">
          <span class="text-primary">{{ routeItem.meta.JPName }}</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item
          v-else-if="routeItem.meta.JPName !== route.matched[i + 1].meta.JPName"
          class="cursor-pointer"
          @click="jump({ name: routeItem.name })"
        >
          <span class="breadcrumb-link">{{ routeItem.meta.JPName }}</span>
        </el-breadcrumb-item>
      </template>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts" setup>
  import { typedConfirm } from '@/utils';
  import { computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';

  const router = useRouter();
  const route = useRoute();

  const title = computed(
    () =>
      router.currentRoute.value?.meta?.title ||
      router.currentRoute.value?.meta?.JPName
  );

  async function goBack(meta) {
    if (!meta.back) {
      return;
    }
    if (!meta.back.noConfirm) {
      await typedConfirm();
    }
    if (meta.back.router) {
      router.push(meta.back.router);
    }
  }

  async function jump(route) {
    const meta = router.currentRoute.value.meta;
    if (meta.back) {
      await goBack(meta);
    } else {
      router.push(route);
    }
  }
</script>
<style scoped lang="postcss">
  .comiru-ui {
    --el-border-color: transparent;
    & .el-page-header {
      height: 24px;
    }
  }
  .page-breadcrumb {
    --el-text-color-regular: var(--el-text-color-primary);
    &:deep(.breadcrumb-link) {
      color: var(--el-text-color-secondary);
    }
  }
</style>
