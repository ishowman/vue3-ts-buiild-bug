<template>
  <el-form label-position="top" class="survey">
    <el-form-item :required="survey.is_required">
      <template #label>
        <h4 class="inline">質問 {{ props.index + 1 }}</h4>
      </template>
      <p class="leading-6">{{ survey.text }}</p>
    </el-form-item>
    <el-link
      v-if="survey.is_multiple"
      :underline="false"
      type="danger"
      class="text-[12px] -translate-y-2.5"
    >
      (複数選択可)
    </el-link>

    <div class="flex items-center leading-6">
      <h4>
        回答数 {{ survey.answered_count + '/' + survey.sent_count }} ({{
          getPercent(survey.answered_count, survey.sent_count)
        }}%)
      </h4>
      <el-link
        v-if="survey.unanswered?.length"
        type="primary"
        :underline="false"
        class="ml-2"
        @click="toggleStudents('unanswered', survey.unanswered)"
        >未回答者一覧</el-link
      >
      <el-link
        v-if="survey.texted?.length"
        type="primary"
        :underline="false"
        class="ml-2"
        @click="toggleStudents('texted', survey.texted)"
        >回答一覧</el-link
      >
    </div>

    <div v-show="visible">
      <slot name="inviters" :data="students">
        <group-students :data="students" />
      </slot>
    </div>

    <div v-for="(answer, j) in survey.answers" :key="answer.id" class="mt-4">
      <p>
        <b>{{ j + 1 }}.</b>{{ answer.text }}
      </p>
      <NewsVote :answer="answer" :total="survey.sent_count">
        <template #answerers>
          <slot
            name="answerers"
            :answerers="answer.students || answer.teachers"
          >
            <group-students
              v-if="answer?.students?.length || answer?.teachers?.length"
              :data="answer.students || answer.teachers"
            ></group-students>
          </slot>
        </template>
      </NewsVote>
    </div>
    <p v-if="survey.use_text" class="text-secondary">
      保護者側では記述欄が表示されます。
    </p>
  </el-form>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { getPercent } from '@/utils';
  import GroupStudents from '@/components/GroupStudents.vue';
  import NewsVote from './NewsVote.vue';

  interface IProps {
    survey: Record<string, any>;
    index: number;
  }

  const props = withDefaults(defineProps<IProps>(), {
    // survey: {}
  });

  const survey = computed(() => props.survey);
  const students = ref<any[]>([]);
  const visible = ref(false);
  let lastType = '';

  function toggleStudents(type, data) {
    if (type === lastType) {
      visible.value = !visible.value;
    } else {
      visible.value = true;
    }
    lastType = type;
    students.value = data;
  }
</script>
<style scoped></style>
