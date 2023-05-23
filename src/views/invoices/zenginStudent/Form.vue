<template>
  <div v-if="loading" v-loading="loading" />

  <div v-else class="comiru-content py-6">
    <c-form
      ref="formRef"
      label-position="right"
      :label-width="280"
      class="form w-[800px] mx-auto"
      :form-entries="formEntries"
      :model="formData"
    >
      <template #footer>
        <el-form-item class="mt-6 mb-0">
          <el-button
            type="primary"
            :disabled="disabled"
            :loading="submitting"
            @click="submit"
          >
            {{ isCreating ? '送信' : '保存' }}
          </el-button>

          <el-button type="danger" plain @click="reset"> リセット </el-button>
        </el-form-item>
      </template>
    </c-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import {
    createZenginStudent,
    updateZenginStudent,
    getZenginStudent,
    getSchoolList,
    searchStudents,
    type IZenginStudentForm,
    type IZenginStudentUpdateForm,
  } from '@/services';

  import CForm from '@/components/form/CForm.vue';
  import { convertSelect, convertOptions } from '@/components/form/utils';
  import type { IFormEntry, IOption } from '@/components/form/types';

  import type { FormInstance } from 'element-plus';

  import { isIterable } from '@/utils';
  import { MaxPageSize } from '@/constants';

  const route = useRoute();
  const router = useRouter();

  const id = Number(route.params.id);
  const isCreating = computed(() => !route.params.id);
  const isEditing = computed(() => Boolean(route.params.id));

  const formEntries = ref<IFormEntry[]>([]);
  const initialFormData = ref<Record<string, any>>({ bank_account_type: 1 });
  const formData = ref<Record<string, any>>({ ...initialFormData.value });
  const formRef = ref<{ ref: FormInstance }>();

  const loading = ref<boolean>(false);
  const submitting = ref<boolean>(false);

  const disabled = computed(() => {
    const requiredFieldValues = formEntries.value
      .reduce(
        (acc, { prop, rules = [] }) =>
          (Array.isArray(rules) ? rules : [rules]).some(
            ({ required }) => required
          )
            ? [...acc, formData.value[prop]]
            : acc,
        [] as any[]
      )
      .some((value) =>
        isIterable(value)
          ? value.length === 0
          : ['', undefined, null].includes(value)
      );

    return requiredFieldValues;
  });

  const loadingSchools = ref<boolean>(false);
  const loadingStudents = ref<boolean>(false);

  const schoolOptions = ref<IOption[]>([]);

  interface IStudentOption extends IOption {
    school_id: number;
    school: {
      id: number;
      name: string;
    };
  }

  const studentOptions = ref<IStudentOption[]>([]);

  async function initialize() {
    loading.value = true;

    formEntries.value = [
      convertSelect({
        label: '教室名前',
        prop: 'school_id',

        loading: loadingSchools,
        options: schoolOptions,
        filterable: true,

        rules: {
          required: true,
          message: '教室名前は、必ず指定してください',
          trigger: 'blur',
        },

        vif: () => isCreating.value,

        fetch: async (keyword?: string) => {
          loadingSchools.value = true;

          try {
            const { items } = await getSchoolList({
              ...(keyword ? { keyword } : undefined),
              pagesize: MaxPageSize,
              only_search_name: 1,
            });

            const options = items.map(({ id, name }) => ({
              value: id,
              label: name,
            }));

            schoolOptions.value = options;
            return options;
          } finally {
            loadingSchools.value = false;
          }
        },

        change: async (schoolId) => {
          if (!schoolId) {
            formData.value = {
              ...formData.value,
              student_id: undefined,
            };
            studentOptions.value = [];
            return;
          }

          try {
            const { items } = await searchStudents({
              pagesize: MaxPageSize,
              page: 1,
              school_id: schoolId,
              with_school: 1,
              with_grade: 1,
              exclude_trash: 1,
              order_by: { id: 'asc' },
            });

            const options = items.map(
              ({ student_no, name, id, grade, schools: school }) => ({
                label: `${grade.short_label} | ${student_no} | ${name}`,
                value: id,
                school: { name: school.name, id: school.id },
              })
            );

            studentOptions.value = options;

            formData.value = {
              ...formData.value,
              student_id: options[0]?.value,
            };
          } catch (e) {
            console.error(e);
          }
        },
      }),
      convertSelect({
        label: '生徒名前',
        prop: 'student_id',
        options: studentOptions,
        loading: loadingStudents,
        filterable: true,

        vif: () => isCreating.value,

        rules: {
          required: true,
          message: '生徒名前は、必ず指定してください',
          trigger: 'blur',
        },

        fetch: async (keyword) => {
          if (!keyword) {
            return;
          }

          loadingStudents.value = true;
          const { school_id } = formData.value;

          try {
            const { items } = await searchStudents({
              ...(keyword ? { keyword } : {}),
              ...(school_id ? { school_id } : {}),
              pagesize: MaxPageSize,
              search_type: 'name',
              with_school: 1,
              with_grade: 1,
              exclude_trash: 1,
            });

            const options = items.map(
              ({ student_no, name, id, grade, schools: school }) => ({
                label: `${grade.short_label} | ${student_no} | ${name}`,
                value: id,
                school: { name: school.name, id: school.id },
              })
            );

            studentOptions.value = options;
            return options;
          } finally {
            loadingStudents.value = false;
          }
        },
      }),
      {
        label: '生徒名前',
        prop: 'student_name',
        vif: () => isEditing.value,
        component: {
          name: ElInput,
          attrs: { readonly: true, disabled: true },
        },
      },
      {
        label: '口座名前',
        prop: 'name',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '入力口座名前',
          },
        },
        rules: {
          max: 15,
          message: '口座名前は15文字以下で入力してください',
          trigger: 'blur',
        },
      },
      {
        label: '口座名前（半角カナ）',
        prop: 'name_kana',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '入力口座名前（半角カナ）',
          },
        },
        rules: [
          {
            required: true,
            message: '口座名前（半角カナ）は、必ず指定してください',
            trigger: 'blur',
          },
          {
            pattern: /^[0-9A-Zｧ-ﾝﾞﾟｦ-ﾟ]*$/,
            message:
              '口座名前（半角カナ）は半角カタカナ英数字大文字などで入力してください',
            trigger: 'change',
          },
        ],
      },
      {
        label: '請求先金融機関コード',
        prop: 'bank_code',
        desc: 'ゆうちょ銀行の場合9900',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '入力請求先金融機関コード',
          },
        },
        rules: [
          {
            required: true,
            message: '請求先金融機関コードは、必ず指定してください',
            trigger: 'blur',
          },
          {
            max: 4,
            message:
              '請求先金融機関コードは半角数字（4けた以下）で入力してください',
            trigger: 'change',
          },
          {
            pattern: /^[0-9]{1,4}$/,
            message: '請求先金融機関コードは半角数字で入力してください',
            trigger: 'change',
          },
        ],
      },
      {
        label: '請求先金融機関名（半角カナ英大文字）',
        prop: 'bank_name',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '入力請求先金融機関名（半角カナ英大文字）',
          },
        },
        rules: [
          {
            max: 15,
            message:
              '請求先金融機関名（半角カナ英大文字）カタカナ（15文字以下）で入力してください',
            trigger: 'change',
          },
          {
            pattern: /^[0-9A-Zｧ-ﾝﾞﾟｦ-ﾟ]*$/,
            message:
              '請求先金融機関名（半角カナ英大文字）は半角カタカナ英数字大文字などで入力してください',
            trigger: 'change',
          },
        ],
      },
      {
        label: '請求先支店番号',
        prop: 'bank_branch_code',
        desc: 'ゆうちょ銀行で支店番号が記号の場合、2桁目～4桁目を入力してください',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '入力請求先支店番号',
          },
        },
        rules: [
          {
            required: true,
            message: '請求先支店番号は、必ず指定してください',
            trigger: 'blur',
          },
          {
            max: 3,
            message: '請求先支店番号は半角数字（3けた以下）で入力してください',
            trigger: 'change',
          },
          {
            pattern: /^[0-9]{1,3}$/,
            message: '請求先支店番号は半角数字で入力してください',
            trigger: 'change',
          },
        ],
      },
      {
        label: '請求先支店名（半角カナ）',
        prop: 'bank_branch_kana',
        desc: 'ゆうちょ銀行の場合は空欄でお願いします',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '入力請求先支店名（半角カナ）',
          },
        },
        rules: [
          {
            max: 15,
            message:
              '請求先支店名（半角カナ）カタカナ（15文字以下）で入力してください',
            trigger: 'change',
          },
          {
            pattern: /^[0-9A-Zｧ-ﾝﾞﾟｦ-ﾟ]*$/,
            message:
              '請求先支店名（半角カナ）は半角カタカナ英数字大文字などで入力してください',
            trigger: 'change',
          },
        ],
      },
      {
        label: '請求口座の預金科目',
        prop: 'bank_account_type',
        desc: 'ゆうちょ銀行の場合は「普通預金」を設定する',
        component: {
          name: ElRadioGroup,
          slots: convertOptions(ElRadio)([
            { value: 1, label: '普通預金' },
            { value: 2, label: '当座預金' },
            { value: 4, label: '貯蓄' },
          ]),
        },
        valueConverter: (s) => s === 'true',
      },
      {
        label: '請求口座の口座番号',
        prop: 'bank_account_no',
        desc: 'ゆうちょ銀行の場合、口座番号の上7桁を記入してください',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '入力請求口座の口座番号',
          },
        },
        rules: [
          {
            required: true,
            message: '請求口座の口座番号は、必ず指定してください',
            trigger: 'blur',
          },
          {
            max: 7,
            message:
              '請求口座の口座番号は半角数字（7けた以下）で入力してください',
            trigger: 'change',
          },
          {
            pattern: /^[0-9]{1,7}$/,
            message: '請求口座の口座番号は半角数字で入力してください',
            trigger: 'change',
          },
        ],
      },
    ];

    if (isEditing.value && id) {
      const zenginStudent = await getZenginStudent(id);
      const fields = formEntries.value.map(({ prop }) => prop);

      initialFormData.value = Object.entries(zenginStudent).reduce(
        (acc, [prop, value]) =>
          fields.includes(prop) ? { ...acc, [prop]: value } : acc,
        { student_name: zenginStudent.student?.name }
      );
      formData.value = { ...initialFormData.value };
    }

    loading.value = false;
  }

  async function submit() {
    const actionInText = isCreating.value ? '保存' : '更新';
    try {
      submitting.value = true;

      await formRef.value?.ref.validate(async (isValid) => {
        if (!isValid) {
          return;
        }

        await (isCreating.value
          ? createZenginStudent(formData.value as IZenginStudentForm)
          : updateZenginStudent({
              ...formData.value,
              id,
            } as IZenginStudentUpdateForm));

        router.push({ name: 'InvoiceZenginStudentList' });

        ElMessage.success(`${actionInText}しました！`);
      });
    } catch (e) {
      console.error(e);
      ElMessage.error(`${actionInText}に失敗しました！`);
    } finally {
      submitting.value = false;
    }
  }

  function reset() {
    formRef.value?.ref?.resetFields();
    studentOptions.value = [];
  }

  initialize();
</script>
