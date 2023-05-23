<template>
  <span>
    <i
      class="rounded-full w-1 h-1 inline-block mr-1 align-middle"
      :class="classList"
    ></i>
    <slot />
  </span>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { StatusType } from '@/constants';

  interface IDotProps {
    status: StatusType;
  }
  const dotProps = withDefaults(defineProps<IDotProps>(), {
    status: StatusType.primary,
  });
  const classList = computed(() => `dot-${dotProps.status}`);
</script>
<style scoped lang="postcss">
  .dot-primary {
    background-color: var(--el-color-primary);
  }
  .dot-warning {
    background-color: var(--el-color-warning);
  }

  .dot-success {
    background-color: var(--el-color-success);
  }
  .dot-danger {
    background-color: var(--el-color-danger);
  }
</style>
