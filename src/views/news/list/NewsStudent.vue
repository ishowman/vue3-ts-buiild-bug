<template>
  <div
    class="news-student-title flex justify-between items-center py-1 border-y border-x-0 border-solid pl-4 pr-6 cursor-pointer"
    @click="rotateDeg = rotateDeg > 0 ? 0 : 180"
  >
    <span>
      <el-link :disabled="!props.expanable" :underline="false">
        <c-icon-font
          v-if="props.expanable"
          name="icon-Dropdown_ico"
          :rotate="rotateDeg"
          :size="ButtonIconHeight.default"
          color="var(--el-text-color-secondary)"
          class="mr-2"
        />
      </el-link>
      <slot name="title">
        <b class="leading-6">
          {{ student.is_sub_student ? '生徒' : '保護者' }}:{{ student.name }}
          {{ GradesMap.get(student.grade) }}
        </b>
      </slot>
    </span>

    <slot name="right">
      <span>
        <c-icon-font
          :name="student.is_read ? 'icon-Receive' : 'icon-massage'"
          :size="ButtonIconHeight.default"
          :class="{ 'icon-active': student.is_read }"
          class="mr-4"
        />

        <c-icon-font
          name="icon-like"
          :size="ButtonIconHeight.default"
          :class="{ 'icon-active': student.is_okay }"
          class="mr-4"
        />

        <template v-if="props.expanable">
          <c-icon-font
            name="icon-massage1"
            :size="ButtonIconHeight.default"
            class="mr-1"
          />
          <span class="mr-4">{{
            student.comments_count || student?.comments?.length
          }}</span>
        </template>
      </span>
    </slot>
  </div>
  <div v-show="rotateDeg === 0 && props.expanable" class="news-student-content">
    <slot />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';

  import { ButtonIconHeight, GradesMap } from '@/constants';

  interface IProps {
    student: Record<string, any>;
    expanable: boolean;
  }

  const props = withDefaults(defineProps<IProps>(), {
    expanable: false,
  });
  const student = computed(() => props.student);

  const rotateDeg = ref(180);
</script>
<style scoped lang="postcss">
  .news-student-title {
    background-color: var(--el-table-header-bg-color);
    border-color: var(--el-border-color-base);
  }
  .icon-active {
    color: var(--el-color-primary);
  }
</style>
