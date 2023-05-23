<template>
  <div class="InvoiceList">
    <c-list-table
      v-loading="fetching"
      :data="listData"
      :total="total"
      has-checkbox
      @sort-change="updateSorter"
      @refetch="fetchList"
      @size-change="updatePageSize"
      @current-change="updateCurrentPage"
      @select="select"
      @setting="tableFieldsVisible = true"
      @filter="filterDialogVisible = true"
    >
      <template #header-left>
        <el-button type="primary" plain @click="linkToTrash">
          ゴミ箱リスト
        </el-button>

        <csv-dropdown
          v-for="action in csvDownloadActions"
          :key="action"
          :action="action"
          :data="listData"
          :selected-ids="selectedIds"
          :search="filters"
          :current-page-ids="listData.map(({ id }) => id)"
        />

        <br />

        <el-button
          type="primary"
          plain
          @click="router.push({ name: 'InvoiceZenginUpload' })"
        >
          <c-icon-font name="icon-Upload" :size="ButtonIconHeight.default" />
          振替結果アップロード
        </el-button>
        <el-button
          type="primary"
          plain
          @click="router.push({ name: 'InvoiceCreate' })"
        >
          <c-icon-font name="icon-Upload" :size="ButtonIconHeight.default" />
          CSVアップロード
        </el-button>

        <csv-export
          :selected-ids="selectedIds"
          filename="請求書情報"
          action="invoices/csv-data"
          :total="total"
          :sort="sortFields"
        />

        <el-button
          type="danger"
          :disabled="selectedIds.length === 0"
          @click="moveToTrash"
        >
          ゴミ箱
        </el-button>
      </template>

      <template #default>
        <template v-for="field in selectedFields" :key="field">
          <!--請求日付-->
          <el-table-column
            v-if="field.prop === 'date'"
            :label="field.label"
            :class="field.prop"
            :prop="field.prop"
            :width="field.width"
            :sortable="field.sort"
          >
            <template #default="scope">
              <span class="date">{{ scope.row.date }}</span>

              <span v-if="scope.row.scheduled_time" class="scheduled">
                {{ scope.row.scheduled_time }}
              </span>

              <div>
                <el-tag v-if="scope.row.is_reissued">再発行</el-tag>
                <el-tag
                  v-if="scope.row.new_transferred_invoices_count > 0"
                  type="success"
                  >繰越し</el-tag
                >
              </div>
            </template>
          </el-table-column>

          <!--請求-->
          <el-table-column
            v-else-if="field.prop === 'status'"
            :label="field.label"
            :class="field.prop"
            :prop="field.prop"
            :width="field.width"
            :sortable="field.sort"
          >
            <template #default="scope">
              <el-tag :type="STATUS_TYPE_MAP[scope.row.status]">{{
                scope.row.status
              }}</el-tag>
            </template>
          </el-table-column>

          <!--支払ステータス-->
          <el-table-column
            v-else-if="field.prop === 'payment_status'"
            :label="field.label"
            :class="field.prop"
            :prop="field.prop"
            :width="field.width"
            :sortable="field.sort"
          >
            <template #default="scope">
              <span
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
                <span v-else class="dot" />
                {{ scope.row.payment_status }}
              </span>
            </template>
          </el-table-column>

          <!--操作-->
          <el-table-column
            v-else-if="field.prop === 'operation'"
            fixed="right"
            :label="field.label"
            :width="field.width"
          >
            <template #default="scope">
              <el-button
                text
                type="primary"
                @click.prevent="editInvoice(scope.row)"
              >
                メモ
              </el-button>

              <el-button
                text
                type="primary"
                @click.prevent="checkInvoiceDetail(scope.row.id)"
              >
                詳細
              </el-button>
            </template>
          </el-table-column>

          <el-table-column
            v-else
            :label="field.label"
            :prop="field.prop"
            :min-width="field.width"
            :sortable="field.sort"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div
                v-if="'pay_type' === field.prop"
                v-dompurify-html="scope.row.pay_type"
              />

              <template v-else-if="'memo' === field.prop">
                {{ scope.row.memo ?? '-' }}
              </template>

              <template v-else-if="'readed' === field.prop">
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
  </div>

  <c-table-field-dialog
    v-model="tableFieldsVisible"
    v-model:checked-fields="selectedFields"
    title="カスタムアライメント"
    :field-configs="fieldsConfig"
  />

  <filter-dialog v-model="filterDialogVisible" :submit="submitFilter" />

  <edit-dialog
    v-model="editingInvoice"
    :invoice="editingInvoice"
    :after-editing="afterEditing"
  />

  <detail-dialog
    :id="checkingInvoiceId"
    v-model="checkingInvoiceId"
    type="regular-list"
    :after-editing="afterEditing"
  />
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import CListTable from '@/components/table/CListTable.vue';
  import EditDialog from './EditDialog.vue';
  import DetailDialog from './DetailDialog.vue';
  import FilterDialog from './FilterDialog.vue';
  import CsvDropdown, {
    type TCSVDownloadAction,
  } from './DownloadCSV/CSVDropdown.vue';

  import { typedConfirm } from '@/utils';

  import {
    getInvoicesList,
    type IInvoiceItem,
    moveInvoicesToTrash,
  } from '@/services';
  import {
    DefaultPageSize,
    StorageKeys,
    ButtonIconHeight,
    invoiceListFields,
  } from '@/constants';

  const route = useRoute();
  const router = useRouter();

  const query = computed(() => route.query || {});
  const sortFields = ref();
  const fetching = ref<boolean>(false);

  const listData = ref<IInvoiceItem[]>([]);
  const currentPage = ref<number>(Number(query.value?.page || 1));
  const pageSize = ref<number>(
    Number(query.value?.pageSize || DefaultPageSize)
  );

  const total = ref<number>(0);
  const zenginButtonEnable = ref<boolean>(false);
  const zenginCorporationButtonEnable = ref<boolean>(false);

  const filters = ref<any>({
    ...query.value,
    page: undefined,
    pageSize: undefined,
  });

  const selectedIds = ref<number[]>([]);

  const defaultSortFields = [
    'date',
    'school_name',
    'status',
    'grade',
    'total_price',
  ];

  const defaultSelectedFields =
    localStorage.getItem(StorageKeys.invoiceFields)?.split(',') ||
    invoiceListFields.map(({ prop }) => prop);

  const fieldsConfig = invoiceListFields.map((field) => ({
    ...field,
    show: defaultSelectedFields.includes(field.prop),
    sort: defaultSortFields.includes(field.prop) && 'custom',
  }));

  const selectedFields = ref(fieldsConfig.filter((config) => config.show));

  const tableFieldsVisible = ref<boolean>(false);
  const filterDialogVisible = ref<boolean>(false);

  const editingInvoice = ref<IInvoiceItem | undefined>(undefined);
  const checkingInvoiceId = ref<number | undefined>(undefined);

  const STATUS_TYPE_MAP = {
    請求済: 'success',
    未請求: 'danger',
  };

  const PAYMENT_STATUS_TYPE_MAP = {
    本日: 'card today',
    要確認: 'card to-be-confirmed',
    '(済)': 'card paid',
    未納: 'unpaid',
    既納: 'paid',
  };

  const csvDownloadActions = [
    'zenginCorporation',
    'zengin',
    'veritrans',
  ] as TCSVDownloadAction[];

  async function fetchList() {
    try {
      fetching.value = true;

      const {
        items,
        total_records,
        zengin_button_enable,
        zengin_corporation_button_enable,
      } = await getInvoicesList({
        page: currentPage.value,
        pagesize: pageSize.value,
        order_by: sortFields.value,
        ...(filters.value ? { search: filters.value } : {}),
      });

      if (items) {
        listData.value = items;
      }

      total.value = total_records;
      selectedIds.value = [];
      zenginButtonEnable.value = zengin_button_enable;
      zenginCorporationButtonEnable.value = zengin_corporation_button_enable;
    } catch (e) {
      console.error(e);
    } finally {
      fetching.value = false;
    }
  }

  async function submitFilter(query) {
    filterDialogVisible.value = false;
    filters.value = query;
    fetchList();
  }

  function updateSorter({ prop, order }) {
    sortFields.value = order
      ? { [prop]: { descending: 'desc' }[order] || 'asc' }
      : undefined;

    return fetchList();
  }

  function updatePageSize(newPageSize) {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    fetchList();
  }

  function updateCurrentPage(newCurrentPage: number) {
    currentPage.value = newCurrentPage;
    fetchList();
  }

  function select(selectedInvoices: IInvoiceItem[]) {
    selectedIds.value = selectedInvoices.map(({ id }) => id);
  }

  function editInvoice(invoice: IInvoiceItem) {
    editingInvoice.value = invoice;
  }

  function checkInvoiceDetail(id: number) {
    checkingInvoiceId.value = id;
  }

  function linkToTrash() {
    router.push({ name: 'InvoiceTrashList' });
  }

  async function moveToTrash() {
    try {
      if (selectedIds.value.length === 0) {
        return;
      }

      await typedConfirm({ title: 'ゴミ箱リストに移しますか？' });
      await moveInvoicesToTrash(selectedIds.value);
      await fetchList();

      ElMessage.success('ゴミ箱へ移しました！');
    } catch (e) {
      if (e === 'cancel') {
        return;
      }
      ElMessage.error('ゴミ箱へ移動に失敗しました！');
    }
  }

  async function afterEditing() {
    editingInvoice.value = undefined;
    checkingInvoiceId.value = undefined;
    await fetchList();
  }

  fetchList();
</script>

<style scoped lang="postcss">
  .InvoiceList::v-deep(td) {
    vertical-align: top;
  }
  .InvoiceList::v-deep(.cell) {
    line-height: 2;
  }

  .InvoiceList::v-deep(.el-tag) {
    display: flex;
    width: fit-content;
    padding: 0.25em 0.5em;
  }

  .InvoiceList::v-deep(.el-tag + .el-tag) {
    margin-left: 0.25rem;
  }

  .InvoiceList::v-deep(.header-left .el-button + .el-button) {
    margin-left: 0;
  }
  .InvoiceList::v-deep(
      .header-left :where(.el-button, .el-dropdown):not(:last-child)
    ) {
    margin-right: 12px;
  }

  .scheduled {
    display: block;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 3px;
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
