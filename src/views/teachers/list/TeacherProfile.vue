<template>
  <el-form
    ref="formRef"
    label-position="top"
    :model="teacherForm"
    :rules="validateRules"
    class="pb-16 teacher-profile"
  >
    <el-card v-loading="loading" class="mb-4">
      <h2 class="text-[16px] font-bold mb-4">一般設定</h2>
      <el-form-item label="ID: ">
        <el-input v-model="teacherForm.id" disabled></el-input>
      </el-form-item>

      <div class="grid grid-cols-3 gap-x-6">
        <el-form-item label="氏: " prop="first_name" required>
          <el-input
            v-model="teacherForm.first_name"
            placeholder="入力 氏"
          ></el-input>
        </el-form-item>

        <el-form-item label="名: " prop="last_name" required>
          <el-input
            v-model="teacherForm.last_name"
            placeholder="入力 名"
          ></el-input>
        </el-form-item>

        <el-form-item label="名前" required prop="name">
          <el-input
            v-model="teacherForm.name"
            placeholder="入力 名前"
          ></el-input>
        </el-form-item>

        <el-form-item label="氏（フリガナ）: " prop="first_name_kana" required>
          <el-input
            v-model="teacherForm.first_name_kana"
            placeholder="入力 氏（フリガナ）"
          ></el-input>
        </el-form-item>

        <el-form-item label="名（フリガナ）: " prop="last_name_kana" required>
          <el-input
            v-model="teacherForm.last_name_kana"
            placeholder="入力 名（フリガナ）"
          ></el-input>
        </el-form-item>

        <el-form-item label="フリガナ: " prop="name_kana" required>
          <el-input
            v-model="teacherForm.name_kana"
            placeholder="入力 フリガナ"
          ></el-input>
        </el-form-item>
      </div>

      <el-form-item label="メールアドレス: " prop="email">
        <el-input v-model="teacherForm.email" disabled></el-input>
      </el-form-item>

      <el-form-item label="講師ステータス: ">
        <c-component
          v-for="component in statusRender([teacherForm.status]).components"
          :key="component.uniqKey"
          v-bind="component"
        ></c-component>
      </el-form-item>
      <el-form-item label="性别: " prop="sex" required>
        <el-select
          v-model="teacherForm.sex"
          class="w-full"
          :options="SexOptions"
          placeholder="性别"
        >
          <template v-for="item in SexOptions" :key="item.value">
            <el-option :label="item.label" :value="item.value"></el-option>
          </template>
        </el-select>
      </el-form-item>

      <el-form-item label="電話番号: " prop="tel">
        <c-input-number v-model="teacherForm.tel" placeholder="入力 電話番号" />
      </el-form-item>

      <el-form-item label="郵便番号(7桁): " prop="zip">
        <c-input-number
          v-model="teacherForm.zip"
          placeholder="入力 郵便番号(7桁)"
          :maxlength="7"
          @input="zipChanged"
        />
      </el-form-item>

      <el-form-item label="都道府県: " prop="prefecture">
        <el-input
          v-model="teacherForm.prefecture"
          :maxlength="255"
          placeholder="入力 都道府県"
        />
      </el-form-item>

      <div class="grid grid-cols-2 gap-6">
        <el-form-item label="住所: " prop="address">
          <el-input
            v-model="teacherForm.address"
            :maxlength="255"
            placeholder="入力住所"
          />
        </el-form-item>
        <el-form-item label="住所2: " prop="address2">
          <el-input
            v-model="teacherForm.address2"
            placeholder="入力住所2"
            :maxlength="255"
          ></el-input>
        </el-form-item>
      </div>

      <el-form-item label="生年月日: " prop="birthday">
        <el-date-picker
          v-model="teacherForm.birthday"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="入力 生年月日"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="学年: " prop="grade">
        <el-select
          v-model="teacherForm.grade"
          class="w-full"
          placeholder="学年"
        >
          <template v-for="item in gradeOptions" :key="item.value">
            <el-option :label="item.label" :value="item.value"></el-option>
          </template>
        </el-select>
      </el-form-item>

      <el-form-item label="講師ランク: " prop="rank">
        <el-input
          v-model="teacherForm.rank"
          placeholder="入力 講師ランク"
          :maxlength="30"
        />
      </el-form-item>

      <el-form-item label="教室: " prop="schools">
        <el-select
          v-model="teacherForm.schools"
          class="w-full"
          placeholder="入力 教室"
          multiple
          filterable
          remote
          :remote-method="searchCorporationSchool"
          :loading="loadingCorporationSchool"
        >
          <el-option
            v-for="item in corporationSchoolOptions"
            :key="item.id"
            :value="item.id"
            :label="item.label"
            >{{ item.label }}</el-option
          >
        </el-select>
        <p class="text-secondary text-xs mt-1">
          既にオーナー権限で所属している教室はここでは選択／削除できません
        </p>
      </el-form-item>

      <el-form-item label="ヘルプ登録可能教室: " prop="helpable_schools">
        <el-select
          v-model="teacherForm.helpable_schools"
          class="w-full"
          placeholder="入力 ヘルプ登録可能教室"
          multiple
          filterable
          remote
          :remote-method="searchHelpableSchools"
          :loading="loadingHelpableSchool"
        >
          <el-option
            v-for="item in helpableSchoolOptions"
            :key="item.id"
            :value="item.id"
            :label="item.label"
            >{{ item.label }}</el-option
          >
        </el-select>
      </el-form-item>
    </el-card>

    <el-card v-if="showPrivacy" class="mb-4">
      <h2 class="text-[16px] font-bold mb-4">講師権限</h2>
      <el-form-item label="権限: "> </el-form-item>
    </el-card>

    <el-card
      v-for="(detail, index) in teacherForm.details"
      :key="detail.key"
      class="mb-4"
    >
      <h2 class="text-[16px] font-bold mb-4">
        講師詳細情報

        <c-icon-font
          name="icon-recycle"
          height="12px"
          color="var(--el-color-danger)"
          @click.prevent="removeDetail(index)"
        />
      </h2>

      <div class="grid grid-cols-2 gap-6">
        <el-form-item
          label="緊急連絡先: "
          :prop="`details.${index}.emergency_contact_tel`"
        >
          <c-input-number
            v-model="detail.emergency_contact_tel"
            :maxlength="255"
            placeholder="入力緊急連絡先"
          />
        </el-form-item>
        <el-form-item
          label="緊急連絡先名: "
          :prop="`details.${index}.emergency_contact_name`"
        >
          <el-input
            v-model="detail.emergency_contact_name"
            :maxlength="255"
            placeholder="入力緊急連絡先名"
          ></el-input>
        </el-form-item>
      </div>

      <el-form-item label="教室名: " :prop="`details.${index}.school_id'`">
        <el-select
          v-model="detail.school_id"
          class="w-full"
          placeholder="入力 教室"
          filterable
          clearable
          remote
          :remote-method="
            (keyword) => searchCorporationSchoolId(detail.key, keyword)
          "
          :loading="loadingCorporationSchool"
          :disabled="detail.id && !!detail.school_id"
        >
          <el-option
            v-for="item in corporationSchoolIdOptions[detail.key]"
            :key="item.id"
            :value="item.id"
            :label="item.label"
            :disabled="isDisabledSchool(index, item.id)"
          >
            {{ item.label }}
          </el-option>
        </el-select>
      </el-form-item>

      <div class="grid grid-cols-3 gap-x-6">
        <el-form-item label="学校: " :prop="`details.${index}.education_id`">
          <el-select
            v-model="detail.education_id"
            class="w-full"
            placeholder="入力 学校"
            filterable
            clearable
            remote
            :remote-method="(keyword) => searchEducation(detail.key, keyword)"
            :loading="loadingEducation"
            @change="searchDepartments(detail.key, detail.education_id)"
          >
            <el-option
              v-for="item in educationOptions[detail.key]"
              :key="item.id"
              :value="item.id"
              :label="item.label"
              >{{ item.label }}</el-option
            >
          </el-select>
        </el-form-item>
        <el-form-item
          label="学部: "
          :prop="`details.${index}.education_department_id`"
        >
          <el-select
            v-model="detail.education_department_id"
            class="w-full"
            placeholder="入力 学部"
            filterable
            clearable
            remote
            :remote-method="
              (keyword) =>
                searchDepartments(detail.key, detail.education_id, keyword)
            "
            :loading="loadingDepartment"
          >
            <el-option
              v-for="item in departmentOptions[detail.key]"
              :key="item.id"
              :value="item.id"
              :label="item.label"
              >{{ item.label }}</el-option
            >
          </el-select>
        </el-form-item>

        <el-form-item
          label="紹介者: "
          :prop="'details.' + index + '.introducer'"
        >
          <el-input
            v-model="detail.introducer"
            :maxlength="255"
            placeholder="入力 紹介者"
          />
        </el-form-item>
      </div>

      <el-form-item
        label="授業開始日: "
        :prop="'details.' + index + '.start_day'"
      >
        <el-date-picker
          v-model="detail.start_day"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="入力 授業開始日"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="メモ: " :prop="'details.' + index + '.note'">
        <el-input
          v-model="detail.note"
          :maxlength="255"
          placeholder="入力 メモ"
        />
      </el-form-item>

      <el-form-item label="添付ファイル: ">
        <el-upload
          :ref="
            (el) => {
              if (el) uploadRefs[detail.school_id] = el;
            }
          "
          list-type="picture"
          :auto-upload="false"
          multiple
          class="w-[400px]"
          :data="{
            teacher_id: route.params?.id,
            school_id: detail.school_id,
          }"
          :http-request="uploadFiles"
          :disabled="
            (detail.attrachments?.length || 0) +
              (uploadFileList[detail.school_id]?.length || 0) >=
              maxFileCount || !detail.school_id
          "
          :on-change="
            (uploadFile, uploadFiles) =>
              fileChanged(detail.school_id, uploadFile, uploadFiles)
          "
          :limit="maxFileCount - (detail.attrachments?.length || 0)"
          :on-exceed="handleExceed"
        >
          <template #trigger>
            <el-button
              type="primary"
              :disabled="
                (detail.attrachments?.length || 0) +
                  (uploadFileList[detail.school_id]?.length || 0) >=
                  maxFileCount || !detail.school_id
              "
            >
              <c-icon-font
                name="icon-Upload"
                color="var(--el-color-white)"
                height="18px"
                width="18px"
                class="pr-1"
              />
              アップロード
            </el-button>
          </template>
          <div
            v-for="(file, j) in detail.attrachments"
            :key="file.id"
            class="upload-file grid p-2 items-center w-[400px] mt-2.5 gap-2 text-left"
          >
            <template v-if="isImage(file.file_mime)">
              <img :src="file.file_url" :alt="file.file_name" width="48" />
            </template>
            <template v-else>
              <c-icon-font name="icon-csv" height="24px" width="100%" />
            </template>
            <a :href="file.file_url" target="_blank" rel="noopener noreferrer">
              {{ file.file_name }}
            </a>

            <c-icon-font
              name="icon-recycle"
              height="12px"
              @click="
                removeFile(
                  {
                    teacher_attachment_id: file.id,
                    school_id: detail.school_id,
                  },
                  detail.attrachments,
                  j
                )
              "
            />
          </div>

          <template #file="{ file }">
            <div
              :key="file.uid"
              class="upload-file grid items-center p-2 gap-2"
            >
              <template v-if="isImage(file.raw.type)">
                <img
                  :src="file.response ? file.response.file_url : file.url"
                  :alt="file.name"
                  width="48"
                />
              </template>
              <template v-else>
                <c-icon-font name="icon-csv" height="24px" width="100%" />
              </template>

              <a
                :href="file.response ? file.response.file_url : file.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ file.name }}
              </a>

              <c-icon-font
                name="icon-recycle"
                height="12px"
                @click="removeLocalFile(file, detail.school_id)"
              />
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-card>

    <el-button
      v-show="maxDetail > teacherForm.details?.length"
      class="block w-full button-dashed"
      plain
      @click="addDetail"
    >
      <c-icon-font name="icon-add" height="12px" />講師詳細情報
    </el-button>
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
        >保存</el-button
      >
    </div>
  </el-form>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, watch, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { nanoid } from 'nanoid';

  import {
    setTeacherInfo,
    getTeacherInfo,
    getCorporationSchools,
    getEducationsList,
    getEducationsDepartments,
    addAttachments,
    delAttachments,
  } from '@/services';
  import {
    getAddressByZip,
    isImage,
    selectorOptions,
    type IOption,
    patchOptions,
  } from '@/utils';
  import CComponent from '@/components/CComponent.vue';

  import CInputNumber from '@/components/CInputNumber.vue';
  import {
    GradesMap,
    SexTranslations,
    MaxPageSize,
    maxFileSize,
  } from '@/constants';
  import { statusRender } from './teacherFieldRender';
  import CIconFont from '@/components/CIconFont.vue';
  const showPrivacy = ref(false);
  const route = useRoute();
  const router = useRouter();
  const isValidForm = ref(false);
  let initedTeacherForm = {};
  const teacherForm = ref<Record<string, any>>(initedTeacherForm);
  const validateRules = reactive({
    zip: [{ validator: zipValidator, trigger: 'blur' }],
  });

  function zipValidator(_, value: string, callback) {
    if (value && value.length !== 7) {
      callback(new Error('郵便番号は、7文字にしてください'));
    } else {
      callback();
    }
  }
  const formRef = ref<InstanceType<typeof ElForm>>();

  const uploadRefs = ref<{
    [key: string]: any;
  }>({});
  const submitUpload = async () => {
    Object.values(uploadRefs.value).map((el) => el.submit());
  };

  const maxDetail = ref(0);
  const isSumbiting = ref(false);

  interface ISelectOptions<K> {
    label: string;
    value: K;
  }

  const gradeOptions: ISelectOptions<number>[] = [];
  for (const [value, label] of GradesMap) {
    gradeOptions.push({
      value,
      label,
    });
  }

  const maxFileCount = 15;
  const uploadFileList = ref({});

  let defaultSchools: IOption[] = [];
  let defaultHelpableSchools: IOption[] = [];

  onMounted(async () => {
    searchCorporationSchool();
    searchHelpableSchools();

    await initForm();
    watch(teacherForm, checkFormValid, { deep: true });
  });

  watch(
    () => [
      teacherForm.value.first_name,
      teacherForm.value.last_name,
      teacherForm.value.first_name_kana,
      teacherForm.value.last_name_kana,
    ],
    (
      [first_name, last_name, first_name_kana, last_name_kana],
      [pre_first_name, pre_last_name, pre_first_name_kana, pre_last_name_kana]
    ) => {
      const firstTimeChanged = [
        pre_first_name,
        pre_last_name,
        pre_first_name_kana,
        pre_last_name_kana,
      ].every((item) => item === undefined);
      if (firstTimeChanged || isReseting) {
        return;
      }
      if (first_name !== pre_first_name || last_name !== pre_last_name) {
        teacherForm.value.name = first_name + last_name;
      }
      if (
        first_name_kana !== pre_first_name_kana ||
        last_name_kana !== pre_last_name_kana
      ) {
        teacherForm.value.name_kana = first_name_kana + last_name_kana;
      }
    }
  );

  const loading = ref(false);

  async function initForm() {
    const { id } = route.params;
    try {
      // id 获取数据
      loading.value = true;
      const data = await getTeacherInfo(+id);
      console.log('student_data', data);

      // 初始化 formModel
      if (data) {
        const {
          id,
          first_name,
          last_name,
          name,
          first_name_kana,
          last_name_kana,
          name_kana,
          email,
          status,
          sex,
          tel,
          zip,
          prefecture,
          address,
          address2,
          birthday,
          grade,
          rank,
          schools = [],
          helpable_schools = [],
          details = [],
        } = data;
        teacherForm.value = {
          id,
          first_name,
          last_name,
          name,
          first_name_kana,
          last_name_kana,
          name_kana,
          email,
          status,

          sex,

          tel,
          zip,
          prefecture,
          address,
          address2,
          birthday,
          grade,
          rank,
          schools: schools.map((item) => item.id),
          helpable_schools: helpable_schools.map((item) => item.id),

          details: details.map((item) => {
            const {
              id,
              school_id,
              emergency_contact_tel,
              emergency_contact_name,
              note,
              education_id,
              education_department_id,
              introducer,
              start_day,
              attrachments,
              department,
              education,
              school,
            } = item;
            const key = nanoid();
            defaultDepartments[key] = department || {};
            defaultEducationOptions[key] = education || {};
            defaultCorporationSchoolIds[key] = school || {};
            searchDepartments(key, education_id);
            searchCorporationSchoolId(key);
            searchEducation(key);
            uploadFileList.value[school_id] = [];

            return {
              id,
              school_id,
              emergency_contact_tel,
              emergency_contact_name,
              note,
              education_id,
              education_department_id,
              introducer,
              start_day,
              attrachments,
              key,
            };
          }),
        };
        initedTeacherForm = JSON.parse(JSON.stringify(teacherForm.value));

        defaultSchools = schools;
        defaultHelpableSchools = helpable_schools;
      }
      nextTick(checkFormValid);
    } finally {
      loading.value = false;
    }
  }

  const SexOptions = SexTranslations.map(([value, label]) => ({
    value,
    label,
  }));

  function checkFormValid() {
    formRef.value?.validate((isValid) => {
      isValidForm.value = !!isValid;
    });
  }
  let isReseting = false;
  function resetForm() {
    console.log('reset form:', initedTeacherForm);
    toDelFiles.value = [];
    Object.values(uploadRefs.value).map((item) => {
      item.clearFiles();
    });
    isReseting = true;
    teacherForm.value = JSON.parse(JSON.stringify(initedTeacherForm));
    nextTick(() => {
      isReseting = false;
    });
  }
  async function submitForm() {
    ElMessage.closeAll();
    console.log('uploadFileList.value', uploadFileList.value);
    try {
      isSumbiting.value = true;
      await Promise.allSettled(
        toDelFiles.value.map(async (item) => delAttachments(item))
      );
      await submitUpload();
      const teacherInfo = { ...teacherForm.value };
      teacherInfo.schools = teacherInfo.schools.join();
      teacherInfo.helpable_schools = teacherInfo.helpable_schools.join();
      teacherInfo.details = teacherInfo.details.map((detail) => {
        const {
          id,
          school_id,
          emergency_contact_tel,
          emergency_contact_name,
          note,
          education_id,
          education_department_id,
          introducer,
          start_day,
        } = detail;

        return {
          id,
          school_id,
          emergency_contact_tel,
          emergency_contact_name,
          note,
          education_id,
          education_department_id,
          introducer,
          start_day,
        };
      });
      await setTeacherInfo(teacherInfo);
      await ElMessage.success('更新しました！');
      router.push({ name: 'TeacherList' });
    } catch (err) {
      console.error('err', err);
      ElMessage.error('更新に失敗しました！');
    } finally {
      isSumbiting.value = false;
    }
  }

  const corporationSchoolOptions = ref<IOption[]>([]);

  const loadingCorporationSchool = ref(false);
  async function searchCorporationSchool(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingCorporationSchool.value = true;
      const { id } = route.params;

      const { items } = await getCorporationSchools({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
        teacher_id: id,
      });
      if (!keyword) {
        patchOptions(items, defaultSchools);
      }
      const options = selectorOptions(items, ['id', 'slug', 'name']);

      corporationSchoolOptions.value = options;
    } finally {
      loadingCorporationSchool.value = false;
    }
  }

  const helpableSchoolOptions = ref<IOption[]>([]);

  const loadingHelpableSchool = ref(false);

  async function searchHelpableSchools(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingHelpableSchool.value = true;
      const { id } = route.params;

      const { items } = await getCorporationSchools({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
        teacher_id: id,
      });
      if (!keyword) {
        patchOptions(items, defaultHelpableSchools);
      }

      const options = selectorOptions(items, ['id', 'slug', 'name']);

      helpableSchoolOptions.value = options;
    } finally {
      loadingHelpableSchool.value = false;
    }
  }

  interface IOptions {
    [key: string]: IOption[];
  }

  const loadingCorporationSchoolId = ref(false);
  const corporationSchoolIdOptions = ref<IOptions>({});
  const fullCorporationSchoolIdOptions = ref<IOption[]>([]);
  const defaultCorporationSchoolIds: Record<string, IOption> = {};
  async function searchCorporationSchoolId(key: string, keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingCorporationSchoolId.value = true;

      const { items, total_records } = await getCorporationSchools({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });
      if (!keyword) {
        maxDetail.value = total_records;
        fullCorporationSchoolIdOptions.value = [...items];
        if (defaultCorporationSchoolIds[key].id) {
          const index = items.findIndex(
            (option) => +option.id === +defaultCorporationSchoolIds[key].id
          );
          if (index === -1) {
            items.unshift(defaultCorporationSchoolIds[key]);
          }
        }
      }
      const options = selectorOptions(items, ['id', 'slug', 'name']);

      corporationSchoolIdOptions.value[key] = options;
    } finally {
      loadingCorporationSchoolId.value = false;
    }
  }

  const loadingEducation = ref(false);
  const educationOptions = ref<IOptions>({});
  const fullEducationOptions = ref<IOption[]>([]);
  const defaultEducationOptions: Record<string, IOption> = {};
  async function searchEducation(key: string, keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingEducation.value = true;

      const { items } = await getEducationsList({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });

      if (!keyword) {
        fullEducationOptions.value = [...items];

        if (defaultEducationOptions[key].id) {
          const index = items.findIndex(
            (option) => +option.id === +defaultEducationOptions[key].id
          );
          if (index === -1) {
            items.unshift(defaultEducationOptions[key]);
          }
        }
      }

      const options = selectorOptions(items);

      educationOptions.value[key] = options;
    } finally {
      loadingEducation.value = false;
    }
  }

  const loadingDepartment = ref(false);
  const departmentOptions = ref<IOptions>({});

  const defaultDepartments: Record<string, IOption> = {};
  async function searchDepartments(key: string, educationId, keyword?: string) {
    if (!educationId) {
      return;
    }
    keyword = keyword?.trim();
    try {
      loadingDepartment.value = true;

      const { items } = await getEducationsDepartments({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
        education_id: educationId,
      });
      console.log('searchDepartments items before', items);

      if (!keyword) {
        if (defaultDepartments[key].id) {
          const index = items.findIndex(
            (option) => +option.id === +defaultDepartments[key].id
          );
          if (index === -1) {
            items.unshift(defaultDepartments[key]);
          }
        }
      }
      console.log('searchDepartments items', items);
      const options = selectorOptions(items);
      departmentOptions.value[key] = options;
    } finally {
      loadingDepartment.value = false;
    }
  }

  function addDetail() {
    const key = nanoid();
    teacherForm.value.details.push({
      emergency_contact_tel: '',
      emergency_contact_name: '',
      school_id: '',
      education_id: '',
      education_department_id: '',
      introducer: '',
      start_day: '',
      note: '',
      key,
    });

    corporationSchoolIdOptions.value[key] =
      fullCorporationSchoolIdOptions.value;

    educationOptions.value[key] = fullEducationOptions.value;
  }

  function removeDetail(index: number) {
    const { key } = teacherForm.value.details[index];
    delete corporationSchoolIdOptions.value[key];
    teacherForm.value.details.splice(index, 1);
  }

  const toDelFiles = ref<
    {
      teacher_id: number;
      teacher_attachment_id: number;
      school_id: number;
    }[]
  >([]);

  async function removeFile(params, files, index) {
    const { id } = route.params;
    toDelFiles.value.push({
      ...params,
      teacher_id: id,
    });
    files.splice(index, 1);
  }

  function isDisabledSchool(index: number, schoolId) {
    const detail = teacherForm.value.details[index];
    if (detail.id) {
      return true;
    }
    const usedSchoolId = teacherForm.value.details.map(
      (item) => item.school_id
    );
    usedSchoolId.splice(index, 1);
    return usedSchoolId.includes(schoolId);
  }

  const uploadFiles: typeof ElUpload.httpRequest = async function (opt) {
    const { file, data } = opt;
    const formData = new FormData();
    formData.append('attachment', file);

    Object.entries(data).map(([key, value]) => {
      formData.append(key, value as string);
    });

    await addAttachments(formData);
  };

  function removeLocalFile(file, schoolId) {
    console.log('removeLocalFile', file);
    const uploadInstance = uploadRefs.value[schoolId];
    uploadInstance && uploadInstance.handleRemove(file);
  }

  function fileChanged(schoolId, file, files) {
    console.log('fileChanged', file, files);
    const { size } = file;
    uploadFileList.value[schoolId] = files;
    if (size > maxFileSize) {
      ElMessage.error(`5M以下のファイルを選択ください`);
      const uploadInstance = uploadRefs.value[schoolId];
      uploadInstance.handleRemove(file);
    }
  }
  const handleExceed = () => {
    ElMessage.warning(`最大１5個ファイルアップロードできます`);
  };
  async function zipChanged() {
    const zip = teacherForm.value.zip;
    if (zip.length !== 7) {
      return;
    }
    try {
      const data = await getAddressByZip(zip);
      if (!data) {
        return;
      }
      const { prefecture, address } = data;
      teacherForm.value.prefecture = prefecture;
      teacherForm.value.address = address;
    } catch (err) {
      ElMessage.closeAll();
      if (typeof err === 'string') {
        ElMessage({ message: err, type: 'warning' });
      }
    }
  }
</script>
<style scoped lang="postcss">
  .teacher-profile .el-card {
    --el-card-padding: 16px;
    border: none;
  }
  .teacher-profile .upload-file {
    border: 1px solid var(--el-border-color-base);
    border-radius: 2px;
    grid-template-columns: 48px 1fr 16px;
    height: 66px;
  }
  .teacher-profile:deep(.el-upload-list--picture .el-upload-list__item) {
    padding: 0;
    height: auto;
    border-radius: 0;
    border: 0;
  }
</style>
