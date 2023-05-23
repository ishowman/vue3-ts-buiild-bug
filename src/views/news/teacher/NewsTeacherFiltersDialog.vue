<template>
  <c-dialog v-bind="$attrs" v-model="dialogVisible" @open="initFiltersForm">
    <div v-show="loading" v-loading="loading"></div>

    <el-form v-show="!loading" label-position="top" :model="filtersForm">
      <template v-for="{ label, prop, components } in formConfigs" :key="prop">
        <el-form-item
          :label="`${label || NewsTeacherFieldsMap[prop]}：`"
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
  import { computed, ref, useAttrs } from 'vue';

  import CDialog from '@/components/CDialog.vue';
  import { getSchoolList, getExistingTeacher } from '@/services';

  import { MaxPageSize, NewsTeacherFieldsMap, newsStatus } from '@/constants';
  import type { IComponent } from '@/components/CComponent.vue';
  import { isFunction } from '@vueuse/core';
  import { useRoute, useRouter } from 'vue-router';
  import { getUrlParam } from '@/utils';

  const initalSelects = {
    teacher_id: [],
  };
  const dialogVisible = computed<typeof ElDialog.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const loading = ref(false);
  const hasOpened = ref(false);

  const router = useRouter();
  const route = useRoute();

  const emit = defineEmits(['filter-submit', 'update:modelValue']);

  const filtersForm = ref<Record<string, any>>({
    ...initalSelects,
  });
  const formConfigs = ref<IFormConfigs[]>([]);

  const validFilter = computed(() => {
    const filter = {};
    for (const [key, val] of Object.entries(filtersForm.value)) {
      if (![null, undefined, ''].includes(val)) {
        filter[key] = val;
      }
    }

    return {
      ...filter,
      teacher_id: arrayFormatter(filtersForm.value.teacher_id),
    };
  });

  interface IFormConfigs {
    label?: string;
    prop: string;
    components?: IComponent[];
  }

  const schoolList = ref([]);
  const loadingSchool = ref(false);
  const existingTeachers = ref([]);
  const loadingTeachers = ref(false);

  const searchFieldMap = new Map([
    ['school_id', searchSchool],
    ['teacher_id', searchExistingTeacher],
  ]);

  init();
  emit('filter-submit', validFilter.value);

  async function initFiltersForm() {
    if (hasOpened.value) {
      return;
    }
    filtersForm.value = {
      ...filtersForm.value,
      ...searchParams2Form(),
    };
    try {
      loading.value = true;
      await Promise.all([searchSchool(), searchExistingTeacher()]);

      hasOpened.value = true;
    } finally {
      loading.value = false;
    }
  }

  function searchParams2Form() {
    // 排除参数 page
    const searchParams = new URLSearchParams(location.search);
    const filter = {};
    // 显示键/值对
    const arrayKeys = ['teacher_id'];

    searchParams.forEach((val, key) => {
      if (arrayKeys.includes(key)) {
        filter[key] = val.split(',').map((item) => {
          return /^[+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(item)
            ? +item
            : item;
        });
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
        order_by: { id: 'asc' },
      });
      schoolList.value = items.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    } finally {
      loadingSchool.value = false;
    }
  }
  async function searchExistingTeacher(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingTeachers.value = true;
      const { items } = await getExistingTeacher({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });
      existingTeachers.value = items.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    } finally {
      loadingTeachers.value = false;
    }
  }

  async function init() {
    formConfigs.value = [
      {
        label: '教室',
        prop: 'school_id',
        components: [
          searchSelect({
            field: 'school_id',
            options: schoolList,
            loading: loadingSchool,
          }),
        ],
      },
      {
        label: '書いた講師',
        prop: 'teacher_id',
        components: [
          searchSelect(
            {
              field: 'teacher_id',
              options: existingTeachers,
              loading: loadingTeachers,
            },
            { multiple: true }
          ),
        ],
      },

      {
        prop: 'title',
        components: [
          {
            name: ElInput,
            attrs: {
              placeholder: '入力タイトル',
              clearable: true,
            },
          },
        ],
      },
      {
        prop: 'content',
        label: '本文',

        components: [
          {
            name: ElInput,
            attrs: {
              placeholder: '入力本文',
              clearable: true,
            },
          },
        ],
      },
      {
        label: '本部',
        prop: 'from_corporation',
        components: [
          radioGroupConfig(
            [
              { label: 1, value: 'True' },
              { label: 0, value: 'False' },
            ].map(({ label, value }) => ({
              label,
              value,
            }))
          ),
        ],
      },

      {
        label: '公開有無',
        prop: 'status',
        components: [
          radioGroupConfig(
            newsStatus.map(({ label, value }) => ({
              label,
              value,
            }))
          ),
        ],
      },
    ];
    filtersForm.value = {
      ...filtersForm.value,
      ...searchParams2Form(),
    };
  }

  function reset() {
    filtersForm.value = {
      ...initalSelects,
    };
  }

  function save() {
    const query = {
      ...validFilter.value,
      page: 1,
      pageSize: getUrlParam('pageSize') || undefined,
    };
    emit('filter-submit', validFilter.value);
    reloadWithQuery(query);
  }

  function reloadWithQuery(query) {
    router.replace({
      path: route.path,
      query,
    });
  }

  function radioGroupConfig(radios) {
    return {
      name: ElRadioGroup,
      slots: [
        {
          name: 'default',
          components: radios.map(({ label, value }) => {
            return {
              name: ElRadio,
              attrs: {
                label,
              },
              slots: [
                {
                  name: 'default',
                  value,
                },
              ],
            };
          }),
        },
      ],
    };
  }

  function arrayFormatter(selections: Array<string | number>) {
    if (selections?.length) {
      return selections.join();
    }
    return undefined;
  }
</script>
<style scoped></style>
