<template>
  <el-form
    ref="formRef"
    label-position="top"
    :model="studentForm"
    :rules="validateRules"
    class="pb-16 student-profile"
  >
    <el-card v-loading="loading" class="mb-4">
      <h2 class="text-[16px] font-bold mb-4">一般設定</h2>
      <el-form-item label="ID: ">
        <el-input v-model="studentForm.id" disabled></el-input>
      </el-form-item>

      <div class="grid grid-cols-2 gap-6">
        <el-form-item label="生徒番号: " prop="student_no" required>
          <c-input-number
            v-model="studentForm.student_no"
            placeholder="入力 生徒番号"
          />
        </el-form-item>
        <el-form-item label="会社生徒コード: " prop="corporation_code">
          <el-input
            v-model="studentForm.corporation_code"
            placeholder="入力 会社生徒コード"
          ></el-input>
        </el-form-item>
      </div>

      <div class="grid grid-cols-3 gap-x-6">
        <el-form-item label="氏: " prop="first_name" required>
          <el-input
            v-model="studentForm.first_name"
            placeholder="入力 氏"
          ></el-input>
        </el-form-item>

        <el-form-item label="名: " prop="last_name" required>
          <el-input
            v-model="studentForm.last_name"
            placeholder="入力 名"
          ></el-input>
        </el-form-item>

        <el-form-item label="名前" required prop="name">
          <el-input
            v-model="studentForm.name"
            placeholder="入力 名前"
          ></el-input>
        </el-form-item>

        <el-form-item label="氏（フリガナ）: " prop="first_name_kana" required>
          <el-input
            v-model="studentForm.first_name_kana"
            placeholder="入力 氏（フリガナ）"
          ></el-input>
        </el-form-item>

        <el-form-item label="名（フリガナ）: " prop="last_name_kana" required>
          <el-input
            v-model="studentForm.last_name_kana"
            placeholder="入力 名（フリガナ）"
          ></el-input>
        </el-form-item>

        <el-form-item label="フリガナ" prop="name_kana" required>
          <el-input
            v-model="studentForm.name_kana"
            placeholder="入力 フリガナ"
          ></el-input>
        </el-form-item>

        <el-form-item label="学年: " prop="grade" required>
          <el-select
            v-model="studentForm.grade"
            class="w-full"
            placeholder="学年"
          >
            <template v-for="item in gradeOptions" :key="item.value">
              <el-option :label="item.label" :value="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="生徒区分: " prop="student_type">
          <el-select
            v-model="studentForm.student_type"
            class="w-full"
            placeholder="生徒区分"
          >
            <template v-for="item in studentTypeOptions" :key="item.value">
              <el-option :label="item.label" :value="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="グループ: " prop="student_groups">
          <el-select
            v-model="studentForm.student_groups"
            placeholder="入力 グループ"
            :remote-method="searchStudentGroups"
            multiple
            filterable
            clearable
            class="w-full"
            remote
            :loading="loadingStudentGroups"
            value-key="id"
            :collapse-tags="studentForm.student_groups?.length > 2"
            collapse-tags-tooltip
          >
            <el-option
              v-for="item in studentGroups"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>

      <el-form-item label="性别: " prop="sex" required>
        <el-select
          v-model="studentForm.sex"
          class="w-full"
          :options="SexOptions"
          placeholder=" 性别"
        >
          <template v-for="item in SexOptions" :key="item.value">
            <el-option :label="item.label" :value="item.value"></el-option>
          </template>
        </el-select>
      </el-form-item>
    </el-card>
    <!-- 電話番号 -->
    <el-card class="mb-4">
      <h2 class="text-[16px] font-bold mb-2">電話番号</h2>
      <el-form-item label="電話番号" prop="tel" class="mb-1">
        <c-input-number v-model="studentForm.tel" placeholder="入力 電話番号" />
      </el-form-item>
      <el-form-item prop="if_tel_show_in_student_list">
        <el-checkbox
          v-model="studentForm.if_tel_show_in_student_list"
          @change="telChanged"
        >
          一覧に表示する
        </el-checkbox>
      </el-form-item>

      <div
        v-for="(owner, index) in studentForm.tels"
        :key="index"
        class="grid gap-6 grid-columns-auto"
      >
        <el-form-item label="持ち主:" :prop="'tels.' + index + '.name'">
          <el-input v-model="owner.name" placeholder="入力 持ち主"></el-input>
          <el-checkbox
            v-model="owner.if_show_in_student_list"
            @change="telsChanged(index)"
          >
            一覧に表示する
            <c-icon-font
              name="icon-recycle"
              height="12px"
              color="var(--el-color-danger)"
              @click.prevent="removeTels(index)"
            />
          </el-checkbox>
        </el-form-item>
        <el-form-item
          label="電話番号:"
          :prop="`tels.${index}.tel`"
          class="w-[982px]"
        >
          <c-input-number v-model="owner.tel" placeholder="入力 電話番号" />
        </el-form-item>
      </div>

      <el-button class="block w-full button-dashed" plain @click="addTels">
        <c-icon-font name="icon-add" height="12px" />新規
      </el-button>
    </el-card>
    <el-card>
      <h2 class="text-[16px] font-bold mb-4">その他</h2>
      <div class="grid grid-cols-2 gap-6">
        <el-form-item label="住所: " prop="address">
          <el-input
            v-model="studentForm.address"
            placeholder="入力住所"
          ></el-input>
        </el-form-item>
        <el-form-item label="住所2 " prop="address2">
          <el-input
            v-model="studentForm.address2"
            placeholder="入力住所2"
            :maxlength="255"
          ></el-input>
        </el-form-item>
      </div>

      <el-form-item label="郵便番号(7桁):" prop="zip">
        <c-input-number
          v-model="studentForm.zip"
          placeholder="入力 郵便番号(7桁)"
          :maxlength="7"
        />
      </el-form-item>

      <el-form-item label="生年月日:" prop="real_birthday">
        <el-date-picker
          v-model="studentForm.real_birthday"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="入力 生年月日"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="兄弟姉妹:" prop="siblings">
        <el-select
          v-model="studentForm.siblings"
          class="w-full"
          placeholder="入力兄弟姉妹"
          multiple
          :collapse-tags="studentForm.siblings?.length > 3"
          :collapse-tags-tooltip="studentForm.siblings?.length > 3"
          filterable
          remote
          :remote-method="searchSiblings"
          :loading="loadingSiblings"
        >
          <el-option
            v-for="item in siblingOptions"
            :key="item.id"
            :value="item.id"
            :label="item.label"
            >{{ item.label }}</el-option
          >
        </el-select>

        <p class="text-secondary text-xs mt-1">
          兄弟姉妹は生徒番号で検索・選択してください
        </p>
      </el-form-item>

      <el-form-item label="支払方法:" prop="pay_type">
        <el-select
          v-model="studentForm.pay_type"
          class="w-full"
          placeholder="支払方法"
        >
          <template v-for="item in payMethodList" :key="item.value">
            <el-option :label="item.lable" :value="item.value"></el-option>
          </template>
        </el-select>
      </el-form-item>
    </el-card>
  </el-form>

  <el-form
    class="bg-white py-3 fixed inset-x-0 bottom-0 z-10 shadow-[0_-3px_4px_rgba(0,0,0,0.05)] px-4 overflow-auto"
  >
    <div class="layout-container flex justify-end">
      <el-button type="danger" plain @click="resetForm">リセット</el-button>
      <el-button type="primary" :disabled="!isValidForm" @click="submitForm">
        保存
      </el-button>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
  import { useRoute, useRouter } from 'vue-router';
  import { nextTick, onMounted, reactive, ref, watch, unref } from 'vue';
  import type { ElForm } from 'element-plus';
  import { ElMessage } from 'element-plus';
  import {
    GradesMap,
    StudentTypesMap,
    SexTranslations,
    MaxPageSize,
  } from '@/constants';
  import {
    getStudentInfo,
    setStudentInfo,
    getStudentSiblings,
    getStudentGroups,
    getPayTypes,
  } from '@/services';
  import CInputNumber from '@/components/CInputNumber.vue';
  import { type IOption, patchOptions, selectorOptions } from '@/utils';

  const loading = ref(false);
  const router = useRouter();
  interface ISelectOptions<K> {
    label: string;
    value: K;
  }

  const gradeOptions: ISelectOptions<number>[] = [];
  const siblingOptions = ref<{ id: number; label: string }[]>([]);
  const studentGroups = ref<{ id: number; label: string }[]>([]);

  for (const [value, label] of GradesMap) {
    gradeOptions.push({
      value,
      label,
    });
  }

  const studentTypeOptions: ISelectOptions<string>[] = [];
  for (const [value, label] of StudentTypesMap) {
    studentTypeOptions.push({
      value,
      label,
    });
  }

  const SexOptions = SexTranslations.map(([value, label]) => ({
    value,
    label,
  }));

  const route = useRoute();
  const formRef = ref<InstanceType<typeof ElForm>>();

  let initedStudentForm = {};
  const studentForm = ref<Record<string, any>>(initedStudentForm);

  const payMethodList = ref<{ value: string; lable: string }[]>([]);

  async function updatePayMethods() {
    const { items } = await getPayTypes();
    payMethodList.value = items.map(({ value, lable }) => ({
      value: String(value),
      lable,
    }));
  }

  const validateRules = reactive({});

  const isValidForm = ref(false);
  let isReseting = false;

  onMounted(async () => {
    searchSiblings();
    searchStudentGroups();

    await initStudentForm();

    watch(studentForm, checkFormValid, { deep: true });
  });

  watch(
    () => [
      studentForm.value.first_name,
      studentForm.value.last_name,
      studentForm.value.first_name_kana,
      studentForm.value.last_name_kana,
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
        studentForm.value.name = first_name + last_name;
      }
      if (
        first_name_kana !== pre_first_name_kana ||
        last_name_kana !== pre_last_name_kana
      ) {
        studentForm.value.name_kana = first_name_kana + last_name_kana;
      }
    }
  );

  function checkFormValid() {
    formRef.value?.validate((isValid, props) => {
      console.log('isValid', isValid, props);
      isValidForm.value = !!isValid;
    });
  }

  async function initStudentForm() {
    const { id } = route.params;
    try {
      // id 获取数据
      loading.value = true;
      const data = await getStudentInfo(+id);

      // 初始化 formModel
      if (data) {
        const {
          id,
          student_no,
          corporation_code,
          first_name,
          last_name,
          name,
          first_name_kana,
          last_name_kana,
          name_kana,
          grade,
          student_type,
          student_groups = [],
          sex,
          tel,
          if_tel_show_in_student_list,
          tels = [],
          address,
          address2,
          zip,
          real_birthday,
          siblings = [],
          pay_type,
          school_id,
        } = data;

        await updatePayMethods();
        const isValidPayType = payMethodList.value.find(
          (item) => +item.value === +pay_type
        );

        if (siblings.length) {
          defaultSiblings = siblings.map(
            ({ id, name, schools, student_no }) => {
              let label = `${student_no} | ${name}`;
              if (schools?.name) {
                label += `(${schools.name})`;
              }
              return {
                id,
                label,
              };
            }
          );
        }

        if (student_groups.length) {
          defaultStudentGroups = student_groups.map(({ id, name }) => {
            return {
              id,
              name,
            };
          });
        }

        studentForm.value = {
          id,
          school_id,
          student_no,
          corporation_code,
          first_name,
          last_name,
          name,
          first_name_kana,
          last_name_kana,
          name_kana,
          grade,
          student_type,
          sex,
          tel,
          if_tel_show_in_student_list,
          tels,
          address,
          address2,
          zip,
          real_birthday,
          pay_type: isValidPayType ? pay_type : '',
          siblings: siblings.map((item) => item.id),
          student_groups: student_groups.map((item) => item.id),
        };
        initedStudentForm = { ...studentForm.value };
      }
      searchSiblings();
      searchStudentGroups();

      nextTick(checkFormValid);
    } finally {
      loading.value = false;
    }
  }

  function removeTels(index: number) {
    studentForm.value.tels.splice(index, 1);
  }

  function addTels() {
    studentForm.value.tels.push({
      name: '',
      tel: '',
      if_show_in_student_list: false,
    });
  }

  const loadingStudentGroups = ref(false);

  async function searchStudentGroups(keyword?: string) {
    keyword = keyword?.trim();

    try {
      loadingStudentGroups.value = true;
      const { id } = route.params;

      const { items } = await getStudentGroups({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
        student_id: id,
        only_used: 0,
      });
      const options = selectorOptions(items, ['name']);
      if (!keyword) {
        patchOptions(options, defaultStudentGroups);
      }
      studentGroups.value = options;
    } finally {
      loadingStudentGroups.value = false;
    }
  }

  function resetForm() {
    console.log('reset form:', initedStudentForm);
    isReseting = true;

    studentForm.value = JSON.parse(JSON.stringify(initedStudentForm));
    nextTick(() => {
      isReseting = false;
    });
  }

  async function submitForm() {
    ElMessage.closeAll();
    try {
      const studentInfo = unref(studentForm.value);
      studentInfo.tels = studentForm.value.tels.map(
        ({ tel, name, if_show_in_student_list, id }) => ({
          id,
          tel,
          name,
          if_show_in_student_list,
        })
      );

      await setStudentInfo(studentInfo);
      ElMessage.success('更新しました！');
      router.push({ name: 'StudentList' });
    } catch (err) {
      console.error('err', err);
      ElMessage.error('更新に失敗しました！');
    }
  }
  const loadingSiblings = ref(false);
  let defaultSiblings: IOption[] = [];
  let defaultStudentGroups: IOption[] = [];
  async function searchSiblings(keyword?: string) {
    keyword = keyword?.trim();

    try {
      loadingSiblings.value = true;
      const { items } = await getStudentSiblings({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });
      const options = items.map(({ id, student_no, name, schools }) => {
        let label = `${student_no} | ${name}`;
        if (schools?.name) {
          label += `(${schools.name})`;
        }
        return {
          id,
          label,
        };
      });
      if (!keyword) {
        patchOptions(options, defaultSiblings);
      }
      siblingOptions.value = options;
    } finally {
      loadingSiblings.value = false;
    }
  }

  function telsChanged(index: number) {
    studentForm.value.tels.forEach((item, i) => {
      if (i !== index) {
        item.if_show_in_student_list = false;
      }
    });
    studentForm.value.if_tel_show_in_student_list = false;
  }
  function telChanged() {
    studentForm.value.tels.forEach((item) => {
      item.if_show_in_student_list = false;
    });
  }
</script>
<style scoped lang="postcss">
  .student-profile .el-card {
    --el-card-padding: 16px;
    border: none;
  }
</style>
