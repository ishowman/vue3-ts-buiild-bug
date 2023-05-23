<template>
  <el-input-number v-model="min" :max="max" />
  ~
  <el-input-number v-model="max" :min="min" />

  {{ min }}~{{ max }}
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  const max = ref();
  const min = ref();
</script>
<style scoped></style>
