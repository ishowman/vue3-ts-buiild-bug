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
      <el-button plain type="primary" @click="linkToCopy">データ複製</el-button>
      <el-button
        plain
        :type="selectedRows.length ? 'primary' : 'default'"
        :disabled="selectedRows.length === 0"
        @click="linkToOmise"
        >omiseAPI設定</el-button
      >
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
            <template v-if="field.prop === 'name'">
              <a href="#" @click.prevent="showInfo(scope.row)">{{
                scope.row.name
              }}</a>
            </template>
          </template>
        </el-table-column>
      </template>
    </template>
  </c-list-table>
  <report-filters-dialog
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
    <p class="mb-4">
      システムオーナー: <span class="ml-1">{{ schoolInfo.owner_name }}</span>
    </p>
    <p class="mb-4">
      2C請求書設定:
      <el-tag class="ml-1">{{ schoolInfo.is_using_pinvoice }}</el-tag>
    </p>
    <p class="mb-4">
      シークレットキー: <span class="ml-1">{{ schoolInfo.omise_secret }}</span>
    </p>
    <p class="mb-4">
      パブリックキー: <span class="ml-1">{{ schoolInfo.omise_public }}</span>
    </p>
    <p class="mb-4">
      スクールLINEプッシュ:
      <el-tag type="danger" class="ml-1">{{
        schoolInfo.is_using_school_line
      }}</el-tag>
    </p>
    <p class="mb-4">
      グループ:
      <el-tag
        v-for="group in schoolInfo.groups"
        :key="group.id"
        class="ml-1"
        type="success"
        >{{ group.name }}</el-tag
      >
    </p>
    <p class="mb-4">
      作成日時: <span class="ml-1">{{ schoolInfo.created_at }}</span>
    </p>
  </el-drawer>
</template>

<script lang="ts" setup>
  import { computed, ref, watch, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import {
    schoolFieldsConfig,
    StorageKeys,
    DefaultPageSize,
  } from '@/constants';
  import { getSchoolListByPage } from '@/services';

  import CListTable from '@/components/table/CListTable.vue';
  import ReportFiltersDialog from './FilterDialog.vue';

  interface SchoolInfo {
    owner_name: string;
    is_using_pinvoice: string;
    omise_secret: string;
    omise_public: string;
    is_using_school_line: string;
    groups: { id: number; name: string }[];
    created_at: string;
  }

  const route = useRoute();
  const router = useRouter();

  const loading = ref<boolean>(false);
  const tableFieldsVisible = ref<boolean>(false);
  const tableFilterVisible = ref<boolean>(false);
  const query = computed(() => route.query || {});
  const tableData = ref([]);
  const sortFields = ref();

  const defaultSortFields = ['id', 'slug'];
  const defaultSelectedFields = localStorage
    .getItem(StorageKeys.schoolFields)
    ?.split(',') || [
    'id',
    'slug',
    'name',
    'name_kana',
    'fc_flag',
    'zip',
    'address',
    'address2',
    'tel',
    'email',
  ];
  const fieldsConfig = schoolFieldsConfig.map((item) => {
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
  const selectedRows = ref<any>([]);
  const filters = ref<any>(
    Object.assign({}, query.value, { page: undefined, pageSize: undefined })
  );
  const drawerVisible = ref<boolean>(false);
  const drawerTitle = ref<string>('');
  const schoolInfo = reactive<SchoolInfo>({
    owner_name: '',
    is_using_pinvoice: '',
    omise_secret: '',
    omise_public: '',
    is_using_school_line: '',
    groups: [],
    created_at: '',
  });

  watch(selectedFields, (newVal) => {
    if (newVal) {
      localStorage.setItem(
        StorageKeys.schoolFields,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  const linkToCopy = () => {
    router.push({ name: 'SchoolCopySettings' });
  };

  const linkToOmise = () => {
    router.push({
      name: 'SchoolOmiseSettings',
      query: {
        ids: selectedRows.value.map((item) => item.id).join(','),
      },
    });
  };

  const showInfo = async (row) => {
    drawerVisible.value = true;
    drawerTitle.value = row.name;
    Object.assign(schoolInfo, row.extra);
  };

  async function getList() {
    loading.value = true;
    try {
      const { items, total_records } = await getSchoolListByPage({
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
    selectedRows.value = [];
    getList();
  }

  function handlePageChange(newCurrentPage: number) {
    currentPage.value = newCurrentPage;
    getList();
  }

  getList();
</script>
