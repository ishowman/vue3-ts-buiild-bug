<template>
  <c-dialog v-bind="$attrs" title="フィルタ" @open="initialize">
    <c-form
      :loading="loading"
      label-position="top"
      :initial-model="INITIAL_FORM_DATA"
      :model="formData"
      :form-entries="formEntries"
      no-footer
    />

    <template #footer>
      <el-button type="danger" plain @click="reset">リセット</el-button>
      <el-button type="primary" @click="submit">送信</el-button>
    </template>
  </c-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import { isString } from '@vueuse/core';
  import {
    getSchoolList,
    searchStudents,
    getStudentZengins,
    getGradesWithInvoices,
  } from '@/services';

  import { getUrlParam, isIterable } from '@/utils';

  import { MaxPageSize } from '@/constants';

  import CForm from '@/components/form/CForm.vue';
  import CDialog from '@/components/CDialog.vue';

  import {
    convertOptions,
    convertSelect,
    convertDateRange,
  } from '@/components/form/utils';

  import type { IFormEntry, IOption } from '@/components/form/types';

  interface FilterDialogProps {
    submit: (query: Record<string, any>) => void | Promise<void>;
  }

  const INITIAL_FORM_DATA = {
    school_ids: [],
    pay_type: undefined,
    student_zengin_bank_code: [],
    zengin: undefined,
    readed: undefined,
    student_ids: [],
    grade: [],
  };

  const route = useRoute();
  const router = useRouter();

  const props = defineProps<FilterDialogProps>();

  const formEntries = ref<IFormEntry[]>([]);
  const formData = ref<Record<string, any>>({ ...INITIAL_FORM_DATA });

  const loading = ref<boolean>(false);
  const loadingSchools = ref<boolean>(false);
  const loadingStudentZenginBankCode = ref<boolean>(false);
  const loadingStudents = ref<boolean>(false);
  const loadingGrades = ref<boolean>(false);

  const schoolOptions = ref<IOption[]>([]);
  const studentZenginOptions = ref<IOption[]>([]);
  const studentOptions = ref<IOption[]>([]);

  const gradeOptions = ref<IOption[]>([]);
  const filteredGradeOptions = ref<IOption[]>([]);

  const PAY_TYPE_OPTIONS: IOption[] = [
    { value: undefined, label: '全て' },
    { value: 1, label: '銀行振込' },
    { value: 2, label: 'クレジットカード' },
    { value: 3, label: '口座振替' },
    { value: 4, label: '月謝' },
    { value: 5, label: '口座振替(ベリトランス)' },
  ];

  const PAY_TYPE_MAP = PAY_TYPE_OPTIONS.reduce(
    (acc, { value, label }) => ({ ...acc, [label]: value }),
    {}
  );

  const mapStudentOptions = (
    items: { student_no: string; name: string; id: number }[]
  ) => {
    const existedIds = new Set();

    return items.reduce((acc, { student_no, name, id }) => {
      if (existedIds.has(id)) {
        return acc;
      }

      existedIds.add(id);

      return [
        ...acc,
        {
          label: `${student_no} | ${name}`,
          value: id,
        },
      ];
    }, [] as IOption[]);
  };

  async function initialize() {
    loading.value = true;

    formEntries.value = [
      convertSelect({
        label: '教室',
        prop: 'school_ids',

        loading: loadingSchools,
        options: schoolOptions,
        filterable: true,
        multiple: true,

        fetch: async (keyword?: string) => {
          loadingSchools.value = true;

          try {
            const { items } = await getSchoolList({
              ...(keyword ? { keyword } : undefined),
              pagesize: MaxPageSize,
              only_search_name: 1,
              order_by: { id: 'asc' },
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
      }),
      {
        label: '支払方法',
        prop: 'pay_type',
        component: {
          name: ElRadioGroup,
          slots: convertOptions(ElRadio)([
            { value: undefined, label: '全て' },
            { value: 1, label: '銀行振込' },
            { value: 2, label: 'クレジットカード' },
            { value: 3, label: '口座振替' },
            { value: 4, label: '月謝' },
            { value: 5, label: '口座振替(ベリトランス)' },
          ]),
        },
        valueConverter: Number,
      },
      convertSelect({
        label: '生徒の口座',
        prop: 'student_zengin_bank_code',

        loading: loadingStudentZenginBankCode,
        options: studentZenginOptions,

        vif: () => formData.value.pay_type === PAY_TYPE_MAP['口座振替'],
        multiple: true,
        filterable: true,

        valueConverter: id,

        fetch: async () => {
          const hasOptions = studentZenginOptions.value.length > 0;

          if (hasOptions) {
            return;
          }

          loadingStudentZenginBankCode.value = true;

          try {
            const { items } = await getStudentZengins();
            const options = items.map(({ key, value }) => ({
              value: key,
              label: value,
            }));
            studentZenginOptions.value = options;

            return options;
          } finally {
            loadingStudentZenginBankCode.value = false;
          }
        },
      }),
      {
        label: '口座情報登録',
        prop: 'zengin',
        component: {
          name: ElRadioGroup,
          slots: convertOptions(ElRadio)([
            { value: undefined, label: '全て' },
            { value: true, label: '登録済' },
            { value: false, label: '未登録' },
          ]),
        },
        valueConverter: (s) => s === 'true',
      },
      {
        label: '送付および支払いステータス',
        prop: 'status',
        component: {
          name: ElCheckboxGroup,
          slots: convertOptions(ElCheckbox)([
            { value: 0, label: '未請求' },
            { value: 1, label: '請求済(未納)' },
            { value: 3, label: '請求済(既納)' },
          ]),
          attrs: { multiple: true },
        },
        valueConverter: Number,
      },
      {
        label: '既読ステータス',
        prop: 'readed',
        component: {
          name: ElRadioGroup,
          slots: convertOptions(ElRadio)([
            { value: undefined, label: '全て' },
            { value: false, label: '未読' },
            { value: true, label: '既読' },
          ]),
        },
        valueConverter: (s) => s === 'true',
      },
      convertSelect({
        label: '生徒の名前',
        prop: 'student_ids',
        options: studentOptions,
        loading: loadingStudents,
        multiple: true,
        filterable: true,
        fetch: async (keyword) => {
          loadingStudents.value = true;

          try {
            const append_student_ids = route.query.student_ids;

            const { items, append_student_items = [] } = await searchStudents({
              ...(append_student_ids ? { append_student_ids } : undefined),
              ...(keyword ? { keyword } : undefined),
              pagesize: MaxPageSize,
              search_type: 'name',
              order_by: { id: 'desc' },
            });

            const options = mapStudentOptions([
              ...items,
              ...append_student_items,
            ]);

            studentOptions.value = options;
            return options;
          } finally {
            loadingStudents.value = false;
          }
        },
      }),
      convertSelect({
        label: '学年',
        prop: 'grade',
        filterable: true,
        options: filteredGradeOptions,
        fetch: async (keyword?: string) => {
          try {
            const fetched = gradeOptions.value.length > 0;

            if (!fetched) {
              loadingGrades.value = true;
              gradeOptions.value = (await getGradesWithInvoices()).map(
                ({ key: value, value: label }) => ({
                  value,
                  label,
                })
              );
            }

            const keywords = (keyword ?? '')
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              .split(' ')
              .join('|');
            const reg = new RegExp(`${keywords}`, '');

            filteredGradeOptions.value = keyword
              ? gradeOptions.value.filter(({ label }) => reg.test(label))
              : gradeOptions.value;

            return filteredGradeOptions.value;
          } finally {
            loadingGrades.value = false;
          }
        },
      }),
      convertDateRange({
        label: '請求書の日付',
        prop: 'date',
      }),
      convertDateRange({
        label: '支払期限',
        prop: 'pay_date',
      }),
      {
        label: 'メモ',
        prop: 'memo',
        component: {
          name: ElInput,
          attrs: { placeholder: '入力メモ' },
        },
      },
      convertSelect({
        label: 'ベリトランス口座登録',
        prop: 'veri_registered',
        options: [
          { value: 0, label: '未登録' },
          { value: 1, label: '登録済み' },
        ],
      }),
      /*
      convertSelect({
        label: 'コンビニステータス',
        prop: 'conbini',
        options: [
          { value: 1, label: '請求前' },
          { value: 2, label: '送信済' },
          { value: 3, label: 'データ出力済み' },
          { value: 4, label: '速報' },
          { value: 5, label: '確定' },
        ],
      }),
      */
    ];

    await recoverQuery();
    loading.value = false;
  }

  const id = (a: any) => a;

  async function recoverQuery() {
    const listFields = formEntries.value
      .filter((entry) => entry.component?.attrs?.multiple)
      .map(({ prop }) => prop);

    const dateFields = formEntries.value
      .filter((entry) => entry.component?.type === 'daterange')
      .reduce(
        (acc, { prop }) => [...acc, `${prop}_start`, `${prop}_end`],
        [] as string[]
      );

    const fields = formEntries.value.map(({ prop }) => prop).concat(dateFields);

    const converterMap = formEntries.value.reduce(
      (acc, entry) => ({
        ...acc,
        [entry.prop]: entry.valueConverter ?? id,
      }),
      {}
    );

    const fetchers = formEntries.value.map(({ fetch }) => fetch?.());

    await Promise.all(fetchers);

    const previousFormData = Object.entries(route.query).reduce(
      (acc, [k, v]) =>
        fields.includes(k) && isString(v)
          ? Object.assign(
              acc,
              dateFields.includes(k)
                ? (() => {
                    const dateKey = k.replace(/_(start|end)$/, '');
                    const isEnd = /_end$/.test(k);
                    return isEnd
                      ? { [dateKey]: [acc[dateKey][0], v] }
                      : { [dateKey]: [v] };
                  })()
                : listFields.includes(k)
                ? { [k]: v?.split(',').map(converterMap[k]) }
                : { [k]: converterMap[k](v) }
            )
          : acc,
      { ...INITIAL_FORM_DATA }
    );
    formData.value = previousFormData;
  }

  function reset() {
    formData.value = { ...INITIAL_FORM_DATA };
  }

  async function submit() {
    const dateKeys = formEntries.value
      .filter(({ component }) => component?.type === 'daterange')
      .map(({ prop }) => prop);

    const validatedFormData = Object.entries(formData.value).reduce(
      (acc, [key, val]) =>
        (
          (
            isIterable(val)
              ? val.length > 0
              : ![undefined, null, ''].includes(val ?? '')
          )
            ? key === 'student_zengin_bank_code'
              ? formData.value.pay_type === PAY_TYPE_MAP['口座振替']
              : true
            : false
        )
          ? Object.assign(
              acc,
              dateKeys.includes(key)
                ? { [`${key}_start`]: val[0], [`${key}_end`]: val[1] }
                : { [key]: isIterable(val) ? val.join() : val }
            )
          : acc,
      {}
    );

    const query = {
      ...validatedFormData,
      page: 1,
      pageSize: getUrlParam('pageSize') || undefined,
    };

    await props.submit(validatedFormData);
    router.replace({ path: route.path, query });
  }
</script>

<style scoped lang="postcss">
  .form::v-deep(.el-radio),
  .form::v-deep(.el-checkbox) {
    margin-right: 12px;
  }
</style>
