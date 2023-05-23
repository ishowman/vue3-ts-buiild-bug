<template>
  <el-form
    ref="formRef"
    label-width="var(--label-width)"
    :model="formState"
    :show-message="false"
    class="translate-x-10 w-[920px]"
  >
    <el-form-item v-if="!props.isEdit" label="日付" prop="date" required>
      <el-date-picker
        v-model="formState.date"
        placeholder="入力日付"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <el-form-item label="タイトル" prop="title" required>
      <el-input v-model="formState.title" placeholder="入力タイトル" />
    </el-form-item>

    <el-form-item label="本文" prop="content" required>
      <el-input
        v-model="formState.content"
        placeholder="内容を入力してください"
        type="textarea"
        :rows="3"
      />
    </el-form-item>
    <el-form-item v-if="showStatus" label="公開有無" prop="status" required>
      <el-select-v2
        v-model="formState.status"
        placeholder="選択"
        :options="newsStatusOptions"
        clearable
        class="w-full"
      />
      <div
        v-if="props.isEdit && formState.status === PublishedNews"
        class="mt-1"
      >
        <el-date-picker
          v-model="formState.email_date"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm"
          :disabled-date="(date) => isSelectableDay(date)"
        />
      </div>
    </el-form-item>

    <el-form-item
      v-if="!props.isEdit && formState.status === PublishedNews"
      label="予約送信"
      prop="scheduled_time_switch"
    >
      <el-switch v-model="formState.scheduled_time_switch" />
      <p class="text-secondary text-[12px] w-full leading-6">
        通知メールの送信時刻を指定することができます。
      </p>
      <el-date-picker
        v-if="formState.scheduled_time_switch"
        v-model="formState.email_date"
        type="datetime"
        value-format="YYYY-MM-DD HH:mm"
        format="YYYY-MM-DD HH:mm"
        :disabled-date="(date) => isSelectableDay(date)"
      />
    </el-form-item>

    <el-form-item v-if="!props.isEdit" label="添付ファイル" prop="file">
      <c-uploader
        ref="uploadRef"
        v-model:file-list="localFiles"
        :limit="3"
        :disabled="localFiles.length >= 1"
      >
        <template #buttonText> アップロード </template>
      </c-uploader>
    </el-form-item>

    <el-form-item v-if="!props.isEdit" label="アンケート:" prop="survey">
      <template v-for="(survey, i) in formState.surveys" :key="`surver${i}`">
        <news-survey-config
          :survey="survey"
          :index="i"
          class="mb-2"
          @change="({ data, index }) => (formState.surveys[index] = data)"
          @del="formState.surveys.splice(i, 1)"
        />
      </template>

      <el-button class="block w-full button-dashed" plain @click="addSurvey">
        <c-icon-font
          name="icon-add"
          :height="ButtonIconHeight.small"
        />項目を追加
      </el-button>
    </el-form-item>

    <el-form-item
      v-if="!props.isEdit"
      label="アンケートの締め切り日"
      prop="survey_expires_at"
    >
      <el-date-picker
        v-model="formState.survey_expires_at"
        placeholder="入力"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import {
    ButtonIconHeight,
    newsStatus,
    newsTypes,
    PublishedNews,
  } from '@/constants';
  import CUploader from '@/components/CUploader.vue';
  import NewsSurveyConfig from '@/components/CSurveyConfig.vue';
  import { getSurveyByType } from '@/utils';

  interface IProps {
    modelValue: Record<string, any>;
    isEdit: boolean;
    showStatus: boolean;
  }
  const props = withDefaults(defineProps<IProps>(), {
    modelValue: () => ({}),
    isEdit: false,
  });
  const emit = defineEmits(['update:modelValue']);
  defineExpose({
    validate: async () => {
      return await formRef.value?.validate((isValid) => {
        return isValid;
      });
    },
  });
  const newsStatusOptions = newsStatus.map(({ label, value }) => ({
    label: value,
    value: label,
  }));

  const localFiles = ref<any[]>([]);
  const formRef = ref();

  const formState = computed<any>({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  const showStatus = computed(() => props.showStatus);

  function isSelectableDay(date: number) {
    return date < Date.now() - 24 * 60 * 60 * 1000;
  }

  function addSurvey() {
    const survey = getSurveyByType(newsTypes.choice, !!props.isEdit);
    formState.value.surveys.push(survey);
  }
</script>
