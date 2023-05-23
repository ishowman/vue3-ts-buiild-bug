<template>
  <el-dropdown @command="handleDownload">
    <el-button plain :loading="loading">
      <c-icon-font
        name="icon-Download"
        :size="ButtonIconHeight.default"
      />CSVダウンロード
      <span v-if="showPercent && loading && downloadType === 'all'">{{
        percent
      }}</span>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in dropdownMenus"
          :key="item.type"
          :command="item.type"
          :disabled="item.type === 'lines' && selectedIds.length === 0"
        >
          {{ item.name }}
        </el-dropdown-item>
        <el-dropdown-item
          v-for="item in extraOptions"
          :key="item.type"
          :divided="item.type === 'all'"
          :command="item.type + '_extra'"
          :disabled="item.type === 'lines' && selectedIds.length === 0"
        >
          {{ item.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { ButtonIconHeight, DefaultPageSize, MaxPageSize } from '@/constants';
  import { apiClient, downloadCSV } from '@/utils';

  import dayjs from 'dayjs';
  import utf from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';

  dayjs.extend(utf);
  dayjs.extend(timezone);

  interface IDropdownMenu {
    type: string;
    name: string;
  }

  interface IExtraParamKeys {
    [key: string]: {
      selectedValue: number | string | boolean;
      unSelectedValue: number | string | boolean;
    };
  }

  interface IProps {
    selectedIds: number[];
    filename: string;
    action: string;
    total: number;
    extraOptions?: IDropdownMenu[];
    extraParamKeys?: IExtraParamKeys;
    sort?: Record<string, any>;
    showPercent?: boolean;
    withTime?: boolean;
  }

  interface IMeta {
    header: string[];
    page: number;
    pagesize: number;
    total_page: number;
  }

  interface IResponse {
    data: string[][];
    file_name?: string;
    meta: IMeta;
  }

  const emit = defineEmits(['downloaded']);
  const route = useRoute();

  const props = withDefaults(defineProps<IProps>(), {
    selectedIds: () => [],
    filename: '',
    action: '',
    total: 0,
    extraOptions: () => [],
    extraParamKeys: () => ({}),
    sort: () => ({}),
    showPercent: true,
    withTime: false,
  });

  const dropdownMenus: IDropdownMenu[] = [
    { type: 'all', name: '全て' },
    { type: 'cur', name: '現在のページ' },
    { type: 'lines', name: '選択行のみ' },
  ];
  const data = ref<string[][]>([]);
  const header = ref<string[]>([]);
  const downloadType = ref<string>('');
  const loading = ref<boolean>(false);
  const page = ref<number>(1);
  const pageSize = ref<number>(MaxPageSize);
  const totalPage = ref(0);
  const isExtraSelected = ref<boolean>(false);
  const downloadFileName = ref<string>('');
  const ableExport = ref(true);

  const percent = computed<string | number>(() => {
    if (totalPage.value === 0) {
      return 0 + '%';
    }
    return Math.floor((page.value / totalPage.value) * 100) + '%';
  });

  const extraParams = computed(() => {
    const params = {};
    for (const key in props.extraParamKeys) {
      params[key] = isExtraSelected.value
        ? props.extraParamKeys[key].selectedValue
        : props.extraParamKeys[key].unSelectedValue;
    }
    return params;
  });

  const params = computed(() => {
    const isSorted = Object.keys(props.sort).length;
    return downloadType.value === 'lines'
      ? {
          ids: props.selectedIds.join(','),
          pagesize: pageSize.value,
          ...extraParams.value,
          ...(isSorted ? { order_by: props.sort } : {}),
        }
      : Object.assign(
          { ...route.query, pageSize: undefined },
          downloadType.value === 'all'
            ? {
                page: page.value,
                pagesize: pageSize.value,
                batch_size: route.query.pageSize || DefaultPageSize,
              }
            : {
                page: route.query.page || 1,
                pagesize: route.query.pageSize || DefaultPageSize,
              },
          extraParams.value,
          isSorted ? { order_by: props.sort } : {}
        );
  });

  onBeforeUnmount(() => {
    ableExport.value = false;
  });

  const downloadCsv = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const now = props.withTime ? '_' + dayjs().format('HHmmss') : '';
    const fileName = downloadFileName.value || today + now + props.filename;
    downloadCSV([
      {
        header: header.value,
        file_name: fileName,
      },
      data.value,
    ]);
  };

  const fetch = async () => {
    if (!ableExport.value) {
      return Promise.reject();
    }
    const res: IResponse = await apiClient.get(props.action, {
      params: params.value,
    });

    totalPage.value = res.meta.total_page;
    if (res.file_name) {
      downloadFileName.value = res.file_name;
    }

    if (res.meta.header.length > header.value.length) {
      header.value = res.meta.header;
    }
    data.value = data.value.concat(res.data);

    if (downloadType.value !== 'all') {
      return Promise.resolve();
    }
    if (page.value >= res.meta.total_page || res.data.length === 0) {
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

  const handleDownload = async (type: string) => {
    const splitTypes = type.split('_');
    isExtraSelected.value = splitTypes.length > 1;
    downloadType.value = splitTypes[0];
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
