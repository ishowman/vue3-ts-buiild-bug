<template>
  <c-list-table
    v-loading="loading"
    :data="tableData"
    :total="total"
    @sort-change="handleSortChange"
    @filter="tableFilterVisible = true"
    @setting="tableFieldsVisible = true"
    @refetch="getList"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
    @select="handelSelect"
  >
    <template #header-left>
      <el-button type="primary" @click="linkToCreate">
        <c-icon-font name="icon-add" :size="ButtonIconHeight.default" />新規
      </el-button>
      <el-button type="primary" plain @click="linkToGroup">
        <c-icon-font
          name="icon-add"
          :size="ButtonIconHeight.default"
        />グループ作成
      </el-button>
      <csv-export
        :selected-ids="selectedStudents.map(({ id }) => id)"
        filename="生徒情報"
        action="students/csv-data"
        :total="total"
        :sort="sortFields"
        class="mx-3"
      >
      </csv-export>
      <el-button
        :type="selectedStudents.length ? 'danger' : 'default'"
        :disabled="!selectedStudents.length"
        @click="studentLeavingVisible = true"
      >
        休退会処理
      </el-button>
    </template>

    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          v-if="field.prop === 'operation'"
          fixed="right"
          label="操作"
          width="50"
        >
          <template #default="scope">
            <el-button
              text
              type="primary"
              @click.prevent="linkToProfile(scope.row.id)"
              >編集</el-button
            >
          </template>
        </el-table-column>

        <el-table-column
          v-else
          :label="field.label"
          :sortable="field.sort"
          :prop="field.prop"
          :min-width="field.labelWidth"
          show-overflow-tooltip
        >
          <template #default="scope">
            <template v-if="field.prop === 'student_status'">
              <c-status-dot
                :status="
                  StatusType[StudentStatus[scope.row.student_status]] ||
                  'danger'
                "
              >
                {{ scope.row.student_status }}
              </c-status-dot>
            </template>

            <template v-else-if="field.prop === 'name'">
              <el-button text type="primary" @click="showModal(scope.row)">{{
                scope.row.name
              }}</el-button>
            </template>
            <template v-else-if="field.prop === 'pay_type'">{{
              PayType[scope.row[field.prop]]
            }}</template>
            <template v-else-if="field.prop === 'does_agree_terms'">
              <div
                v-if="scope.row[field.prop]"
                class="flex justify-center items-center w-4 h-4 rounded-full border border-solid border-current"
              >
                <c-icon-font
                  height="16px"
                  name="icon-right"
                  color="var(--el-text-color-regular)"
                />
              </div>
            </template>

            <template v-else-if="field.prop === 'student_groups'">
              <template
                v-if="
                  studentGroupsRender([scope.row.student_groups]).components
                "
              >
                <c-component
                  v-for="(component, i) in studentGroupsRender([
                    scope.row.student_groups,
                  ]).components"
                  v-bind="component"
                  :key="i"
                />
              </template>
            </template>

            <template v-else-if="field.prop === 'zengin_setting'">
              <!-- 112 -->
              <template
                v-for="(component, i) in zenginSettingRender([
                  scope.row[field.prop],
                ]).components"
                :key="i"
              >
                <c-component v-bind="component" />
              </template>
            </template>

            <template v-else-if="field.prop === 'leave'">
              <template
                v-for="(component, i) in leaveRender([scope.row[field.prop]], {
                  labelWidth: '232px',
                }).components"
                :key="i"
              >
                <c-component v-bind="component"> </c-component>
              </template>
            </template>

            <template v-else-if="field.prop === 'siblings'">
              <template
                v-for="(component, i) in siblingsRender([scope.row[field.prop]])
                  .components"
                :key="i"
              >
                <c-component v-bind="component" />
              </template>
            </template>

            <template
              v-else-if="['courses_name', 'classes_name'].includes(field.prop)"
            >
              {{
                scope.row[field.prop]?.length
                  ? scope.row[field.prop].map((item) => item.name).join(', ')
                  : ''
              }}
            </template>

            <template v-else>
              {{ fieldFormatter(scope.row[field.prop], field.prop) }}
            </template>
          </template>
        </el-table-column>
      </template>
    </template>
  </c-list-table>

  <c-table-field-dialog
    v-model="tableFieldsVisible"
    v-model:checked-fields="selectedFields"
    title="カスタムアライメント"
    :field-configs="StudentFieldsConfig"
  ></c-table-field-dialog>

  <student-leaving-dialog
    v-model="studentLeavingVisible"
    title="休退会処理"
    :student-ids="selectedStudents.map(({ id }) => id)"
    @confirm-success="getList"
  />

  <student-filters-dialog
    v-model="tableFilterVisible"
    title="フィルタ"
    @filter-submit="syncFilters"
  />

  <c-drawer v-model="drawerVisible" @confirm="linkToProfile(currentStudent.id)">
    <template #title>
      <div>
        <el-avatar
          v-if="currentStudent.icon_url"
          :size="24"
          class="align-middle mr-1"
          :src="currentStudent.icon_url"
        ></el-avatar>
        {{ currentStudent.name }}
        <c-status-dot
          :status="
            StatusType[StudentStatus[currentStudent.student_status]] || 'danger'
          "
          class="ml-2"
        >
          {{ currentStudent.student_status }}
        </c-status-dot>
      </div>
    </template>
    <div
      v-for="(info, index) in personalInfo"
      :key="index"
      class="leading-loose"
    >
      <p class="text-[16px] font-medium mb-2">{{ info.title }}</p>
      <div v-if="drawerVisible" class="grid grid-cols-3 gap-1">
        <template v-for="item in info.data" :key="item.label">
          <span
            :class="item.classes"
            class="grid gap-1 leading-6 py-2"
            style="grid-template-columns: auto 1fr"
          >
            {{ item.label }}:
            <div
              v-if="item.field === 'does_agree_terms'"
              class="inline-block"
              :class="{ 'align-text-bottom': item.value }"
            >
              <div
                v-if="item.value"
                class="flex justify-center items-center w-4 h-4 rounded-full border border-solid border-current"
              >
                <c-icon-font
                  height="16px"
                  name="icon-right"
                  color="var(--el-text-color-regular)"
                />
              </div>
              <template v-else>-</template>
            </div>

            <div v-else-if="item?.components">
              <c-component
                v-for="(component, i) in item.components"
                :key="i"
                v-bind="component"
              ></c-component>
            </div>
            <span v-else>
              {{ emptyFieldFormatter(item.value).value }}
            </span>
          </span>
        </template>
      </div>
      <el-divider v-if="index + 1 < personalInfo.length"></el-divider>
    </div>
  </c-drawer>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import StudentFiltersDialog from './StudentFiltersDialog.vue';
  import CTableFieldDialog from '@/components/table/CTableFieldDialog.vue';
  import StudentLeavingDialog from './StudentLeavingDialog.vue';
  import {
    PayType,
    StatusType,
    StudentFieldsMap,
    ButtonIconHeight,
    StorageKeys,
    DefaultPageSize,
  } from '@/constants';

  import { emptyFieldFormatter } from '@/utils';
  import { getStudents } from '@/services';
  import CStatusDot from '@/components/CStatusDot.vue';
  import {
    studentGroupsRender,
    zenginSettingRender,
    leaveRender,
    periodRender,
    telsRender,
    isActiveAppRender,
    semesterTypeRender,
    siblingsRender,
  } from './studentFieldRender';
  import CComponent from '@/components/CComponent.vue';
  const route = useRoute();
  const query = computed(() => route.query || {});
  const tableData = ref<any>([]);
  const loading = ref(false);
  const sortFields = ref();

  function fieldFormatter(fieldValue, field) {
    const { isEmpty, value } = emptyFieldFormatter(fieldValue, '');
    if (isEmpty) {
      return value;
    }
    if (field === 'tels') {
      return telsRender([fieldValue]).value;
    }
    if (field === 'is_alumni') {
      return booleanTranslater(fieldValue);
    }
    if (field === 'is_active_app') {
      return isActiveAppRender([fieldValue]).value;
    }
    if (field === 'period') {
      return periodRender([fieldValue]).value;
    }
    return fieldValue;
  }

  const filters = ref(
    Object.assign({}, query.value, { page: undefined, pageSize: undefined })
  );
  function syncFilters(filterForm) {
    // if (!Object.keys(filterForm).length) return;
    console.log('receive filter data', filterForm);
    tableFilterVisible.value = false;
    filters.value = filterForm;
    getList();
  }

  function handlePageChange(newCurrentPage: number) {
    console.log('newCurrentPage', newCurrentPage);
    currentPage.value = newCurrentPage;
    const query = {
      ...route.query,
      page: newCurrentPage,
    };

    reloadWithQuery(query);
    getList();
  }

  enum StudentStatus {
    '在籍',
    '復会',
    '休会',
    '退会',
    '削除',
  }

  const router = useRouter();

  interface IPersonalInfo {
    title: string;
    data: any[];
  }

  const currentPage = ref(+(query.value?.page || 1));
  const pageSize = ref(+(query.value?.pageSize || DefaultPageSize));
  const total = ref(0);
  const drawerVisible = ref(false);

  const defaultSortFields = [
    'student_no',
    'id',
    'grade',
    'created_at',
    'updated_at',
  ];

  const defaultSelectedFields = localStorage
    .getItem(StorageKeys.studentFields)
    ?.split(',') || [
    'student_no',
    'corporation_code',
    'name',
    'grade',
    'sex',
    'school_name',
    'leave',
    'operation',
  ];
  const StudentFieldsConfig = reactive(
    Object.entries(StudentFieldsMap).map(([prop, label]) => ({
      label,
      labelWidth: ['created_at', 'updated_at', 'start_date'].includes(prop)
        ? 205
        : ['leave', 'zengin_setting'].includes(prop)
        ? 236
        : ['sex'].includes(prop)
        ? 64
        : label.length > 4
        ? 20 + label.length * 15
        : 120,
      prop,
      show: defaultSelectedFields.includes(prop),
      sort: defaultSortFields.includes(prop) && 'custom',
    }))
  );

  // it should be filter by default
  const selectedFields = ref(
    StudentFieldsConfig.filter((config) => config.show)
  );

  const tableFieldsVisible = ref(false);

  watch(selectedFields, (newVal) => {
    if (newVal) {
      localStorage.setItem(
        StorageKeys.studentFields,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  const tableFilterVisible = ref(false);
  const studentLeavingVisible = ref(false);
  const selectedStudents = ref([]);

  function reloadWithQuery(query) {
    router.replace({
      path: route.path,
      query,
    });
  }

  function handleSizeChange(newPageSize) {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    const query = {
      ...route.query,
      pageSize: newPageSize,
      page: 1,
    };
    reloadWithQuery(query);
    getList();
  }

  function handleSortChange({ prop, order }) {
    if (!order) {
      sortFields.value = undefined;
    } else {
      const obj = {
        descending: 'desc',
      };
      console.log(order);
      sortFields.value = {
        [prop]: obj[order] || 'asc',
      };
    }
    getList();
  }

  async function getList() {
    loading.value = true;
    console.log('getList filters', filters.value);
    try {
      const { items, total_records } = await getStudents({
        page: currentPage.value,
        pagesize: pageSize.value,
        order_by: sortFields.value,
        ...(filters.value ? { search: filters.value } : {}),
      });
      if (items) {
        tableData.value = items;
      }
      total.value = total_records;
      selectedStudents.value = [];
    } finally {
      loading.value = false;
    }
  }

  function booleanTranslater(value: boolean, descriptions = ['否', '是']) {
    return descriptions[+value];
  }

  const EmptyPlaceholder = '-';

  function handelSelect(selection) {
    selectedStudents.value = selection;
  }

  // 这里考虑用 map 重构
  const personalInfo = computed<IPersonalInfo[]>(() => {
    const {
      student_no,
      id,
      corporation_code,
      grade,
      student_type,
      sex,
      real_birthday,
      tel,
      tels,
      zip,
      prefecture,
      address,
      address2,
      classes_name,
      courses_name,
      in_school_date,
      zengin,
      pay_type,
      start_date,
      out_school_date,
      period,
      school_name,
      siblings,
      emergency_contact_name,
      parent_name,
      zengin_setting,
      emergency_contact_phone,
      is_alumni,
      is_active_app,
      does_agree_terms,
      student_groups,
      leave,
      education_name,
      education_type,
      semester_type,
      line_status,
      email_status,
      card_status,
      veritrans_status,
    } = currentStudent.value;

    return [
      {
        title: '個人基本情報',
        data: [
          {
            label: '生徒番号',
            value: student_no,
          },
          {
            label: 'ID',
            value: id,
          },
          {
            label: '教室',
            value: school_name,
          },
          {
            label: '会社生徒コード',
            value: corporation_code,
          },
          {
            label: '学年',
            value: grade,
          },

          {
            label: '生徒区分',
            value: student_type,
          },
          {
            label: '性別',
            value: sex,
          },
          {
            label: '生年月日',
            value: real_birthday,
          },
          {
            label: '電話番号',
            value: tel,
          },
          telsRender([tels, EmptyPlaceholder], {
            classes: 'col-span-3',
          }),
          {
            label: '郵便番号',
            value: zip,
          },

          {
            label: '都道府県',
            value: prefecture,
          },
          {
            label: '住所',
            value: address,
          },
          {
            label: '住所2',
            value: address2,
          },

          {
            label: 'コース名',
            value:
              (courses_name?.length &&
                courses_name.map((item) => item.name).join(', ')) ||
              EmptyPlaceholder,
          },
          {
            label: 'クラス名',
            value:
              (classes_name?.length &&
                classes_name.map((item) => item.name).join(', ')) ||
              EmptyPlaceholder,
          },

          siblingsRender([siblings, EmptyPlaceholder], {
            classes: 'col-span-3',
          }),

          {
            label: '保護者名',
            value: parent_name,
          },
          {
            label: '緊急連絡先名',
            value: emergency_contact_name,
          },
          {
            label: '緊急連絡先電話番号',
            value: emergency_contact_phone,
          },
        ],
      },
      {
        title: '学校情報',
        data: [
          {
            label: '学校区分',
            value: education_type,
          },

          {
            label: '学校',
            value: education_name,
          },
          semesterTypeRender([semester_type, EmptyPlaceholder]),
          studentGroupsRender([student_groups, EmptyPlaceholder], {
            label: 'グループ',
            classes: 'col-span-3',
          }),
          {
            label: '支払方法',
            value: PayType[pay_type],
          },
          {
            label: '生徒口座情報',
            value: zengin,
            classes: 'col-span-2',
          },
          {
            label: '入会日',
            value: in_school_date,
          },
          {
            label: '授業開始日',
            value: start_date,
          },

          {
            label: '退会日',
            value: out_school_date,
          },

          periodRender([period, EmptyPlaceholder]),

          zenginSettingRender([zengin_setting, EmptyPlaceholder], {
            classes: 'col-span-3',
          }),
          leaveRender([leave, EmptyPlaceholder], {
            classes: 'col-span-3',
          }),
          {
            label: '初回ログイン',
            value: does_agree_terms,
            field: 'does_agree_terms',
          },
          isActiveAppRender([is_active_app, EmptyPlaceholder]),
          {
            label: 'LINE',
            value: line_status || EmptyPlaceholder,
          },
          {
            label: 'メールアドレス',
            value: email_status || EmptyPlaceholder,
          },
          {
            label: 'クレジットカード',
            value: card_status || EmptyPlaceholder,
          },
          {
            label: 'ベリトランス口座',
            value: veritrans_status || EmptyPlaceholder,
          },
          {
            label: '卒業生',
            value: booleanTranslater(is_alumni),
          },
        ],
      },
    ];
  });

  function linkToProfile(studentID) {
    router.push({ name: 'StudentProfile', params: { id: studentID } });
  }
  function linkToGroup() {
    router.push({ name: `StudentGroup` });
  }
  function linkToCreate() {
    router.push({ name: `StudentCreate` });
  }
  const currentStudent = ref<Record<string, any>>({});
  function showModal(row) {
    currentStudent.value = row;
    drawerVisible.value = true;
  }

  getList();
</script>
