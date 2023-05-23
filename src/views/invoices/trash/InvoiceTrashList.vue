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
    @select="selectChanged"
  >
    <template #header-left>
      <el-button
        type="primary"
        :disabled="!selectedRows.length"
        @click="batchRecovery"
      >
        復元
      </el-button>

      <csv-export
        :selected-ids="selectedRows.map(({ id }) => id)"
        filename="ゴミ箱リスト"
        action="invoices/csv-data"
        :total="total"
        :extra-param-keys="{
          is_trash_list: { selectedValue: 1, unSelectedValue: 1 },
        }"
        :sort="sortFields"
        class="mx-3"
      />
      <el-button
        type="danger"
        :disabled="!selectedRows.length"
        @click="batchDelete"
      >
        一括削除
      </el-button>
    </template>

    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          v-if="field.prop === 'operation'"
          fixed="right"
          label="操作"
          width="90"
        >
          <template #default="scope">
            <el-button text type="primary" @click.prevent="showEdit(scope.row)">
              メモ
            </el-button>
            <el-button
              text
              type="primary"
              @click="
                () => {
                  checkingInvoiceId = scope.row.id;
                }
              "
            >
              詳細
            </el-button>
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
            <template v-if="field.prop === 'readed'">
              <c-icon-font
                v-if="scope.row[field.prop]"
                name="icon-right1"
                :size="ButtonIconHeight.default"
              />
            </template>

            <!--請求日付-->
            <template v-else-if="field.prop === 'date'">
              <span class="date">{{ scope.row.date }}</span>
              <span
                v-if="scope.row.scheduled_time"
                class="scheduled block text-[12px] leading-none"
              >
                {{ scope.row.scheduled_time }}
              </span>
              <el-tag v-if="scope.row.is_reissued">再発行</el-tag>
            </template>

            <!--請求-->
            <template v-else-if="field.prop === 'status'">
              <el-tag :type="STATUS_TYPE_MAP[scope.row.status]">{{
                scope.row.status
              }}</el-tag>
            </template>

            <!--支払ステータス-->
            <template v-else-if="field.prop === 'payment_status'">
              <span
                v-if="scope.row.payment_status"
                :class="
                  PAYMENT_STATUS_TYPE_MAP[scope.row.payment_status] ??
                  'card days-left'
                "
              >
                <c-icon-font
                  v-if="scope.row.can_use_card"
                  name="icon-crad"
                  :size="ButtonIconHeight.default"
                />
                <span v-else class="dot inline-block w-1.5 h-1.5" />
                {{ scope.row.payment_status }}
              </span>
            </template>

            <template v-else>
              <span v-dompurify-html="fieldFormatter(scope.row[field.prop])" />
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
    :field-configs="fieldsConfig"
  />
  <trash-edit-dialog
    v-model="rowData"
    v-model:form="rowData"
    title="メモ"
    @confirm="updateMemo"
  />
  <detail-dialog
    :id="checkingInvoiceId"
    v-model="checkingInvoiceId"
    type="trash-list"
    :after-editing="afterEditing"
  />

  <filter-dialog v-model="tableFilterVisible" :submit="submitFilter" />
</template>

