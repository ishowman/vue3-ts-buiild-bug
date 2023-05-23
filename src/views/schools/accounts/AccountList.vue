<template>
  <c-list-table
    v-loading="loading"
    :data="tableData"
    :total="total"
    :has-checkbox="false"
    @sort-change="handleSortChange"
    @refetch="getList"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
    @setting="tableFieldsVisible = true"
    @filter="tableFilterVisible = true"
  >
    <template #header-left>
      <el-button type="primary" @click="linkToCreate">
        <c-icon-font name="icon-add" :size="ButtonIconHeight.default" />新規
      </el-button>
    </template>

    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          :label="field.label"
          :sortable="field.sort"
          :prop="field.prop"
          :min-width="field.labelWidth"
          show-overflow-tooltip
          :fixed="field.prop === 'operation' ? 'right' : false"
        >
          <template #default="scope">
            <template v-if="field.prop === 'operation'">
              <el-button text type="primary" @click="linkToEdit(scope.row.id)"
                >編集</el-button
              >
              <el-button
                text
                type="danger"
                :loading="deletingId && deletingId === scope.row.id"
                @click="handleDelete(scope.row.id)"
                >削除</el-button
              >
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
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import {
    schoolAccountsFieldsConfig,
    StorageKeys,
    DefaultPageSize,
    ButtonIconHeight,
  } from '@/constants';
  import { typedConfirm } from '@/utils';
  import { getSchoolAccountsList, deleteSchoolAccount } from '@/services';

  import CListTable from '@/components/table/CListTable.vue';
  import ReportFiltersDialog from './FilterDialog.vue';

  const route = useRoute();
  const router = useRouter();

  const loading = ref<boolean>(false);
  const deletingId = ref<number | null>(null);
  const tableFieldsVisible = ref<boolean>(false);
  const tableFilterVisible = ref<boolean>(false);
  const query = computed(() => route.query || {});
  const tableData = ref([]);
  const sortFields = ref();

  const defaultSortFields = ['id', 'slug'];
  const defaultSelectedFields = localStorage
    .getItem(StorageKeys.schoolAccountsFields)
    ?.split(',') || [
    'id',
    'school.name',
    'school.name_kana',
    'type_name',
    'info_title',
    'consignor_code',
    'name',
    'name_kana',
    'bank_code',
    'bank_name',
    'bank_branch_code',
    'bank_branch_kana',
    'bank_account_type_name',
    'bank_account_no',
    'operation',
  ];
  const fieldsConfig = schoolAccountsFieldsConfig.map((item) => {
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
  const filters = ref<any>(
    Object.assign({}, query.value, { page: undefined, pageSize: undefined })
  );

  watch(selectedFields, (newVal) => {
    if (newVal) {
      localStorage.setItem(
        StorageKeys.schoolAccountsFields,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  const linkToCreate = () => {
    router.push({
      name: 'SchoolAccountCreate',
    });
  };

  const linkToEdit = (id: number) => {
    router.push({
      path: `/schools/account/${id}`,
    });
  };

  const handleDelete = async (id) => {
    try {
      await typedConfirm({
        title: '本当に削除しますか？',
        content: '',
      });
      deletingId.value = id;
      await deleteSchoolAccount({ id });
      ElMessage.success('削除しました！');
      await getList();
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      console.error(err);
      ElMessage.error('削除に失敗しました！');
    } finally {
      deletingId.value = null;
    }
  };

  const getList = async () => {
    loading.value = true;
    try {
      const { items, total_records } = await getSchoolAccountsList({
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
  };

  const syncFilters = (filterForm) => {
    tableFilterVisible.value = false;
    filters.value = filterForm;
    getList();
  };

  const handleSortChange = ({ prop, order }) => {
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
  };

  const handleSizeChange = (newPageSize: number) => {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    getList();
  };

  const handlePageChange = (newCurrentPage: number) => {
    currentPage.value = newCurrentPage;
    getList();
  };

  getList();
</script>
