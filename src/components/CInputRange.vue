<template>
  <div class="grid items-center gap-2 input-range-container">
    <el-input
      v-model="start"
      :placeholder="placeholder"
      @input="($event: string) => (start = $event.replace(/[^\d]/g, ''))"
    />

    <span>~</span>
    <el-input
      v-model="end"
      :placeholder="placeholder"
      @input="($event: string) => (end = $event.replace(/[^\d]/g, ''))"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, useAttrs } from 'vue';
  export interface IProps {
    modelValue: (typeof ElInput.modelValue)[];
    placeholder?: typeof ElInput.placeholder;
  }
  const props = withDefaults(defineProps<IProps>(), {
    modelValue: () => ['', ''],
    placeholder: '',
  });
  const emit = defineEmits(['update:modelValue']);

  const start = computed<typeof ElInput.modelValue>({
    get() {
      return props.modelValue[0];
    },
    set(start) {
      const end = props.modelValue[1];
      emit('update:modelValue', [start, end]);
    },
  });

  const end = computed<typeof ElInput.modelValue>({
    get() {
      return props.modelValue[1];
    },
    set(end) {
      const start = props.modelValue[0];
      emit('update:modelValue', [start, end]);
    },
  });

  const placeholder = computed<typeof ElInput.placeholder>(
    () => useAttrs().placeholder
  );
</script>
<style scoped lang="postcss">
  .input-range-container {
    grid-template-columns: 1fr auto 1fr;
  }
</style>
