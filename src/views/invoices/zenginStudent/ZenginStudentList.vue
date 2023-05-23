<template>
  <div class="ZenginStudentList">
    <c-list-table
      v-loading="fetching"
      :data="listData"
      :total="total"
      has-checkbox
      @refetch="fetchList"
      @size-change="updatePageSize"
      @current-change="updateCurrentPage"
      @select="select"
      @setting="tableFieldsVisible = true"
      @filter="filterDialogVisible = true"
    >
      <template #header-left>
        <el-button v-if="creatable" type="primary" @click="linkToCreate">
          <c-icon-font name="icon-add" :size="ButtonIconHeight.default" />
          新規
        </el-button>

        <el-button
          v-if="creatable"
          type="primary"
          plain
          @click="linkToUploadCSV"
        >
          <c-icon-font name="icon-Upload" :size="ButtonIconHeight.default" />
          CSV アップロード
        </el-button>

        <csv-export
          :selected-ids="selectedIds"
          filename="生徒口座"
          :total="total"
          action="student-zengin/csv-data"
          :sort="sortFields"
          with-time
        />

        <el-button
          v-if="deletable"
          type="danger"
          :disabled="selectedIds.length === 0"
          :loading="isDeleting"
          @click="deleteSelectedItems"
        >
          削除
        </el-button>
      </template>

      <template #default>
        <template v-for="field in selectedFields" :key="field">
          <el-table-column
            v-if="field.prop !== 'operation'"
            :label="field.label"
            :prop="field.prop"
            :min-width="field.width"
            show-overflow-tooltip
          >
            <template #default="scope">
              <template v-if="'memo' === field.prop">
                {{ scope.row.memo ?? '-' }}
              </template>

              <template v-if="'readed' === field.prop">
                <c-icon-font
                  v-if="scope.row[field.prop]"
                  name="icon-right1"
                  :size="ButtonIconHeight.default"
                />
              </template>
            </template>
          </el-table-column>

          <!--操作-->
          <el-table-column
            v-else
            fixed="right"
            :label="field.label"
            :width="field.width"
          >
            <template #default="scope">
              <el-button
                v-if="editable"
                text
                type="primary"
                @click.prevent="linkToEdit(scope.row.id)"
              >
                編集
              </el-button>

              <el-button
                v-if="deletable"
                text
                type="danger"
                @click.prevent="deleteItem(scope.row.id)"
              >
                削除
              </el-button>
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
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';

  import { useRoute } from 'vue-router';
  import router from '@/router';

  import CListTable from '@/components/table/CListTable.vue';
  import FilterDialog from './FilterDialog.vue';

  import { typedConfirm } from '@/utils';

  import {
    getZenginStudentList,
    type IZenginStudentItem,
    deleteZenginStudent,
  } from '@/services';

  import {
    DefaultPageSize,
    StorageKeys,
    ButtonIconHeight,
    zenginStudentFields,
  } from '@/constants';

  const route = useRoute();

  const query = computed(() => route.query || {});
  const sortFields = ref();
  const fetching = ref<boolean>(false);
  const isDeleting = ref<boolean>(false);

  const listData = ref<IZenginStudentItem[]>([]);
  const currentPage = ref<number>(Number(query.value?.page || 1));
  const pageSize = ref<number>(
    Number(query.value?.pageSize || DefaultPageSize)
  );

  const total = ref<number>(0);
  const creatable = ref<boolean>(false);
  const editable = ref<boolean>(false);
  const deletable = ref<boolean>(false);

  const filters = ref<any>({
    ...query.value,
    ...(query.value?.bank_code === 'all' ? { bank_code: '' } : undefined),
    page: undefined,
    pageSize: undefined,
  });

  const selectedIds = ref<number[]>([]);

  const defaultSelectedFields =
    localStorage.getItem(StorageKeys.zenginStudentFields)?.split(',') ||
    zenginStudentFields.map(({ prop }) => prop);

  const fieldsConfig = zenginStudentFields.map((field) => ({
    ...field,
    show: defaultSelectedFields.includes(field.prop),
  }));

  const selectedFields = ref(fieldsConfig.filter((config) => config.show));

  const tableFieldsVisible = ref<boolean>(false);
  const filterDialogVisible = ref<boolean>(false);

  async function fetchList() {
    try {
      fetching.value = true;

      const {
        items,
        total_records,
        create_permission,
        edit_permission,
        delete_permission,
      } = await getZenginStudentList({
        page: currentPage.value,
        pagesize: pageSize.value,
        order_by: sortFields.value,
        ...(filters.value ? { search: filters.value } : {}),
      });

      if (items) {
        listData.value = items;
      }

      total.value = total_records;
      creatable.value = create_permission;
      editable.value = edit_permission;
      deletable.value = delete_permission;
      selectedIds.value = [];
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

  function updatePageSize(newPageSize) {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    fetchList();
  }

  function updateCurrentPage(newCurrentPage: number) {
    currentPage.value = newCurrentPage;
    fetchList();
  }

  function linkToCreate() {
    router.push({ name: 'InvoiceZenginStudentNew' });
  }

  function linkToUploadCSV() {
    router.push({ name: 'InvoiceZenginStudentCreate' });
  }

  function linkToEdit(id: number) {
    router.push({ path: `/invoices/zenginStudent/edit/${id}` });
  }

  function select(selectedInvoices: IZenginStudentItem[]) {
    selectedIds.value = selectedInvoices.map(({ id }) => id);
  }

  async function onDelete(ids: number[]) {
    try {
      await typedConfirm({ title: '本当に削除しますか？', content: '' });

      isDeleting.value = true;

      await deleteZenginStudent(ids);
      ElMessage.success('削除しました！');

      await fetchList();
      selectedIds.value = [];
    } catch (e) {
      if (e === 'cancel') {
        return;
      }
      console.error(e);
      ElMessage.error('削除に失敗しました！');
    } finally {
      isDeleting.value = false;
    }
  }

  function deleteSelectedItems() {
    onDelete(selectedIds.value);
  }

  function deleteItem(id: number) {
    onDelete([id]);
  }

  fetchList();
</script>

<style scoped lang="postcss">
  .ZenginStudentList::v-deep(td) {
    vertical-align: top;
  }
  .ZenginStudentList::v-deep(.cell) {
    line-height: 2;
  }

  .ZenginStudentList::v-deep(.header-left .el-button + .el-button) {
    margin-left: 0;
  }
  .ZenginStudentList::v-deep(
      .header-left :where(.el-button, .el-dropdown):not(:last-child)
    ) {
    margin-right: 12px;
  }
</style>
