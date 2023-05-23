<template>
  <c-list-table
    :key="type"
    v-loading="loading"
    :data="tableData"
    :total="total"
    @sort-change="handleSortChange"
    @select="selectChanged"
    @setting="tableFieldsVisible = true"
    @filter="tableFilterVisible = true"
    @refetch="getList"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
  >
    <template #header-left>
      <el-button
        v-show="isAdmin"
        type="primary"
        :disabled="!selectedRows.length"
        @click="batchConfirm"
      >
        <c-icon-font
          name="icon-right"
          :height="ButtonIconHeight.default"
          class="mr-2"
        />一括承認
      </el-button>
    </template>

    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          v-if="field.prop === 'operation'"
          fixed="right"
          label="操作"
          width="136"
        >
          <template #default="scope">
            <div class="inline-flex">
              <el-button
                v-if="isEditable(scope.row)"
                text
                type="primary"
                @click.prevent="editRow(scope.row)"
              >
                編集
              </el-button>

              <template v-if="scope.row.confirm === confirmStatus[1]">
                <el-button
                  text
                  type="primary"
                  @click="removeFromInactive(scope.row.id)"
                >
                  復職する
                </el-button>
              </template>

              <template v-if="scope.row.confirm === confirmStatus[0]">
                <el-button
                  text
                  type="primary"
                  @click="
                    confirmInactiveStatus({
                      id: scope.row.id,
                      type: 'confirm',
                    })
                  "
                >
                  承認
                </el-button>

                <el-button
                  text
                  type="danger"
                  @click="
                    confirmInactiveStatus({
                      id: scope.row.id,
                      type: 'deny',
                    })
                  "
                >
                  却下
                </el-button>
              </template>
            </div>
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
            <template v-if="field.prop === 'inactive_status'">
              <c-component
                v-for="component in inactiveStatusRender([
                  scope.row[field.prop],
                ]).components"
                v-bind="component"
                :key="`${field.prop}-${component.uniqKey}`"
              />
            </template>
            <template v-else-if="field.prop === 'is_school_admin'">
              <div
                v-if="scope.row[field.prop]"
                class="flex justify-center items-center w-4 h-4 rounded-full border border-solid border-current"
              >
                <c-icon-font
                  height="16px"
                  name="icon-right"
                  color="var(--el-text-color-regular)"
                />
              </div>
            </template>

            <template v-else-if="field.prop === 'type'">
              <c-component
                v-for="component in inactiveTeacherTypeRender([
                  scope.row[field.prop],
                ]).components"
                v-bind="component"
                :key="`${field.prop}-${component.uniqKey}`"
              />
            </template>
            <template v-else-if="field.prop === 'confirm'">
              <c-component
                v-for="component in inactiveTeacherConfirmRender([
                  scope.row[field.prop],
                ]).components"
                v-bind="component"
                :key="`${field.prop}-${component.uniqKey}`"
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
  <inactive-teacher-filters-dialog
    v-model="tableFilterVisible"
    title="フィルタ"
    @filter-submit="syncFilters"
  />
  <c-dialog
    v-model="editModalVisible"
    title="編集"
    :confirm-disabled="!currentRow.schedule || !currentRow.id"
    @confirm="updateRow"
  >
    <el-form label-position="top">
      <el-form-item label="予約時間：">
        <el-date-picker
          v-model="currentRow.schedule"
          type="date"
          value-format="YYYY-MM-DD"
          :disabled-date="isInvalidDate"
        />
      </el-form-item>
    </el-form>
  </c-dialog>
</template>

