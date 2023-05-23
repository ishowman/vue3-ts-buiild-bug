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
          v-if="field.prop === 'operation'"
          fixed="right"
          label="操作"
          width="160"
        >
          <template #default="scope">
            <el-button
              v-if="hasEditPermission"
              text
              type="primary"
              @click="multipleCopyTempalte(scope.row)"
            >
              コピー
            </el-button>

            <el-button text type="danger" @click="delTempalte(scope.row.id)">
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
            <template v-if="field.prop === 'content'">
              <span
                v-dompurify-html="scope.row.content"
                class="block h-8 fr-view"
              />
            </template>

            <template v-else-if="field.prop === 'schools' && hasEditPermission">
              <el-select
                v-model="scope.row.selectedSchool"
                placeholder="選択"
                class="w-36"
                clearable
              >
                <el-option
                  v-for="item in scope.row.schools"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
              <el-button
                :disabled="
                  !scope.row.selectedSchool || scope.row.schools?.length === 0
                "
                :loading="scope.row.loading"
                type="primary"
                class="ml-2"
                @click="copyTemplate(scope.row)"
                >コピー</el-button
              >
            </template>

            <template v-else>
              {{ fieldFormatter(scope.row[field.prop]) }}
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

  <teacher-template-filters-dialog
    v-model="tableFilterVisible"
    title="フィルタ"
    @filter-submit="syncFilters"
  />
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import {
    newsTemplateFieldsConfig,
    ButtonIconHeight,
    StorageKeys,
    DefaultPageSize,
  } from '@/constants';
  import { emptyFieldFormatter, typedConfirm } from '@/utils';
  import {
    getTeacherNewsTemplateList,
    delTeacherNewsTemplate,
    teacherNewsTemplateFastCopy,
  } from '@/services';

  import CListTable from '@/components/table/CListTable.vue';
  import TeacherTemplateFiltersDialog from './TeacherTemplateFiltersDialog.vue';
  import { reportTemplatesStore } from '@/store';
  const route = useRoute();
  const router = useRouter();

  const loading = ref(false);
  const tableFieldsVisible = ref(false);
  const tableFilterVisible = ref(false);
  const query = computed(() => route.query || {});
  const tableData = ref<any>([]);
  const sortFields = ref();

  const defaultSortFields = ['id'];
  const defaultSelectedFields = localStorage
    .getItem(StorageKeys.newsTemplateFields)
    ?.split(',') || [
    'id',
    'school_name',
    'title',
    'date',

    'content',
    'created_at',
    'schools',
    'operation',
  ];

  const filters = ref();

  const fieldsConfig = newsTemplateFieldsConfig.map((item) => {
    return {
      ...item,
      show: defaultSelectedFields.includes(item.prop),
      sort: defaultSortFields.includes(item.prop) && 'custom',
    };
  });

  const selectedFields = ref(fieldsConfig.filter((config) => config.show));
  watch(selectedFields, (newVal) => {
    console.log('selectedFields', newVal);
    if (newVal) {
      localStorage.setItem(
        StorageKeys.newsTemplateFields,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  const currentPage = ref(+(query.value?.page || 1));
  const pageSize = ref(+(query.value?.pageSize || DefaultPageSize));
  const total = ref(0);

  const hasEditPermission = ref(false);

  async function getList() {
    loading.value = true;
    try {
      const { items, total_records, edit_permission } =
        await getTeacherNewsTemplateList({
          page: currentPage.value,
          pagesize: pageSize.value,
          order_by: sortFields.value,
          ...(filters.value ? { search: filters.value } : {}),
        });
      hasEditPermission.value = edit_permission;
      tableData.value = items.map((item) => {
        item.selectedSchool = null;
        return item;
      });
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

  function fieldFormatter(fieldValue) {
    const { isEmpty, value } = emptyFieldFormatter(fieldValue, '');
    if (isEmpty) {
      return value;
    }
    return fieldValue;
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

  function handleSizeChange(newPageSize) {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    getList();
  }

  function handlePageChange(newCurrentPage: number) {
    currentPage.value = newCurrentPage;
    getList();
  }

  function linkToCreate() {
    router.push({ name: 'NewsTeacherTemplateCreate' });
  }

  async function delTempalte(id) {
    try {
      await typedConfirm({
        title: '本当に削除しますか？',
        content: '',
      });

      await delTeacherNewsTemplate({
        id,
      });
      await ElMessage.success('削除しました！');
      getList();
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      ElMessage.error('削除に失敗しました！');
    }
  }

  async function copyTemplate(row) {
    try {
      row.loading = true;
      await teacherNewsTemplateFastCopy({
        template_id: row.id,
        school_id: row.selectedSchool,
      });
      await ElMessage.success('更新しました！');
      getList();
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      ElMessage.error('更新に失敗しました！');
    } finally {
      row.loading = false;
    }
  }

  function multipleCopyTempalte(rowData) {
    const { id } = rowData;
    const template = tableData.value.find((t) => Number(t.id) === Number(id));
    if (template) {
      reportTemplatesStore.setTemplates([template]);
    }
    router.push({
      name: 'NewsTeacherTemplateMultipleCopy',
      params: {
        id,
      },
    });
  }
</script>
