<template>
  <c-list-table
    v-loading="loading"
    :data="tableData"
    :total="total"
    @sort-change="handleSortChange"
    @filter="tableFilterVisible = true"
    @setting="tableFieldsVisible = true"
    @refetch="getTeacherList"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
    @select="handelSelect"
  >
    <template #header-left>
      <el-button type="primary" @click="linkToCreate">
        <c-icon-font name="icon-add" :size="ButtonIconHeight.default" />新規
      </el-button>
      <el-dropdown class="mx-3" @command="linkToSchool">
        <el-button type="primary" plain>
          <c-icon-font
            name="icon-add"
            :size="ButtonIconHeight.default"
          />教室変更
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="TeacherSchoolAdd"
              >教室に追加</el-dropdown-item
            >
            <el-dropdown-item command="TeacherSchoolRemove"
              >教室から削除</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="primary" plain @click="linkToPermission">
        <c-icon-font
          name="icon-add"
          :size="ButtonIconHeight.default"
        />権限CSVアップロード
      </el-button>
      <!-- <el-button plain>
        <c-icon-font
          name="icon-Download"
          :size="ButtonIconHeight.default"
        />権限CSVダウンロード
      </el-button> -->
      <csv-export
        :selected-ids="selectedTeachers.map(({ id }) => id)"
        filename="講師情報"
        action="teachers/csv-data"
        :total="total"
        :sort="sortFields"
        class="mx-3"
      >
      </csv-export>
      <teacher-condition-csv-export
        v-if="conditionalCsvPermission"
      ></teacher-condition-csv-export>
    </template>

    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          v-if="field.prop === 'operation'"
          fixed="right"
          label="操作"
          width="60"
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
            <template v-if="field.prop === 'name'">
              <el-button text type="primary" @click="showModal(scope.row)">{{
                scope.row.name
              }}</el-button>
            </template>
            <template v-else-if="field.prop === 'school_name'">
              <c-component
                v-for="component in schoolNameRender([scope.row[field.prop]])
                  .components"
                v-bind="component"
                :key="`${field.prop}-${component.uniqKey}`"
              />
            </template>
            <template v-else-if="field.prop === 'status'">
              <c-component
                v-for="component in statusRender([scope.row[field.prop]])
                  .components"
                v-bind="component"
                :key="`${field.prop}-${component.uniqKey}`"
              />
            </template>

            <template v-else-if="field.prop === 'attachments'">
              <el-button
                v-for="item in scope.row.attachments"
                :key="item.file_id"
                text
                type="primary"
                @click="showModal(scope.row, item.file_id)"
              >
                {{ item.file_name }}</el-button
              >
            </template>

            <template v-else>
              {{ fieldFormatter(scope.row[field.prop], field.prop) }}
            </template>
          </template>
        </el-table-column>
      </template>
    </template>
  </c-list-table>

  <c-drawer
    v-model="drawerVisible"
    @confirm="linkToProfile(current.id)"
    @opened="scrollToTarget"
  >
    <template #title>
      <div>
        <el-avatar
          v-if="current.icon_url"
          :size="24"
          class="align-middle mr-1"
          :src="current.icon_url"
        ></el-avatar>
        {{ current.name }}
      </div>
    </template>
    <div
      v-for="(info, index) in personalInfo"
      :key="index"
      class="leading-loose"
      :class="{ 'teacher-basic': index === 0 }"
    >
      <p class="text-[16px] font-medium mb-2">{{ info.title }}</p>
      <div v-if="drawerVisible" class="grid grid-cols-3 gap-1">
        <template
          v-for="item in info.data"
          :key="`${current.id}-${item.label}`"
        >
          <span
            :class="item.classes"
            class="grid gap-1 leading-6 py-2"
            style="grid-template-columns: auto 1fr"
          >
            {{ item.label }}:

            <div v-if="item?.components">
              <c-component
                v-for="component in item.components"
                v-bind="component"
                :key="`${current.id}-${item.label}-${component.uniqKey}`"
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

  <c-table-field-dialog
    v-model="tableFieldsVisible"
    v-model:checked-fields="selectedFields"
    title="カスタムアライメント"
    :field-configs="fieldsConfig"
  ></c-table-field-dialog>

  <teacher-filters-dialog
    v-model="tableFilterVisible"
    title="フィルタ"
    @filter-submit="syncFilters"
  />
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import TeacherFiltersDialog from '@/views/teachers/list/TeacherFiltersDialog.vue';
  import CTableFieldDialog from '@/components/table/CTableFieldDialog.vue';
  import CListTable from '@/components/table/CListTable.vue';
  import TeacherConditionCsvExport from './TeacherConditionCsvExport.vue';

  import {
    TeacherFieldsMap,
    ButtonIconHeight,
    StorageKeys,
    DefaultPageSize,
  } from '@/constants';

  import { emptyFieldFormatter } from '@/utils';
  import { getTeachers, getTeacherInfo } from '@/services';
  import {
    schoolNameRender,
    gradeRender,
    sexRender,
    emergencyContactTelsRender,
    memosRender,
    periodRender,
    emergencyContactNamesRender,
    startDaysRender,
    statusRender,
    educationNamesRender,
    introducersRender,
    departmentNamesRender,
    isActiveAppRender,
    isBrowserLoggedInRender,
    attachmentsRender,
  } from './teacherFieldRender';
  import CComponent from '@/components/CComponent.vue';
  const route = useRoute();
  const query = computed(() => route.query || {});
  const tableData = ref<any>([]);
  const loading = ref(false);
  const sortFields = ref();
  const current = ref<Record<string, any>>({});
  const conditionalCsvPermission = ref(false);

  interface IPersonalInfo {
    title: string;
    data: any[];
  }

  const EmptyPlaceholder = '-';
  const joinSymbol = '、';

  const personalInfo = computed<IPersonalInfo[]>(() => {
    const {
      school_name,
      id,
      corporation_code,
      name_kana,

      email,
      status,
      tel,
      zip,

      grade,
      address,
      address2,
      birthday,

      sex,
      details,
      periods,
      rank,

      is_browser_logged_in,
      is_active_app,
      created_at,
      updated_at,
    } = current.value;

    const emergency_contact_tels: Record<string, string>[] = [];
    const emergency_contact_names: Record<string, string>[] = [];
    const education_names: Record<string, string>[] = [];
    const department_names: Record<string, string>[] = [];

    const introducers: Record<string, string>[] = [];
    const memos: Record<string, string>[] = [];
    const start_days: Record<string, string>[] = [];
    const attachments: Record<string, string>[] = [];

    if (details?.length) {
      details.map((item) => {
        const {
          emergency_contact_tel,
          emergency_contact_name,
          education,
          department,

          introducer,
          note,
          start_day,
          attrachments,
          school,
        } = item;

        emergency_contact_tel &&
          emergency_contact_tels.push({
            name: school.name,
            emergency_contact_tel,
          });

        emergency_contact_name &&
          emergency_contact_names.push({
            name: school.name,
            emergency_contact_name,
          });

        education?.name &&
          education_names.push({
            name: school.name,
            education_name: education.name,
          });

        department?.name &&
          department_names.push({
            name: school.name,
            department_name: department.name,
          });

        introducer &&
          introducers.push({
            name: school.name,
            introducer,
          });

        note &&
          memos.push({
            name: school.name,
            note,
          });

        start_day &&
          start_days.push({
            name: school.name,
            start_day,
          });

        attrachments?.length &&
          attachments.push({
            schoolName: school.name,
            data: attrachments,
          });
      });
    }

    return [
      {
        title: '講師基本情報',
        data: [
          {
            label: 'ID',
            value: id,
          },
          {
            label: '会社講師コード',
            value: corporation_code,
          },

          {
            label: 'フリガナ',
            value: name_kana,
          },
          sexRender([sex, EmptyPlaceholder]),

          {
            label: '生年月日',
            value: birthday,
          },
          {
            label: '講師ランク',
            value: rank,
          },
          gradeRender([grade, EmptyPlaceholder]),
          {
            label: '電話番号',
            value: tel,
          },
          {
            label: '郵便番号',
            value: zip,
          },
          isBrowserLoggedInRender([is_browser_logged_in, EmptyPlaceholder]),
          isActiveAppRender([is_active_app, EmptyPlaceholder]),

          {
            label: 'メールアドレス',
            value: email,
            classes: 'col-span-3',
          },

          {
            label: '住所',
            value: address,
            classes: 'col-span-3',
          },
          {
            label: '住所2',
            value: address2,
            classes: 'col-span-3',
          },
          {
            label: '作成日時',
            value: created_at,
            classes: 'col-span-3',
          },
          {
            label: '更新日時',
            value: updated_at,
            classes: 'col-span-3',
          },
        ],
      },

      {
        title: '講師詳細情報',
        data: [
          schoolNameRender([school_name, EmptyPlaceholder], {
            classes: 'col-span-3',
          }),
          statusRender([status, EmptyPlaceholder], {
            classes: 'col-span-3',
          }),
          emergencyContactTelsRender(
            [emergency_contact_tels, EmptyPlaceholder, joinSymbol],
            {
              classes: 'col-span-3',
            }
          ),

          emergencyContactNamesRender(
            [emergency_contact_names, EmptyPlaceholder, joinSymbol],
            {
              classes: 'col-span-3',
            }
          ),

          educationNamesRender(
            [education_names, EmptyPlaceholder, joinSymbol],
            {
              classes: 'col-span-3',
            }
          ),
          departmentNamesRender(
            [department_names, EmptyPlaceholder, joinSymbol],
            {
              classes: 'col-span-3',
            }
          ),
          introducersRender([introducers, EmptyPlaceholder, joinSymbol], {
            classes: 'col-span-3',
          }),
          startDaysRender([start_days, EmptyPlaceholder, joinSymbol], {
            classes: 'col-span-3',
          }),
          periodRender([periods, EmptyPlaceholder, joinSymbol], {
            classes: 'col-span-3',
          }),
          memosRender([memos, EmptyPlaceholder, joinSymbol], {
            classes: 'col-span-3',
          }),

          attachmentsRender([attachments, EmptyPlaceholder], {
            classes: 'col-span-3',
          }),
        ],
      },
    ];
  });

  function fieldFormatter(fieldValue, field) {
    const { isEmpty, value } = emptyFieldFormatter(fieldValue, '');
    if (isEmpty) {
      return value;
    }
    if (field === 'grade') {
      return gradeRender([fieldValue]).value;
    }
    if (field === 'sex') {
      return sexRender([fieldValue]).value;
    }
    if (field === 'emergency_contact_tels') {
      return emergencyContactTelsRender([fieldValue]).value;
    }
    if (field === 'emergency_contact_names') {
      return emergencyContactNamesRender([fieldValue]).value;
    }
    if (field === 'education_names') {
      return educationNamesRender([fieldValue]).value;
    }
    if (field === 'department_names') {
      return departmentNamesRender([fieldValue]).value;
    }
    if (field === 'introducers') {
      return introducersRender([fieldValue]).value;
    }
    if (field === 'start_days') {
      return startDaysRender([fieldValue]).value;
    }

    if (field === 'memos') {
      return memosRender([fieldValue]).value;
    }
    if (field === 'periods') {
      return periodRender([fieldValue]).value;
    }

    return fieldValue;
  }

  const filters = ref();
  function syncFilters(filterForm) {
    if (!Object.keys(filterForm).length) {
      return;
    }
    console.log('receive filter data', filterForm);
    tableFilterVisible.value = false;
    filters.value = filterForm;
  }

  const router = useRouter();

  const currentPage = ref(+(query.value?.page || 1));
  const pageSize = ref(+(query.value?.pageSize || DefaultPageSize));
  const total = ref(0);
  const drawerVisible = ref(false);

  const defaultSortFields = ['id'];
  const settingField = StorageKeys.teacherFields;

  const defaultSelectedFields = localStorage
    .getItem(settingField)
    ?.split(',') || [
    'id',
    'name',
    'name_kana',
    'email',
    'school_name',
    'status',
    'tel',
    'zip',
    'grade',

    'memos',
    'is_browser_logged_in',
    'updated_at',
    'operation',
  ];
  const fieldsConfig = reactive(
    Object.entries(TeacherFieldsMap).map(([prop, label]) => ({
      label,
      labelWidth: ['created_at', 'updated_at'].includes(prop)
        ? 205
        : ['leave', 'school_name'].includes(prop)
        ? 160
        : label.length > 4
        ? 20 + label.length * 15
        : 120,
      prop,
      show: defaultSelectedFields.includes(prop),
      sort: defaultSortFields.includes(prop) && 'custom',
    }))
  );

  // it should be filter by default
  const selectedFields = ref(fieldsConfig.filter((config) => config.show));

  const tableFieldsVisible = ref(false);

  watch(selectedFields, (newVal) => {
    if (newVal) {
      localStorage.setItem(
        settingField,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  watch(
    filters,
    function (val) {
      // change url search
      const dateKeys = ['period_days', 'period_months'];
      const query = {};
      for (const key in val) {
        // TODO
        if (![null, undefined, ''].includes(val[key])) {
          if (dateKeys.includes(key)) {
            const isEmpty = Object.values(val[key]).every((item) => !item);
            if (!isEmpty) {
              query[key] = JSON.stringify(val[key]);
            }
          } else {
            query[key] = val[key];
          }
        }
      }
      query['page'] = 1;
      console.log('filter changed', query);
      reloadWithQuery(query);
      getTeacherList();
    },
    { deep: true }
  );

  const tableFilterVisible = ref(false);
  const selectedTeachers = ref([]);

  const handelSelect = (selection) => {
    selectedTeachers.value = selection;
  };

  function reloadWithQuery(query) {
    router.replace({
      path: route.path,
      query,
    });
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
    getTeacherList();
  }

  async function getTeacherList() {
    loading.value = true;
    try {
      const { items, total_records, export_by_condition_permission } =
        await getTeachers({
          page: currentPage.value,
          pagesize: pageSize.value,
          order_by: sortFields.value,
          ...(filters.value ? { search: filters.value } : {}),
        });
      if (items) {
        tableData.value = items;
      }
      conditionalCsvPermission.value = export_by_condition_permission;
      total.value = total_records;
    } finally {
      loading.value = false;
      selectedTeachers.value = [];
    }
  }

  function handleSizeChange(newPageSize) {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    getTeacherList();
  }

  function handlePageChange(newCurrentPage: number) {
    currentPage.value = newCurrentPage;
    getTeacherList();
  }

  function linkToProfile(studentID) {
    router.push({ name: 'TeacherProfile', params: { id: studentID } });
  }
  function linkToPermission() {
    router.push({ name: 'TeacherRoleUpload' });
  }
  function linkToCreate() {
    router.push({ name: 'TeacherCreate' });
  }

  function linkToSchool(name) {
    router.push({ name });
  }

  const drawerTargetId = ref('');
  function showModal(row, targetId?: string) {
    getTeacherInfo(row.id).then((data) => {
      current.value = data;
      drawerVisible.value = true;
      drawerTargetId.value = targetId || '';
    });
  }

  function scrollToTarget() {
    const el = document.querySelector(
      drawerTargetId.value ? `#file-${drawerTargetId.value}` : '.teacher-basic'
    );
    el?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }
</script>