<script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import {
    getInactiveTeachers,
    inactiveTeacherBatchConfirm,
    inactiveTeacherConfirm,
    inactiveTeacherRecovery,
    inactiveTeacherSchedule,
  } from '@/services';
  import {
    DefaultPageSize,
    ButtonIconHeight,
    StorageKeys,
    InactiveTeacherFieldsMap,
    MaxTimestamp,
    MinTimestamp,
    confirmStatus,
  } from '@/constants';
  import { emptyFieldFormatter, typedConfirm } from '@/utils';
  import {
    inactiveTeacherTypeRender,
    inactiveStatusRender,
    inactiveTeacherConfirmRender,
  } from './fieldRender';
  import InactiveTeacherFiltersDialog from './InactiveTeacherFiltersDialog.vue';
  interface IProps {
    type?: string;
    visible?: boolean;
  }

  const props = withDefaults(defineProps<IProps>(), {
    type: 'admin',
    visible: false,
  });

  const route = useRoute();
  const query = computed(() => route.query || {});

  const loading = ref(false);
  const tableFieldsVisible = ref(false);
  async function batchConfirm() {
    const ids = selectedRows.value.map(({ id }) => id);
    if (!ids.length) {
      return;
    }

    const msg = '承認';
    operationMessage({
      msg,
      fn: async () => inactiveTeacherBatchConfirm({ ids: ids.join() }),
    });
  }
  const editModalVisible = ref(false);

  const tableData = ref<any>([]);
  const total = ref(0);
  const sortFields = ref();
  const currentPage = ref(+(query.value?.page || 1));
  const pageSize = ref(+(query.value?.pageSize || DefaultPageSize));

  const type = computed(() => props.type);
  const isAdmin = computed(() => type.value === 'admin');

  const defaultSortFields = ['type', 'confirm'];
  const defaultSelectedFields = computed(() => {
    const fieldsKey = isAdmin.value
      ? StorageKeys.adminInactiveTeacherFields
      : StorageKeys.otherInactiveTeacherFields;
    return (
      localStorage.getItem(fieldsKey)?.split(',') || [
        'name',
        'name_kana',
        'email',
        'inactive_status',
        'is_school_admin',
        'school_name',
        'schedule',
        'current_state',

        'type',
        'confirm',
        ...(isAdmin.value ? ['operation'] : []),
      ]
    );
  });

  const fieldsConfig = computed(() => {
    const OperationField = 'operation';
    let fields = Object.entries(InactiveTeacherFieldsMap);
    if (!isAdmin.value) {
      fields = Object.entries(InactiveTeacherFieldsMap).filter(([prop]) => {
        return prop !== OperationField;
      });
    }
    return fields.map(([prop, label]) => ({
      label,
      labelWidth: ['email'].includes(prop)
        ? 205
        : ['inactive_status', 'current_state'].includes(prop)
        ? 160
        : label.length > 4
        ? 20 + label.length * 15
        : 120,
      prop,
      show: defaultSelectedFields.value.includes(prop),
      sort: defaultSortFields.includes(prop) && 'custom',
    }));
  });

  const selectedFields = ref(
    fieldsConfig.value.filter((config) => config.show)
  );

  watch(selectedFields, (newVal) => {
    if (newVal) {
      const fieldsKey = isAdmin.value
        ? StorageKeys.adminInactiveTeacherFields
        : StorageKeys.otherInactiveTeacherFields;

      localStorage.setItem(
        fieldsKey,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

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
  const filters = ref();

  async function getList() {
    loading.value = true;
    try {
      const { items, total_records } = await getInactiveTeachers({
        page: currentPage.value,
        pagesize: pageSize.value,
        order_by: sortFields.value,
        type: type.value,
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

  const tableFilterVisible = ref(false);
  function syncFilters(filterForm) {
    console.log('receive filter data', filterForm);
    tableFilterVisible.value = false;
    filters.value = filterForm;
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

  const selectedRows = ref([]);

  function selectChanged(selection) {
    console.log('selection', selection);
    selectedRows.value = selection;
  }
  const currentRow = ref({ schedule: null, id: null });

  function editRow(row) {
    editModalVisible.value = true;
    const { id, schedule } = row;

    currentRow.value = { id, schedule };
  }

  async function updateRow() {
    const { id, schedule } = currentRow.value;
    try {
      await inactiveTeacherSchedule({
        id,
        schedule,
      });
      ElMessage.success('更新しました！');

      editModalVisible.value = false;
      getList();
    } catch (err) {
      ElMessage.closeAll();
      ElMessage.error('更新に失敗しました！');
    }
  }

  function fieldFormatter(fieldValue) {
    const { isEmpty, value } = emptyFieldFormatter(fieldValue, '');
    if (isEmpty) {
      return value;
    }
    return fieldValue;
  }
  function isInvalidDate(date) {
    const timestamp = new Date(date).getTime();
    return timestamp > MaxTimestamp || timestamp < MinTimestamp;
  }

  function isEditable(row) {
    const { schedule, confirm } = row;
    return schedule || (!schedule && confirm === confirmStatus[0]);
  }

  async function operationMessage({ msg, fn }) {
    if (!fn) {
      return;
    }
    try {
      await typedConfirm({ title: `本当に${msg}しますか？`, content: '' });
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

  async function removeFromInactive(id) {
    const msg = '復職';
    operationMessage({
      msg,
      fn: async () => inactiveTeacherRecovery({ id }),
    });
  }

  function confirmInactiveStatus({ id, type }) {
    const msg = type === 'deny' ? '却下' : '承認';
    operationMessage({
      msg,
      fn: async () => inactiveTeacherConfirm({ id, type }),
    });
  }
</script>
