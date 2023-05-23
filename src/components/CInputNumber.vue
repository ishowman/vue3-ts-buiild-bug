<template>
  <el-input v-bind="$attrs" v-model="inputValue">
    <template v-for="(_, name) in $slots" #[name]>
      <slot :name="name"></slot>
    </template>
  </el-input>
</template>

<script lang="ts" setup>
  import { computed, useAttrs } from 'vue';

  const emit = defineEmits(['update:modelValue']);

  const inputValue = computed<typeof ElInput.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val) =>
      emit('update:modelValue', (val as string).replace(/[^\d]/g, '')),
  });
</script>
