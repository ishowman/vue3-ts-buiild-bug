<template>
  <el-dropdown class="mx-3" @command="handleDownload">
    <el-button plain :loading="loading">
      <c-icon-font
        name="icon-Download"
        :size="ButtonIconHeight.default"
      />CSVダウンロード
      <span
        v-if="
          downloading && downloadType === 'all' && downloadCsvType === 'news'
        "
        >{{ percent }}
      </span>
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
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <el-dialog v-model="dialogVisible" width="30%" title="CSVダウンロード">
    <el-space fill direction="vertical" class="w-full">
      <el-button type="success" @click="handleDialogDownload('news')">
        お知らせ CSVダウンロード
      </el-button>
      <el-button type="primary" @click="handleDialogDownload('surveys')">
        アンケート CSVダウンロード
      </el-button>
    </el-space>
  </el-dialog>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { ButtonIconHeight, DefaultPageSize } from '@/constants';
  import dayjs from 'dayjs';
  import { checkSurveyCount, exportNews, exportSurveys } from '@/services';
  import { downloadCSV } from '@/utils';

  interface IDropdownMenu {
    type: string;
    name: string;
  }

  interface IProps {
    selectedIds: number[];
    total: number;
    sort?: Record<string, any>;
  }

  const emit = defineEmits(['downloaded']);
  const route = useRoute();

  const props = withDefaults(defineProps<IProps>(), {
    selectedIds: () => [],
    total: 0,
    sort: () => ({}),
  });

  const today: string = dayjs().format('YYYY-MM-DD');
  const dropdownMenus: IDropdownMenu[] = [
    { type: 'all', name: '全て' },
    { type: 'cur', name: '現在のページ' },
    { type: 'lines', name: '選択行のみ' },
  ];
  const data = ref<string[][]>([]);
  const header = ref<string[]>([]);
  const downloadType = ref<string>('');
  const downloadCsvType = ref<string>('news');
  const loading = ref<boolean>(false);
  const page = ref<number>(1);
  const pageSize = ref<number>(100);
  const dialogVisible = ref<boolean>(false);
  const downloading = ref<boolean>(false);

  const percent = computed<string | number>(() => {
    if (props.total === 0) {
      return 0;
    }
    return Math.floor((data.value.length / props.total) * 100) + '%';
  });

  const params = computed(() => {
    return downloadType.value === 'lines'
      ? {
          ids: props.selectedIds.join(','),
          pagesize: pageSize.value,
          ...props.sort,
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
          props.sort
        );
  });

  const filename = computed<string>(() => {
    return downloadCsvType.value === 'news'
      ? today + '_お知らせ情報'
      : today + '_アンケート情報';
  });

  const request = computed(() => {
    return downloadCsvType.value === 'news' ? exportNews : exportSurveys;
  });

  const downloadCsv = () => {
    downloadCSV([
      {
        header: header.value,
        file_name: filename.value,
      },
      data.value,
    ]);
  };

  const fetch = async () => {
    const res: any = await request.value(params.value);
    if (res.meta.header.length > header.value.length) {
      header.value = res.meta.header;
    }
    data.value = data.value.concat(res.data);

    if (downloadCsvType.value === 'news') {
      if (res.data.length < pageSize.value || res.data.length === 0) {
        return Promise.resolve();
      }
    } else {
      if (res.survey_length < pageSize.value) {
        return Promise.resolve();
      }
    }
    page.value++;
    return fetch();
  };

  const resetData = () => {
    downloadCsvType.value = 'news';
    data.value = [];
    header.value = [];
    page.value = 1;
  };

  const download = async () => {
    loading.value = true;
    downloading.value = true;
    try {
      if (downloadType.value === 'all') {
        await fetch();
        downloadCsv();
      } else {
        const { data, meta } = await request.value(params.value);

        downloadCSV([
          {
            header: meta.header,
            file_name: filename.value,
          },
          data,
        ]);
      }
      emit('downloaded');
      ElMessage.success('エクスポート成功になりました!');
    } finally {
      resetData();
      loading.value = false;
      downloading.value = false;
    }
  };

  const handleDialogDownload = (type: string) => {
    downloadCsvType.value = type;
    dialogVisible.value = false;
    download();
  };

  const handleDownload = async (type: string) => {
    downloadType.value = type;
    loading.value = true;
    try {
      const { survey_count } = await checkSurveyCount(params.value);
      if (survey_count) {
        dialogVisible.value = true;
        return;
      }
      download();
    } finally {
      loading.value = false;
    }
  };
</script>
