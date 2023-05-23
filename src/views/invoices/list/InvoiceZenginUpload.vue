<template>
  <el-form
    v-show="!submited"
    v-loading="loading"
    class="comiru-content px-48 py-7"
    label-position="right"
    label-width="150px"
  >
    <el-form-item label="タイプ：">
      <el-radio-group v-model="selectedType">
        <el-radio
          v-for="type in typeList"
          :key="type.value"
          :label="type.value"
        >
          {{ type.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="添付ファイル：" required>
      <csv-uploader
        ref="csvRef"
        accept=".csv,.txt,.dat"
        @parsed="hasFiles = true"
      >
        <template #info>&nbsp;</template>
      </csv-uploader>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" :disabled="!hasFiles" @click="uploadFile"
        >送信</el-button
      >
      <el-button type="danger" plain @click="reset"> リセット </el-button>
    </el-form-item>
  </el-form>

  <c-list-table
    v-if="submited"
    :data="pageData"
    :has-checkbox="false"
    class="mb-2"
    empty-text="No data available in table"
    :total="total"
    @refetch="uploadFile"
    @setting="tableFieldsVisible = true"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
  >
    <template #header-left>
      <el-button @click="downloadCsv">
        <c-icon-font name="icon-Download" :size="ButtonIconHeight.default" />
        CSVダウンロード</el-button
      >
    </template>

    <template #header-right>
      <el-input v-model="keyword" placeholder="入力檢索" class="pb-3" />
    </template>

    <template #default>
      <template v-for="field in selectedFields" :key="field">
        <el-table-column
          :label="field.label"
          :sortable="field.sort"
          :prop="field.prop"
          :min-width="field.labelWidth"
          show-overflow-tooltip
          :class="field.prop"
        >
          <template #default="scope">
            <template v-if="field.prop === 'status'">
              <c-component
                v-for="component in statusRender([scope.row[field.prop]])
                  .components"
                v-bind="component"
                :key="`${field.prop}-${component.uniqKey}`"
              />
            </template>
            <template v-else-if="field.prop === 'pay_type'">
              <c-component
                v-for="component in payStatusRender([scope.row[field.prop]])
                  .components"
                v-bind="component"
                :key="`${field.prop}-${component.uniqKey}`"
              />
            </template>

            <template v-else-if="field.prop === 'student'">
              <span v-dompurify-html="scope.row?.student" />
            </template>

            <template v-else-if="field.prop === `payment_status`">
              <span
                v-if="scope.row.payment_status"
                :class="
                  PAYMENT_STATUS_TYPE_MAP[scope.row.payment_status] ??
                  'card days-left'
                "
              >
                <c-icon-font
                  v-if="scope.row.can_use_card"
                  name="icon-crad"
                  :size="ButtonIconHeight.default"
                />
                <span v-else class="dot inline-block w-1.5 h-1.5" />
                {{ scope.row.payment_status }}
              </span>
            </template>

            <template v-else>
              {{ scope.row[field.prop] }}
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
  />
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import dayjs from 'dayjs';

  import { getZenginUploadTypes, zenginUpload } from '@/services';
  import {
    invoiceZenginUploadFieldsConfig,
    ButtonIconHeight,
    StorageKeys,
    DefaultPageSize,
  } from '@/constants';
  import {
    statusRender,
    payStatusRender,
  } from '@/views/invoices/list/invoiceZenginUploadFieldRender';
  import { downloadCSV } from '@/utils';

  const typeList = ref();
  const defaultSelectedType = 'zengin';
  const selectedType = ref(defaultSelectedType);
  const csvRef = ref();
  const hasFiles = ref(false);
  const keyword = ref('');
  const pageData = ref<Record<string, string>[]>([]);

  const loading = ref(false);
  const submited = ref(false);

  const tableData = ref<Record<string, string>[]>([]);
  const currentPage = ref(1);
  const pageSize = ref(DefaultPageSize);

  const total = ref(0);

  const PAYMENT_STATUS_TYPE_MAP = {
    本日: 'card today',
    要確認: 'card to-be-confirmed',
    '(済)': 'card paid',
    未納: 'unpaid',
    既納: 'paid',
  };

  const defaultSortFields = [
    'school_name',
    'request_no',
    'payment_status',
    'reason',
  ];

  const defaultSelectedFields =
    localStorage.getItem(StorageKeys.invoiceZenginUploadFields)?.split(',') ||
    invoiceZenginUploadFieldsConfig.map((field) => field.prop);

  const fieldsConfig = invoiceZenginUploadFieldsConfig.map((item) => {
    return {
      ...item,
      show: defaultSelectedFields.includes(item.prop),
      sort: defaultSortFields.includes(item.prop),
    };
  });

  const selectedFields = ref(fieldsConfig.filter((config) => config.show));

  function chunkedArray(arr: any[], chunkSize: number) {
    if (!arr?.length || typeof chunkSize !== 'number') {
      return [];
    }
    if (chunkSize >= arr.length) {
      return [arr];
    } else {
      const count = arr.length / chunkSize;
      const data: any[] = [];
      for (let i = 0; i < count; i++) {
        data.push(arr.slice(chunkSize * i, chunkSize * (i + 1)));
      }
      return data;
    }
  }

  watch(selectedFields, (newVal) => {
    if (newVal) {
      localStorage.setItem(
        StorageKeys.invoiceZenginUploadFields,
        newVal.map((field) => field.prop).join(',')
      );
    }
  });

  watch([tableData, keyword, pageSize, currentPage], () => {
    const filtedData = tableData.value.filter((item) => {
      const values = Object.values(item);
      return values.some((str) => {
        if (typeof str !== 'string') {
          return false;
        }
        return str.includes(keyword.value);
      });
    });
    pageData.value = chunkedArray(filtedData, pageSize.value)[
      currentPage.value - 1
    ];
    total.value = filtedData.length;
  });

  const tableFieldsVisible = ref(false);

  getUploadTypes();
  async function getUploadTypes() {
    try {
      loading.value = true;
      const data = await getZenginUploadTypes();
      typeList.value = Object.entries(data).map(([value, label]) => {
        return {
          value,
          label,
        };
      });
    } finally {
      loading.value = false;
    }
  }

  async function uploadFile() {
    try {
      loading.value = true;
      const params = new FormData();
      params.append('type', selectedType.value);
      const localFiles = csvRef.value.getFiles();

      if (localFiles.length) {
        params.append('file', localFiles[0].raw);
      }
      const { data = [] } = await zenginUpload(params);
      tableData.value = data.map((item) => {
        const row = item.reduce((pre, value, i) => {
          const key = invoiceZenginUploadFieldsConfig[i].prop;
          pre[key] = value;
          return pre;
        }, {});
        return row;
      });
      total.value = data.length;
      if (data?.length === 0) {
        ElMessage.warning(
          '送信できませんでした。添付ファイルが指定のフォーマットに沿っているか、もう一度ご確認ください'
        );
      }
      submited.value = true;
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    selectedType.value = defaultSelectedType;
    csvRef.value.clearFiles();
    hasFiles.value = false;
  }

  const downloadCsv = () => {
    const fieldLabels: string[] = [];
    const fieldProps: string[] = [];
    for (const { prop, label } of selectedFields.value) {
      fieldLabels.push(label);
      fieldProps.push(prop);
    }

    const data = tableData.value.map((item) => {
      return fieldProps.reduce((pre, prop) => {
        if (prop === 'student') {
          pre.push(item.student ? item.student.replace(`<br>`, ' ') : '');
        } else {
          pre.push(item[prop]);
        }
        return pre;
      }, [] as string[]);
    });

    const today = dayjs().format('YYYY-MM-DD');
    const fileName = `振替結果アップロード${today}`;

    console.log(`new data`, data);

    downloadCSV([
      {
        header: fieldLabels,
        file_name: fileName,
      },
      data,
    ]);
  };

  function handleSizeChange(newPageSize) {
    pageSize.value = newPageSize;
    currentPage.value = 1;
  }

  function handlePageChange(newCurrentPage: number) {
    currentPage.value = newCurrentPage;
  }
</script>
<style scoped lang="postcss">
  .scheduled {
    color: var(--el-text-color-secondary);
  }

  .dot {
    border-radius: 50%;
  }

  .unpaid .dot {
    background-color: var(--el-color-danger);
  }
  .paid .dot {
    background-color: var(--el-color-primary);
  }

  .card.today {
    color: var(--color-blue);
  }
  .card.to-be-confirmed {
    color: var(--el-color-danger);
  }
  .card.days-left {
    color: var(--el-color-warning);
  }
  .card.paid {
    color: var(--el-color-primary);
  }
</style>
