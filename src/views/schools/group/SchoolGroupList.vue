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
      <el-button
        type="primary"
        @click="router.push({ name: `SchoolGroupCreate` })"
      >
        <c-icon-font name="icon-add" :size="ButtonIconHeight.default" />新規
      </el-button>
    </template>
    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          v-if="field.prop === 'operation'"
          fixed="right"
          label="操作"
          width="120"
        >
          <template #default="scope">
            <el-button
              text
              type="primary"
              @click="
                router.push({
                  name: `SchoolGroupUpdate`,
                  params: { id: scope.row.id },
                })
              "
            >
              編集
            </el-button>
            <el-button text type="danger" @click="deleteItem(scope.row.id)">
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
            <template v-if="field.prop === 'school_lists'">
              <el-tag
                v-for="school in scope.row[field.prop]"
                :key="school"
                type="primary"
                class="mr-0.5"
              >
                {{ school }}
              </el-tag>
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

  <school-group-filters-dialog
    v-model="tableFilterVisible"
    title="フィルタ"
    @filter-submit="syncFilters"
  />
</template>
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import {
    schoolGroupsFieldsConfig,
    ButtonIconHeight,
    StorageKeys,
    DefaultPageSize,
  } from '@/constants';
  import { getSchoolGroupsInfoIndex, deleteSchoolGroupsInfo } from '@/services';
  import { emptyFieldFormatter, typedConfirm } from '@/utils';
  import SchoolGroupFiltersDialog from './SchoolGroupFiltersDialog.vue';

  const route = useRoute();
  const router = useRouter();

  const loading = ref(false);
  const tableFieldsVisible = ref(false);
  const tableFilterVisible = ref(false);
  const query = computed(() => route.query || {});
  let tableData = ref<any>([]);
  let sortFields = ref();

  let currentPage = ref(+(query.value?.page || 1));
  let pageSize = ref(+(query.value?.pageSize || DefaultPageSize));
  let total = ref(0);
  const filters = ref();

  const defaultSortFields = ['name', 'code'];
  const localFieldKeys = StorageKeys.schoolGroupsFields;
  const defaultSelectedFields =
    localStorage.getItem(localFieldKeys)?.split(',') ||
    schoolGroupsFieldsConfig.map(({ prop }) => prop);

  const fieldsConfig = schoolGroupsFieldsConfig.map((item) => {
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
        localFieldKeys,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  function syncFilters(filterForm) {
    tableFilterVisible.value = false;
    filters.value = filterForm;
    getList();
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

  async function getList() {
    loading.value = true;
    try {
      const { items, total_records } = await getSchoolGroupsInfoIndex({
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

  async function deleteItem(id) {
    const title = '本当に削除しますか？';
    operationMessage({
      title,
      fn: async () => deleteSchoolGroupsInfo({ id }),
    });
  }

  async function operationMessage({ title, fn }) {
    if (!fn) {
      return;
    }
    try {
      await typedConfirm({ title, content: '' });
      await fn();
      ElMessage.success('削除しました！');
      getList();
    } catch (err) {
      if (err === 'cancel') {
        return;
      }
      ElMessage.error('削除に失敗しました！');
    }
  }
</script>
