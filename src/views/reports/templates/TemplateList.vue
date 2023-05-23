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
    @filter="filterDialogVisible = true"
  >
    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <!--実行-->
        <el-table-column
          v-if="hasEditPermission && field.prop === 'copy_to'"
          :label="field.label"
          :width="field.labelWidth"
        >
          <template #default="scope">
            <target-select
              :key="scope.row.id"
              :template-id="scope.row.id"
              :schools="scope.row.schools"
              :refetch="getList"
            />
          </template>
        </el-table-column>

        <!--操作-->
        <el-table-column
          v-else-if="
            (hasEditPermission || hasDeletePermission) &&
            field.prop === 'operation'
          "
          fixed="right"
          :label="field.label"
          :width="field.labelWidth"
        >
          <template #default="scope">
            <el-button
              v-if="hasEditPermission"
              text
              type="primary"
              @click.prevent="editTemplate(scope.row)"
            >
              編集
            </el-button>

            <el-button
              v-if="hasEditPermission"
              text
              type="primary"
              @click.prevent="linkToCopy(scope.row.id)"
            >
              コピー
            </el-button>

            <el-button
              v-if="hasDeletePermission"
              text
              type="danger"
              @click.prevent="deleteTemplate(scope.row.id)"
            >
              削除
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

  <c-table-field-dialog
    v-model="tableFieldsVisible"
    v-model:checked-fields="selectedFields"
    title="カスタムアライメント"
    :field-configs="fieldsConfig"
  />

  <filter-dialog v-model="filterDialogVisible" :submit="submitFilter" />
  <edit-dialog
    v-model="editingTemplate"
    :template="editingTemplate"
    :submit="submitEdit"
  />
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { reportTemplatesStore } from '@/store';
  import {
    reportTemplateFieldsConfig,
    StorageKeys,
    DefaultPageSize,
    ButtonIconHeight,
  } from '@/constants';
  import {
    getReportTemplateList,
    deleteReportTemplate,
    type IReportTemplateItem,
  } from '@/services';

  import CListTable from '@/components/table/CListTable.vue';
  import TargetSelect from './TargetSelect.vue';
  import FilterDialog from './FilterDialog.vue';
  import EditDialog from './EditDialog.vue';

  import { typedConfirm } from '@/utils';

  const route = useRoute();
  const router = useRouter();

  const loading = ref<boolean>(false);

  const tableFieldsVisible = ref<boolean>(false);
  const filterDialogVisible = ref<boolean>(false);
  const editingTemplate = ref<Record<string, any> | undefined>(undefined);

  const query = computed(() => route.query || {});
  const tableData = ref<IReportTemplateItem[]>([]);
  const sortFields = ref();

  const hasEditPermission = ref(false);
  const hasDeletePermission = ref(false);

  const defaultSortFields = ['id', 'school_name', 'sort'];
  const defaultSelectedFields = localStorage
    .getItem(StorageKeys.reportTemplateFields)
    ?.split(',') || [
    'id',
    'school_name',
    'sort',
    'template_name',
    'template_lesson_text',
    'template_homework_text',
    'template_note',
    'created_at',
    'copy_to',
    'operation',
  ];

  const fieldsConfig = reportTemplateFieldsConfig.map((item) => {
    return {
      ...item,
      show: defaultSelectedFields.includes(item.prop),
      sort: defaultSortFields.includes(item.prop) && 'custom',
    };
  });

  const selectedFields = ref(fieldsConfig.filter((config) => config.show));
  const currentPage = ref<number>(Number(query.value?.page || 1));
  const pageSize = ref<number>(
    Number(query.value?.pageSize || DefaultPageSize)
  );
  const total = ref<number>(0);
  const filters = ref<any>(
    Object.assign({}, query.value, { page: undefined, pageSize: undefined })
  );

  watch(selectedFields, (newVal) => {
    if (newVal) {
      localStorage.setItem(
        StorageKeys.reportTemplateFields,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  async function getList() {
    loading.value = true;
    try {
      const { items, total_records, edit_permission, delete_permission } =
        await getReportTemplateList({
          page: currentPage.value,
          pagesize: pageSize.value,
          order_by: sortFields.value,
          ...(filters.value ? { search: filters.value } : {}),
        });
      if (items) {
        tableData.value = items;
      }
      hasEditPermission.value = edit_permission;
      hasDeletePermission.value = delete_permission;
      total.value = total_records;
    } finally {
      loading.value = false;
    }
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

  function linkToCopy(id: number) {
    const template = tableData.value.find((t) => Number(t.id) === Number(id));

    if (template) {
      reportTemplatesStore.setTemplates([template]);
    }

    router.push({
      name: 'ReportTemplateBatchCopy',
      params: { id },
      query: route.query,
    });
  }

  function submitFilter(query) {
    filterDialogVisible.value = false;
    filters.value = query;
    getList();
  }

  function editTemplate(template) {
    editingTemplate.value = template;
  }

  async function submitEdit() {
    editingTemplate.value = undefined;
    await getList();
  }

  async function deleteTemplate(id: number) {
    try {
      await typedConfirm({
        title: '本当に削除しますか？',
        content: '',
      });
      await deleteReportTemplate({ id });
      ElMessage.success('削除しました！');
      await getList();
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      console.error(err);
      ElMessage.error('削除に失敗しました！');
    }
  }

  getList();
</script>
