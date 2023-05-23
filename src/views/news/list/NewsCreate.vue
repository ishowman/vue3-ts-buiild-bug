<template>
  <el-form
    ref="formRef"
    v-loading="loading"
    label-position="top"
    :model="formState"
    :rules="formRules"
    class="p-4 comiru-content news-create"
  >
    <template v-if="!props.id">
      <el-form-item
        :label="orgEnabled ? '組織:' : '教室:'"
        required
        prop="schools"
        class="block"
      >
        <el-tree
          v-if="orgEnabled"
          ref="orgTrees"
          :data="orgs"
          show-checkbox
          node-key="id"
          highlight-current
          :props="defaultTreeProps"
          class="p-4 rounded-t-sm w-full"
          style="border: 1px solid #d9d9d9"
          @check-change="schoolChange"
        >
          <template #default="{ node, data }">
            <span v-if="node?.isLeaf && data.count !== undefined"
              >{{ node.label }}（{{ data.count }}人）</span
            >
            <span v-else>{{ node.label }}</span>
          </template>
        </el-tree>
        <el-select-v2
          v-else
          v-model="formState.schools"
          multiple
          filterable
          clearable
          class="w-full"
          :options="schoolOptions"
          placeholder="選択"
          @change="schoolChange"
        />

        <el-checkbox
          v-if="orgEnabled"
          style="border-color: #d9d9d9"
          class="border border-solid border-t-0 w-full px-4 py-1 rounded-b-sm"
          @change="(val) => selectAllSchool(val)"
        >
          すべて選択</el-checkbox
        >
      </el-form-item>
      <el-form-item label="宛先:" required prop="recipient">
        <el-checkbox-group v-model="formState.recipient">
          <el-checkbox label="parent">保護者</el-checkbox>
          <el-checkbox label="sub_student">生徒</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </template>

    <el-form-item label="日付:" required prop="date">
      <el-date-picker
        v-model="formState.date"
        type="date"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <template v-if="!props.id">
      <el-form-item label="学年：" prop="grades">
        <el-select-v2
          v-model="formState.grades"
          class="w-full"
          :options="gradeOptions"
          placeholder="選択"
          filterable
          multiple
          clearable
        ></el-select-v2>
        <p class="text-secondary text-[12px] w-full leading-6">
          空欄のときは全ての生徒に送信されます
        </p>
      </el-form-item>

      <el-form-item label="学校:">
        <el-link
          :underline="false"
          type="primary"
          @click="educationsVisible = true"
        >
          {{ selectedEducations.desc }}
        </el-link>
      </el-form-item>
    </template>

    <template v-if="isUsingSchoolCourse && !props.id">
      <el-form-item label="コースグループ:" prop="course_group_ids">
        <el-select-v2
          v-model="formState.course_group_ids"
          remote
          multiple
          filterable
          clearable
          :remote-method="searchCourseGroups"
          placeholder="選択 "
          :options="couseGroups"
          class="w-full"
          @visible-change="(visible) => visible && searchCourseGroups()"
        />
      </el-form-item>
      <el-form-item label="クラス:" prop="class_ids">
        <el-select-v2
          v-model="formState.class_ids"
          remote
          multiple
          filterable
          clearable
          :remote-method="searchSchoolClass"
          placeholder="選択 "
          :options="classOptions"
          class="w-full"
          @visible-change="(visible) => visible && searchSchoolClass()"
        />
      </el-form-item>
    </template>

    <el-form-item v-if="!props.id" label="グループ:">
      <el-select
        v-model="formState.groups"
        placeholder="選択"
        :options="studentGroups"
        multiple
        filterable
        clearable
        class="w-full"
        value-key="id"
        :collapse-tags="formState.groups?.length > 4"
        collapse-tags-tooltip
      >
        <el-option
          v-for="item in studentGroups"
          :key="item.id"
          :label="item.label"
          :value="item"
        ></el-option>
      </el-select>
      <p class="text-secondary text-[12px] w-full leading-6">
        空欄のときは全ての生徒に送信されます。（先に会社の教室のいずれかを選定した場合だけでグループの選択肢が表示されます）
      </p>
    </el-form-item>

    <el-form-item
      v-if="!props.id"
      label="特定の生徒を対象に追加:"
      prop="special_students"
    >
      <el-select-v2
        v-model="formState.special_students"
        remote
        multiple
        filterable
        clearable
        :remote-method="searchStudentList"
        placeholder="入力特定の生徒を対象に追加"
        :options="studentOptions"
        class="w-full"
        @visible-change="(visible) => visible && searchStudentList()"
      />
      <p class="text-secondary text-[12px] w-full leading-6">
        空欄のときは全ての生徒に送信されます
      </p>
    </el-form-item>

    <el-form-item required label="配信方法:" prop="from_corporation">
      <el-radio-group
        v-model="formState.from_corporation"
        @change="
          (checked) => {
            formState.can_comment = checked;
          }
        "
      >
        <el-radio :label="1">本社から直接配信する</el-radio>
        <el-radio :label="0">教室を通じて配信する </el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="!props.id" label="テンプレート:">
      <el-select
        v-model="selectedTpl"
        placeholder="選択"
        remote
        value-key="id"
        :remote-method="searchNewsTpls"
        filterable
        clearable
        :loading="loadingNewsTemplates"
        class="w-[600px]"
        @visible-change="(visible) => visible && searchNewsTpls()"
      >
        <el-option
          v-for="item in newsTemplates"
          :key="item.id"
          :value="item.value"
          :label="item.label"
        >
          {{ item.label }}
        </el-option>
      </el-select>
      <el-button
        type="primary"
        :disabled="!selectedTpl?.id"
        class="ml-2"
        @click="loadTemplate"
        >確認
      </el-button>
    </el-form-item>

    <el-form-item required label="タイトル:" prop="title" class="w-[668px]">
      <el-input v-model="formState.title" placeholder="入力タイトル" />
    </el-form-item>

    <el-form-item required label="本文:" prop="content">
      <c-editor
        ref="editor"
        class="w-full"
        @change="(content) => (formState.content = content)"
      ></c-editor>
    </el-form-item>

    <el-form-item label="添付ファイル:" prop="files">
      <c-uploader
        ref="uploadRef"
        v-model:file-list="localFiles"
        :limit="3"
        :disabled="localFiles.length >= 3 || remoteFiles.length >= 3"
        :on-change="handleUpload"
      >
        <div
          v-if="remoteFiles?.length"
          class="grid grid-cols-3 gap-2 mt-2 relative p-2.5 border border-solid border-color-gray-400"
        >
          <CUploadPreview
            v-for="file in remoteFiles"
            :key="file.id"
            :file="file"
            mode="card"
          />
          <c-icon-font
            name="icon-recycle"
            :size="ButtonIconHeight.small"
            color="var(--el-color-danger)"
            class="absolute top-0 right-0 cursor-pointer"
            @click="clearRemoteFiles"
          />
        </div>

        <template #buttonText>
          <!-- <el-button type="primary" :disabled="disabled"> -->
          アップロード
          <!-- </el-button> -->
        </template>
      </c-uploader>
    </el-form-item>

    <el-form-item required label="公開有無:" prop="status">
      <el-select-v2
        v-model="formState.status"
        placeholder="入力タイトル"
        :options="newsStatus"
        :disabled="disableStatus"
      />
      <p class="text-secondary text-[12px] w-full leading-6">
        「下書き」を選んだ場合、生徒と保護者には公開も通知もされません。
      </p>
      <el-checkbox
        v-model="formState.is_public"
        class="w-full mt-4"
        :true-label="1"
        :false-label="0"
        >外部公開ページを作成する
      </el-checkbox>
      <el-checkbox
        v-model="formState.can_comment"
        class="w-full mt-4"
        :true-label="0"
        :false-label="1"
        :disabled="formState.from_corporation"
      >
        このお知らせのコメント機能をオフにする
      </el-checkbox>
    </el-form-item>

    <div
      v-if="formState.status === PublishedNews"
      class="flex items-center mb-2"
    >
      <span>予約送信：</span>
      <el-switch
        v-model="formState.scheduled_time_switch"
        active-value="on"
        inactive-value="off"
      />
    </div>

    <el-date-picker
      v-if="formState.scheduled_time_switch === 'on'"
      v-model="formState.email_date"
      type="datetime"
      value-format="YYYY-MM-DD HH:mm"
      format="YYYY-MM-DD HH:mm"
      :disabled-date="(date) => isSelectableDay(date)"
    />

    <p
      v-if="formState.status === PublishedNews"
      class="text-secondary text-[12px] leading-none mt-1.5"
    >
      保護者への請求書公開とプッシュ通知/通知メールの送信時刻を指定することができます。
    </p>
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
      <el-button type="primary" plain @click="previewVisible = true">
        プレビュー
      </el-button>
      <el-button
        type="primary"
        :disabled="!isValidForm"
        :loading="isSumbiting"
        @click="submitForm"
      >
        {{
          formState.status === DraftNews || props.id
            ? '保存'
            : formState.scheduled_time_switch === 'on'
            ? '保存して予約する'
            : '保存して送信する'
        }}
      </el-button>
    </div>
  </el-form>

  <c-dialog
    v-model="educationsVisible"
    title="学校の選択"
    @open="preSelectedEducationIds = [...selectedEducations.ids]"
  >
    <el-checkbox-group v-model="selectedEducations.ids" class="grid">
      <el-checkbox
        v-for="{ id: eduId, name } in schoolEducations"
        :key="eduId"
        :label="eduId"
        >{{ name }}</el-checkbox
      >
    </el-checkbox-group>

    <template #footer>
      <div class="flex justify-between">
        <el-checkbox v-model="isAllChecked" @change="toggleSelectAllEducations">
          すべて選択
        </el-checkbox>
        <div>
          <el-button plain @click="closeEducationsModal"> リセット </el-button>
          <el-button type="primary" @click="educationsVisible = false">
            確認
          </el-button>
        </div>
      </div>
    </template>
  </c-dialog>

  <c-dialog v-model="previewVisible" title="プレビュー画面">
    <div class="detail-card p-4">
      <h3
        v-dompurify-html="formState.title"
        class="border-l-4 border-r-0 border-y-0 border-[#16BFB7] border-solid text-[18px] py-0.5 font-normal pl-1"
      />
      <p class="flex justify-end items-center">
        <span class="mr-4">日付：{{ formState.date }}</span>
        from：
        <el-avatar
          :src="previewUser.avatar"
          :alt="previewUser.name"
          class="my-0 mx-1"
          :size="24"
        />
        <span> {{ previewUser.name }}</span>
      </p>
      <p
        v-dompurify-html="formState.content"
        class="news-content mt-2 fr-view"
      />
    </div>
    <template v-if="uploadRef.getFileInfo().files?.length">
      <p class="mt-4 mb-2">添付ファイル:</p>
      <div v-for="file in uploadRef.getFileInfo().files" :key="file.raw.uid">
        <a
          type="primary"
          :underline="false"
          class="mb-2"
          :href="file.url"
          target="_blank"
          rel="noreferrer"
        >
          {{ file.name }}
        </a>
      </div>
    </template>

    <template v-if="formState.surveys?.length">
      <p class="mt-4 mb-2">アンケート:</p>

      <el-form
        v-for="(survey, i) in formState.surveys"
        :key="`preview${i}`"
        class="detail-card w-full relative p-4 mb-2"
        label-position="top"
      >
        <el-form-item :required="survey.is_required">
          <template #label>
            <b class="inline">質問 {{ i + 1 }}</b>
          </template>
          <p class="leading-6">{{ survey.text }}</p>
        </el-form-item>

        <el-form-item v-if="survey.type === newsTypes.choice">
          <template #label>
            <b class="inline">回答</b>
          </template>
          <p v-if="survey.is_multiple" class="w-full text-danger text-[12px]">
            （複数選択可）
          </p>
          <template
            v-for="(answer, key) in survey.answers"
            :key="`answer${key}`"
          >
            <div class="flex mb-2 w-full items-center">
              <el-checkbox disabled />
              <span class="text-right ml-1">
                {{ key + 1 }}.{{ answer.text }}</span
              >
            </div>
          </template>
          <el-link :underline="false" type="primary" style="font-size: 12px"
            >未選択に戻す</el-link
          >
        </el-form-item>

        <template
          v-if="[newsTypes.month, newsTypes.date].includes(survey.type)"
        >
          <p class="mb-4">
            回答形式：{{ survey.type === newsTypes.month ? '月' : '日付' }}
          </p>
          <p class="mb-4">
            選択可能期間:
            {{
              survey.is_using_selectable_period && survey?.period?.length
                ? survey.period.join('~')
                : '指定なし'
            }}
          </p>
          <p class="mb-4">回答可能数: ：{{ survey.available_answer_count }}</p>
        </template>

        <el-form-item v-if="survey.use_text" label="記述欄:">
          <el-input type="textarea" disabled />
        </el-form-item>
      </el-form>
    </template>

    <el-checkbox
      v-model="formState.scheduled_time_switch"
      true-label="on"
      false-label="off"
      class="mt-4 mb-2 w-full block"
      @change="
        (checked) => {
          formState.status = checked ? PublishedNews : DraftNews;
          formState.email_date = [];
        }
      "
    >
      予約送信
    </el-checkbox>
    <el-date-picker
      v-if="formState.scheduled_time_switch === 'on'"
      v-model="formState.email_date"
      type="datetime"
      value-format="YYYY-MM-DD HH:mm"
      format="YYYY-MM-DD HH:mm"
      :disabled-date="(date) => isSelectableDay(date)"
    />

    <template #footer>
      <el-button type="primary" plain @click="previewVisible = false"
        >編集に戻る</el-button
      >
      <el-button type="primary" @click="submitForm"> 送信する </el-button>
    </template>
  </c-dialog>
