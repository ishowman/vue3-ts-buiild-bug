<template>
  <div class="home-chart w-full">
    <el-form label-width="60px">
      <el-form-item label="教室：">
        <el-select-v2
          v-model="selectedSchools"
          class="w-full"
          filterable
          :options="props.schoolOptions"
          placeholder="入力教室"
          multiple
          collapse-tags
          collapse-tags-tooltip
          @change="onSchoolSelectChange"
        />
      </el-form-item>
    </el-form>
    <el-skeleton v-if="loading" :rows="5" animated />
    <div
      v-show="!loading"
      ref="chartContainer"
      class="home-chart-container w-full"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, computed } from 'vue';
  // https://g2plot.antv.vision/zh/examples/line/basic#line
  import { DualAxes, Line, Pie } from '@antv/g2plot';
  import { apiClient } from '@/utils';

  interface SchoolOptions {
    label: string;
    value: string | number;
    options?: SchoolOptions[];
  }

  interface IProps {
    options: any;
    height?: string;
    type: 'line' | 'dualAxes' | 'pie';
    action: string;
    hasDateFilter?: boolean;
    schoolOptions: SchoolOptions[];
    dates?: string[];
  }

  /* props */
  const props = withDefaults(defineProps<IProps>(), {
    options: {},
    height: '340px',
    type: 'line',
    action: '',
    hasDateFilter: false,
    schoolOptions: () => {
      return [];
    },
    dates: () => {
      return [];
    },
  });

  /* computed */
  const chartOptions = computed(() => {
    return Object.assign(props.options, { data: chartData.value });
  });

  const separateDate = computed(() => {
    return props.dates?.length
      ? {
          start_date: props.dates[0],
          end_date: props.dates[1],
        }
      : {};
  });

  const params = computed(() => {
    return props.hasDateFilter
      ? Object.assign(separateDate.value, {
          schools: selectedSchools.value.join(','),
        })
      : { schools: selectedSchools.value.join(',') };
  });

  /* data */
  const chartContainer = ref();
  const chart = ref<any>(null);
  const loading = ref<boolean>(false);
  const chartData = ref<any>(null);
  const selectedSchools = ref<(string | number)[]>([0]);

  /* methods */
  const renderChart = (type: string) => {
    if (type === 'render') {
      chart.value.render(chartOptions.value);
    } else {
      chart.value.changeData(chartOptions.value.data);
    }
  };

  const getChart = (type: typeof props.type) => {
    switch (type) {
      case 'line':
        return new Line(chartContainer.value, chartOptions.value);
      case 'dualAxes':
        return new DualAxes(chartContainer.value, chartOptions.value);
      case 'pie':
        return new Pie(chartContainer.value, chartOptions.value);
      default:
        return new Line(chartContainer.value, chartOptions.value);
    }
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const res: any = await apiClient.get(props.action, {
        params: params.value,
      });
      chartData.value = res.data;
    } catch (error) {
      chartData.value = [];
    } finally {
      loading.value = false;
    }
  };

  const onSchoolSelectChange = () => {
    fetchData();
  };

  /* watch */
  watch(
    () => chartData.value,
    (_newValue, oldValue) => {
      if (oldValue !== null) {
        renderChart('data-change');
      }
    }
  );

  watch(
    () => props.dates,
    () => {
      fetchData();
    }
  );

  onMounted(async () => {
    await fetchData();
    chart.value = getChart(props.type);
    renderChart('render');
  });
</script>

<style scoped lang="postcss">
  .home-chart-container {
    height: v-bind(height);
  }
</style>
