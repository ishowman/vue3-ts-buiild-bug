<template>
  <div class="comiru-content py-6" style="--label-width: 300px">
    <c-steps
      :active="activeStep"
      class="mb-9"
      :steps="steps"
      :process-status="processStatus"
    />

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
            @click="router.push({ name: 'StudentList' })"
            >リストに戻る</el-button
          >
        </template>
      </el-result>
    </template>

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
              :width="Math.max(column.label.length * 20, 60)"
              show-overflow-tooltip
            >
              <template #default="scope">
                <template v-if="scope.row.info[column.key]">
                  <span v-if="column.key === 'school_id'">
                    {{ scope.row.data[column.key] }}({{
                      scope.row.info[column.key]
                    }})
                  </span>
                  <span v-else>
                    {{ scope.row.info[column.key] }}
                  </span>
                  <p class="text-danger">{{ scope.row.error[column.key] }}</p>
                </template>
                <template v-else>
                  {{ scope.row.data[column.key] }}
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

    <el-form
      v-show="activeStep === 0"
      ref="formRef"
      label-width="var(--label-width)"
      :model="step1"
      :show-message="false"
      class="translate-x-10 w-[920px]"
    >
      <el-form-item label="既存の生徒番号に対するアップロード方法：">
        <el-radio-group v-model="step1.update_blank_override">
          <el-radio :label="0">空欄の項目は更新しない</el-radio>
          <el-radio :label="1">空欄の項目は既存のデータを削除する</el-radio>
        </el-radio-group>
      </el-form-item>

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
            ></el-select-v2>
          </div>
        </template>
        <el-input
          v-model="step1.csvString"
          type="textarea"
          :rows="6"
        ></el-input>
        <div class="text-secondary text-[12px] leading-4">
          <p class="mb-4 mt-1">
            生徒番号,会社生徒コード,生徒氏,
            生徒名,生徒氏カナ,生徒名カナ,学年,生徒区分,グループ,性別,生年月日,メールアドレス1,メールアドレス2,郵便番号,住所,住所2,電話番号,持ち主:他の電話番号,学校ID,ノート,教室ID,兄弟姉妹
          </p>
          <p class="mb-4">
            例：20210003,10001,小林,晃瑠,コバヤシ,ヒカル,中2,2,GroupA,男,19901020,student-a@comiru.jp,student-b@comiru.jp,1300025,東京都中央区日本橋茅場町1-13-21,阪神ビル4F,08012375622,母:09000000000,10000,ノート,10002,20210001|20210002
          </p>
          <p>
            グループ：複数のグループを設定する時は”|”で分けてください。<br />
            性别範囲:男,女,不明<br />
            学年範囲：0歳,1歳,2歳,3歳,年少,年中,年長,小1,小2,小3,小4,小5,小6,中1,中2,中3,高1,高2,高3,大1,大2,大3,大4,大5,修1,修2,博1,博2,博3,大学生,社会人,既卒,不明<br />
            生徒区分:1=通塾生, 2=体験生, 3=講習生, 4=特別生,
            5=その他外部利用者<br />
            兄弟姉妹：生徒/保護者側にも影響がでるため、兄弟姉妹は「既存の生徒番号に対するアップロード方法」の設定に関係なく、追加しか行うことができません。
            <br />
            学期制は自動的に「3学期制」が選択されます。必要に応じて生徒の編集画面から変更を行ってください。
          </p>
        </div>
      </el-form-item>
    </el-form>

    <el-form :label-width="activeStep === 0 ? '340px' : '325px'">
      <el-form-item>
        <template v-if="activeStep < steps.length - 1">
          <el-button
            v-if="activeStep !== 0"
            plain
            type="primary"
            @click="activeStep -= 1"
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

  import CSteps from '@/components/CSteps.vue';
  import CsvUploader from '@/components/CsvUploader.vue';
  import {
    getBatchImportConfig,
    getBatchImportInfo,
    validateCSVData,
    createBatchImportJobs,
    getBatchImportProgress,
  } from '@/services';
  import { DefaultPageSize } from '@/constants';
  import { getPercent, typedConfirm } from '@/utils';
  import { useRouter } from 'vue-router';
  const activeStep = ref(0);
  const router = useRouter();
  const ableToNext = computed(() => {
    if (activeStep.value === 0) {
      return !!step1.value.csvString;
    }
    if (activeStep.value === 1) {
      return isPassed.value;
    }
    return false;
  });

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

  const loading = ref(false);
  const verifyed = ref(false);
  const isPassed = ref(false);
  const uploading = ref(false);

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
  const defaultStep1 = { update_blank_override: 0, csvString: '' };
  const step1 = ref({ ...defaultStep1 });

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

  const selectedEncoding = ref(' ');
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
  const csvConfig = ref({ encoding: selectedEncoding.value });
  const batchId = ref('');

  const tableData = ref<any>([]);
  const tableColumn = ref<any>([]);

  const chunkSize = 1000;

  function updateCSVString({ data }) {
    console.log('data', data);
    const csvData = data
      .map((row) => {
        return row.map((item) => `${item || ''}`).join(',');
      })
      .filter((item) => item !== '');

    step1.value.csvString = `${csvData.join('\n')}`;
  }

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

  const rowData = computed(() => {
    // examples:
    // 20210003,1024,小林,晃瑠,コバヤシ,ヒカル,中2,2,"",男,19901020,student-a@comiru.jp,student-b@comiru.jp,1300025,東京都中央区日本橋茅場町1-13-21,阪神ビル4F,08012375622,母:09000000000,10000,"",4756,""

    // 209911008694823749238,1024,小林,晃瑠,コバヤシ,ヒカル,中2,2,"",男,19901020,student-a@comiru.jp,student-b@comiru.jp,1300025,東京都中央区日本橋茅場町1-13-21,阪神ビル4F,08012375622,母:09000000000,10000,"",4756,"20210006|20210007"
    // 支持任意数量的换行
    return step1.value.csvString.split('\n').filter((row) => row.trim().length);
  });

  const timerId = ref();

  async function toNextStep(stepValue) {
    if (stepValue === 0) {
      const config = await getBatchImportConfig();
      console.log('getBatchImportConfig config', config);

      const chunkCount = Math.ceil(rowData.value.length / chunkSize);
      const { batch_id } = await getBatchImportInfo({
        md5: Md5.hashStr(step1.value.csvString),
        'attributes[update_blank_override]': step1.value.update_blank_override,
      });
      batchId.value = batch_id;
      console.log('batchIds', batchId.value);
      verifyed.value = false;
      tableData.value = [];
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
        batchValidations.push(await validateCSVData(formData));
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
      const hasRemoteStudent = tableData.value.some(
        (data) => data?.warning?.is_update === '1'
      );
      hasRemoteStudent &&
        (await typedConfirm({
          title:
            step1.value.update_blank_override === 1
              ? '既存生徒が含まれるCSVです。入力された値で上書きし、空欄の項目は既存データが削除されます。よろしいですか？'
              : '既存生徒が含まれるCSVです。入力された値のみ上書きします。よろしいですか？',
          content: '',
          confirmButtonText: 'はい',
          cancelButtonText: 'いいえ',
        }));
      activeStep.value += 1;

      loading.value = true;

      const { status, progress, errors } = await createBatchImportJobs({
        batch_id: batchId.value,
      });

      uploading.value = true;
      loading.value = false;

      importProgress.value = {
        status,
        progress,
        errors,
      };
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

  const currentPageData = computed(() => {
    return tableData.value.slice(
      DefaultPageSize * (currentPage.value - 1),
      DefaultPageSize * currentPage.value
    );
  });

  async function queryJobs() {
    if (['failed', 'success'].includes(importProgress.value.status)) {
      clearInterval(timerId.value);

      return;
    }

    const { status, progress, errors } = await getBatchImportProgress({
      batch_id: batchId.value,
    });

    importProgress.value = {
      status,
      progress,
      errors,
    };

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
  const csvRef = ref();
  function clearStep1() {
    step1.value = { ...defaultStep1 };
    csvRef.value.clearFiles();
  }
</script>
<style scoped></style>
