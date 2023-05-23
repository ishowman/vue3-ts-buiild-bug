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
      <news-csv-export
        :selected-ids="selectedRows.map(({ id }) => id)"
        :total="total"
        :sort="csvSortFields"
      />
      <el-button
        type="danger"
        :disabled="!selectedRows.length"
        @click="batchDelete"
      >
        一括削除
      </el-button>

      <el-button
        type="primary"
        :disabled="!selectedRows.length"
        @click="visible = true"
      >
        一括送信
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
              text
              type="primary"
              @click.prevent="linkToEdit(scope.row.id)"
            >
              編集
            </el-button>
            <el-button
              v-if="scope.row.survey_count > 0"
              :disabled="surveyLoading"
              text
              type="primary"
              @click="downloadSurvey(scope.row.id)"
            >
              アンケート結果
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
            <template v-else-if="field.prop === 'survey_count'">
              {{ scope.row.survey_count || '' }}
            </template>

            <template v-else-if="['status', 'is_public'].includes(field.prop)">
              <c-icon-font
                v-if="scope.row[field.prop]"
                name="icon-right1"
                :size="ButtonIconHeight.default"
              />
            </template>
            <template v-else-if="field.prop === 'can_comment'">
              <c-icon-font
                v-if="scope.row[field.prop] === false"
                name="icon-Disable"
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
  ></c-table-field-dialog>

  <news-filters-dialog
    v-model="tableFilterVisible"
    title="フィルタ"
    @filter-submit="syncFilters"
  />

  <c-dialog
    v-model="visible"
    :show-close="false"
    width="416px"
    custom-class="news-public"
    @closed="
      publicForm = {
        send_schedule: false,
        scheduled_time: '',
      }
    "
  >
    <template #title>
      <div class="flex">
        <c-icon-font
          size="18px"
          color="var(--el-color-warning)"
          class="mr-2 translate-y-1"
          name="icon-warning"
        ></c-icon-font>
        <h4 class="text-[16px]">
          選択したお知らせを一括で送信しますがよろしいですか？
        </h4>
      </div>
    </template>
    <el-form class="pl-7">
      <p>
        <el-checkbox v-model="publicForm.send_schedule">予約送信</el-checkbox>
      </p>
      <el-date-picker
        v-if="publicForm.send_schedule"
        v-model="publicForm.scheduled_time"
        type="datetime"
        value-format="YYYY-MM-DD HH:mm"
        format="YYYY-MM-DD HH:mm"
      />
      <p class="text-secondary">
        保護者/生徒へのアプリのプッシュ通知と通知メールの送信時刻を指定することができます。
      </p>
    </el-form>
    <template #footer>
      <el-button plain @click="visible = false"> 取消 </el-button>
      <el-button
        type="primary"
        :disabled="publicForm.send_schedule && !publicForm.scheduled_time"
        @click="batchNotify"
      >
        確認
      </el-button>
    </template>
  </c-dialog>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import {
    newsFieldsConfig,
    ButtonIconHeight,
    StorageKeys,
    DefaultPageSize,
    MaxPageSize,
  } from '@/constants';
  import { emptyFieldFormatter, typedConfirm, downloadCSV } from '@/utils';
  import {
    deleteNews,
    getNews,
    publicNews,
    exportSurveyById,
  } from '@/services';

  import CListTable from '@/components/table/CListTable.vue';
  import NewsFiltersDialog from './NewsFiltersDialog.vue';
  import NewsCsvExport from './NewsCsvExport.vue';

  const route = useRoute();
  const router = useRouter();

  const loading = ref(false);
  const tableFieldsVisible = ref(false);
  const tableFilterVisible = ref(false);
  const visible = ref(false);
  const query = computed(() => route.query || {});
  const tableData = ref<any>([]);
  const sortFields = ref();

  const defaultSortFields = ['date', 'status', 'is_public', 'can_comment'];
  const defaultSelectedFields = localStorage
    .getItem(StorageKeys.newsFields)
    ?.split(',') || [
    'school_name',
    'teacher_name',
    'title',
    'survey_count',

    'date',
    'scheduled_time',
    'students',
    'status',
    'operation',
  ];
  const fieldsConfig = newsFieldsConfig.map((item) => {
    return {
      ...item,
      show: defaultSelectedFields.includes(item.prop),
      sort: defaultSortFields.includes(item.prop) && 'custom',
    };
  });

  const publicForm = ref({
    send_schedule: false,
    scheduled_time: '',
  });

  const selectedFields = ref(fieldsConfig.filter((config) => config.show));
  watch(selectedFields, (newVal) => {
    console.log('selectedFields', newVal);
    if (newVal) {
      localStorage.setItem(
        StorageKeys.newsFields,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  const currentPage = ref(+(query.value?.page || 1));
  const pageSize = ref(+(query.value?.pageSize || DefaultPageSize));
  const total = ref(0);
  const selectedRows = ref([]);
  const filters = ref();
  const surveyLoading = ref<boolean>(false);

  const csvSortFields = computed(() => {
    return sortFields.value
      ? {
          order_by: sortFields.value,
        }
      : {};
  });

  async function getList() {
    loading.value = true;
    try {
      const { items, total_records } = await getNews({
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
    console.log('receive filter data', filterForm);
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

  function linkToCreate() {
    router.push({ name: 'NewsCreate' });
  }

  async function batchDelete() {
    const ids = selectedRows.value.map(({ id }) => id);
    if (!ids.length) {
      return;
    }

    const title = '選択したお知らせを一括削除しますがよろしいですか？';
    operationMessage({
      title,
      fn: async () => {
        await deleteNews({ ids: ids.join() });
        selectedRows.value = [];
      },
    });
  }

  async function batchNotify() {
    try {
      const ids = selectedRows.value.map(({ id }) => id);
      if (!ids.length) {
        return;
      }
      const params = { ids: ids.join() };
      params['send_schedule'] = publicForm.value.send_schedule;
      if (publicForm.value.send_schedule) {
        params['scheduled_time'] = publicForm.value.scheduled_time;
      }
      await publicNews(params);
      ElMessage.success('更新しました！');
      visible.value = false;
      getList();
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      ElMessage.error('更新に失敗しました！');
    }
  }

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

  function linkToDetail(id) {
    router.push({ name: 'NewsDetail', query: { id } });
  }

  function linkToEdit(id) {
    router.push({ name: 'NewsEdit', params: { id } });
  }

  const downloadSurvey = async (id: number) => {
    surveyLoading.value = true;
    try {
      const { meta, data } = await exportSurveyById({
        id,
        pagesize: MaxPageSize,
        page: 1,
      });

      downloadCSV([
        {
          header: meta.header,
          file_name: 'アンケート結果',
        },
        data,
      ]);

      ElMessage.success('エクスポート成功になりました!');
    } finally {
      surveyLoading.value = false;
    }
  };

  async function operationMessage({ title, fn }) {
    if (!fn) {
      return;
    }
    try {
      await typedConfirm({ title, content: '' });
      await fn();
      ElMessage.success('更新しました！');
      getList();
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      ElMessage.error('更新に失敗しました！');
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

<style>
  .news-public .el-dialog__body {
    --el-border-color-light: transparent;
    padding: 8px 32px 0 24px;
  }
  .news-public .el-dialog__header {
    padding: 32px 32px 0;
  }
  .news-public .el-dialog__footer {
    padding: 24px 32px;
  }
</style>
