<template>
  <c-list-table
    v-loading="loading"
    :data="tableData"
    :total="total"
    has-checkbox
    hide-setting
    hide-filter
    @sort-change="handleSortChange"
    @select="selectChanged"
    @refetch="getList"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
  >
    <template #header-left>
      <csv-export
        :selected-ids="selectedRows.map(({ id }) => id)"
        filename="生徒レポート"
        action="student/reports/download-csv"
        :total="total"
        :sort="sortFields"
      >
      </csv-export>
    </template>
    <template #header-right>
      <el-row>
        <el-col :span="12">
          <el-date-picker
            v-model="filters.year_month"
            type="month"
            value-format="YYYY-MM"
            :clearable="false"
            :editable="false"
            @change="onDateChange"
          />
        </el-col>
        <el-col :span="12">
          <el-row>
            <el-col class="flex items-center" :span="5">教室：</el-col>
            <el-col :span="19">
              <el-input
                v-model="filters.keyword"
                placeholder="入力教室"
                @change="onNameChange"
              />
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </template>
    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          :label="field.label"
          sortable="custom"
          :prop="field.prop"
          :min-width="field.labelWidth"
          show-overflow-tooltip
        >
        </el-table-column>
      </template>
      <el-table-column
        v-if="isShowDiscount"
        label="値引ID数"
        sortable="custom"
        prop="discount_num"
        :min-width="120"
        show-overflow-tooltip
      >
      </el-table-column>
    </template>
  </c-list-table>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import { DefaultPageSize } from '@/constants';
  import { getStudentReportsList } from '@/services';
  import CListTable from '@/components/table/CListTable.vue';

  interface TableFields {
    label: string;
    labelWidth: number;
    prop: string;
  }

  interface Filters {
    keyword: string;
    year_month: string;
  }

  const defaultStartFields: TableFields[] = [
    {
      label: '教室番号',
      labelWidth: 120,
      prop: 'school_id',
    },
    {
      label: '教室名',
      labelWidth: 120,
      prop: 'school_name',
    },
  ];

  const defaultEndFields: TableFields[] = [
    {
      label: '平均ID数',
      labelWidth: 120,
      prop: 'average_num',
    },
  ];

  const route = useRoute();
  const router = useRouter();

  /* computed */
  const selectedFields = computed(() => {
    const daysInMonth: number = dayjs(filters.year_month).daysInMonth();
    const daysFields: TableFields[] = new Array(daysInMonth)
      .fill({})
      .map((_item, index) => {
        const day = index + 1 + '';
        return {
          label: day + '日',
          labelWidth: 80,
          prop: day,
        };
      });
    return [...defaultStartFields, ...daysFields, ...defaultEndFields];
  });

  const query = computed(() => route.query || {});

  /* data */
  const loading = ref<boolean>(false);
  const tableData = ref<any>([]);
  const sortFields = ref();
  const currentPage = ref<number>(+(query.value?.page || 1));
  const pageSize = ref<number>(+(query.value?.pageSize || DefaultPageSize));
  const total = ref<number>(0);
  const selectedRows = ref([]);
  const dayNum = ref<string | undefined>(undefined);
  const isShowDiscount = ref<boolean>(false);
  const filters = reactive<Filters>(
    Object.assign(
      { keyword: '', year_month: dayjs().format('YYYY-MM') },
      query.value,
      { page: undefined, pageSize: undefined }
    )
  );

  /* methods */
  const onDateChange = () => {
    currentPage.value = 1;
    reloadWithQuery();
    getList();
  };

  const onNameChange = () => {
    currentPage.value = 1;
    reloadWithQuery();
    getList();
  };

  const getList = async () => {
    loading.value = true;
    try {
      const { items, total_records, is_show_discount_column } =
        await getStudentReportsList({
          ...filters,
          page: currentPage.value,
          pagesize: pageSize.value,
          order_by: sortFields.value,
          day_num: dayNum.value,
        });
      if (items) {
        tableData.value = items.map((item, index) => {
          return Object.assign(
            {},
            { ...item, ...item.data },
            {
              data: undefined,
              id: (currentPage.value - 1) * pageSize.value + index,
            }
          );
        });
      }
      isShowDiscount.value = is_show_discount_column;
      total.value = total_records;
    } finally {
      loading.value = false;
    }
  };

  const selectChanged = (selection) => {
    selectedRows.value = selection;
  };

  const handleSortChange = ({ prop, order }) => {
    if (!order) {
      sortFields.value = undefined;
      dayNum.value = undefined;
    } else {
      const obj = {
        descending: 'desc',
      };
      const key = Number(prop) ? 'day' : prop;
      dayNum.value = Number(prop) ? prop : undefined;
      sortFields.value = {
        [key]: obj[order] || 'asc',
      };
    }
    getList();
  };

  const handleSizeChange = (newPageSize: number) => {
    pageSize.value = newPageSize;
    currentPage.value = 1;
    getList();
  };

  const handlePageChange = (newCurrentPage: number) => {
    currentPage.value = newCurrentPage;
    getList();
  };

  const reloadWithQuery = () => {
    const query = {
      keyword: filters.keyword || undefined,
      year_month: filters.year_month || undefined,
    };
    router.replace({
      path: route.path,
      query,
    });
  };

  getList();
</script>
