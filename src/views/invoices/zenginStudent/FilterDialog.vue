<template>
  <c-dialog v-bind="$attrs" title="フィルタ" @open="initialize">
    <div v-if="loading" v-loading="loading" />

    <el-form v-else label-position="top" :model="formData" class="form">
      <template
        v-for="{ label, prop, component, vif = () => true } in formEntries"
        :key="prop"
      >
        <el-form-item v-if="vif?.()" :label="`${label}：`" :prop="prop">
          <c-component v-bind="component" v-model="formData[prop]" />
        </el-form-item>
      </template>
    </el-form>

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
    searchZenginStudentFilterOptions,
    searchZenginStudentAllBankCodes,
  } from '@/services';

  import { getUrlParam } from '@/utils';
  import { MaxPageSize } from '@/constants';
  import CDialog from '@/components/CDialog.vue';

  import { convertSelect } from '@/components/form/utils';
  import type { IFormEntry, IOption } from '@/components/form/types';

  interface FilterDialogProps {
    submit: (query: Record<string, any>) => void | Promise<void>;
  }

  const INITIAL_FORM_DATA = {
    school_id: [],
    student_id: [],
    student_no: [],
    bank_code: 'all',
  };

  const route = useRoute();
  const router = useRouter();

  const props = defineProps<FilterDialogProps>();

  const formEntries = ref<IFormEntry[]>([]);
  const formData = ref<Record<string, any>>({ ...INITIAL_FORM_DATA });

  const loading = ref<boolean>(false);
  const loadingSchools = ref<boolean>(false);
  const loadingStudents = ref<boolean>(false);
  const loadingStudentNos = ref<boolean>(false);
  const loadingBankCodes = ref<boolean>(false);

  const schoolOptions = ref<IOption[]>([]);
  const studentOptions = ref<IOption[]>([]);
  const studentNoOptions = ref<IOption[]>([]);
  const bankCodeOptions = ref<IOption[]>([{ value: 'all', label: '全て' }]);
  const filteredBankCodeOptions = ref<IOption[]>([
    { value: 'all', label: '全て' },
  ]);

  async function initialize() {
    loading.value = true;

    formEntries.value = [
      convertSelect({
        label: '教室名前',
        prop: 'school_id',

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
      convertSelect({
        label: '生徒名前',
        prop: 'student_id',
        options: studentOptions,
        loading: loadingStudents,
        multiple: true,
        filterable: true,
        fetch: async (keyword) => {
          loadingStudents.value = true;

          try {
            const { items } = await searchStudents({
              ...(keyword ? { keyword } : {}),
              pagesize: MaxPageSize,
              search_type: 'name',
              with_school: 1,
            });

            const options = items.map(({ student_no, name, id, schools }) => ({
              label: `${student_no} | ${name}（${schools.name}）`,
              value: id,
            }));

            studentOptions.value = options;
            return options;
          } finally {
            loadingStudents.value = false;
          }
        },
      }),
      convertSelect({
        label: '生徒番号',
        prop: 'student_no',
        options: studentNoOptions,
        loading: loadingStudentNos,
        multiple: true,
        filterable: true,
        valueConverter: String,
        fetch: async (keyword) => {
          loadingStudentNos.value = true;

          try {
            const { items } = await searchStudents({
              ...(keyword ? { keyword } : {}),
              pagesize: MaxPageSize,
              search_type: 'student_no',
              with_school: 1,
            });

            const options = items.map(({ id, student_no, name, schools }) => ({
              label: `${student_no} | ${name}（${schools.name}）`,
              value: id,
            }));

            studentNoOptions.value = options;
            return options;
          } finally {
            loadingStudentNos.value = false;
          }
        },
      }),
      {
        label: '口座名前',
        prop: 'name',
        component: {
          name: ElInput,
          attrs: {
            type: 'textarea',
            rows: 1,
            placeholder: '入力口座名前',
          },
        },
      },
      convertSelect({
        label: '生徒の口座',
        prop: 'bank_code',
        options: filteredBankCodeOptions,
        loading: loadingBankCodes,
        filterable: true,
        valueConverter: String,
        fetch: async (keyword) => {
          try {
            const fetched = bankCodeOptions.value.length > 1; // `all` is by default included in `bankCodeOptions`

            if (!fetched) {
              loadingBankCodes.value = true;
              const { items } = await searchZenginStudentAllBankCodes();

              const options = [
                { value: 'all', label: '全て' },
                ...items.map(({ label: value, value: label }) => ({
                  value,
                  label,
                })),
              ];

              bankCodeOptions.value = options;
            }

            const keywords = (keyword ?? '')
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              .split(' ')
              .join('|');
            const reg = new RegExp(`${keywords}`, '');

            filteredBankCodeOptions.value = keyword
              ? bankCodeOptions.value.filter(({ label }) => reg.test(label))
              : bankCodeOptions.value;

            return filteredBankCodeOptions.value;
          } finally {
            loadingBankCodes.value = false;
          }
        },
      }),
    ];

    await recoverQuery();
    loading.value = false;
  }

  const id = (a: any) => a;

  async function recoverQuery() {
    const listFields = formEntries.value
      .filter((entry) => entry.component?.attrs?.multiple)
      .map(({ prop }) => prop);

    const fields = formEntries.value.map(({ prop }) => prop);

    const converterMap = formEntries.value.reduce(
      (acc, entry) => ({
        ...acc,
        [entry.prop]: entry.valueConverter ?? id,
      }),
      {}
    );

    const previousFormData = Object.entries(route.query).reduce(
      (acc, [k, v]) =>
        fields.includes(k) && isString(v)
          ? Object.assign(
              acc,
              listFields.includes(k)
                ? { [k]: v?.split(',').map(converterMap[k]) }
                : { [k]: converterMap[k](v) }
            )
          : acc,
      { ...INITIAL_FORM_DATA }
    );

    formData.value = previousFormData;

    try {
      const { school_id, student_id, student_no } = route.query;

      const result = await searchZenginStudentFilterOptions({
        school_id: school_id?.toString(),
        student_id: student_id?.toString(),
        student_no: student_no?.toString(),
      });

      schoolOptions.value =
        result.school_id?.map(({ id: value, name: label }) => ({
          value,
          label,
        })) ?? [];

      studentOptions.value =
        result.student_id?.map(({ id: value, name, school, student_no }) => ({
          value,
          label: `${student_no} | ${name}（${school.name}）`,
        })) ?? [];

      studentNoOptions.value =
        result.student_no?.map(({ name, school, student_no }) => ({
          value: student_no,
          label: `${student_no} | ${name}（${school.name}）`,
        })) ?? [];
    } catch (e) {
      console.error(e);
    }
  }

  function reset() {
    formData.value = { ...INITIAL_FORM_DATA };
  }

  const isIterable = (iter: any) =>
    typeof iter === 'object' && typeof iter?.[Symbol.iterator] === 'function';

  async function submit() {
    const validatedFormData = Object.entries(formData.value).reduce(
      (acc, [key, val]) =>
        (
          isIterable(val)
            ? val.length > 0
            : ![undefined, null, ''].includes(val ?? '')
        )
          ? Object.assign(acc, { [key]: isIterable(val) ? val.join() : val })
          : acc,
      {}
    ) as Record<string, any>;

    const query = {
      ...validatedFormData,
      page: 1,
      pageSize: getUrlParam('pageSize') || undefined,
    };

    await props.submit({
      ...validatedFormData,
      ...(validatedFormData.bank_code === 'all'
        ? { bank_code: '' }
        : undefined),
    });
    router.replace({ path: route.path, query });
  }
</script>

<style scoped lang="postcss">
  .form::v-deep(.el-radio),
  .form::v-deep(.el-checkbox) {
    margin-right: 12px;
  }
</style>
