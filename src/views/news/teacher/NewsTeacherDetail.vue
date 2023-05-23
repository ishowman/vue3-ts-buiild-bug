<template>
  <div v-loading="loading" class="comiru-content py-6 px-4 news-detail">
    <div class="detail-card p-4">
      <h3
        v-dompurify-html="newsInfo.title"
        class="border-l-4 border-r-0 border-y-0 border-[#16BFB7] border-solid text-[18px] py-0.5 font-normal pl-1"
      />
      <p class="flex justify-end items-center">
        <span class="mr-4">教室：{{ newsInfo.school_name }}</span>
        <span class="mr-4"> 送信日：{{ newsInfo.date }}</span>
        <span class="leading-6">
          書いた講師：
          <el-avatar
            :src="newsInfo.teacher_icon_url"
            class="align-middle mr-1"
            size="small"
          />
          <span v-if="newsInfo.from_corporation" class="text-warning"
            >本部</span
          >
          <template v-else>{{ newsInfo.teacher_name }}</template>
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

    <template v-if="showSwitch && surveyList.length">
      <p class="pt-4 pb-1.5">アンケート:</p>
      <div
        v-for="(survey, i) in surveyList"
        :key="survey.id"
        class="detail-card p-4 mb-4"
      >
        <news-survey :index="i" :survey="survey">
          <template #inviters="{ data }">
            <!-- 回答\未回答者一览 -->

            <div class="teachers-tag p-2 pb-0">
              <el-tag
                v-for="item in data"
                :key="item?.name"
                class="mr-2 mb-2 h-auto"
                type="info"
                style="height: auto"
              >
                <p class="leading-6">
                  {{ item?.name }}
                  <template
                    v-if="
                      [newsTypes.month, newsTypes.date].includes(survey.type)
                    "
                  >
                    <span v-if="item.date_text" class="ml-1">{{
                      item.date_text
                    }}</span>

                    <p v-if="item.text">記述: {{ item.text }}</p>
                  </template>
                  <template v-else-if="item.text">
                    {{ ':' + item.text }}
                  </template>
                </p>
              </el-tag>
            </div>
          </template>
          <template #answerers="{ answerers }">
            <!-- 投票者一览 -->
            <div class="teachers-tag p-2 pb-0">
              <el-tag
                v-for="item in answerers"
                :key="item?.name"
                class="mr-2 mb-2 h-auto"
                type="info"
                style="height: auto"
              >
                <p class="leading-6">
                  {{ item?.name }}
                  <template v-if="item.text">
                    {{ ':' + item.text }}
                  </template>
                </p>
              </el-tag>
            </div>
          </template>
        </news-survey>
      </div>
    </template>

    <!-- news.students -->
    <template v-if="showSwitch">
      <p class="mt-4 mb-2">既読数: {{ newsInfo.is_read_count }}</p>
      <news-student
        v-for="item in newsInfo.teachers"
        :key="item.id"
        :student="item"
        expanable
      >
        <template #title>
          <b class="leading-6">
            {{ item.name }}
          </b>
        </template>

        <div class="w-[616px]">
          <p class="leading-6 pt-4">
            <c-icon-font
              name="icon-massage"
              :size="ButtonIconHeight.default"
              class="mr-1"
            />コメントする
          </p>

          <el-input
            v-model="item.content"
            :rows="2"
            type="textarea"
            placeholder="入力"
            class="w-[616px] mb-4"
          />
          <el-button
            type="primary"
            :disabled="!item.content"
            class="mb-4"
            @click="addComment(item.teachers_news_teachers_id, item.content)"
          >
            投稿
          </el-button>
        </div>

        <news-comment
          v-for="comment in item.comments"
          :key="comment.id"
          class="mb-4"
          :comment="comment"
          :is-admin="comment?.teacher_id !== item.id"
          :readonly="false"
          :show-admin-info="false"
          @del="delComment(comment.id)"
        />
      </news-student>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import {
    deleteTeacherNewsComment,
    getTeacherNews,
    saveNewsComment,
  } from '@/services';
  import { useRoute } from 'vue-router';
  import { computed, ref } from 'vue';
  import { ButtonIconHeight } from '@/constants';
  import NewsSurvey from '@/views/news/list/NewsSurvey.vue';
  import NewsStudent from '@/views/news/list/NewsStudent.vue';
  import NewsComment from '@/views/news/list/NewsComment.vue';
  import { typedConfirm } from '@/utils';
  import { newsTypes } from '@/constants';

  const route = useRoute();
  const loading = ref(false);

  const newsInfo = ref<Record<string, any>>({
    title: '',
    students: [],
  });

  const surveyList = ref<any>([]);

  const showSwitch = computed(() => {
    return newsInfo.value.schedule_time
      ? newsInfo.value.status !== 'draft' && newsInfo.value.submitted_time
      : newsInfo.value.status !== 'draft';
  });
  init();

  async function init() {
    try {
      loading.value = true;
      const { id } = route.query;

      const { teacher_news: news, surveys } = await getTeacherNews({ id });
      if (news.teachers?.length) {
        for (const teacher of news.teachers) {
          const comments = teacher.comments
            .reverse()
            .map((item) => transformComment(item));
          teacher.comments = comments;
        }
      }

      newsInfo.value = {
        ...news,
        content: news.content.replace(/\n/g, '<br/>'),
      };
      if (surveys.length) {
        surveyList.value = surveys;
      }
    } finally {
      loading.value = false;
    }
  }

  function transformComment(data) {
    return {
      ...data,
      teacher: {
        icon_url: data.teacher_icon_url,
        name: data.teacher_name,
      },
      format_created_at: data.created_at,
    };
  }

  async function addComment(teacherId, comment) {
    const { id } = route.query;
    try {
      loading.value = true;
      await saveNewsComment({
        id,
        teacher_id: teacherId,
        comment,
      });
      init();
    } finally {
      loading.value = false;
    }
  }

  async function delComment(id) {
    try {
      await typedConfirm({
        title: '本当に削除しますか？',
        content: '',
      });
      loading.value = true;

      await deleteTeacherNewsComment({ id });
      await ElMessage.success('削除しました！');

      init();
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      ElMessage.error('削除に失敗しました！');
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

  .teachers-tag {
    background-color: var(--el-border-color-light);
  }
</style>
