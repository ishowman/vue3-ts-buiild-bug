<template>
  <el-form
    ref="formRef"
    v-loading="loading"
    label-position="top"
    :model="formState"
    :rules="formRules"
    class="p-4 comiru-content news-create"
  >
    <el-form-item required label="タイトル:" prop="title" class="w-[668px]">
      <el-input v-model="formState.title" placeholder="入力タイトル" />
    </el-form-item>

    <el-form-item label="本文:" prop="content">
      <c-editor
        ref="editor"
        class="w-full"
        @change="(content) => (formState.content = content)"
      ></c-editor>
    </el-form-item>
  </el-form>

  <el-form
    v-loading="loading"
    label-position="top"
    class="p-4 comiru-content mt-4 mb-20"
  >
    <el-form-item label="アンケート:" prop="surveys">
      <template v-for="(survey, i) in formState.surveys" :key="`surver${i}`">
        <news-survey-config
          :survey="survey"
          :index="i"
          class="mb-2"
          :disabled="survey.answered_count"
          :should-have-id="!!props.id"
          @change="({ data, index }) => (formState.surveys[index] = data)"
          @del="removeSurvey({ index: i, id: survey.id })"
        />
      </template>
      <el-button class="block w-full button-dashed" plain @click="addSurvey">
        <c-icon-font
          name="icon-add"
          :height="ButtonIconHeight.small"
        />項目を追加
      </el-button>
    </el-form-item>

    <el-form-item label="アンケートの締め切り日:" prop="survey_expires_at">
      <el-date-picker
        v-model="formState.survey_expires_at"
        type="date"
        value-format="YYYY-MM-DD"
      ></el-date-picker>
    </el-form-item>
  </el-form>

  <el-form
    class="bg-white py-3 fixed inset-x-0 bottom-0 z-10 shadow-[0_-3px_4px_rgba(0,0,0,0.05)] px-4 overflow-auto"
  >
    <div class="layout-container flex justify-end">
      <el-button type="danger" plain @click="resetForm">リセット</el-button>
      <el-button
        type="primary"
        :disabled="!isValidForm"
        :loading="isSumbiting"
        @click="submitForm"
      >
        保存
      </el-button>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';
  import { newsTypes, ButtonIconHeight } from '@/constants';
  import { useRouter } from 'vue-router';
  import NewsSurveyConfig from '@/components/CSurveyConfig.vue';
  import { getSurveyByType, typedConfirm, validateSurveys } from '@/utils';
  import {
    createNewsTemplate,
    delNewsTemplateSurvey,
    editNewsTemplateSurvey,
    getNewsTemplate,
  } from '@/services';
  import type { FormRules } from 'element-plus';
  import dayjs from 'dayjs';

  const router = useRouter();

  const initalFormState = {
    surveys: [],
  };
  const formState = ref<Record<string, any>>({ ...initalFormState });
  const loading = ref(true);
  const editor = ref();
  const isValidForm = ref(true);
  const formRef = ref();
  const isSumbiting = ref(false);
  const formRules = reactive<FormRules>({
    title: [{ required: true, message: 'タイトルは、必ず指定してください' }],
  });

  interface IProps {
    id?: string;
  }
  const props = withDefaults(defineProps<IProps>(), {
    id: '',
  });

  init();

  async function init() {
    try {
      loading.value = true;
      if (props.id) {
        await getNewsTemplateInfo();
      }
      watch(formState, isFormValid, { deep: true });
    } finally {
      loading.value = false;
    }
  }

  async function getNewsTemplateInfo() {
    const { title, content, survey_expires_at, surveys } =
      await getNewsTemplate({ id: props.id });
    formState.value = {
      title,
      content,
      survey_expires_at,
      surveys: surveys.map((survey) => {
        if (survey.is_using_selectable_period) {
          survey.period = [
            survey.type === newsTypes.month
              ? dayjs(survey.selectable_date_start).format('YYYY-MM')
              : survey.selectable_date_start,
            survey.type === newsTypes.month
              ? dayjs(survey.selectable_date_end).format('YYYY-MM')
              : survey.selectable_date_end,
          ];
        }
        return survey;
      }),
    };
    editor.value.setHtml(content);
  }

  async function removeSurvey({ index, id }) {
    try {
      if (id && id !== 'null') {
        await typedConfirm({
          title: '本当に削除しますか？',
          content: '',
        });
        await delNewsTemplateSurvey({ template_id: props.id, survey_id: id });
        ElMessage.success('削除しました！');
      }
      formState.value.surveys.splice(index, 1);
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      ElMessage.error('削除に失敗しました！');
    }
  }

  function addSurvey() {
    const survey = getSurveyByType(newsTypes.choice, !!props.id);
    formState.value.surveys.push(survey);
  }

  async function resetForm() {
    if (!props.id) {
      formState.value = { ...initalFormState };
      formState.value.surveys = [];
      editor.value.setHtml('');
      return;
    }
    await getNewsTemplateInfo();
  }

  async function submitForm() {
    const { title, content, surveys, survey_expires_at } = formState.value;
    ElMessage.closeAll();

    try {
      isSumbiting.value = true;
      const isInvalid = await isFormInvalid();
      if (isInvalid) {
        return;
      }

      const params = {
        title,
        content,
      };

      if (surveys?.length) {
        params['surveys_json'] = formState.value.surveys.map((item) => {
          // 只将后端合法的字段提交
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

          const filterKeys = Object.entries(item).filter(([key, _]) =>
            validKeys.includes(key)
          );
          return filterKeys.reduce((preObj, [key, value]) => {
            preObj[key] = value;
            return preObj;
          }, {});
        });
      }
      if (survey_expires_at) {
        params['survey_expires_at'] = survey_expires_at;
      }
      props.id
        ? await editNewsTemplateSurvey({
            ...params,
            id: props.id,
          })
        : await createNewsTemplate(params);

      const tips = props.id ? '更新しました！' : '保存しました！';
      await ElMessage.success(tips);

      router.push({
        name: 'NewsTemplateList',
      });
    } catch (err) {
      console.error('catch err', err);

      const tips = props.id ? '更新に失敗しました！' : '保存に失敗しました！';
      ElMessage.error(tips);
    } finally {
      isSumbiting.value = false;
    }
  }

  async function isFormValid() {
    await formRef.value?.validate(async (isValid) => {
      isValidForm.value = isValid;
    });
  }

  async function isFormInvalid() {
    if (formState.value?.surveys?.length) {
      const { areValidSurveys, errMsg } = validateSurveys(
        formState.value.surveys
      );

      if (!areValidSurveys) {
        ElMessage.error(errMsg);
        return true;
      }
    }

    const isValid = await isFormValid();
    console.log('isValidForm', isValid, isValidForm.value);
    return !isValidForm.value;
  }
</script>
