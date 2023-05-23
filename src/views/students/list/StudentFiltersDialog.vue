<template>
  <c-dialog v-bind="$attrs" v-model="dialogVisible" @open="initFiltersForm">
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
  import { computed, ref, useAttrs } from 'vue';
  import CDialog from '@/components/CDialog.vue';
  import {
    getClassList,
    getCourseList,
    getSchoolList,
    getStudentGroups,
    searchStudents,
  } from '@/services';

  import {
    GradesMap,
    LeaveStatusTranslation,
    SexTranslations,
    StudentFieldsMap,
    LineStatus,
    AccountStatus,
    MaxPageSize,
    AccountRegisted,
  } from '@/constants';
  import type { IComponent } from '@/components/CComponent.vue';
  import CInputNumber from '@/components/CInputNumber.vue';

  import CInputRange from '@/components/CInputRange.vue';
  import { isFunction } from '@vueuse/core';
  import { useRoute, useRouter } from 'vue-router';
  import { type IOption, getUrlParam } from '@/utils';

  const dialogVisible = computed<typeof ElDialog.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const initalSelects = {
    leave_status: [],
    student_ids: [],
    student_no: [],
    grade: [],
    course_ids: [],
    student_ids_from_group: [],
    class_ids: [],
    sex: '',
  };
  interface IFormConfigs {
    label?: string;
    prop: string;
    components?: IComponent[];
  }

  const formConfigs = ref<IFormConfigs[]>([]);
  const studentNOList = ref([]);
  const schoolList = ref([]);
  const courseList = ref([]);
  const classList = ref([]);
  const studentGroups = ref([]);
  const nameList = ref<IOption[]>([]);
  const loadingName = ref(false);

  const loadingClass = ref(false);
  const loadingCourse = ref(false);
  const loadingStudentGroups = ref(false);
  const loadingStudentNO = ref(false);
  const loadingSchool = ref(false);

  const searchFieldMap = new Map([
    ['school_id', searchSchool],
    ['course_ids', searchCourses],
    ['class_ids', searchClasses],
    ['student_ids_from_group', searchStudentGroups],
    ['student_no', searchStudentNO],
    ['student_ids', searchName],
  ]);

  const loading = ref(false);
  const hasOpened = ref(false);

  const router = useRouter();
  const route = useRoute();
  const emit = defineEmits(['filter-submit', 'update:modelValue']);

  const validFilter = computed(() => {
    const filter = {};
    for (const [key, val] of Object.entries(filtersForm.value)) {
      if (![null, undefined, ''].includes(val)) {
        filter[key] = val;
      }
    }

    return {
      ...filter,
      student_ids: arrayFormatter(filtersForm.value.student_ids),
      student_no: arrayFormatter(filtersForm.value.student_no),
      grade: arrayFormatter(filtersForm.value.grade),
      course_ids: arrayFormatter(filtersForm.value.course_ids),
      class_ids: arrayFormatter(filtersForm.value.class_ids),
      leave_status: arrayFormatter(filtersForm.value.leave_status),

      period_days: dateRangeFormatter(filtersForm.value.period_days),
      period_months: dateRangeFormatter(filtersForm.value.period_months),
      student_ids_from_group: arrayFormatter(
        // 不提交 studentsId 为空的数据
        filtersForm.value.student_ids_from_group
          .map((item) => item.split('|')[0])
          .filter((sid) => !!sid)
      ),
      created_at: dateRangeFormatter(filtersForm.value.created_at),
      updated_at: dateRangeFormatter(filtersForm.value.updated_at),
      in_school_date: dateRangeFormatter(filtersForm.value.in_school_date),
      start_date: dateRangeFormatter(filtersForm.value.start_date),
      out_school_date: dateRangeFormatter(filtersForm.value.out_school_date),
    };
  });

  const filtersForm = ref<Record<string, any>>({
    ...initalSelects,
  });
  initFormConfig();

  // emit('filter-submit', validFilter.value);

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
      await Promise.all([
        searchStudentNO(),
        searchSchool(),
        searchCourses(),
        searchClasses(),
        searchStudentGroups(),
        searchName(),
      ]);
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
    const arrayKeys = [
      'student_no',
      'grade',
      'course_ids',
      'class_ids',
      'leave_status',
      'student_ids',
      'student_ids_from_group',
    ];

    const dateKeys = [
      'period_days',
      'period_months',
      'created_at',
      'updated_at',
      'start_date',
      'in_school_date',
      'out_school_date',
    ];
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
        label: '生徒番号',
        prop: 'student_no',
        components: [
          searchSelect(
            {
              field: 'student_no',
              options: studentNOList,
              loading: loadingStudentNO,
            },
            { multiple: true }
          ),
        ],
      },
      {
        label: '名前',
        prop: 'student_ids',
        components: [
          searchSelect(
            {
              field: 'student_ids',
              options: nameList,
              loading: loadingName,
            },
            { multiple: true }
          ),
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
        label: '性別',
        prop: 'sex',
        components: [['', '全部'], ...SexTranslations].map(
          ([value, label]) => ({
            name: ElRadio,
            attrs: {
              label: value,
            },
            slots: [
              {
                name: 'default',
                value: label,
              },
            ],
          })
        ),
      },

      {
        label: '学年',
        prop: 'grade',
        components: [
          {
            name: ElSelectV2,
            attrs: {
              placeholder: '選択',
              options: Array.from(GradesMap).map(([value, label]) => ({
                value,
                label,
              })),
              class: 'w-full',
              multiple: true,
              filterable: true,
            },
          },
        ],
      },

      {
        prop: 'course_ids',
        label: 'コース名',
        components: [
          searchSelect(
            {
              field: 'course_ids',
              options: courseList,
              loading: loadingCourse,
            },
            { multiple: true }
          ),
        ],
      },

      {
        prop: 'class_ids',
        label: 'クラス名',
        components: [
          searchSelect(
            { field: 'class_ids', options: classList, loading: loadingClass },
            { multiple: true }
          ),
        ],
      },

      {
        prop: 'real_birthday',
        components: [
          datePickerConfig({
            type: 'date',
          }),
        ],
      },

      {
        label: '電話番号',
        prop: 'tel',
        components: [
          {
            name: CInputNumber,
            attrs: {
              placeholder: '入力電話番号',
              autocomplete: 'new-password',
            },
          },
        ],
      },

      {
        label: 'ステータス',
        prop: 'leave_status',
        components: [
          {
            name: ElCheckboxGroup,
            slots: [
              {
                name: 'default',
                components: LeaveStatusTranslation.slice(0, 5).map(
                  ([val, key]) => {
                    return {
                      name: ElCheckbox,
                      attrs: {
                        label: val,
                      },
                      slots: [
                        {
                          name: 'default',
                          value: key,
                        },
                      ],
                    };
                  }
                ),
              },
            ],
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

      {
        prop: 'student_ids_from_group',
        label: 'グループ',

        components: [
          searchSelect(
            {
              field: 'student_ids_from_group',
              options: studentGroups,
              loading: loadingStudentGroups,
            },
            { multiple: true }
          ),
        ],
      },

      {
        prop: 'does_agree_terms',
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
        prop: 'is_active_app',
        label: 'アプリ登録',
        components: [
          radioGroupConfig(
            AccountStatus.map(([label, value]) => ({
              label,
              value,
            }))
          ),
        ],
      },

      {
        prop: 'is_active_line',
        label: 'LINE登録',
        components: [
          radioGroupConfig(
            LineStatus.map(([label, value]) => ({
              label,
              value,
            }))
          ),
        ],
      },

      {
        prop: 'is_verified',
        label: 'メールアドレス登録',
        components: [
          radioGroupConfig(
            AccountStatus.map(([label, value]) => ({
              label,
              value,
            }))
          ),
        ],
      },

      {
        prop: 'omise',
        label: 'クレジットカード登録',
        components: [
          radioGroupConfig(
            AccountStatus.map(([label, value]) => ({
              label,
              value,
            }))
          ),
        ],
      },

      {
        prop: 'veritrans',
        label: 'ベリトランス口座登録',
        components: [
          radioGroupConfig(
            [AccountRegisted, [2, '登録エラー'], [3, '未登録']].map(
              ([label, value]) => ({
                label,
                value,
              })
            )
          ),
        ],
      },

      {
        prop: 'created_at',
        components: [datePickerConfig({ placeholder: '作成日時' })],
      },

      {
        label: '更新日時',
        prop: 'updated_at',
        components: [datePickerConfig({ placeholder: '更新日時' })],
      },

      {
        prop: 'in_school_date',
        components: [datePickerConfig({ placeholder: '入会日' })],
      },

      {
        prop: 'start_date',
        components: [datePickerConfig({ placeholder: '授業開始日' })],
      },

      {
        prop: 'out_school_date',
        components: [datePickerConfig({ placeholder: '退会日' })],
      },
    ];
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
        onVisibleChange: function (visible) {
          if (visible && isFunction(searchFieldMap.get(field))) {
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
      });
      schoolList.value = items.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    } finally {
      loadingSchool.value = false;
    }
  }

  async function searchCourses(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingCourse.value = true;
      const { items } = await getCourseList({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });
      courseList.value = items.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    } finally {
      loadingCourse.value = false;
    }
  }
  async function searchClasses(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingClass.value = true;
      const { items } = await getClassList({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });
      classList.value = items.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    } finally {
      loadingClass.value = false;
    }
  }
  async function searchStudentGroups(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingStudentGroups.value = true;
      const { items } = await getStudentGroups({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
        only_used: 0,
      });
      studentGroups.value = items.map(({ student_ids, name, id }) => ({
        label: name,
        value: `${student_ids}|${id}`,
      }));
    } finally {
      loadingStudentGroups.value = false;
    }
  }

  async function searchStudentNO(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingStudentNO.value = true;
      const { items } = await searchStudents({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });
      studentNOList.value = items.map(({ student_no, name }) => ({
        label: `${student_no} | ${name}`,
        value: student_no,
      }));
    } finally {
      loadingStudentNO.value = false;
    }
  }

  const mapStudentOptions = (
    items: { student_no: string; name: string; id: number }[]
  ) => {
    const existedIds = new Set();

    return items.reduce((acc, it) => {
      if (existedIds.has(it.id)) {
        return acc;
      }

      existedIds.add(it.id);

      return [
        ...acc,
        {
          label: `${it.student_no} | ${it.name}`,
          value: it.id,
        },
      ] as IOption[];
    }, [] as IOption[]);
  };

  async function searchName(keyword?: string) {
    keyword = keyword?.trim();

    try {
      const append_student_ids = route.query.student_ids;

      loadingName.value = true;
      const { items, append_student_items = [] } = await searchStudents({
        ...(append_student_ids ? { append_student_ids } : {}),
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
        search_type: 'name',
      });
      nameList.value = mapStudentOptions([...items, ...append_student_items]);
    } finally {
      loadingName.value = false;
    }
  }

  function datePickerConfig(
    attrs: Record<string, any>,
    mergeOption: Record<string, any> = {}
  ) {
    const placeholder = '生年月日';
    return {
      name: ElDatePicker,
      attrs: {
        placeholder,
        type: 'daterange',
        'start-placeholder': attrs?.placeholder || placeholder,
        'end-placeholder': attrs?.placeholder || placeholder,
        'value-format': 'YYYY-MM-DD',
        ...attrs,
      },
      ...mergeOption,
    };
  }

  function inputRangeConfig(attrs) {
    return {
      name: CInputRange,
      attrs,
    };
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

  initFormConfig();

  function reloadWithQuery(query) {
    router.replace({
      path: route.path,
      query,
    });
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
</script>
<style scoped></style>
