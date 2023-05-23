<template>
  <el-drawer
    v-bind="$attrs"
    v-model="visible"
    direction="rtl"
    size="648px"
    custom-class="comiru-drawer"
    :with-header="false"
  >
    <div class="grid absolute inset-0 comiru-drawer-body">
      <div class="py-4 px-6 flex justify-between">
        <slot name="title"></slot>
        <c-icon-font
          :name="666"
          width="22px"
          class="p-1 cursor-pointer"
          @click="close"
        />
      </div>
      <div class="p-6 border-y border-solid border-x-0 overflow-auto">
        <slot />
      </div>
      <div class="py-2 px-6 flex justify-end">
        <slot name="footer">
          <el-button @click="close">{{ CDrawerProps.cancelText }}</el-button>
          <el-button type="primary" @click="confirm">{{
            CDrawerProps.confirmText
          }}</el-button>
        </slot>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
  // import CIconFont from './CIconFont.vue';
  // 组件 api 除了多一个 footer 插槽，其它与 https://element-plus.gitee.io/zh-CN/component/drawer.html 一致
  import { computed, useAttrs } from 'vue';
  export interface IDrawerProps {
    confirmText?: string;
    cancelText?: string;
  }

  const emit = defineEmits(['update:modelValue', 'confirm']);

  const CDrawerProps = withDefaults(defineProps<IDrawerProps>(), {
    confirmText: '編集',
    cancelText: 'キャンセル',
  });

  const visible = computed<typeof ElDrawer.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val: typeof ElDrawer.modelValue) => emit('update:modelValue', val),
  });

  function close() {
    visible.value = false;
  }

  function confirm() {
    close();
    emit('confirm');
  }
</script>
<style>
  .comiru-drawer {
    --el-drawer-padding-primary: 16px 24px 0;
  }
</style>
<style scoped lang="postcss">
  .comiru-drawer-body {
    grid-template-rows: 56px 1fr 48px;
  }
</style>