</template>

<script lang="ts" setup>
  import dayjs from 'dayjs';
  import {
    GradesMap,
    MaxPageSize,
    ButtonIconHeight,
    newsTypes,
  } from '@/constants';
  import {
    getSchoolAreas,
    getSchoolCourseGroups,
    getStudentSchoolGroups,
    getNewsTemplates,
    saveNewsData,
    getSchoolEducations,
    searchStudents,
    getClassByCorporation,
    getNewsInfo,
    delNewsSurveys,
    editNewsData,
  } from '@/services';
  import { computed, nextTick, reactive, ref, watch } from 'vue';
  import { getSurveyByType, typedConfirm, validateSurveys } from '@/utils';
  import type { FormRules } from 'element-plus';
  import CEditor from '@/components/CEditor.vue';
  import CUploader from '@/components/CUploader.vue';
  import NewsSurveyConfig from '@/components/CSurveyConfig.vue';
  import { useRouter } from 'vue-router';
  import { defaultAvatar } from '@/assets';
  import { userStore } from '@/store';
  import CUploadPreview from '@/components/CUploadPreview.vue';

  const remoteFiles = ref<any[]>([]);
  const localFiles = ref<any[]>([]);

  interface IProps {
    id?: string;
  }
  const props = withDefaults(defineProps<IProps>(), {
    id: '',
  });

  const router = useRouter();
  const DraftNews = 'draft';
  const PublishedNews = 'published';
  const editor = ref();
  const initalFormState = {
    schools: [],
    groups: [],
    grades: [],
    from_corporation: 0,
    is_public: 0,
    can_comment: 1,
    scheduled_time_switch: 'off',
    status: DraftNews,
    surveys: [],
    course_group_ids: [],
    special_students: [],
    class_ids: [],
    date: '',
  };
  const formState = ref<Record<string, any>>({ ...initalFormState });
  const formRules = reactive<FormRules>({
    schools: [{ required: true, message: '組織/教室を選択してください' }],
    recipient: [{ required: true, message: '宛先を選択してください' }],
    date: [{ required: true, message: '日付を入力してください' }],

    from_corporation: [
      { required: true, message: '配信方法を選択してください' },
    ],

    content: [{ required: true, message: '本文を入力してください' }],

    status: [{ required: true, message: '公開有無を選択してください' }],

    title: [{ required: true, message: 'タイトルを入力してください' }],
  });

  const orgEnabled = ref(false);
  const loading = ref(true);
  const previewVisible = ref(false);
  const isUsingSchoolCourse = ref(false);
  const defaultTreeProps = {
    children: 'areas',
    label: 'name',
    class: customNodeClass,
  };
  const orgs = ref<any>([]);
  const schoolOptions = ref<any>([]);
  const educationsVisible = ref(false);
  const disableStatus = ref(false);

  const previewUser = computed(() => {
    return formState.value.from_corporation
      ? {
          avatar: defaultAvatar,
          name: '本部',
        }
      : { avatar: userStore.gAvatar, name: userStore.name };
  });

  const gradeOptions = reactive<{ value: number; label: string }[]>([]);
  GradesMap.forEach((label, value) => {
    gradeOptions.push({ value, label });
  });

  const newsStatus = [
    {
      label: '下書き',
      value: DraftNews,
    },
    {
      label: '公開',
      value: PublishedNews,
    },
  ];

  const orgTrees = ref();
  const isAllChecked = computed(
    () => selectedEducations.ids.length === schoolEducations.value.length
  );

  init();

  async function init() {
    try {
      loading.value = true;
      if (props.id) {
        await getNewsData();
      }

      const arr = [searchStudentGroups(), searchCourseGroups()];
      if (!props.id) {
        arr.concat([getAreaList(), initSelectedEducations()]);
      }

      await Promise.allSettled(arr);
      watch(formState, checkFormValid, { deep: true });
    } finally {
      loading.value = false;
    }
  }

  function customNodeClass(data) {
    return data.class;
  }

  const couseGroups = ref([]);
  async function searchCourseGroups(keyword = '') {
    const { is_using_school_course, items } = await getSchoolCourseGroups({
      ...(keyword ? { keyword } : {}),
      pagesize: MaxPageSize,
    });
    isUsingSchoolCourse.value = is_using_school_course;
    couseGroups.value = items.map(({ id, name }) => {
      return {
        label: ` ${name}`,
        value: id,
      };
    });
  }

  const studentOptions = ref([]);
  async function searchStudentList(keyword = '') {
    const { items } = await searchStudents({
      ...(keyword ? { keyword } : {}),
      pagesize: MaxPageSize,
      with_school: 1,
    });
    studentOptions.value = items.map(({ id, name, student_no, schools }) => {
      return {
        label: `${student_no} | ${name}(${schools.name})`,
        value: id,
      };
    });
  }

  let allSchoolIds: number[] = [];

  function formatAreas(areas) {
    return areas.map((area) => {
      const onlySchools =
        area?.schools?.length && (!area.areas || area?.areas?.length === 0);
      if (onlySchools) {
        area.class = 'only-schools';
      }
      if (!area.schools && !area.areas) {
        allSchoolIds.push(area.id);
      }
      if (area?.schools?.length) {
        if (!area.areas) {
          area.areas = [];
        }
        area.areas = area.schools.concat(area.areas);
        allSchoolIds = allSchoolIds.concat(area.schools.map(({ id }) => id));
      }
      if (area?.areas?.length) {
        area.areas = formatAreas(area.areas);
      }

      return area;
    });
  }

  async function getAreaList() {
    const { area_enable, areas, no_areas, schools } = await getSchoolAreas();
    orgEnabled.value = area_enable;
    if (area_enable) {
      if (areas.areas) {
        areas.areas = formatAreas(areas.areas);
        no_areas.areas = formatAreas(no_areas.schools);
        no_areas.class = 'only-schools';
      }

      orgs.value = [areas, no_areas];

      console.log('newAreas value', areas);
    } else {
      schoolOptions.value = schools.map(({ id, name }) => ({
        value: id,
        label: name,
      }));
    }
  }

  const fullStudentGroups = ref<
    { value: any; label: string; schoolId: number; id: number }[]
  >([]);

  const studentGroups = ref<
    { value: any; label: string; schoolId: number; id: number }[]
  >([]);
  async function searchStudentGroups() {
    const { items } = await getStudentSchoolGroups();

    const options = items.map((item) => {
      const { full_name, id, school_id } = item;
      return {
        label: full_name,
        value: item,
        schoolId: school_id,
        id,
      };
    });

    fullStudentGroups.value = options;
  }

  const newsTemplates = ref<any[]>([]);
  const loadingNewsTemplates = ref(false);
  const selectedTpl = ref<any>({});
  async function searchNewsTpls(keyword = '') {
    keyword = keyword?.trim();

    try {
      loadingNewsTemplates.value = true;

      const { items } = await getNewsTemplates({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });

      newsTemplates.value = items.map((item) => {
        const { news, id } = item;
        return {
          value: item,
          label: `${id} | ${news.title}`,
          id,
        };
      });
    } finally {
      loadingNewsTemplates.value = false;
    }
  }

  const uploadRef = ref();
  const formRef = ref();
  const isValidForm = ref(true);
  const hasDeleteFile = ref(false);

  async function checkFormValid() {
    await formRef.value?.validate(async (isValid) => {
      console.log('isValid', isValid);
      isValidForm.value = isValid;
      return Promise.resolve(isValid);
    });
  }

  async function isFormInvalid() {
    if (previewVisible.value) {
      if (!props.id && !formState.value.schools?.length) {
        ElMessage.error('組織/教室を選択してください');
        return true;
      }

      if (!props.id && !formState.value.recipient) {
        ElMessage.error('宛先を選択してください');
        return true;
      }

      if (!formState.value.date) {
        ElMessage.error('日付を入力してください');
        return true;
      }

      if (!formState.value.title) {
        ElMessage.error('タイトルを入力してください');
        return true;
      }

      if (!formState.value.content) {
        ElMessage.error('本文を入力してください');
        return true;
      }
    }

    if (
      formState.value.scheduled_time_switch === 'on' &&
      !formState.value.email_date
    ) {
      ElMessage.error('予約送信日時を選択してください');
      return true;
    }
    if (
      formState.value.scheduled_time_switch === 'on' &&
      new Date(formState.value.email_date).getTime() <= Date.now()
    ) {
      ElMessage.error('予約送信日時をご確認ください');
      return true;
    }

    if (formState.value?.surveys?.length) {
      const { areValidSurveys, errMsg } = validateSurveys(
        formState.value.surveys
      );

      if (!areValidSurveys) {
        ElMessage.error(errMsg);
        return true;
      }
    }

    const { totalSize } = uploadRef.value.getFileInfo();
    if (totalSize > 8 * 1024 * 1024) {
      ElMessage.warning('添付ファイルの容量の上限を超えています');
      return true;
    }

    const isValid = await checkFormValid();
    console.log('isValidForm', isValid, isValidForm.value);
    return !isValidForm.value;
  }

  const isSumbiting = ref(false);
  async function submitForm() {
    ElMessage.closeAll();

    const {
      date,
      from_corporation,
      title,
      content,
      status,
      scheduled_time_switch,
      email_date,
      is_public,
      can_comment,
      survey_expires_at,
      surveys,

      schools,
      recipient,
      grades,
      course_group_ids,
      groups,
      special_students,
    } = formState.value;

    try {
      isSumbiting.value = true;
      const isInvalid = await isFormInvalid();
      if (isInvalid) {
        return;
      }
      const formParams = new FormData();

      const { files } = uploadRef.value.getFileInfo();

      for (const file of files) {
        formParams.append('files[]', file.raw);
      }

      let params: Record<string, any> = {
        date,
        title,
        content,
        from_corporation,

        status,
        scheduled_time_switch,
        is_public,
        can_comment,
      };

      if (scheduled_time_switch === 'on' && email_date) {
        params.email_date = email_date;
      }

      if (survey_expires_at) {
        params.survey_expires_at =
          dayjs(survey_expires_at).format('YYYY-MM-DD');
      }

      if (surveys?.length) {
        params.surveys_json = JSON.stringify(
          formState.value.surveys.map((item) => {
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
          })
        );
      }

      if (!props.id) {
        params = {
          ...params,
          schools: schools.join(),
          recipient: recipient.join(),
          educations: selectedEducations.ids.join(),
          grades: grades.join(),
          special_students: special_students.join(),
        };
        if (groups?.length) {
          params.groups = groups.map((item) => item.id).join();
        }
        if (isUsingSchoolCourse.value) {
          params.course_group_ids = course_group_ids.join();
        }
      }

      const items = Object.entries(params);
      for (const [key, value] of items) {
        formParams.append(key, value);
      }
      if (props.id) {
        formParams.append('id', props.id);
        formParams.append('delete_file', hasDeleteFile.value ? '1' : '0');
        await editNewsData(formParams);
      } else {
        await saveNewsData(formParams);
      }

      const tips = disableStatus.value
        ? 'お知らせを保存しました'
        : status === DraftNews
        ? 'お知らせを下書きとして保存しました'
        : scheduled_time_switch === 'on'
        ? '予約送信を受け付けました'
        : 'お知らせを送信しました';
      await ElMessage.success(tips);

      router.push({
        name: 'NewsList',
      });
    } catch (err) {
      console.error('catch err', err);

      const tips =
        status === DraftNews
          ? '保存に失敗しました'
          : scheduled_time_switch === 'on'
          ? '予約送信に失敗しました'
          : '送信に失敗しました';
      ElMessage.error(tips);
    } finally {
      isSumbiting.value = false;
    }
  }

  const classOptions = ref([]);

  async function searchSchoolClass(keyword = '') {
    const { items } = await getClassByCorporation({
      ...(keyword ? { keyword } : {}),
      pagesize: MaxPageSize,
    });
    classOptions.value = items.map(({ id, name }) => {
      return {
        value: id,
        label: name,
      };
    });
  }

  const schoolEducations = ref([]);

  const defaultEducation = {
    ids: [],
    desc: '未選択',
  };
  const selectedEducations = reactive<{
    ids: any[];
    desc: string;
  }>({ ...defaultEducation });
  const preSelectedEducationIds = ref<string[]>([]);

  async function initSelectedEducations() {
    const { items } = await getSchoolEducations();
    schoolEducations.value = items;
  }

  async function toggleSelectAllEducations(isChecked) {
    if (!isChecked) {
      selectedEducations.ids = [];
      return;
    }
    selectedEducations.ids = schoolEducations.value.map(({ id }) => id);
  }

  async function closeEducationsModal() {
    selectedEducations.ids = [...preSelectedEducationIds.value];
  }

  watch(educationsVisible, (newVal) => {
    if (newVal === false) {
      selectedEducations.desc =
        selectedEducations.ids.length === 0
          ? '未選択'
          : `${selectedEducations.ids.length}件学校選択済み`;
    }
  });

  async function resetForm() {
    localFiles.value = [];

    if (!props.id) {
      formState.value = { ...initalFormState };
      toggleSelectAllEducations(true);
      orgTrees.value.setCheckedKeys([]);

      selectedEducations.desc = defaultEducation.desc;
      selectedEducations.ids = defaultEducation.ids;
      formState.value.surveys = [];
      editor.value.setHtml('');
      return;
    }

    try {
      loading.value = true;

      await getNewsData();
    } finally {
      loading.value = false;
    }
  }

  function addSurvey() {
    const survey = getSurveyByType(newsTypes.choice, !!props.id);
    formState.value.surveys.push(survey);
  }

  async function loadTemplate() {
    if (!selectedTpl.value || (selectedTpl.value && !selectedTpl.value.news)) {
      return;
    }
    try {
      await typedConfirm({
        title: 'テンプレートを適用して間違いありませんか？',
        content: selectedTpl.value.news.title,
      });
      const {
        title,
        content,
        surveys = [],
        survey_expires_at,
      } = selectedTpl.value.news;
      formState.value.title = title;
      formState.value.content = content;
      if (survey_expires_at) {
        formState.value.survey_expires_at =
          dayjs(survey_expires_at).format('YYYY-MM-DD');
      }
      formState.value.surveys = surveys.map(
        ({
          text,
          is_required,
          type,
          answers,
          is_using_selectable_period,
          available_answer_count,
          selectable_date_start,
          selectable_date_end,
          is_multiple,
          use_text,
        }) => {
          const data = {
            text,
            is_required,
            type,
            answers,
            is_using_selectable_period,
            available_answer_count,
            is_multiple,
            use_text,
          };

          function fixedWrongDateFormat(type, date, splitor = '-') {
            const dateArr = date.split();
            if (dateArr?.length && dateArr.length > 1) {
              const [y, m, d] = date.split(splitor);
              return type === 'month' ? `${y}-${m}` : `${y}-${m}-${d}`;
            }
            return date;
          }

          if (selectable_date_start && selectable_date_end) {
            data['period'] = [
              fixedWrongDateFormat(type, selectable_date_start),
              fixedWrongDateFormat(type, selectable_date_end),
            ];
          }
          return data;
        }
      );

      editor.value.setHtml(content);
    } catch (err) {
      console.error('error', err);
    }
  }

  function selectAllSchool(val) {
    if (val) {
      orgTrees.value.setCheckedKeys(orgs.value.map((item) => item.id));
    } else {
      orgTrees.value.setCheckedKeys([]);
    }
  }

  function schoolChange() {
    const checkedIds = orgEnabled.value
      ? orgTrees.value
          .getCheckedKeys(false)
          .filter((item) => allSchoolIds.includes(item))
      : formState.value.schools;
    if (orgEnabled.value) {
      formState.value.schools = checkedIds;
    }
    studentGroups.value = fullStudentGroups.value.filter((item) => {
      return checkedIds.includes(item.schoolId);
    });
    formState.value.groups = formState.value.groups.filter((item) => {
      return checkedIds.includes(item.schoolId);
    });
  }

  async function removeSurvey({ index, id }) {
    try {
      if (id && id !== 'null') {
        await typedConfirm({
          title: '本当に削除しますか？',
          content: '',
        });
        await delNewsSurveys({ news_id: props.id, survey_id: id });
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

  function handleUpload(file) {
    console.error('handleUpload', file);
    remoteFiles.value = [];
  }

  async function getNewsData() {
    const id = props.id;

    const { news, surveys } = await getNewsInfo({ id });
    const {
      title,
      content,
      status,
      can_comment,
      attachments,
      from_corporation,
      date,
      is_public,
      survey_expires_at,
    } = news;

    disableStatus.value = status === PublishedNews;

    const data = {
      ...initalFormState,
      title,
      content,
      status,
      can_comment: +can_comment,
      from_corporation: +from_corporation,
      ...(surveys?.length ? { surveys } : {}),
      date: dayjs(date).format('YYYY-MM-DD'),
      is_public: +is_public,
      survey_expires_at,
    };

    formState.value = {
      ...data,
    };
    if (attachments) {
      remoteFiles.value = attachments;
    }
    nextTick(() => {
      editor.value.setHtml(content);
    });
  }

  function clearRemoteFiles() {
    hasDeleteFile.value = true;
    remoteFiles.value = [];
  }

  function isSelectableDay(date: number) {
    return date < Date.now() - 24 * 60 * 60 * 1000;
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
<style>
  .el-tree-node.only-schools > .el-tree-node__children {
    display: flex;
    flex-direction: row;
  }
</style>
