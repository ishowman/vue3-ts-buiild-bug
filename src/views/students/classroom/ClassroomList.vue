<template>
  <div>{{ componentName }}</div>
  <component :is="config.name" v-bind="config.attrs">
    <template v-for="slot in config.slots" #[slot.name]>{{
      slot.text
    }}</template>
  </component>
</template>

<script lang="ts" setup>
  import { ElCard } from 'element-plus';
  import 'element-plus/es/components/card/style/css';

  const componentName = 'StudentManage';
  const config = {
    name: ElCard,
    attrs: {
      type: 'primary',
    },
    slots: [
      {
        name: 'header',
        text: 666,
      },
    ],
  };
</script>
<style scoped></style>
