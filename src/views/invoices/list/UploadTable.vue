<template>
  <el-table :data="currentPageData" max-height="1052.5">
    <template #default>
      <template v-for="column in tableColumn" :key="column.key">
        <el-table-column
          :label="column.label"
          :prop="column.key"
          :width="Math.max(column.label.length * 20, 120)"
          show-overflow-tooltip
        >
          <template #default="scope">
            <template v-if="scope.row.info?.[column.key]">
              <span>
                {{ scope.row.info[column.key] }}
              </span>
            </template>
            <template v-else>
              <template v-if="column.key === `tax_free`">
                <div v-for="(isFree, i) in scope.row.data.tax_free" :key="i">
                  <c-icon-font
                    v-if="isFree"
                    name="icon-right1"
                    :size="ButtonIconHeight.default"
                  />
                </div>
              </template>
              <span v-else class="whitespace-pre-line">{{
                renderColumn(scope.row.data[column.key])
              }}</span>
            </template>
            <p class="text-danger">{{ scope.row.error[column.key] }}</p>
          </template>
        </el-table-column>
      </template>
    </template>
  </el-table>
  <div class="p-4 flex justify-end">
    <el-pagination
      v-model:currentPage="currentPage"
      :page-size="DefaultPageSize"
      layout="total,  prev, pager, next"
      :total="tableData.length"
      small
      @current-change="handlePageChange"
    />
  </div>
</template>

<script lang="ts" setup>
  import { DefaultPageSize, ButtonIconHeight } from '@/constants';
  import { computed, ref } from 'vue';
  import { isArray } from '@/utils';

  interface IProps {
    data: Record<string, any>[];
    columns: { key: string; label: string }[];
  }
  const props = withDefaults(defineProps<IProps>(), {
    data: () => [],
    columns: () => [],
  });
  const tableData = computed(() => props.data);
  const tableColumn = computed(() => props.columns);
  const currentPage = ref(1);

  const currentPageData = computed(() => {
    return tableData.value.slice(
      DefaultPageSize * (currentPage.value - 1),
      DefaultPageSize * currentPage.value
    );
  });

  function handlePageChange(page: number) {
    currentPage.value = page;
  }

  function renderColumn(data) {
    return isArray(data) ? data.join('\n') : data;
  }
</script>
<style scoped></style>
