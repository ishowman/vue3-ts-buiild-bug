<template>
  <c-dialog v-bind="$attrs" v-model="dialogVisible" @open="loadFullSelections">
    <div v-show="loading" v-loading="loading"></div>

    <el-form v-show="!loading" label-position="top" :model="filtersForm">
      <template v-for="{ label, prop, components } in formConfigs" :key="prop">
        <el-form-item
          :label="`${StudentFieldsMap[prop] || label}：`"
          :prop="prop"
        >
          <template v-for="(component, i) in components">
            <c-component
              v-if="component.name"
              v-bind="component"
              :key="i"
              v-model="filtersForm[prop]"
            />
          </template>
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <el-button type="danger" plain @click="reset"> リセット </el-button>
      <el-button type="primary" @click="save"> 送信 </el-button>
    </template>
  </c-dialog>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onMounted, ref, useAttrs } from 'vue';
  import { ElInput, ElSelectV2 } from 'element-plus';
  import 'element-plus/es/components/select-v2/style/css';

  import CDialog from '@/components/CDialog.vue';
  import { getSchoolList } from '@/services';

  import { StudentFieldsMap, MaxPageSize, teacherStatus } from '@/constants';
  import type { IComponent } from '@/components/CComponent.vue';
  import CInputNumber from '@/components/CInputNumber.vue';
  import CInputRange from '@/components/CInputRange.vue';
  import { isFunction } from '@vueuse/core';
  import { useRouter } from 'vue-router';
  import { getUrlParam } from '@/utils';

  const initalSelects = {
    periods_current_type: [],
    school_name: [],
  };
  const dialogVisible = computed<typeof ElDialog.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const loading = ref(false);
  const inited = ref(false);
  const router = useRouter();

  function reset() {
    filtersForm.value = {
      ...initalSelects,
    };

    const query = {
      page: getUrlParam('page') || undefined,
      pageSize: getUrlParam('pageSize') || undefined,
    };

    router.replace({
      path: '/teachers/list',
      query,
    });
  }

  const emit = defineEmits(['filter-submit', 'update:modelValue']);
  function save() {
    const filter = {};
    for (const [key, val] of Object.entries(filtersForm.value)) {
      if (![null, undefined, ''].includes(val)) {
        filter[key] = val;
      }
    }

    const filterParams = {
      ...filter,
      school_name: arrayFormatter(filtersForm.value.school_name),
      periods_current_type: arrayFormatter(
        filtersForm.value.periods_current_type
      ),

      period_days: dateRangeFormatter(filtersForm.value.period_days),
      period_months: dateRangeFormatter(filtersForm.value.period_months),
    };
    emit('filter-submit', filterParams);
  }

  const filtersForm = ref<Record<string, any>>({
    ...initalSelects,
  });

  onMounted(() => {
    initFormConfig();
    nextTick(() => {
      filtersForm.value = {
        ...filtersForm.value,
        ...searchParams2Form(),
      };
      save();
    });
  });

  async function loadFullSelections() {
    if (inited.value) {
      return;
    }
    try {
      loading.value = true;
      await searchSchool();
      inited.value = true;
    } finally {
      loading.value = false;
    }
  }

  function searchParams2Form() {
    // 排除参数 page
    const searchParams = new URLSearchParams(location.search);
    const filter = {};
    // 显示键/值对
    const arrayKeys = ['periods_current_type', 'school_name'];

    const dateKeys = ['period_days', 'period_months'];
    searchParams.forEach((val, key) => {
      if (arrayKeys.includes(key)) {
        filter[key] = val.split(',').map((item) => {
          return /^[+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(item) &&
            !['student_no'].includes(key)
            ? +item
            : item;
        });
      } else if (dateKeys.includes(key)) {
        const { start, end } = JSON.parse(val);
        filter[key] = [start, end];
      } else {
        if (!['pageSize', 'page'].includes(key)) {
          filter[key] = /^[+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(val)
            ? +val
            : val; // 能转数字类型的转为数字类型
        }
      }
    });

    return filter;
  }

  function dateRangeFormatter(dateRange) {
    if (
      dateRange &&
      dateRange.length &&
      dateRange.some((item) => item !== '')
    ) {
      const [start, end] = dateRange;
      return {
        start,
        end,
      };
    }
    return undefined;
  }

  function arrayFormatter(selections: Array<string | number>) {
    if (selections?.length) {
      return selections.join();
    }
    return undefined;
  }

  interface IFormConfigs {
    label?: string;
    prop: string;
    components?: IComponent[];
  }

  const schoolList = ref([]);

  async function initFormConfig() {
    formConfigs.value = [
      {
        label: 'ID',
        prop: 'id',
        components: [
          {
            name: CInputNumber,
            attrs: {
              placeholder: '入力 ID',
              clearable: true,
            },
          },
        ],
      },

      {
        label: '名前',
        prop: 'name',
        components: [
          {
            name: ElInput,
            attrs: {
              placeholder: '入力名前',
              clearable: true,
            },
          },
        ],
      },

      {
        label: 'フリガナ',
        prop: 'name_kana',
        components: [
          {
            name: ElInput,
            attrs: {
              placeholder: '入力フリガナ',
              clearable: true,
            },
          },
        ],
      },

      {
        label: 'メールアドレス',
        prop: 'email',
        components: [
          {
            name: ElInput,
            attrs: {
              placeholder: '入力メールアドレス',
              clearable: true,
            },
          },
        ],
      },

      {
        label: '教室名',
        prop: 'school_name',
        components: [
          searchSelect(
            {
              field: 'school_name',
              options: schoolList,
              loading: loadingSchool,
            },
            { multiple: true }
          ),
        ],
      },
      {
        label: '講師ステータス',
        prop: 'periods_current_type',
        components: [
          {
            name: ElSelectV2,
            attrs: {
              placeholder: '選択',
              options: getStatusOptions(),
              class: 'w-full',
              multiple: true,
              filterable: true,
            },
          },
        ],
      },

      {
        label: '学校',
        prop: 'school_attributes_education_name',
        components: [
          {
            name: ElInput,
            attrs: {
              placeholder: '入力学校',
              clearable: true,
            },
          },
        ],
      },
      {
        label: '学部',
        prop: 'school_attributes_department_name',
        components: [
          {
            name: ElInput,
            attrs: {
              placeholder: '入力学部',
              clearable: true,
            },
          },
        ],
      },

      {
        prop: 'period_days',
        label: '在籍期間（日数）',
        components: [
          inputRangeConfig({
            placeholder: '在籍期間（日数）',
          }),
        ],
      },

      {
        prop: 'period_months',
        label: '在籍期間（月数）',
        components: [
          inputRangeConfig({
            placeholder: '在籍期間（月数）',
          }),
        ],
      },
    ];
  }

  const loadingSchool = ref(false);

  const searchFieldMap = new Map([['school_name', searchSchool]]);

  function getStatusOptions() {
    const options: { value: number; label: string }[] = [];
    teacherStatus.forEach((label, value) => {
      options.push({
        value,
        label,
      });
    });
    return options;
  }

  const formConfigs = ref<IFormConfigs[]>([]);

  initFormConfig();

  function searchSelect({ field, options, loading }, attrs = {}) {
    return {
      name: ElSelectV2,
      attrs: {
        placeholder: '選択',
        options,
        'remote-method':
          isFunction(searchFieldMap.get(field)) && searchFieldMap.get(field),
        loading,
        remote: true,
        filterable: true,
        clearable: true,
        class: 'w-full',
        onFocus: function () {
          if (isFunction(searchFieldMap.get(field))) {
            searchFieldMap.get(field)?.();
          }
        },
        ...attrs,
      },
    };
  }

  async function searchSchool(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingSchool.value = true;
      const { items } = await getSchoolList({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
        only_search_name: 1,
      });
      schoolList.value = items.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    } finally {
      loadingSchool.value = false;
    }
  }

  function inputRangeConfig(attrs) {
    return {
      name: CInputRange,
      attrs,
    };
  }
</script>
<style scoped></style>
