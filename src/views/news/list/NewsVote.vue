<template>
  <div class="flex news-vote">
    <el-progress
      :percentage="getPercent(answer.answer_count, props.total)"
      :format="
        () => {
          return `${answer.answer_count} 票`;
        }
      "
      :stroke-width="4"
    >
    </el-progress>
    <el-button text
      >({{ getPercent(answer.answer_count, props.total) }}%)</el-button
    >

    <el-link
      v-if="answer.answer_count"
      type="primary"
      :underline="false"
      class="ml-2"
      @click="visible = !visible"
    >
      投票者一覧
    </el-link>
  </div>
  <div v-show="visible">
    <slot name="answerers"> </slot>
  </div>
</template>

<script lang="ts" setup>
  import { getPercent } from '@/utils';

  import { ref } from 'vue';
  interface IProps {
    answer: any;
    total: number;
  }

  const props = withDefaults(defineProps<IProps>(), {
    total: 0,
  });
  const visible = ref(false);
</script>
<style scoped lang="postcss">
  .news-vote:deep(.el-progress-bar) {
    width: 900px;
    flex-grow: unset;
  }
  .news-vote:deep(.el-progress__text) {
    min-width: unset;
  }
</style>
