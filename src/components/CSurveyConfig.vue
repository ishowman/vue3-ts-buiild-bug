<template>
  <el-form class="survey-card w-full relative p-4" :disabled="disabled">
    <div v-if="disabled" class="w-[378px] mb-4">
      <el-alert type="warning" show-icon :closable="false">
        <template #title
          ><span class="text-regular"
            >この質問はすでに回答者がいるため更新できません</span
          ></template
        >
      </el-alert>
    </div>

    <div class="label-item">
      <span class="text-right">
        <span class="text-danger">*</span>質問 {{ props.index + 1 }}：
      </span>
      <el-input v-model="survey.text" />
    </div>

    <el-checkbox
      v-model="survey.is_required"
      :true-label="NumbericBoolean.true"
      :false-label="NumbericBoolean.false"
    >
      必須項目にする
    </el-checkbox>

    <div class="flex">
      <span>回答形式：</span>
      <span v-if="survey.id && survey.id !== 'null'">
        <template v-if="survey.type === newsTypes.choice">選択</template>
        <template v-if="survey.type === newsTypes.text">記述</template>
        <template v-if="survey.type === newsTypes.month">月</template>
        <template v-if="survey.type === newsTypes.date">日付</template>
      </span>
      <el-radio-group v-else v-model="survey.type" @change="typeChange">
        <el-radio :label="newsTypes.choice">選択</el-radio>
        <el-radio :label="newsTypes.text">記述</el-radio>
        <el-radio :label="newsTypes.month">月</el-radio>
        <el-radio :label="newsTypes.date">日付</el-radio>
      </el-radio-group>
    </div>

    <template v-if="survey.type === newsTypes.choice">
      <template v-for="(answer, key) in survey.answers" :key="`answer${key}`">
        <div class="label-item mb-2">
          <span class="text-right">回答 {{ key + 1 }}：</span>
          <div class="flex">
            <el-input v-model="answer.text" />
            <span
              class="text-danger ml-2 cursor-pointer"
              :class="{ 'cursor-not-allowed': disabled }"
              @click="removeAnswer(key)"
              >⨉</span
            >
          </div>
        </div>
      </template>
      <div>
        <el-link
          type="primary"
          :underline="false"
          :disabled="disabled"
          @click="addSurveyAnswer(survey.answers)"
        >
          <c-icon-font
            name="icon-add"
            :height="ButtonIconHeight.small"
          />回答を追加
        </el-link>
      </div>
    </template>

    <template v-if="[newsTypes.month, newsTypes.date].includes(survey.type)">
      <p>月・日付表示制限</p>
      <el-radio-group v-model="survey.is_using_selectable_period">
        <el-radio :label="false" class="w-full"
          >制限なく選択可能にする</el-radio
        >
        <div class="w-full" />

        <el-radio :label="true">選択可能期間を指定する</el-radio>
        <el-form-item
          :class="{
            'is-error':
              survey.is_using_selectable_period &&
              (survey?.period?.length !== 2 ||
                (survey?.period?.length === 2 &&
                  survey?.period[0] === '' &&
                  survey?.period[1] === '')),
          }"
        >
          <el-date-picker
            v-model="survey.period"
            :type="survey.type === newsTypes.month ? 'monthrange' : 'daterange'"
            :value-format="
              survey.type === newsTypes.month ? 'YYYY-MM' : 'YYYY-MM-DD'
            "
            class="-translate-x-4"
            :disabled="!survey.is_using_selectable_period"
          />
        </el-form-item>
      </el-radio-group>

      <div class="w-[200px] flex mt-2">
        <span class="w-44">回答可能数：</span>
        <el-select-v2
          v-model="survey.available_answer_count"
          :options="answerCounts"
          placeholder="選択"
        />
      </div>
    </template>

    <el-checkbox
      v-if="survey.type === newsTypes.choice"
      v-model="survey.is_multiple"
      :true-label="NumbericBoolean.true"
      :false-label="NumbericBoolean.false"
      >複数回答を許可</el-checkbox
    >
    <el-checkbox
      v-if="survey.type !== newsTypes.text"
      v-model="survey.use_text"
      :true-label="NumbericBoolean.true"
      :false-label="NumbericBoolean.false"
      >記述欄を設ける
    </el-checkbox>

    <c-icon-font
      name="icon-recycle"
      :size="ButtonIconHeight.large"
      color="var(--el-color-danger)"
      class="absolute top-1 right-1 cursor-pointer"
      @click.prevent="emit('del', { index: props.index, id: survey.id })"
    />
  </el-form>
</template>

<script lang="ts" setup>
  import { ButtonIconHeight, newsTypes } from '@/constants';
  import { computed } from 'vue';
  import { NumbericBoolean } from '@/types';
  import { getSurveyByType, type ISurvey, getSurveyAnswerModel } from '@/utils';

  interface IProps {
    survey: ISurvey;
    index: number;
    disabled?: boolean;
    shouldHaveId?: boolean;
  }

  const emit = defineEmits(['update:survey', 'change', 'del']);

  const answerCounts = new Array(20).fill(0).map((_, index) => ({
    label: String(index + 1),
    value: index + 1,
  }));
  const props = withDefaults(defineProps<IProps>(), {
    shouldHaveId: false,
  });

  const disabled = computed(() => props.disabled);

  function addSurveyAnswer(answers) {
    if (survey.value.answers && survey.value.answers.length >= 20) {
      ElMessage.warning('これ以上追加できません');
      return;
    }

    answers.push(getSurveyAnswerModel(props.shouldHaveId));
  }

  const survey = computed({
    get: () =>
      props.survey || getSurveyByType(newsTypes.choice, props.shouldHaveId),
    set: (val) => emit('change', { data: val, index: props.index }),
  });

  function removeAnswer(index) {
    if (disabled.value || !survey.value.answers) {
      return;
    }
    if (survey.value.answers.length <= 2) {
      ElMessage.warning('回答は少なくとも2つ必要です');
      return;
    }
    survey.value.answers.splice(index, 1);
  }

  function typeChange() {
    survey.value = {
      ...getSurveyByType(survey.value.type, props.shouldHaveId),
      text: survey.value.text,
      is_required: survey.value.is_required,
    };
  }
</script>
<style scoped lang="postcss">
  .survey-card {
    background-color: var(--el-table-header-bg-color);
    border-radius: 4px;
  }

  .label-item {
    @apply grid;
    grid-template-columns: 64px 360px;
  }

  .survey-card:deep(.el-range-editor.is-disabled input) {
    background-color: transparent;
  }
</style>
