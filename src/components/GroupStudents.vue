<template>
  <div class="grade-group-students p-2">
    <section
      v-for="([grade, students], i) in data"
      :key="grade"
      :class="{ 'mt-2': i > 0 }"
    >
      <p class="leading-6">{{ GradesMap.get(grade) }}：</p>
      <el-tag
        v-for="student in students"
        :key="student.id"
        class="mr-2 mt-2 h-auto"
        type="info"
        style="height: auto"
      >
        <p class="leading-6">
          {{ student.is_sub_student ? '(生徒)' : '(保護者)' }}
          {{ student.name }}
          <span v-if="student.is_deleted" class="text-danger">(退会)</span>
          <template v-if="student.date_text">
            {{ ' ' + student.date_text }}
            <p v-if="student.text">記述: {{ student.text }}</p>
          </template>
          <template v-else>
            <span v-if="student.text">: {{ student.text }}</span>
          </template>
        </p>
      </el-tag>
    </section>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { GradesMap } from '@/constants';

  interface IProps {
    data: any[];
    groupKey?: string;
  }

  const props = withDefaults(defineProps<IProps>(), {
    groupKey: 'grade',
  });

  const data = computed(() => {
    // 将数组排序并分组
    const map = new Map();
    const groupKey = props.groupKey;
    for (const item of props.data) {
      const groupValue = item[groupKey];
      if (map.has(groupValue)) {
        const last = map.get(groupValue);
        last.push(item);
        map.set(groupValue, last);
      } else {
        map.set(groupValue, [item]);
      }
    }
    return map;
  });
</script>
<style scoped lang="postcss">
  .grade-group-students {
    background-color: var(--el-border-color-light);
  }
</style>
