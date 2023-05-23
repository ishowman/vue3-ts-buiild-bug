<template>
  <static-cards class="mb-[24px]" />

  <div class="dashboard-charts grid gap-6 mb-[24px]">
    <el-card id="chart-bar" ref="bar" class="w-full h-full">
      <div class="flex items-center justify-between">
        <h3>基本データ</h3>
        <div>
          <el-date-picker
            v-model="selectedDates"
            type="monthrange"
            value-format="YYYY-MM"
            :editable="false"
            :clearable="false"
            unlink-panels
            :disabled-date="(date) => isSelectableMonth(date)"
          />
        </div>
      </div>
      <el-tabs v-model="activeBasicTabName">
        <el-tab-pane label="生徒数" name="student" lazy>
          <el-skeleton v-if="dateLoading" :rows="6" animated />
          <chart
            v-else
            type="dualAxes"
            :options="studentMixChartOptions"
            action="/dashboard/basic-data-overview?type=students"
            has-date-filter
            :school-options="schoolOptions"
            :dates="selectedDates"
          />
        </el-tab-pane>
        <el-tab-pane label="請求書" name="invoice" lazy>
          <chart
            type="dualAxes"
            :options="invoiceChartOptions"
            action="/dashboard/basic-data-overview?type=invoices"
            has-date-filter
            :school-options="schoolOptions"
            :dates="selectedDates"
          />
        </el-tab-pane>
        <el-tab-pane label="お知らせ" name="news" lazy>
          <chart
            type="dualAxes"
            :options="lineMixChartOptions"
            action="/dashboard/basic-data-overview?type=news"
            has-date-filter
            :school-options="schoolOptions"
            :dates="selectedDates"
          />
        </el-tab-pane>
        <el-tab-pane label="指導報告書" name="report" lazy>
          <chart
            type="dualAxes"
            :options="lineMixChartOptions"
            action="/dashboard/basic-data-overview?type=reports"
            has-date-filter
            :school-options="schoolOptions"
            :dates="selectedDates"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-card>
      <h3>その他のデータ</h3>
      <el-tabs v-model="activeOtherTabName">
        <el-tab-pane label="アプリ利用率" name="usage_rate" lazy>
          <chart
            type="pie"
            :options="usageRateChartOptions"
            action="/dashboard/other-data-overview?type=app"
            :school-options="schoolOptions"
          />
        </el-tab-pane>
        <el-tab-pane label="男女比率" name="gender_ratio" lazy>
          <chart
            type="pie"
            :options="genderRatioChartOptions"
            :filter-label-span="3"
            action="/dashboard/other-data-overview?type=sex"
            :school-options="schoolOptions"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>

  <el-card ref="tableCard" class="mb-[24px]">
    <el-skeleton v-if="dateLoading" :rows="8" animated />
    <ranking-table
      v-else
      :school-options="schoolOptions"
      :min-date="minDate"
      :max-date="maxDate"
    />
  </el-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import StaticCards from './StatisticCards.vue';
  import Chart from './Chart.vue';
  import RankingTable from './RankingTable.vue';
  import {
    studentMixChartOptions,
    invoiceChartOptions,
    lineMixChartOptions,
    usageRateChartOptions,
    genderRatioChartOptions,
  } from './chartOptions';
  import {
    getAllSchools,
    getAllSchoolGroups,
    getCorporationInfo,
  } from '@/services';

  interface SchoolOptions {
    label: string;
    value: string | number;
    options?: SchoolOptions[];
  }

  const activeBasicTabName = ref<string>('student');
  const activeOtherTabName = ref<string>('usage_rate');
  const schoolOptions = ref<SchoolOptions[]>([{ value: 0, label: 'All' }]);
  const selectedDates = ref<[string, string]>(['', '']);
  const minDate = ref<string>('');
  const maxDate = ref<string>('');
  const dateLoading = ref<boolean>(false);

  const getSchoolOptions = async () => {
    try {
      const [{ lists: schools }, { lists: schoolGroups }] = await Promise.all([
        getAllSchools(),
        getAllSchoolGroups(),
      ]);
      schoolOptions.value = [
        ...schoolOptions.value,
        {
          value: 'group',
          label: 'グループ',
          options: schoolGroups,
        },
        {
          value: 'school',
          label: '教室',
          options: schools,
        },
      ];
    } catch (error) {
      console.log(error);
    }
  };

  const isSelectableMonth = (date: Date) => {
    return (
      dayjs(date).isBefore(minDate.value) || dayjs(date).isAfter(maxDate.value)
    );
  };

  const getDateLimits = async () => {
    try {
      dateLoading.value = true;
      const {
        data: { min_date, max_date },
      } = await getCorporationInfo();
      minDate.value = min_date;
      maxDate.value = max_date;
      selectedDates.value = [
        dayjs(maxDate.value).subtract(11, 'months').format('YYYY-MM'),
        dayjs(maxDate.value).format('YYYY-MM'),
      ];
      if (dayjs(minDate.value).isAfter(selectedDates.value[0])) {
        selectedDates.value[0] = dayjs(minDate.value).format('YYYY-MM');
      }
    } finally {
      dateLoading.value = false;
    }
  };

  getDateLimits();
  getSchoolOptions();
</script>

<style scoped lang="postcss">
  .dashboard-charts {
    grid-template-columns: 1fr 384px;
    height: 508px;
  }
  .comiru-radio-button {
    vertical-align: bottom;
    & .el-radio-button {
      --el-radio-button-checked-text-color: var(--el-color-primary);
      --el-radio-button-checked-bg-color: #fff;
    }
  }
</style>
