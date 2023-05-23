<template>
  <div class="text-center w-fit">
    <div>
      <span class="statistic-value text-[30px]">
        <span class="text-emphasize">{{ numberFormat(data.total) }}</span>
        <span
          v-if="isAdjacentDates"
          class="statistic-percent font-sm flex items-center"
        >
          <c-icon-font
            name="icon-triangle"
            width="9px"
            height="9px"
            :rotate="iconStatus.rotate"
            :color="iconStatus.color"
            class="mr-0.5"
          />
          <slot>{{ data.rate }}%</slot>
        </span>
      </span>
    </div>
    <p class="statistic-label font-medium">
      <slot name="label">{{ label }}</slot>
    </p>
    <p v-if="isAdjacentDates" class="statistic-date text-gray-400 text-sm">
      {{ preDate + ' : ' + data.prev_date_total }}
    </p>
  </div>
</template>

<script lang="ts" setup>
  import { computed, toRefs } from 'vue';
  import { numberFormat } from '@/utils';

  interface IStatisticProps {
    label: string;
    isAdjacentDates: boolean;
    data: {
      total: number;
      rate: number;
      prev_date_total: number;
    };
    preDate: string;
  }
  const props = withDefaults(defineProps<IStatisticProps>(), {
    label: '',
    isAdjacentDates: false,
    data: () => {
      return {
        total: 0,
        rate: 0,
        prev_date_total: 0,
      };
    },
    preDate: '',
  });
  const { label, data, isAdjacentDates } = toRefs(props);
  const iconStatus = computed(() => {
    if (data.value.rate < 0) {
      return {
        rotate: 0,
        color: 'var(--el-color-danger)',
      };
    }
    if (data.value.rate > 0) {
      return {
        rotate: 180,
        color: 'var(--el-color-success)',
      };
    }

    return {
      rotate: 90,
      color: 'var(--el-text-color-secondary)',
    };
  });
</script>
<style scoped lang="postcss">
  .statistic-value {
    position: relative;
    line-height: 36px;
  }
  .statistic-percent {
    position: absolute;
    left: 100%;
    top: 9px;
    line-height: 18px;
    transform: translateX(5px);
  }
  .statistic-up {
    color: var(--el-color-danger);
  }
  .statistic-down {
    color: var(--el-color-success);
  }
  .statistic-label {
    line-height: 24px;
  }
</style>
