<template>
  <c-list-table
    v-loading="loading"
    :data="tableData"
    :total="total"
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
      <csv-export
        :selected-ids="selectedRows.map(({ id }) => id)"
        filename="講師連絡"
        action="teacher-news/export-data"
        :total="total"
        :sort="sortFields"
        class="mx-3"
      />
      <!-- <el-button
        type="danger"
        @click="batchDelete"
        :disabled="!selectedRows.length"
      >
        一括削除
      </el-button>

      <el-button
        type="primary"
        @click="visible = true"
        :disabled="!selectedRows.length"
      >
        一括送信
      </el-button> -->
    </template>

    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          v-if="field.prop === 'operation'"
          fixed="right"
          label="操作"
          width="100"
        >
          <template #default="scope">
            <el-button
              text
              type="primary"
              @click.prevent="linkToEdit(scope.row.id)"
            >
              編集
            </el-button>
            <el-button
              text
              type="danger"
              @click.prevent="delItem(scope.row.id)"
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
            <template v-if="field.prop === 'teacher_name'">
              <el-button
                v-if="scope.row.from_corporation"
                text
                type="warning"
                class="admin-teacher"
              >
                本部
              </el-button>
              <span v-else>{{ scope.row.teacher_name }}</span>
            </template>

            <template v-else-if="field.prop === 'title'">
              <el-button
                text
                type="primary"
                @click="linkToDetail(scope.row.id)"
                >{{ scope.row.title }}</el-button
              >
            </template>
            <template v-else-if="['status'].includes(field.prop)">
              <c-icon-font
                v-if="scope.row[field.prop]"
                name="icon-right1"
                :size="ButtonIconHeight.default"
              />
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

  <news-teacher-filters-dialog
    v-model="tableFilterVisible"
    title="フィルタ"
    @filter-submit="syncFilters"
  />
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import {
    newsTeacherFieldsConfig,
    ButtonIconHeight,
    StorageKeys,
    DefaultPageSize,
  } from '@/constants';
  import { emptyFieldFormatter, typedConfirm } from '@/utils';
  import {
    deleteTeacherNews,
    getTeacherNewsList,
    // publicNews,
    // exportSurveyById,
  } from '@/services';

  import CListTable from '@/components/table/CListTable.vue';
  // import NewsCsvExport from './NewsCsvExport.vue';
  import NewsTeacherFiltersDialog from './NewsTeacherFiltersDialog.vue';

  const route = useRoute();
  const router = useRouter();

  const loading = ref(false);
  const tableFieldsVisible = ref(false);
  const tableFilterVisible = ref(false);
  // const visible = ref(false);
  const query = computed(() => route.query || {});
  const tableData = ref<any>([]);
  const sortFields = ref();

  const storageKey = StorageKeys.newsTeacherTemplateFields;

  const defaultSortFields = ['date', 'status'];
  const defaultSelectedFields = localStorage
    .getItem(storageKey)
    ?.split(',') || [
    'school_name',
    'teacher_name',
    'title',
    'date',

    'scheduled_time',
    'teachers',
    'is_read',
    'status',

    'last',
    'operation',
  ];
  const fieldsConfig = newsTeacherFieldsConfig.map((item) => {
    return {
      ...item,
      show: defaultSelectedFields.includes(item.prop),
      sort: defaultSortFields.includes(item.prop) && 'custom',
    };
  });

  const selectedFields = ref(fieldsConfig.filter((config) => config.show));
  watch(selectedFields, (newVal) => {
    if (newVal) {
      localStorage.setItem(
        storageKey,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  const currentPage = ref(+(query.value?.page || 1));
  const pageSize = ref(+(query.value?.pageSize || DefaultPageSize));
  const total = ref(0);
  const selectedRows = ref([]);
  const filters = ref();

  function syncFilters(filterForm) {
    tableFilterVisible.value = false;
    filters.value = filterForm;
    getList();
  }

  async function getList() {
    loading.value = true;
    try {
      const { items, total_records } = await getTeacherNewsList({
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

  function fieldFormatter(fieldValue) {
    const { isEmpty, value } = emptyFieldFormatter(fieldValue, '');
    if (isEmpty) {
      return value;
    }
    return fieldValue;
  }

  function linkToCreate() {
    router.push({ name: 'NewsTeacherCreate' });
  }

  // async function batchDelete() {
  //   const ids = selectedRows.value.map(({ id }) => id);
  //   if (!ids.length) {
  //     return;
  //   }

  //   const title = '選択したお知らせを一括削除しますがよろしいですか？';
  //   operationMessage({
  //     title,
  //     fn: async () => deleteTeacherNews({ ids: ids.join() }),
  //   });
  // }

  function selectChanged(selection) {
    console.log('selection', selection);
    selectedRows.value = selection;
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

  function linkToEdit(id) {
    router.push({ name: 'NewsTeacherEdit', params: { id } });
  }

  // async function operationMessage({ title, fn }) {
  //   if (!fn) {
  //     return;
  //   }
  //   try {
  //     await typedConfirm({ title, content: '' });
  //     await fn();
  //     ElMessage.success('更新しました！');
  //     getList();
  //   } catch (err) {
  //     if (err === 'cancel') {
  //       return;
  //     }
  //     ElMessage.error('更新に失敗しました！');
  //   }
  // }

  function linkToDetail(id) {
    router.push({ name: 'NewsTeacherDetail', query: { id } });
  }

  async function delItem(id) {
    try {
      await typedConfirm({
        title: '本当に削除しますか？',
        content: '',
      });
      await deleteTeacherNews({ id });
      await ElMessage.success('削除しました！');
      getList();
    } catch (err) {
      if (err === 'cancel') {
        return;
      }

      ElMessage.error('削除に失敗しました！');
    }
  }
</script>
<style scoped lang="postcss">
  .admin-teacher {
    cursor: text;
    &:hover {
      color: var(--el-color-warning);
    }
  }
</style>
