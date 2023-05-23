<template>
  <div class="comiru-content py-6 invoice-create">
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
          disabled
        />
        <!-- 
          example:
          431,19036232,請求書,◯◯,◯◯,〇〇,2022-08-19,2022-08-20,1,10000,入会金,入会金,10000,1,1,,,,
          431,519423,請求書,◯◯,◯◯,〇〇,2022-08-19,2022-08-20,1,20000,入会金,入会金,10000,1,1,授業料,授業料,10000,1,1

         -->
        <a
          type="primary"
          href="https://files.comiru.com/preparation/Admin_%E8%AB%8B%E6%B1%82%E6%9B%B8CSV%E3%82%A2%E3%83%83%E3%83%97%E3%83%AD%E3%83%BC%E3%83%89%EF%BC%88%E3%83%86%E3%83%B3%E3%83%97%E3%83%AC%E3%83%BC%E3%83%88%EF%BC%89.csv"
          download
        >
          <c-icon-font name="icon-Download" :size="ButtonIconHeight.default" />
          CSVヘッダーを含む入力テンプレート をダウンロード
        </a>
        <div class="text-secondary text-[12px] leading-4">
          <b class="mb-4 mt-1">ヘッダー例</b>
          <p class="mb-4 mt-1">
            教室ID,学生番号,タイトル,備考1,備考2,備考3,日付,お支払期限,お支払方法,合計,項目,詳細,単価,数量,消費税対象外[,項目,詳細,単価,数量,消費税対象外...]
            <br />
            複数の項目がある場合，[項目,詳細,単価,数量,消費税対象外]をループする
          </p>
          <b class="mb-4 mt-1">入力例</b>
          <p class="mb-4">
            266,101,請求書,下記のとおりご請求申し上げます。,恐れ入りますが振り込み手数料はご負担願います。,株式会社POPER,2019-06-20,2019-06-30,1,10500,年間費用,1年,2500,2,,教材費用,文科,1000,5,1
          </p>
          <p class="mb-4">
            ※「お支払方法」は半角数字でご入力ください。各種対応は以下のようになります。
            <br />
            1 = 銀行振込
            <br />
            2 = クレジットカード
            <br />
            3 = 口座振替
            <br />
            4 = 月謝
            <br />
            5 = 口座振替（ベリトランス）
          </p>

          <div>
            <b class="text-danger"
              >adminで請求書のCSVアップロードをする際の注意点</b
            ><br />
            <br />
            ·項目は
            [入会金,授業料,教材費用,外部試験費用,講習費用,値引き,年間費用,システム費用,増加授業料,その他]
            中で選んでください。
            <br />

            ·教室アカウントで「課税設定」が「税抜き設定」になっている時は、各品目を税抜きで作成し、全ての「消費税対象外」の枠を「空欄」にしてください。
            <br />

            ※CSVデータの「消費税対象外」欄に「空欄」と「1」が両方あるデータはアップロードできません。
            <br />

            ※教室アカウントの「課税設定」は、請求書＞請求項目設定＞請求詳細設定にて、設定してください。
          </div>
        </div>
      </el-form-item>
      <el-form-item label="公開有無：" prop="isDraft">
        <el-select-v2
          v-model="step1.isDraft"
          :options="statusOptions"
          class="w-full"
        />
      </el-form-item>
      <el-form-item v-if="step1.isDraft === PublishedNews" label="予約送信：">
        <el-switch v-model="step1.scheduledTimeSwitch" />
        <p class="text-secondary text-[12px] leading-4 w-full">
          保護者への請求書公開とプッシュ通知/通知メールの送信時刻を指定することができます。
        </p>
        <el-date-picker
          v-if="step1.scheduledTimeSwitch"
          v-model="step1.scheduledTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm"
          :disabled-date="(date) => isSelectableDay(date)"
        />
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
        v-show="
          uploading && !['failed', 'success'].includes(importProgress.status)
        "
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
        :title="importResult.title"
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
            @click="router.push({ name: 'InvoiceList' })"
            >リストに戻る</el-button
          >
        </template>
      </el-result>
    </template>

    <div v-if="tableData.length" class="mx-auto w-[1200px] mt-7">
      <upload-table
        v-loading="!verifyed"
        :data="tableData"
        :columns="tableColumn"
      />
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
          >
            前のステップ
          </el-button>

          <el-button
            v-if="activeStep === 1 && verifyed && !isPassed"
            type="primary"
            @click="downloadCsv"
          >
            エラーデータをCSVダウンロード
          </el-button>

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
  import UploadTable from './UploadTable.vue';

  import { downloadCSV, getPercent, isObject } from '@/utils';
  import {
    getCsvBatchImportConfig,
    getCsvBatchImportInfo,
    validateCsvBatchImportData,
    createCsvBatchImportJobs,
    getCsvBatchImportProgess,
  } from '@/services';
  import {
    DraftNews,
    PublishedNews,
    newsStatus,
    ButtonIconHeight,
  } from '@/constants';
  import { useRouter } from 'vue-router';
  import { typedConfirm } from '@/utils';

  const router = useRouter();
  const statusOptions = newsStatus.map(({ label, value }) => ({
    label: value,
    value: label,
  }));

  const activeStep = ref(0);
  const steps = computed(() => {
    return [
      {
        label: 'CSVアップロード',
      },
      {
        label: 'プレビュー',
      },
      {
        label: step1.value.isDraft === PublishedNews ? '送信' : '保存',
      },
    ];
  });

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
      return !(
        !step1.value.csvString ||
        (step1.value.scheduledTimeSwitch && !step1.value.scheduledTime)
      );
    }
    if (activeStep.value === 1) {
      return isPassed.value;
    }
    return false;
  });
  const provider = 'invoice_batch_upload';
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
      data: Record<string, any>;
      info: Record<string, any>;
      error: Record<string, any>;
      line: number;
      warning: Record<string, any>;
    }[]
  >([]);
  const tableColumn = ref<any>([]);

  let chunkSize = 1000;

  const defaultStep1 = {
    csvString: '',
    isDraft: DraftNews,
    scheduledTimeSwitch: undefined,
    scheduledTime: '',
  };
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

  // const currentPage = ref(1);
  const rowData = computed(() => {
    return step1.value.csvString.split('\n').filter((row) => row.trim().length);
  });

  const verifyResult = computed(() => {
    const total = rowData.value.length - 1; // 减去 header
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

    const {
      isDraft,
      // scheduledTime,
      scheduledTimeSwitch,
    } = step1.value;

    let count = 0;

    if (isDraft === PublishedNews) {
      count += 1;
    }

    if (scheduledTimeSwitch) {
      count += 1;
    }

    const title = isSuccess
      ? [
          `保存しました`,
          `保存した請求書が一括送信されました`,
          `保存した請求書が一括予約送信されました`,
        ][count]
      : [
          `保存に失敗しました`,
          `請求書の保存か一括送信に失敗しました`,
          `請求書の保存か一括予約送信に失敗しました`,
        ][count];

    const desc = isSuccess
      ? [
          `${success}件のデータを保存しました`,
          `${success}件のデータを保存した請求書が一括発送されました`,
          `${success}件のデータを保存した請求書が一括予約送信されました`,
        ][count]
      : `${total}件のデータの中に${failed}件のデータを処理する際にエラーが発生しました`;

    return {
      total,
      failed,
      percent: getPercent(success, total),
      isSuccess,
      title,
      desc,
    };
  });

  let timerId: any = 0;

  function updateCSVString({ data }) {
    const csvData = data
      .map((row) => {
        return row.map((item) => `${item || ''}`).join(',');
      })
      .filter((item) => item !== '');

    step1.value.csvString = `${csvData.join('\n')}`;
  }
  async function toNextStep(stepValue) {
    if (stepValue === 0) {
      const { csvString, isDraft, scheduledTimeSwitch, scheduledTime } =
        step1.value;
      if (scheduledTimeSwitch) {
        if (
          !scheduledTime ||
          (scheduledTime && new Date(scheduledTime).getTime() < Date.now())
        ) {
          ElMessage.warning(
            `予約日時が過去に設定されているので、修正してください`
          );
          return;
        }
      }

      const config = await getCsvBatchImportConfig({
        provider,
        action: 'config',
      });
      chunkSize = config.chunk_size;
      const chunkCount = Math.ceil(rowData.value.length / chunkSize);
      const infoParams = {
        provider,
        action: 'info',
        md5: Md5.hashStr(csvString),
        'attributes[is_draft]': isDraft,
      };
      // if (scheduledTimeSwitch) {
      infoParams[`attributes[scheduled_time_switch]`] = scheduledTimeSwitch
        ? 'on'
        : 'off';
      // }
      if (scheduledTime) {
        infoParams[`attributes[scheduled_time]`] = scheduledTime;
      }

      const { batch_id } = await getCsvBatchImportInfo(infoParams as any);
      batchId.value = batch_id;
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
            i > 0 &&
              formData.append(`contents[${i + chunkSize * index}]`, item);
          });
        batchValidations.push(
          await validateCsvBatchImportData(
            {
              provider,
              action: 'validate',
            },
            formData
          )
        );
      }

      const { columns } = batchValidations[0];

      tableColumn.value = columns;
      tableData.value = batchValidations.reduce((pre, current) => {
        const { errors } = current;
        return pre.concat(errors);
      }, []);
      isPassed.value = batchValidations.every((item) => item.passed);

      verifyed.value = true;
    }
    if (stepValue === 1) {
      const studentsMap: Record<string, number> = tableData.value.reduce(
        (pre, current) => {
          const info = `${current.data.student_no}-${current.info.student_name}`;
          if (pre[info]) {
            pre[info] += 1;
          } else {
            pre[info] = 1;
          }
          return pre;
        },
        {}
      );
      const duplicateStudents = Object.entries(studentsMap).reduce(
        (pre: string[], [key, value]) => {
          if (value > 1) {
            pre.push(key);
          }
          return pre;
        },
        []
      );

      await typedConfirm({
        title:
          duplicateStudents.join('、') + 'が重複していますがよろしいですか？',
        confirmButtonText: 'はい',
        cancelButtonText: 'いいえ',
        content: '',
      });
      activeStep.value += 1;
      tableData.value = [];

      loading.value = true;
      verifyed.value = false;
      uploading.value = true;

      importProgress.value = {
        status: 'validate',
        progress: {
          total: rowData.value.length - 1,
          success: 0,
          failed: 0,
          pending: 0,
        },
        errors: [],
      };

      const { status, progress, errors } = await createCsvBatchImportJobs(
        {
          provider,
          action: 'start',
        },
        { batch_id: batchId.value }
      );

      loading.value = false;
      verifyed.value = true;

      importProgress.value = {
        status,
        progress,
        errors,
      };
      if (errors?.items?.length) {
        tableData.value = errors.items;
      }

      if (!['failed', 'success'].includes(importProgress.value.status)) {
        queryJobs();
      }
    }
  }

  onBeforeUnmount(() => {
    if (timerId) {
      clearInterval(timerId);
    }
  });

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
    const lastQuery = Date.now();

    const { status, progress, errors } = await getCsvBatchImportProgess({
      provider,
      action: 'progress',

      batch_id: batchId.value,
    });

    importProgress.value = {
      status,
      progress,
      errors,
    };

    if (errors?.items?.length) {
      tableData.value = errors.items;
    }

    updateImportResult();

    if (!['failed', 'success'].includes(importProgress.value.status)) {
      // 只要还没完成，就继续查下去
      Date.now() - lastQuery > 150
        ? queryJobs()
        : (timerId = setTimeout(queryJobs, 150)); // 控制查询间隔最少是 150ms，减少服务端压力
    }
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

  function isSelectableDay(date: number) {
    return date < Date.now() - 24 * 60 * 60 * 1000;
  }

  const downloadCsv = () => {
    const rawCsvData = step1.value.csvString.split(`\n`);

    const errorData = tableData.value.reduce((previousValue, currentValue) => {
      const { error, line } = currentValue;
      if (isObject(error) && Object.keys(error)?.length > 0) {
        previousValue.push(rawCsvData[line].split(','));
      }
      return previousValue;
    }, [] as string[][]);

    downloadCSV([
      {
        header: rawCsvData[0].split(','),
        file_name: 'エラーデータをCSV',
      },
      errorData,
    ]);
  };
</script>
<style scoped lang="postcss">
  .invoice-create {
    --label-width: 300px;
  }
</style>
