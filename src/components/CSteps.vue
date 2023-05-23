<template>
  <el-steps
    finish-status="success"
    class="c-steps w-[750px] mx-auto"
    style="--color-custom: #f00"
    align-center
    v-bind="$attrs"
  >
    <slot>
      <template v-for="step in stepProps.steps" :key="step.label">
        <el-step :title="step.label" />
      </template>
    </slot>
  </el-steps>
</template>

<script lang="ts" setup>
  interface IStep {
    label: string;
  }
  interface ISteps {
    steps?: IStep[];
  }
  const stepProps = withDefaults(defineProps<ISteps>(), {
    steps: () => [],
  });
</script>

<style>
  .is-process {
    --el-text-color-primary: var(--el-color-primary);
  }

  .is-success {
    --el-color-success: var(--el-color-primary);
  }
</style>
