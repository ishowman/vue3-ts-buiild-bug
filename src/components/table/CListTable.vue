<template>
  <div ref="tableBlockRef" class="table-block layout-container comiru-content">
    <div class="flex justify-between p-4 pb-1">
      <div class="header-left">
        <slot name="header-left"></slot>
      </div>
      <div class="flex items-top">
        <slot name="header-right">
          <el-button
            v-if="!hideFilter"
            plain
            type="primary"
            class="mb-3"
            @click="showFilter"
          >
            <c-icon-font
              name="icon-screen"
              :size="ButtonIconHeight.default"
            />フィルタ
          </el-button>
        </slot>

        <button class="icon-button" @click="refetch">
          <c-icon-font name="icon-Refresh" :size="ButtonIconHeight.large" />
        </button>

        <button class="icon-button" @click="showSetting">
          <c-icon-font
            v-if="!hideSetting"
            name="icon-set"
            :size="ButtonIconHeight.large"
          />
        </button>

        <button class="icon-button" @click="toggleFullscreen">
          <c-icon-font
            :name="isFullscreen ? 'icon-mini' : 'icon-normal'"
            :size="ButtonIconHeight.large"
          />
        </button>
      </div>
    </div>

    <el-table
      ref="multipleTableRef"
      row-key="id"
      max-height="750px"
      :highlight-current-row="false"
      :row-class-name="getRowClass"
      v-bind="$attrs"
      @select="selectChanged"
      @select-all="selectAllHandler"
    >
      <el-table-column v-if="hasCheckbox" type="selection" width="30" fixed />
      <slot></slot>
    </el-table>
    <div v-if="props.pageable" class="p-4 flex justify-end">
      <el-pagination
        v-model:currentPage="currentPage"
        :page-sizes="[10, DefaultPageSize, 50, MaxPageSize]"
        :page-size="pageSize"
        layout="total,  prev, pager, next, sizes, jumper"
        :total="props.total"
        small
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
  const RefetchEvent = 'refetch';
  const SettingEvent = 'setting';
  const FilterEvent = 'filter';
  const CurrentChangeEvent = 'current-change';
  const SizeChangeEvent = 'size-change';
  const SelectEvent = 'select';
</script>

<script lang="ts" setup>
  import { ButtonIconHeight, DefaultPageSize, MaxPageSize } from '@/constants';
  import type { ElTable } from 'element-plus';
  import { useRouter, useRoute } from 'vue-router';
  import { computed, onMounted, onBeforeUnmount, ref } from 'vue';

  import { useFullscreen } from '@vueuse/core';
  export interface ITable {
    total: typeof ElTable.total;
    hasCheckbox: boolean;
    pageable?: boolean;
    hideSetting?: boolean;
    hideFilter?: boolean;
  }

  const props = withDefaults(defineProps<ITable>(), {
    total: 0,
    hasCheckbox: true,
    pageable: true,
    hideSetting: false,
    hideFilter: false,
  });

  const emits = defineEmits([
    RefetchEvent,
    SettingEvent,
    FilterEvent,
    CurrentChangeEvent,
    SizeChangeEvent,
    SelectEvent,
  ]);
  const tableBlockRef = ref();
  const route = useRoute();
  const router = useRouter();
  const query = computed(() => route.query || {});

  const multipleTableRef = ref<InstanceType<typeof ElTable>>();
  const rowKey = ref<string>(`id`); // 默认为 id，外部可以通过 <c-list-table row-key='custom-rowkey' /> 来覆盖
  const selectedRows = ref([]);
  const selectedKeys = computed<string[]>(() =>
    selectedRows.value.map((item) => item[rowKey.value])
  );
  const tableClass = ref<string[]>([]);

  onMounted(() => {
    // update rowKey if row-key is set in CListTable
    if (
      multipleTableRef.value?.rowKey &&
      typeof multipleTableRef.value.rowKey === 'string'
    ) {
      rowKey.value = multipleTableRef.value.rowKey;
    }
  });

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', bodyHandler);
  });

  const { toggle: toggleFullscreen, isFullscreen } = useFullscreen(
    document.body
  );

  function bodyHandler() {
    document.body.classList.toggle('fullscreen');
  }

  document.addEventListener('fullscreenchange', bodyHandler);

  function selectChanged(selection) {
    selectedRows.value = selection;

    tableClass.value = [];
    emits(SelectEvent, selectedRows.value);
  }

  function selectAllHandler(selection) {
    selectedRows.value = selection;
    emits(SelectEvent, selectedRows.value);
  }

  const currentPage = ref(+(query.value?.page || 1));
  const pageSize = ref(+(query.value?.pageSize || DefaultPageSize));

  function reloadWithQuery(query) {
    router.replace({
      path: route.path,
      query,
    });
  }

  function handlePageChange(newCurrentPage: number) {
    currentPage.value = newCurrentPage;
    const query = {
      ...route.query,
      page: newCurrentPage,
    };
    emits(CurrentChangeEvent, newCurrentPage);
    selectedRows.value = [];

    emits(SelectEvent, selectedRows.value);

    reloadWithQuery(query);
  }

  function handleSizeChange(newPageSize) {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    const query = {
      ...route.query,
      pageSize: newPageSize,
      page: 1,
    };
    selectedRows.value = [];
    emits(SizeChangeEvent, newPageSize);
    reloadWithQuery(query);
  }

  function refetch() {
    emits(RefetchEvent);
  }

  function showSetting() {
    emits(SettingEvent);
  }
  function showFilter() {
    emits(FilterEvent);
  }

  function getRowClass({ row }) {
    return row[rowKey.value] && selectedKeys.value.includes(row[rowKey.value])
      ? 'current-row'
      : '';
  }
</script>
<style scoped lang="postcss">
  .header-left::v-deep(.el-button) {
    margin-bottom: 12px;
  }

  .icon-button {
    display: inline-flex;
    height: 32px;
    margin-left: 1rem;
    padding: 0;
    justify-content: center;
    align-items: center;
    background: none;
    border: 0;
    cursor: pointer;
    outline: none;
  }

  .table-block::v-deep(.el-pagination--small .el-select .el-input) {
    width: 110px;
  }
</style>
