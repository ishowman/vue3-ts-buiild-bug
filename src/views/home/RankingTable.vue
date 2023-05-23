<template>
  <div class="card-header grid grid-columns-auto justify-between items-center">
    <h3>順位表</h3>
    <div class="flex items-center">
      <el-radio-group
        v-model="pickerType"
        class="comiru-radio-button mr-[24px]"
        @change="onSearch"
      >
        <el-radio-button label="daterange">日</el-radio-button>
        <el-radio-button label="monthrange">月</el-radio-button>
        <el-radio-button label="year">年</el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-if="pickerType === 'daterange'"
        v-model="dateRange"
        :type="pickerType"
        value-format="YYYY-MM-DD"
        :clearable="false"
        :disabled-date="disabledDate"
        style="width: 385px"
        @change="onSearch"
      >
        <template #range-separator>~</template>
      </el-date-picker>
      <el-date-picker
        v-else-if="pickerType === 'monthrange'"
        v-model="monthRange"
        :type="pickerType"
        value-format="YYYY-MM"
        :editable="false"
        :clearable="false"
        unlink-panels
        :disabled-date="disabledDate"
        style="width: 385px"
        @change="onSearch"
      >
        <template #range-separator>~</template>
      </el-date-picker>
      <div v-else class="flex items-center">
        <el-date-picker
          v-model="startYear"
          value-format="YYYY"
          type="year"
          style="--el-date-editor-width: 180px"
          :editable="false"
          :clearable="false"
          :disabled-date="disabledDate"
          @change="onSearch"
        >
        </el-date-picker>
        <span class="mx-2">~</span>
        <el-date-picker
          v-model="endYear"
          value-format="YYYY"
          type="year"
          style="--el-date-editor-width: 180px"
          :editable="false"
          :clearable="false"
          :disabled-date="disabledDate"
          @change="onSearch"
        >
        </el-date-picker>
      </div>
    </div>
  </div>
  <el-form class="mb-8 mt-4">
    <el-form-item label="教室：">
      <el-select-v2
        v-model="selectedSchools"
        class="w-full"
        filterable
        :options="props.schoolOptions"
        placeholder="入力教室"
        multiple
        @change="onSearch"
      />
    </el-form-item>
  </el-form>

  <el-skeleton v-if="rankingLoading" class="mb-4" animated />
  <template v-else>
    <div class="text-center text-gray-400 text-xl mb-4">
      {{
        rankingData.is_adjacent_dates
          ? separateDate.end_date
          : separateDate.start_date + '~' + separateDate.end_date
      }}
    </div>
    <div class="flex justify-around items-center mb-8">
      <template v-for="(item, index) in indicateData" :key="index">
        <c-statistic
          :label="item.label"
          :data="rankingData[item.key]"
          :is-adjacent-dates="rankingData.is_adjacent_dates"
          :pre-date="separateDate.start_date"
        />
      </template>
    </div>

    <div class="percent-bars mb-[24px]">
      <template v-for="item in percentData" :key="item.label">
        <div>
          <p class="grid justify-between grid-columns-auto mb-[8px]">
            {{ item.label }}
            <span class="percent-value"
              >{{ rankingData.other_data[item.key] }} %</span
            >
          </p>
          <el-progress
            :percentage="rankingData.other_data[item.key]"
            :show-text="false"
            status="success"
          />
        </div>
      </template>
    </div>
  </template>

  <div class="flex justify-between items-start">
    <ranking-csv-export
      :params="csvParams"
      :total="total"
      :is-adjacent-dates="rankingData.is_adjacent_dates"
    ></ranking-csv-export>
    <el-form inline label-width="auto">
      <el-form-item label="教室:">
        <el-input v-model="schoolName" @input="onTableSearch"></el-input>
      </el-form-item>
      <el-form-item label="塾長:" style="margin-right: 0">
        <el-input v-model="ownerName" @input="onTableSearch"></el-input>
      </el-form-item>
    </el-form>
  </div>

  <el-table
    v-loading="tableLoading"
    :data="tableData"
    size="small"
    max-height="500"
    @sort-change="onSortChange"
  >
    <el-table-column
      v-for="(item, index) in tableHeader"
      :key="index"
      :label="item.label"
      header-align="center"
    >
      <el-table-column
        v-for="(item1, index1) in item.children"
        :key="index1"
        :prop="tableColumnIndex(index, index1) + ''"
        :label="item1"
        sortable="custom"
        min-width="100"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span>{{ scope.row[Number(scope.column.property)] }}</span>
        </template>
      </el-table-column>
    </el-table-column>
  </el-table>
  <div class="flex justify-end pt-4">
    <el-pagination
      v-model:currentPage="currentPage"
      :page-sizes="[10, DefaultPageSize, 50, MaxPageSize]"
      :page-size="pageSize"
      layout="total,  prev, pager, next, sizes, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    ></el-pagination>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import dayjs from 'dayjs';
  import { useDebounceFn } from '@vueuse/core';
  import { DefaultPageSize, MaxPageSize } from '@/constants';
  import RankingCsvExport from './RankingCsvExport.vue';
  import {
    getDashboardRankingDataTable,
    getDashboardRankingDataOverview,
    type IDashboardRankingDataOverviewResponse,
  } from '@/services/home';

  interface SchoolOptions {
    label: string;
    value: string | number;
    options?: SchoolOptions[];
  }

  interface IProps {
    schoolOptions: SchoolOptions[];
    minDate: string;
    maxDate: string;
  }

  /* props */
  const props = withDefaults(defineProps<IProps>(), {
    schoolOptions: () => {
      return [];
    },
    minDate: '',
    maxDate: '',
  });

  /* data */
  const indicateData = [
    {
      label: '入塾数',
      key: 'student_join_data',
    },
    {
      label: '退塾数',
      key: 'student_quit_data',
    },
    {
      label: '請求書',
      key: 'invoices_data',
    },
    {
      label: '合計金額',
      key: 'total_money_data',
    },
    {
      label: 'お知らせ',
      key: 'news_data',
    },
    {
      label: '指導報告書',
      key: 'reports_data',
    },
    {
      label: '集団指導報告書',
      key: 'group_reports_data',
    },
  ];

  const percentData = [
    {
      label: 'Login（保護者）',
      key: 'students_terms_count',
    },
    {
      label: 'アプリ登録率（保護者）',
      key: 'students_active_app_count',
    },
    {
      label: 'お知らせ 既読率',
      key: 'news_read_rate',
    },
    {
      label: 'お知らせ 返信率',
      key: 'news_reply_rate',
    },
    {
      label: '指導報告書 既読率',
      key: 'reports_read_rate',
    },
    {
      label: '指導報告書 返信率',
      key: 'reports_reply_rate',
    },
  ];

  const currentPage = ref<number>(1);
  const pageSize = ref<number>(20);
  const total = ref<number>(0);
  const dateRange = ref<[string, string]>([
    dayjs().subtract(2, 'days').format('YYYY-MM-DD'),
    dayjs().subtract(1, 'days').format('YYYY-MM-DD'),
  ]);
  const monthRange = ref<[string, string]>([
    dayjs(props.maxDate).subtract(1, 'months').format('YYYY-MM'),
    dayjs(props.maxDate).format('YYYY-MM'),
  ]);
  const pickerType = ref<string>('daterange');
  const startYear = ref<string>(
    dayjs(props.maxDate).subtract(1, 'years').format('YYYY')
  );
  const endYear = ref<string>(dayjs(props.maxDate).format('YYYY'));
  const schoolName = ref<string>('');
  const ownerName = ref<string>('');
  const selectedSchools = ref<(string | number)[]>([0]);
  const tableLoading = ref<boolean>(false);
  const rankingLoading = ref<boolean>(false);
  const tableData = ref<(string | number)[]>([]);
  const tableHeader = ref<{ label: string; children: string[] }[]>([]);
  const sort = ref<string | undefined>(undefined);
  const sortIndex = ref<number | undefined>(undefined);
  const rankingData = ref<IDashboardRankingDataOverviewResponse>({
    other_data: {
      students_terms_count: 0,
      students_active_app_count: 0,
      news_read_rate: 0,
      news_reply_rate: 0,
      reports_read_rate: 0,
      reports_reply_rate: 0,
    },
    student_join_data: {
      total: 0,
      rate: 0,
      prev_date_total: 0,
    },
    student_quit_data: {
      total: 0,
      rate: 0,
      prev_date_total: 0,
    },
    invoices_data: {
      total: 0,
      rate: 0,
      prev_date_total: 0,
    },
    total_money_data: {
      total: 0,
      rate: 0,
      prev_date_total: 0,
    },
    news_data: {
      total: 0,
      rate: 0,
      prev_date_total: 0,
    },
    reports_data: {
      total: 0,
      rate: 0,
      prev_date_total: 0,
    },
    group_reports_data: {
      total: 0,
      rate: 0,
      prev_date_total: 0,
    },
    is_adjacent_dates: false,
  });

  /* computed */
  const separateDate = computed(() => {
    switch (pickerType.value) {
      case 'daterange':
        return {
          start_date: dateRange.value[0],
          end_date: dateRange.value[1],
        };
      case 'monthrange':
        return {
          start_date: monthRange.value[0],
          end_date: monthRange.value[1],
        };
      case 'year':
        return {
          start_date: startYear.value,
          end_date: endYear.value,
        };
      default:
        return {
          start_date: dateRange.value[0],
          end_date: dateRange.value[1],
        };
    }
  });

  const csvParams = computed(() => {
    return {
      ...separateDate.value,
      schools: selectedSchools.value.join(','),
      school_name: schoolName.value,
      owner_name: ownerName.value,
      sort: sort.value,
      sort_index: sortIndex.value,
    };
  });

  /* methods */
  const disabledDate = (date: Date) => {
    return (
      dayjs(date).isBefore(props.minDate) || dayjs(date).isAfter(props.maxDate)
    );
  };

  const handleSizeChange = (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
    getTableData();
  };

  const handleCurrentChange = (page: number) => {
    currentPage.value = page;
    getTableData();
  };

  const onSortChange = ({ prop, order }) => {
    if (order) {
      sort.value = order === 'ascending' ? 'asc' : 'desc';
      sortIndex.value = Number(prop);
    } else {
      sort.value = undefined;
      sortIndex.value = undefined;
    }
    getTableData();
  };

  const onSearch = () => {
    currentPage.value = 1;
    getTableData();
    getRankingData();
  };

  const onTableSearch = useDebounceFn(() => {
    currentPage.value = 1;
    getTableData();
  }, 500);

  const tableColumnIndex = (headerIndex: number, dataIndex: number): number => {
    return (
      tableHeader.value
        .slice(0, headerIndex)
        .map((item) => item.children)
        .flat().length + dataIndex
    );
  };

  const getTableData = async () => {
    tableLoading.value = true;
    try {
      const { header, items, total_records } =
        await getDashboardRankingDataTable({
          page: currentPage.value,
          pagesize: pageSize.value,
          ...separateDate.value,
          schools: selectedSchools.value.join(','),
          school_name: schoolName.value,
          owner_name: ownerName.value,
          sort: sort.value,
          sort_index: sortIndex.value,
        });
      tableData.value = items;
      tableHeader.value = header;
      total.value = total_records;
    } finally {
      tableLoading.value = false;
    }
  };

  const getRankingData = async () => {
    rankingLoading.value = true;
    try {
      const { data } = await getDashboardRankingDataOverview({
        ...separateDate.value,
        schools: selectedSchools.value.join(','),
      });
      rankingData.value = data;
    } finally {
      rankingLoading.value = false;
    }
  };

  getTableData();
  getRankingData();
</script>

<style scoped lang="postcss">
  .percent-bars {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    justify-content: space-between;
    gap: 25px;
    font-size: 12px;
  }
</style>
