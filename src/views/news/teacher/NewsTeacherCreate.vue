<template>
  <div class="comiru-content py-6 news-teacher">
    <c-steps
      v-if="!props.id"
      :active="activeStep"
      class="mb-9"
      :steps="steps"
      :process-status="processStatus"
    />

    <query-teacher-form v-if="activeStep === 0" v-model="step1" />
    <div v-show="activeStep === 1" v-loading="loading" class="w-[1200px]">
      <el-table
        ref="tableRef"
        :data="currentPageData"
        max-height="1052.5"
        highlight-current-row
        :scrollbar-always-on="true"
        @select="selectHandler"
        @select-all="selectHandler"
      >
        <template #default>
          <el-table-column type="selection" width="30" fixed />

          <template
            v-for="field in newsTeacherPreviewFieldsConfig"
            :key="field"
          >
            <el-table-column v-if="field.prop === 'schools'" label="教室名">
              <template #default="scope">
                <el-tag
                  v-for="school in scope.row.schools"
                  :key="school.id"
                  class="mx-1"
                  size="small"
                  :type="
                    school.owner_teacher_id === scope.row.id
                      ? `warning`
                      : school?.pivot?.is_admin
                      ? `success`
                      : `info`
                  "
                  >{{ school.name }} |
                  {{
                    school.owner_teacher_id === scope.row.id
                      ? 'オーナー'
                      : school?.pivot?.is_admin
                      ? '管理者'
                      : '一般講師'
                  }}</el-tag
                >
              </template>
            </el-table-column>

            <el-table-column
              v-else
              :label="field.label"
              :prop="field.prop"
              :width="field.labelWidth"
              show-overflow-tooltip
            />
          </template>
        </template>
      </el-table>
      <div class="p-4 flex justify-end">
        <el-pagination
          v-model:currentPage="currentPage"
          :page-size="DefaultPageSize"
          layout="total,  prev, pager, next"
          :total="tableData.length"
          small
          @current-change="(page) => (currentPage = page)"
        />
      </div>
    </div>

    <create-teacher-form
      v-if="activeStep === 2"
      ref="step3Form"
      v-model="step3"
      v-loading="loading"
      :is-edit="!!props.id"
      :show-status="showStatus"
    />

    <template v-if="activeStep === 3">
      <el-result
        :icon="submitResult.isSuccess ? 'success' : 'error'"
        :title="submitResult.title"
      >
        <template #sub-title>
          <span class="text-secondary">{{ submitResult?.desc }}</span>
        </template>
        <template #icon>
          <c-icon-font
            v-if="submitResult?.isSuccess"
            name="icon-right2"
            class="mb-2"
            color="var(--el-color-success)"
            size="68px"
          />
          <c-icon-font v-else name="icon-erro" class="mb-2" size="68px" />
        </template>

        <template #extra>
          <el-button type="primary" @click="reCreate"
            >再度アップロード</el-button
          >
          <el-button
            type="primary"
            plain
            @click="router.push({ name: 'NewsTeacherList' })"
            >リストに戻る</el-button
          >
        </template>
      </el-result>
    </template>

    <el-form :label-width="[0, 2].includes(activeStep) ? '340px' : '300px'">
      <el-form-item>
        <template v-if="activeStep < steps.length - 1">
          <el-button
            v-if="activeStep !== 0 && !props.id"
            plain
            type="primary"
            @click="activeStep -= 1"
            >前のステップ</el-button
          >
          <el-button
            v-if="activeStep !== 2"
            type="primary"
            :disabled="!ableToNext"
            @click="toNextStep(activeStep)"
            >次のステップ</el-button
          >
          <el-button
            v-if="activeStep === 2"
            :plain="isStep3Valid"
            type="primary"
            :disabled="!isStep3Valid"
            @click="saveForm"
          >
            {{ saveText }}
          </el-button>

          <el-button
            v-if="[0, 2].includes(activeStep)"
            type="danger"
            plain
            @click="clearSteps"
            >リセット</el-button
          >
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, ref, watch } from 'vue';

  import {
    getTeacherNewsPreview,
    saveTeacherNews,
    editTeacherNewsInfo,
    getTeacherNews,
  } from '@/services';
  import {
    newsTeacherPreviewFieldsConfig,
    DefaultPageSize,
    PublishedNews,
    DraftNews,
  } from '@/constants';

  import { useRouter } from 'vue-router';
  import QueryTeacherForm from '@/views/news/teacher/QueryTeacherForm.vue';
  import CreateTeacherForm from '@/views/news/teacher/CreateTeacherForm.vue';
  import { validateSurveys } from '@/utils';

  const router = useRouter();

  interface IProps {
    id?: string;
  }
  const props = withDefaults(defineProps<IProps>(), {
    id: '',
  });
  const activeStep = ref(props.id ? 2 : 0);

  const steps = [
    {
      label: '講師検索',
    },
    {
      label: 'プレビュー',
    },
    {
      label: '作成',
    },

    {
      label: '送信',
    },
  ];

  const defaultStep1 = {
    school_ids_target: '',
    school_ids: [],
    admin_permissions_ids: [],
    comiru_permissions: [],
    area_id: '',
    group_ids: [],
  };

  const step1 = ref({ ...defaultStep1 });

  let defaultStep3: Record<string, any> = {
    surveys: [],
    status: DraftNews,
  };

  const step3 = ref<Record<string, any>>({
    ...defaultStep3,
  });

  const showStatus = ref(
    !props.id || (!!props.id && step3.value.status === DraftNews)
  );

  const tableRef = ref();
  const tableData = ref<
    {
      data: any[];
      info: any[];
      error: any[];
    }[]
  >([]);
  const currentPage = ref(1);
  const currentPageData = computed(() => {
    return tableData.value.slice(
      DefaultPageSize * (currentPage.value - 1),
      DefaultPageSize * currentPage.value
    );
  });
  const selectedRows = ref([]);

  const submitResult = ref({
    isSuccess: false,
    desc: '',
    title: '',
  });

  const processStatus = computed(() => {
    if (activeStep.value === 3) {
      return submitResult.value?.isSuccess ? 'success' : 'error';
    }
    return 'process';
  });

  const step3Form = ref();

  const loading = ref(false);

  const ableToNext = computed(() => {
    if (activeStep.value === 1) {
      return selectedRows.value.length > 0;
    }
    return true;
  });

  const saveText = computed(() => {
    let text;
    if (props.id) {
      text =
        showStatus.value && step3.value.status === PublishedNews
          ? '保存して送信する'
          : '保存';
    } else {
      text =
        step3.value?.status === PublishedNews &&
        step3.value?.scheduled_time_switch
          ? `保存して予約する`
          : step3.value.status === PublishedNews
          ? `保存して送信する`
          : `保存する`;
    }
    return text;
  });

  init();
  async function init() {
    try {
      loading.value = true;
      if (props.id) {
        await getTeacherNewsInfo(props.id);
        showStatus.value = step3.value.status === DraftNews;
      }
      nextTick(() => {
        watch(step3, checkStep3, { deep: true, immediate: true });
      });
    } finally {
      loading.value = false;
    }
  }

  async function getTeacherNewsInfo(id) {
    const { teacher_news } = await getTeacherNews({ id: id });
    const { title, content, status, scheduled_time } = teacher_news;
    defaultStep3 = {
      title,
      content,
      status,
      email_date: scheduled_time ?? undefined,
    };
    step3.value = {
      ...defaultStep3,
    };
  }

  async function toNextStep(stepValue) {
    activeStep.value += 1;

    if (stepValue === 0) {
      const {
        school_ids,
        admin_permissions_ids,
        comiru_permissions,
        area_id,
        group_ids,
      } = step1.value;
      const params = {};
      if (school_ids?.length) {
        params['school_ids'] = school_ids.join(',');
      }
      if (admin_permissions_ids?.length) {
        params['admin_permissions_ids'] = admin_permissions_ids.join(',');
      }

      if (comiru_permissions?.length) {
        params['comiru_permissions'] = comiru_permissions.join(',');
      }

      if (area_id) {
        params['area_id'] = area_id;
      }

      if (group_ids?.length) {
        params['group_ids'] = group_ids.join(',');
      }

      try {
        loading.value = true;
        const { items } = await getTeacherNewsPreview(params);
        tableData.value = items;
        tableRef.value?.toggleAllSelection();
      } finally {
        loading.value = false;
      }
    }
  }

  function clearSteps() {
    step1.value = { ...defaultStep1 };
    step3.value = { ...defaultStep3, surveys: [] };
  }

  async function saveForm() {
    const inValid = await isFormInvalid();
    if (inValid) {
      return;
    }
    const {
      date,
      title,
      content,
      status,
      scheduled_time_switch,
      email_date,
      surveys,
      survey_expires_at,
    } = step3.value;

    try {
      if (props.id) {
        await editTeacherNewsInfo({
          id: props.id,
          title,
          content,
          status: showStatus.value ? status : undefined,
          email_date: showStatus.value ? email_date : undefined,
        });
      } else {
        const formParams = new FormData();
        if (date) {
          formParams.append('date', date);
        }

        if (title) {
          formParams.append('title', title);
        }

        if (content) {
          formParams.append('content', content);
        }

        if (status) {
          formParams.append('status', status);
        }

        if (scheduled_time_switch !== undefined) {
          formParams.append(
            'scheduled_time_switch',
            scheduled_time_switch ? 'on' : 'off'
          );
        }

        if (email_date) {
          formParams.append('email_date', email_date);
        }

        if (survey_expires_at) {
          formParams.append('survey_expires_at', survey_expires_at);
        }

        if (surveys?.length) {
          formParams.append(
            'surveys_json',
            JSON.stringify(
              step3.value.surveys.map((item) => {
                const validKeys = [
                  'id',
                  'text',
                  'type',
                  'is_required',
                  'use_text',
                  'answers',
                  'is_multiple',
                  'is_using_selectable_period',
                  'selectable_date_start',
                  'selectable_date_end',
                  'available_answer_count',
                  'class_ids',
                ];
                if (
                  item.period &&
                  item?.period?.length === 2 &&
                  item.is_using_selectable_period
                ) {
                  const [start, end] = item.period;
                  item.selectable_date_start = start;
                  item.selectable_date_end = end;
                } else {
                  delete item.selectable_date_start;
                  delete item.selectable_date_end;
                }

                return Object.entries(item).reduce(
                  (acc, [key, value]) =>
                    validKeys.includes(key)
                      ? Object.assign(acc, { [key]: value })
                      : acc,
                  {}
                );
              })
            )
          );
        }

        const teachers = selectedRows.value.map((row: any) => ({
          id: row.id,
          school_ids: row.schools.map((school) => school.id).join(','),
        }));
        if (teachers?.length) {
          formParams.append('teachers', JSON.stringify(teachers));
        }

        await saveTeacherNews(formParams);

        activeStep.value = 3;
      }
      let text = `保存と送信に成功しました`;
      if (status === DraftNews) {
        text = `保存に成功しました`;
      }
      if (status === PublishedNews && scheduled_time_switch) {
        text = `保存と予約に成功しました`;
      }

      submitResult.value = {
        desc: 'お知らせの作成に成功しました',
        title: text,
        isSuccess: true,
      };

      if (props.id) {
        await ElMessage.success('更新しました！');
        if (showStatus.value && step3.value.status === PublishedNews) {
          await ElMessage.success('お知らせを送信しました');
        }
        router.push({
          name: 'NewsTeacherList',
        });
      }
    } catch (err) {
      let text = `保存と送信に失敗しました`;
      if (status === DraftNews) {
        text = `保存に失敗しました`;
      }
      if (status === PublishedNews && scheduled_time_switch) {
        text = `保存と予約に失敗しました`;
      }

      submitResult.value = {
        desc: '',
        title: text,
        isSuccess: false,
      };

      if (props.id) {
        ElMessage.error('更新に失敗しました！');
        if (showStatus.value && step3.value.status === PublishedNews) {
          ElMessage.success('お知らせを送信に失敗しました');
        }
      }
    }
  }

  function reCreate() {
    activeStep.value = 0;
    clearSteps();
  }

  async function isFormInvalid() {
    if (
      (!props.id &&
        step3.value.scheduled_time_switch === 'on' &&
        !step3.value.email_date) ||
      (props.id &&
        showStatus.value &&
        step3.value.status === PublishedNews &&
        !step3.value.email_date)
    ) {
      ElMessage.error('予約送信日時を選択してください');
      return true;
    }

    if (step3.value?.surveys?.length) {
      const { areValidSurveys, errMsg } = validateSurveys(step3.value.surveys);

      if (!areValidSurveys) {
        ElMessage.error(errMsg);
        return true;
      }
    }

    await checkStep3();
    return !isStep3Valid.value;
  }
  const isStep3Valid = ref(false);

  async function checkStep3() {
    const isValid = await step3Form.value?.validate();
    isStep3Valid.value = isValid;
  }

  const selectHandler = (selection) => {
    selectedRows.value = selection;
  };
</script>
<style scoped lang="postcss">
  .news-teacher {
    --label-width: 300px;
  }
</style>