<script lang="ts" setup>
  import {
    DefaultPageSize,
    invoiceTrashFields,
    StorageKeys,
    ButtonIconHeight,
  } from '@/constants';
  import TrashEditDialog from '@/views/invoices/trash/TrashEditDialog.vue';
  import DetailDialog from '@/views/invoices/list/DetailDialog.vue';
  import FilterDialog from '@/views/invoices/list/FilterDialog.vue';

  import {
    getInvoicesList,
    recoverInvoicesFromTrash,
    updateInvoiceMemo,
    moveInvoicesTrash,
    type IUpdateInvoiceMemoParams,
  } from '@/services';
  import { emptyFieldFormatter, typedConfirm } from '@/utils';
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const STATUS_TYPE_MAP = {
    請求済: 'success',
    未請求: 'danger',
  };

  const PAYMENT_STATUS_TYPE_MAP = {
    // 未納: 'danger',
    // 既納: 'success',
    本日: 'card today',
    要確認: 'card to-be-confirmed',
    '(済)': 'card paid',
    未納: 'unpaid',
    既納: 'paid',
  };

  const query = computed(() => route.query || {});
  const tableData = ref<any>([]);
  const loading = ref(false);
  const sortFields = ref();
  const defaultSortFields = [
    'date',
    'school_name',
    'status',
    'grade',
    'total_price',
  ];

  const currentPage = ref(+(query.value?.page || 1));
  const pageSize = ref(+(query.value?.pageSize || DefaultPageSize));
  const total = ref(0);
  const selectedRows = ref([]);

  const tableFieldsVisible = ref(false);
  const tableFilterVisible = ref(false);

  const defaultSelectedFields =
    localStorage.getItem(StorageKeys.invoiceDraftFields)?.split(',') ||
    invoiceTrashFields.map(({ prop }) => prop);
  const fieldsConfig = invoiceTrashFields.map((item) => {
    return {
      ...item,
      show: defaultSelectedFields.includes(item.prop),
      sort: defaultSortFields.includes(item.prop) && 'custom',
    };
  });

  const selectedFields = ref(fieldsConfig.filter((config) => config.show));

  const checkingInvoiceId = ref<number | undefined>(undefined);
  const filters = ref<any>({
    ...query.value,
    page: undefined,
    pageSize: undefined,
  });

  getList();

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
  function handlePageChange(newCurrentPage: number) {
    currentPage.value = newCurrentPage;
    getList();
  }

  function handleSizeChange(newPageSize) {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    getList();
  }

  function selectChanged(selection) {
    selectedRows.value = selection;
  }

  async function getList() {
    try {
      loading.value = true;

      const { items, total_records } = await getInvoicesList({
        page: currentPage.value,
        pagesize: pageSize.value,
        order_by: sortFields.value,
        is_trash_list: 1,
        ...(filters.value ? { search: filters.value } : {}),
      });

      if (items) {
        tableData.value = items;
      }

      total.value = total_records;
      selectedRows.value = [];
    } finally {
      loading.value = false;
    }
  }

  function batchRecovery() {
    const ids: number[] = selectedRows.value.map(({ id }) => id);
    if (!ids.length) {
      return;
    }

    const msg = '復元';
    operationMessage({
      msg,
      fn: async () => recoverInvoicesFromTrash(ids),
    });
  }

  function batchDelete() {
    const ids: number[] = selectedRows.value.map(({ id }) => id);
    if (!ids.length) {
      return;
    }

    const msg = '削除';
    operationMessage({
      msg,
      fn: async () => moveInvoicesTrash({ ids: ids.join() }),
    });
  }

  async function operationMessage({ msg, fn }) {
    if (!fn) {
      return;
    }
    try {
      await typedConfirm({ title: `${msg}しますか？`, content: '' });
      const { success, message } = await fn();
      if (success) {
        ElMessage.success(`${msg}しました！`);
        getList();
      } else if (!success && message) {
        ElMessage.error(message);
      } else {
        ElMessage.error(`${msg}に失敗しました！`);
      }
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      ElMessage.error(`${msg}に失敗しました！`);
    }
  }

  const rowData = ref<IUpdateInvoiceMemoParams | undefined>(undefined);
  function showEdit(row) {
    rowData.value = { ...row };
  }

  function fieldFormatter(fieldValue) {
    const { isEmpty, value } = emptyFieldFormatter(fieldValue, '');
    if (isEmpty) {
      return value;
    }
    return fieldValue;
  }

  async function updateMemo() {
    try {
      if (!rowData.value) {
        return;
      }
      const { id, memo } = rowData.value;
      if (!id) {
        return;
      }
      await updateInvoiceMemo({
        id,
        memo,
      });

      await ElMessage.success('更新しました！');
      rowData.value = undefined;

      getList();
    } catch (e) {
      console.error(e);
      ElMessage.error('更新に失敗しました！');
    }
  }

  async function afterEditing() {
    checkingInvoiceId.value = undefined;
    await getList();
  }

  async function submitFilter(query) {
    tableFilterVisible.value = false;
    filters.value = query;
    getList();
  }
</script>
<style scoped lang="postcss">
  .scheduled {
    color: var(--el-text-color-secondary);
  }

  .dot {
    border-radius: 50%;
  }

  .unpaid .dot {
    background-color: var(--el-color-danger);
  }
  .paid .dot {
    background-color: var(--el-color-primary);
  }

  .card.today {
    color: var(--color-blue);
  }
  .card.to-be-confirmed {
    color: var(--el-color-danger);
  }
  .card.days-left {
    color: var(--el-color-warning);
  }
  .card.paid {
    color: var(--el-color-primary);
  }
</style>
