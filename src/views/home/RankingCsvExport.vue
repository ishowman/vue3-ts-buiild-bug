<template>
  <el-button plain :loading="loading" @click="handleDownload">
    <c-icon-font
      name="icon-Download"
      :size="ButtonIconHeight.default"
    />CSVダウンロード
    <span v-if="loading">{{ percent }}</span>
  </el-button>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { ButtonIconHeight, MaxPageSize } from '@/constants';
  import { downloadCSV } from '@/utils';
  import { exportDashboardRankingCsv } from '@/services/home';

  interface IParams {
    start_date: string;
    end_date: string;
    schools: string;
    school_name: string;
    owner_name: string;
    sort: string | undefined;
    sort_index: number | undefined;
  }
  interface IProps {
    params: IParams;
    total: number;
    isAdjacentDates: boolean;
  }

  interface IMeta {
    header: string[];
    page: number;
    pagesize: number;
    total_page: number;
  }

  interface IResponse {
    data: string[][];
    meta: IMeta;
  }

  const emit = defineEmits(['downloaded']);

  const props = withDefaults(defineProps<IProps>(), {
    params: () => {
      return {
        start_date: '',
        end_date: '',
        schools: '',
        school_name: '',
        owner_name: '',
        sort: '',
        sort_index: 0,
      };
    },
    total: 0,
    isAdjacentDates: false,
  });

  const data = ref<string[][]>([]);
  const header = ref<string[]>([]);
  const loading = ref<boolean>(false);
  const page = ref<number>(1);
  const pageSize = ref<number>(MaxPageSize);

  const percent = computed<string | number>(() => {
    if (props.total === 0) {
      return 0;
    }
    return Math.floor((data.value.length / props.total) * 100) + '%';
  });

  const downloadCsv = () => {
    let date = props.params.start_date + '_' + props.params.end_date;
    if (props.isAdjacentDates) {
      date = props.params.end_date;
    }

    downloadCSV([
      {
        header: header.value,
        file_name: date + '_順位表',
      },
      data.value,
    ]);
  };

  const fetch = async () => {
    const res: IResponse = await exportDashboardRankingCsv({
      page: page.value,
      pagesize: pageSize.value,
      ...props.params,
    });
    if (res.meta.header.length > header.value.length) {
      header.value = res.meta.header;
    }
    data.value = data.value.concat(res.data);

    if (res.data.length < pageSize.value || res.data.length === 0) {
      return Promise.resolve();
    }
    page.value++;
    return fetch();
  };

  const resetData = () => {
    data.value = [];
    header.value = [];
    page.value = 1;
  };

  const handleDownload = async () => {
    loading.value = true;
    try {
      await fetch();
      downloadCsv();
      emit('downloaded');
      ElMessage.success('エクスポート成功になりました!');
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
    resetData();
  };
</script>
