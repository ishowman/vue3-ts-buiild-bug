<template>
  <c-list-table
    v-loading="loading"
    :data="tableData"
    :total="total"
    has-checkbox
    @sort-change="handleSortChange"
    @select="selectChanged"
    @refetch="getList"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
    @setting="tableFieldsVisible = true"
    @filter="tableFilterVisible = true"
  >
    <template #header-left>
      <csv-export
        :selected-ids="selectedRows.map(({ id }) => id)"
        filename="集団指導報告書情報"
        action="/group/reports/download-csv"
        :total="total"
        class="mr-3"
        :show-percent="false"
        :sort="sortFields"
      >
      </csv-export>
    </template>

    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          :label="field.label"
          :sortable="field.sort"
          :prop="field.prop"
          :min-width="field.labelWidth"
          show-overflow-tooltip
        >
          <template #default="scope">
            <template v-if="field.prop === 'date'">
              <a
                v-if="scope.row.has_detail"
                href="#"
                @click.prevent="showInfo(scope.row)"
                >{{ scope.row.date }}</a
              >
              <span v-else>{{ scope.row.date }}</span>
            </template>
            <template v-if="['status', 'is_read'].includes(field.prop)">
              <c-icon-font
                v-if="scope.row[field.prop]"
                name="icon-right1"
                :size="ButtonIconHeight.default"
              />
            </template>
          </template>
        </el-table-column>
      </template>
    </template>
  </c-list-table>
  <group-report-filters-dialog
    v-model="tableFilterVisible"
    title="フィルタ"
    @filter-submit="syncFilters"
  />
  <c-table-field-dialog
    v-model="tableFieldsVisible"
    v-model:checked-fields="selectedFields"
    title="カスタムアライメント"
    :field-configs="fieldsConfig"
  ></c-table-field-dialog>
  <el-drawer v-model="drawerVisible" :title="drawerTitle" direction="rtl">
    <el-skeleton v-if="drawerLoading" :rows="5" animated />
    <template v-else>
      <template v-if="reportInfo.lesson_text">
        <p class="mb-2 text-[16px]">授業内容</p>
        <p
          class="bg-gray-100 rounded-md border-solid border-gray-200 p-2 mb-4 whitespace-pre-wrap"
        >
          {{ reportInfo.lesson_text }}
        </p>
      </template>
      <template v-if="reportInfo.homework_text">
        <p class="mb-2 text-[16px]">宿題</p>
        <p
          class="bg-gray-100 rounded-md border-solid border-gray-200 p-2 mb-4 whitespace-pre-wrap"
        >
          {{ reportInfo.homework_text }}
        </p>
      </template>
      <template v-if="reportInfo.comment">
        <p class="mb-2 text-[16px]">コメント</p>
        <p
          class="bg-gray-100 rounded-md border-solid border-gray-200 p-2 mb-4 whitespace-pre-wrap"
        >
          {{ reportInfo.comment }}
        </p>
      </template>
      <template v-if="reportInfo.note">
        <p class="mb-2 text-[16px]">注記</p>
        <p
          class="bg-gray-100 rounded-md border-solid border-gray-200 p-2 mb-4 whitespace-pre-wrap"
        >
          {{ reportInfo.note }}
        </p>
      </template>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
  import { computed, ref, watch, reactive } from 'vue';
  import { useRoute } from 'vue-router';
  import {
    groupReportFieldsConfig,
    StorageKeys,
    DefaultPageSize,
    ButtonIconHeight,
  } from '@/constants';
  import {
    getGroupReportsList,
    getGroupReportInfo,
    type IGroupReportItem,
    type IGroupReportInfo,
  } from '@/services';

  import CListTable from '@/components/table/CListTable.vue';
  import GroupReportFiltersDialog from './GroupReportFiltersDialog.vue';

  const route = useRoute();

  const loading = ref<boolean>(false);
  const tableFieldsVisible = ref<boolean>(false);
  const tableFilterVisible = ref<boolean>(false);
  const query = computed(() => route.query || {});
  const tableData = ref<IGroupReportItem[]>([]);
  const sortFields = ref();

  const defaultSortFields = ['status', 'group_name', 'created_at'];
  const defaultSelectedFields = localStorage
    .getItem(StorageKeys.groupReportFields)
    ?.split(',') || [
    'school_name',
    'group_name',
    'date',
    'subjects',
    'teacher_name',
    'status',
    'created_at',
  ];
  const fieldsConfig = groupReportFieldsConfig.map((item) => {
    return {
      ...item,
      show: defaultSelectedFields.includes(item.prop),
      sort: defaultSortFields.includes(item.prop) && 'custom',
    };
  });

  const selectedFields = ref(fieldsConfig.filter((config) => config.show));
  const currentPage = ref<number>(+(query.value?.page || 1));
  const pageSize = ref<number>(+(query.value?.pageSize || DefaultPageSize));
  const total = ref<number>(0);
  const selectedRows = ref<IGroupReportItem[]>([]);
  const filters = ref<any>(
    Object.assign({}, query.value, { page: undefined, pageSize: undefined })
  );
  const drawerVisible = ref<boolean>(false);
  const drawerTitle = ref<string>('');
  const drawerLoading = ref<boolean>(false);
  const reportInfo = reactive<IGroupReportInfo>({
    date: '',
    lesson_text: '',
    homework_text: '',
    comment: '',
    note: '',
  });

  watch(selectedFields, (newVal) => {
    if (newVal) {
      localStorage.setItem(
        StorageKeys.groupReportFields,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  const showInfo = async (row: IGroupReportItem) => {
    drawerVisible.value = true;
    drawerTitle.value = row.date;
    try {
      drawerLoading.value = true;
      const result = await getGroupReportInfo({ id: row.id });
      Object.assign(reportInfo, result);
    } finally {
      drawerLoading.value = false;
    }
  };

  async function getList() {
    loading.value = true;
    try {
      const { items, total_records } = await getGroupReportsList({
        page: currentPage.value,
        pagesize: pageSize.value,
        order_by: sortFields.value,
        ...(filters.value ? { search: filters.value } : {}),
      });
      if (items) {
        tableData.value = items;
      }
      total.value = total_records;
    } finally {
      loading.value = false;
    }
  }

  function syncFilters(filterForm) {
    tableFilterVisible.value = false;
    filters.value = filterForm;
    getList();
  }

  function selectChanged(selection) {
    selectedRows.value = selection;
  }

  function handleSortChange({ prop, order }) {
    if (!order) {
      sortFields.value = undefined;
    } else {
      const obj = {
        descending: 'desc',
      };
      sortFields.value = {
        [prop]: obj[order] || 'asc',
      };
    }
    getList();
  }

  function handleSizeChange(newPageSize) {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    getList();
  }

  function handlePageChange(newCurrentPage: number) {
    currentPage.value = newCurrentPage;
    getList();
  }

  getList();
</script>
