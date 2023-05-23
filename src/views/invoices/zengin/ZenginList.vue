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
      <el-button type="primary" @click="linkToCreate">
        <c-icon-font name="icon-add" :size="ButtonIconHeight.default" />新規
      </el-button>
      <el-button
        type="primary"
        plain
        @click="router.push({ name: 'CropZenginCreate' })"
      >
        <c-icon-font name="icon-Upload" :size="ButtonIconHeight.default" />CSV
        アップロード
      </el-button>
      <csv-export
        :selected-ids="selectedRows.map(({ id }) => id)"
        filename="会社口座"
        action="corporation-zengins/export"
        :total="total"
        :sort="sortFields"
        class="mx-3"
      >
      </csv-export>
      <el-button
        type="danger"
        :disabled="selectedRows.length === 0"
        :loading="deleteLoading && selectedRows.length > 0"
        @click="onDeleteZengin(null)"
        >削除</el-button
      >
    </template>

    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          :label="field.label"
          :sortable="field.sort"
          :prop="field.prop"
          :min-width="field.labelWidth"
          :fixed="field.prop === 'operation' ? 'right' : false"
          :show-overflow-tooltip="field.prop !== 'info'"
        >
          <template #default="scope">
            <template v-if="field.prop === 'info'">
              <div class="flex">
                <div class="w-44 pr-2">{{ scope.row.info }}</div>
                <div class="w-44 pr-2">{{ scope.row.consignor_code }}</div>
                <div class="w-40 pr-2">{{ scope.row.name }}</div>
                <div class="w-60">{{ scope.row.name_kana }}</div>
              </div>
            </template>
            <template v-else-if="field.prop === 'operation'">
              <el-button text type="primary" @click="linkToEdit(scope.row.id)"
                >編集</el-button
              >
              <el-button
                text
                type="danger"
                :loading="deleteLoading && deleteId === scope.row.id"
                @click="onDeleteZengin(scope.row.id)"
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
    invoiceZenginFields,
    StorageKeys,
    DefaultPageSize,
    ButtonIconHeight,
  } from '@/constants';
  import {
    getInvoiceCorporationZenginList,
    batchDeleteInvoiceCorporationZengin,
    type IInvoiceCorporationZenginItem,
  } from '@/services';
  import { typedConfirm } from '@/utils';

  import CListTable from '@/components/table/CListTable.vue';
  import ReportFiltersDialog from './FilterDialog.vue';

  const route = useRoute();
  const router = useRouter();

  const loading = ref<boolean>(false);
  const tableFieldsVisible = ref<boolean>(false);
  const tableFilterVisible = ref<boolean>(false);
  const query = computed(() => route.query || {});
  const tableData = ref<IInvoiceCorporationZenginItem[]>([]);
  const sortFields = ref();

  const defaultSortFields: string[] = [];
  const defaultSelectedFields = localStorage
    .getItem(StorageKeys.invoiceZenginFields)
    ?.split(',') || [
    'type',
    'info',
    'consignor_code',
    'name',
    'name_kana',
    'bank_code',
    'bank_name',
    'bank_branch_code',
    'bank_branch_kana',
    'bank_account_type',
    'bank_account_no',
    'operation',
  ];
  const fieldsConfig = invoiceZenginFields.map((item) => {
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
  const selectedRows = ref<IInvoiceCorporationZenginItem[]>([]);
  const filters = ref<any>(
    Object.assign({}, query.value, { page: undefined, pageSize: undefined })
  );
  const deleteLoading = ref<boolean>(false);
  const deleteId = ref<number | string>('');

  watch(selectedFields, (newVal) => {
    if (newVal) {
      localStorage.setItem(
        StorageKeys.reportFields,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  const linkToCreate = () => {
    router.push({
      name: 'InvoiceZenginCreate',
    });
  };

  const linkToEdit = (id: number) => {
    router.push({
      path: `/invoices/zengin/${id}`,
    });
  };

  const getList = async () => {
    loading.value = true;
    try {
      const { items, total_records } = await getInvoiceCorporationZenginList({
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

  const onDeleteZengin = async (id?: number | null) => {
    try {
      await typedConfirm({
        title: '本当に削除しますか？',
        content: '',
      });
      const ids =
        id?.toString() || selectedRows.value.map((item) => item.id).join(',');
      deleteId.value = id || '';
      deleteLoading.value = true;
      await batchDeleteInvoiceCorporationZengin({ ids });
      ElMessage.success('削除しました！');
      await getList();
      selectedRows.value = id
        ? selectedRows.value.filter((item) => item.id !== id)
        : [];
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      console.error(err);
      ElMessage.error('削除に失敗しました！');
    } finally {
      deleteId.value = '';
      deleteLoading.value = false;
    }
  };

  const syncFilters = (filterForm) => {
    tableFilterVisible.value = false;
    filters.value = filterForm;
    getList();
  };

  const selectChanged = (selection) => {
    selectedRows.value = selection;
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
    selectedRows.value = [];
    getList();
  };

  const handlePageChange = (newCurrentPage: number) => {
    currentPage.value = newCurrentPage;
    getList();
  };

  getList();
</script>
