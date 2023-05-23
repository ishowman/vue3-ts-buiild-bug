<template>
  <div v-loading="loading" class="comiru-content py-6 px-4 news-detail">
    <div class="detail-card p-4">
      <h3
        v-dompurify-html="newsInfo.title"
        class="border-l-4 border-r-0 border-y-0 border-[#16BFB7] border-solid text-[18px] py-0.5 font-normal pl-1"
      />
      <p class="flex justify-end items-center">
        <span class="mr-4">教室：{{ newsInfo.school_name }}</span>
        <span class="mr-4">日付：{{ newsInfo.created_at }}</span>
        <span class="leading-6">
          from：<el-avatar
            :src="newsInfo.teacher_icon_url"
            class="align-middle mr-1"
            size="small"
          />{{ newsInfo.teacher_name }}
        </span>
      </p>
      <p
        v-dompurify-html="newsInfo.content"
        class="news-content mt-2 fr-view"
      />
    </div>

    <template v-if="newsInfo.attachments?.length">
      <p class="pt-4 pb-1.5">添付ファイル：</p>

      <div
        v-for="file in newsInfo.attachments"
        :key="file.file_url"
        class="py-1"
      >
        <a :href="file.file_url" target="_blank" rel="noopener noreferrer">
          {{ file.file_name }}
        </a>
      </div>
    </template>

    <template v-if="surveyList.length">
      <p class="pt-4 pb-1.5">アンケート:</p>
      <div
        v-for="(survey, i) in surveyList"
        :key="survey.id"
        class="detail-card p-4 mb-4"
      >
        <news-survey :index="i" :survey="survey"></news-survey>
      </div>
    </template>

    <el-form label-position="top" class="mt-4">
      <el-form-item label="学年：">
        <el-select-v2
          v-model="selectedGrade"
          class="w-full"
          :options="gradeOptions"
          placeholder="選択"
          filterable
          clearable
        ></el-select-v2>
      </el-form-item>

      <el-form-item label="宛先：">
        <el-radio-group v-model="userType">
          <el-radio label="">すべて表示</el-radio>
          <el-radio :label="false">保護者のみ表示</el-radio>
          <el-radio :label="true">生徒のみ表示</el-radio>
        </el-radio-group>
      </el-form-item>
      <div class="mb-4">
        <el-link
          v-for="{ label, value } in status"
          :key="value"
          :underline="false"
          type="primary"
          class="mr-4"
          @click="statusFilter = value"
          >{{ label }}</el-link
        >
      </div>
    </el-form>

    <!-- news.students -->
    <template
      v-if="newsInfo?.status === 'published' && newsInfo?.submitted_time"
    >
      <news-student
        v-for="student in students"
        :key="student.id"
        :student="student"
        :expanable="newsInfo.can_comment"
      >
        <template v-if="newsInfo.can_comment">
          <div class="w-[616px] py-4">
            <p class="leading-6">
              <c-icon-font
                name="icon-massage"
                :size="ButtonIconHeight.default"
                class="mr-1"
              />コメントする
            </p>
            <p class="text-secondary mt-1 mb-4">※保護者のコメントの注意文</p>

            <upload-comment
              :data="{
                id: route.query?.id,
                news_student_id: student?.id,
              }"
            />
          </div>

          <news-comment
            v-for="comment in student.comments"
            :key="comment.teacher_id || comment.student_id"
            class="mb-4"
            :comment="comment"
            :is-admin="!(comment?.student?.id || comment?.teacher?.id)"
            :show-admin-info="!(comment?.student?.id || comment?.teacher?.id)"
          />
        </template>
      </news-student>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { getNewsInfo } from '@/services';
  import { useRoute } from 'vue-router';
  import { computed, reactive, ref } from 'vue';
  import { GradesMap, ButtonIconHeight } from '@/constants';
  import NewsSurvey from './NewsSurvey.vue';
  import NewsStudent from './NewsStudent.vue';
  import NewsComment from './NewsComment.vue';
  import UploadComment from './UploadComment.vue';

  const route = useRoute();
  const loading = ref(false);

  const gradeOptions = reactive<{ value: number; label: string }[]>([]);
  GradesMap.forEach((label, value) => {
    gradeOptions.push({ value, label });
  });

  const selectedGrade = ref();

  const newsInfo = ref<Record<string, any>>({
    title: '',
    students: [],
  });

  const status = [
    {
      label: 'すべて表示',
      value: '',
    },

    {
      label: '既読者のみ表示',
      value: { is_read: true },
    },
    {
      label: '未読者のみ表示',
      value: { is_read: false },
    },
    {
      label: 'いいね有のみ表示',
      value: { is_okay: true },
    },
  ];

  const statusFilter = ref();

  const userType = ref('');
  const surveyList = ref<any>([]);
  const students = computed(() => {
    let filter: Record<string, string | number> = {};
    const falsyValues = [null, undefined, ''];

    if (!falsyValues.includes(selectedGrade.value)) {
      filter.grade = selectedGrade.value;
    }
    if (!falsyValues.includes(userType.value)) {
      filter.is_sub_student = userType.value;
    }
    if (!falsyValues.includes(statusFilter.value)) {
      filter = {
        ...filter,
        ...statusFilter.value,
      };
    }

    const keys = Object.keys(filter);
    return newsInfo.value.students.filter((item) => {
      return keys.every((key) => item[key] === filter[key]);
    });
  });
  getNewsData();

  async function getNewsData() {
    try {
      loading.value = true;
      const { id } = route.query;

      const { news, surveys } = await getNewsInfo({ id });
      if (news.teachers?.length) {
        for (const teacher of news.teachers) {
          teacher.comments = teacher.comments.reverse();
        }
      }

      newsInfo.value = news;
      if (surveys.length) {
        surveyList.value = surveys;
      }
    } finally {
      loading.value = false;
    }
  }
</script>
<style scoped lang="postcss">
  .detail-card {
    background-color: var(--el-table-header-bg-color);
    border-radius: 4px;
  }
  .news-content {
    line-height: 1.6;
    &:deep(table) {
      @apply mt-2;
      @apply mb-4;
    }
  }
</style>
