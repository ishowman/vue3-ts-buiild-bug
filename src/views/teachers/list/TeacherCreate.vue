<template>
  <div class="comiru-content py-6" style="--label-width: 300px">
    <c-steps
      :active="activeStep"
      class="mb-9"
      :steps="steps"
      :process-status="processStatus"
    />

    <el-form
      v-show="activeStep === 0"
      ref="formRef"
      label-width="var(--label-width)"
      :model="step1"
      :show-message="false"
      class="translate-x-10 w-[920px]"
    >
      <el-form-item label="CSVファイル：" prop="file">
        <div>
          <csv-uploader
            ref="csvRef"
            :parse-config="csvConfig"
            @parsed="updateCSVString"
          />
        </div>
      </el-form-item>

      <el-form-item prop="csvString">
        <template #label>
          <div class="text-right">
            <p>文字コード：</p>
            <el-select-v2
              v-model="selectedEncoding"
              :options="encodingList"
              class="w-28"
            />
          </div>
        </template>
        <el-input
          v-model="step1.csvString"
          type="textarea"
          :rows="6"
        ></el-input>
        <div class="text-secondary text-[12px] leading-4">
          <p class="mb-4 mt-1">
            講師氏,講師名,講師氏カナ,講師名カナ,性別,講師メール,自動でメールアドレスを認証する,講師パスワード,管理者にする,学年,生年月日,電話番号,郵便番号,住所,住所2,緊急連絡先,緊急連絡先名,学校(空文字を許可),学部(空文字を許可),授業開始日,紹介者,講師ランク(30文字以内),教室ID
          </p>
          <p class="mb-4">
            例：直江津,儀子,ナオエツ,ノリコ,1,teacher@comiru.jp,1,passwordAAA,1,小3,1988-11-12,12384752,1030025,東京都中央区日本橋茅場町1-13-21,阪神ビル4F,08012375622,直江津花子,国立北海道大学,経済学部,2020-07-02,田中,講師ランク,123
          </p>
          <div>
            <span class="text-danger">※メールアドレスについての注意</span><br />
            <p>
              <span class="text-danger"
                >docomo.ne.jp / softbank.ne.jp / ezweb.ne.jp</span
              >などの携帯電話会社が提供しているメールアドレスをご利用の方か
            </p>
            <br />
            ら、確認メールや通知メールが届かないというお問い合わせを多くいただいております。その場合はお手数です<br />
            が、GmailやYahoo!メールなどの上記以外のメールアドレスをご利用ください。
          </div>
        </div>
      </el-form-item>
    </el-form>

    <div v-if="activeStep === 1" v-loading="loading" class="w-[1200px]">
      <div class="mx-auto w-[550px]">
        <p class="flex justify-between">
          <span>
            {{ !verifyed ? '検証中' : '検証されました' }}
            <span class="text-secondary ml-2"
              >{{
                !verifyed
                  ? tableData.length
                  : verifyResult.total - verifyResult.failed
              }}/{{ verifyResult.total }}</span
            >
          </span>

          <span v-if="verifyResult.failed > 0 && !!verifyed">
            エラーの数<span class="text-danger ml-2">{{
              verifyResult.failed
            }}</span>
          </span>
        </p>
        <div class="flex">
          <el-progress
            :percentage="verifyResult.percent"
            class="w-[520px]"
            :show-text="false"
            :color="`var(${
              verifyResult.percent < 100 ? '--color-blue' : '--el-color-success'
            })`"
          />
          <span class="ml-1">{{ verifyResult.percent }}%</span>
        </div>
      </div>
    </div>

    <template v-if="activeStep === 2">
      <div
        v-if="
          uploading && !['failed', 'success'].includes(importProgress.status)
        "
        v-loading="loading"
        class="mx-auto w-[550px]"
      >
        <span>
          {{
            ['validating', 'pending'].includes(importProgress?.status)
              ? 'アップロード中'
              : 'アップロードされました'
          }}
        </span>

        <div class="flex">
          <el-progress
            :percentage="importResult.percent"
            class="w-[520px]"
            :show-text="false"
            :color="`var(${
              (importResult?.percent || 0) < 100
                ? '--color-blue'
                : '--el-color-success'
            })`"
          />
          <span class="ml-1">{{ importResult.percent }}%</span>
        </div>
      </div>

      <el-result
        v-if="
          importProgress?.status &&
          ['success', 'failed'].includes(importProgress.status)
        "
        :icon="importResult.isSuccess ? 'success' : 'error'"
        :title="
          importResult.isSuccess
            ? 'アップロードに成功しました'
            : 'アップロードに失敗しました'
        "
      >
        <template #sub-title>
          <span class="text-secondary">{{ importResult?.desc }}</span>
        </template>
        <template #icon>
          <c-icon-font
            v-if="importResult?.isSuccess"
            name="icon-right2"
            class="mb-2"
            color="var(--el-color-success)"
            size="68px"
          />
          <c-icon-font v-else name="icon-erro" class="mb-2" size="68px" />
        </template>

        <template #extra>
          <el-button type="primary" @click="reCreate"
            >再度アップロード</el-button
          >
          <el-button
            type="primary"
            plain
            @click="router.push({ name: 'TeacherList' })"
            >リストに戻る</el-button
          >
        </template>
      </el-result>
    </template>

    <div v-if="tableData.length" class="mx-auto w-[1200px] mt-7">
      <el-table
        v-loading="!verifyed"
        :data="currentPageData"
        max-height="1052.5"
      >
        <template #default>
          <template v-for="column in tableColumn" :key="column.key">
            <el-table-column
              :label="column.label"
              :prop="column.key"
              :width="Math.max(column.label.length * 20, 120)"
              show-overflow-tooltip
            >
              <template #default="scope">
                <template v-if="scope.row.info && scope.row.info[column.key]">
                  <span>
                    {{ scope.row.info[column.key] }}
                  </span>
                  <p class="text-danger">{{ scope.row.error[column.key] }}</p>
                </template>
                <template v-else>
                  <span style="white-space: pre-line">{{
                    renderColumn(scope.row.data[column.key])
                  }}</span>
                  <p class="text-danger">{{ scope.row.error[column.key] }}</p>
                </template>
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
    </div>

    <el-form :label-width="activeStep === 0 ? '340px' : '325px'">
      <el-form-item>
        <template v-if="activeStep < steps.length - 1">
          <el-button
            v-if="activeStep !== 0"
            plain
            type="primary"
            @click="
              activeStep -= 1;
              tableData = [];
            "
            >前のステップ</el-button
          >
          <el-button
            type="primary"
            :disabled="!ableToNext"
            @click="toNextStep(activeStep)"
            >次のステップ</el-button
          >
          <el-button
            v-if="activeStep === 0"
            type="danger"
            plain
            @click="clearStep1"
            >リセット</el-button
          >
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, ref } from 'vue';
  import { Md5 } from 'ts-md5';

  import CsvUploader from '@/components/CsvUploader.vue';
  import { getPercent, isArray } from '@/utils';
  import {
    getTeacherBatchImportConfig,
    getTeacherBatchImportInfo,
    validateTeacherCSVData,
    createTeacherBatchImportJobs,
    getTeacherBatchImportProgress,
  } from '@/services';
  import { DefaultPageSize } from '@/constants';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const activeStep = ref(0);
  const steps = [
    {
      label: 'CSVアップロード',
    },
    {
      label: 'プレビュー',
    },
    {
      label: '送信',
    },
  ];

  const encodingList = [
    {
      label: 'Auto',
      value: ' ',
    },
    {
      label: 'SJIS',
      value: 'SJIS',
    },
    {
      label: 'JIS',
      value: 'JIS',
    },
    {
      label: 'EUCJP',
      value: 'EUCJP',
    },

    {
      label: 'UTF-8',
      value: 'UTF8',
    },
    {
      label: 'SJIS-win',
      value: 'SJIS-win',
    },
  ];

  const loading = ref(false);
  const verifyed = ref(false);
  const isPassed = ref(false);
  const uploading = ref(false);

  const ableToNext = computed(() => {
    if (activeStep.value === 0) {
      return !!step1.value.csvString;
    }
    if (activeStep.value === 1) {
      return isPassed.value;
    }
    return false;
  });

  const importProgress = ref({
    status: 'pending',
    progress: {
      total: 0,
      pending: 0,
      success: 0,
      failed: 0,
    },
    errors: [],
  });
  const selectedEncoding = ref(' ');

  const csvConfig = ref({ encoding: selectedEncoding.value });

  const batchId = ref('');

  const tableData = ref<
    {
      data: any[];
      info: any[];
      error: any[];
    }[]
  >([]);
  const tableColumn = ref<any>([]);

  const chunkSize = 1000;

  const defaultStep1 = { csvString: '' };
  const step1 = ref({ ...defaultStep1 });

  const processStatus = computed(() => {
    if (
      activeStep.value === 2 &&
      importProgress.value?.status &&
      ['success', 'failed'].includes(importProgress.value?.status)
    ) {
      return importProgress.value?.status === 'failed' ? 'error' : 'success';
    }
    return 'process';
  });

  const currentPage = ref(1);
  const rowData = computed(() => {
    return step1.value.csvString.split('\n').filter((row) => row.trim().length);
  });

  const verifyResult = computed(() => {
    const total = rowData.value.length;
    const failed = tableData.value.filter((item) => {
      const keys = Object.keys(item.error);
      return keys.length > 0;
    }).length;

    const count = !verifyed.value ? tableData.value.length : total - failed;
    return {
      total,
      failed,
      percent: getPercent(count, total),
    };
  });

  const importResult = computed(() => {
    if (!uploading.value) {
      return {};
    }
    const progress = importProgress.value.progress;
    const total = progress.total;
    const success = progress.success;
    const failed = progress.failed;

    const isSuccess = importProgress.value.status === 'success';

    return {
      total,
      failed,
      percent: getPercent(success, total),
      isSuccess,
      desc: isSuccess
        ? `${success}件のデータのアップロードに成功しました`
        : `${total}件のデータの中に${failed}件のデータをアップロードする際にエラーが発生しました`,
    };
  });

  const timerId = ref();

  const currentPageData = computed(() => {
    return tableData.value.slice(
      DefaultPageSize * (currentPage.value - 1),
      DefaultPageSize * currentPage.value
    );
  });

  function updateCSVString({ data }) {
    console.log('data', data);
    const csvData = data
      .map((row) => {
        return row.map((item) => `${item || ''}`).join(',');
      })
      .filter((item) => item !== '');

    step1.value.csvString = `${csvData.join('\n')}`;
  }
  async function toNextStep(stepValue) {
    tableData.value = [];

    if (stepValue === 0) {
      const config = await getTeacherBatchImportConfig();
      console.log('getBatchImportConfig config', config);

      const chunkCount = Math.ceil(rowData.value.length / chunkSize);
      const { batch_id } = await getTeacherBatchImportInfo({
        md5: Md5.hashStr(step1.value.csvString),
      });
      batchId.value = batch_id;
      console.log('batchIds', batchId.value);
      verifyed.value = false;
      activeStep.value += 1;

      const batchValidations: any[] = [];
      // 必须同步校验

      for (let index = 0; index < chunkCount; index++) {
        const formData = new FormData();
        formData.append('batch_id', batchId.value);
        rowData.value
          .slice(chunkSize * +index, chunkSize * (+index + 1))
          .forEach((item, i) => {
            formData.append(`contents[${i + 1 + chunkSize * index}]`, item);
          });
        batchValidations.push(await validateTeacherCSVData(formData));
      }

      const { columns } = batchValidations[0];

      tableColumn.value = columns;
      tableData.value = batchValidations.reduce((pre, current) => {
        const { errors } = current;
        return pre.concat(errors);
      }, []);
      console.log('tableData', tableData.value);
      isPassed.value = batchValidations.every((item) => item.passed);

      verifyed.value = true;
    }
    if (stepValue === 1) {
      activeStep.value += 1;

      loading.value = true;
      verifyed.value = false;

      const { status, progress, errors } = await createTeacherBatchImportJobs({
        batch_id: batchId.value,
      });

      uploading.value = true;
      loading.value = false;
      verifyed.value = true;

      importProgress.value = {
        status,
        progress,
        errors,
      };
      if (errors?.items?.length) {
        tableData.value = errors.items.reduce((pre, current) => {
          return pre.concat(current);
        }, []);
      }

      timerId.value = setInterval(queryJobs, 350);
    }
  }

  onBeforeUnmount(() => {
    if (timerId.value) {
      clearInterval(timerId.value);
    }
  });

  function handlePageChange(page: number) {
    currentPage.value = page;
  }

  const csvRef = ref();
  function clearStep1() {
    step1.value = { ...defaultStep1 };
    csvRef.value.clearFiles();
  }

  function updateImportResult() {
    const progress = importProgress.value.progress;
    const total = progress.total;
    const success = progress.success;
    const failed = progress.failed;

    const isSuccess = importProgress.value.status === 'success';

    return {
      total,
      failed,
      percent: getPercent(success, total),
      isSuccess,
      desc: isSuccess
        ? `${success}件のデータのアップロードに成功しました`
        : `${total}件のデータの中に${failed}件のデータをアップロードする際にエラーが発生しました`,
    };
  }

  async function queryJobs() {
    if (['failed', 'success'].includes(importProgress.value.status)) {
      clearInterval(timerId.value);

      return;
    }

    const { status, progress, errors } = await getTeacherBatchImportProgress({
      batch_id: batchId.value,
    });

    importProgress.value = {
      status,
      progress,
      errors,
    };

    if (errors?.items?.length) {
      tableData.value = errors.items.reduce((pre, current) => {
        return pre.concat(current);
      }, []);
    }

    updateImportResult();
  }

  function reCreate() {
    activeStep.value = 0;
    clearStep1();
    importProgress.value = {
      status: 'pending',
      progress: {
        total: 0,
        pending: 0,
        success: 0,
        failed: 0,
      },
      errors: [],
    };
  }

  function renderColumn(data) {
    return isArray(data) ? data.join('\n') : data;
  }
</script>
<style scoped></style>
