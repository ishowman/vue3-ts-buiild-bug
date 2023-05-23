<template>
  <el-button plain @click="showDialog">
    <c-icon-font name="icon-Download" :size="ButtonIconHeight.default" />
    データ連携CSV
  </el-button>
  <el-dialog v-model="visible" title="データ連携CSV" width="30%">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="抽出期間" prop="date">
        <el-date-picker
          v-model="form.date"
          type="daterange"
          range-separator="-"
          start-placeholder="抽出期間"
          end-placeholder="抽出期間"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button
          type="danger"
          plain
          :disabled="loading"
          @click="resetForm(formRef)"
          >リセット</el-button
        >
        <el-button type="primary" :loading="loading" @click="onExport(formRef)"
          >送信</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
  import type { DateModelType, FormInstance, FormRules } from 'element-plus';
  import { reactive, ref } from 'vue';
  import { ButtonIconHeight } from '@/constants';
  import { downloadCSV } from '@/utils';
  import { getTeacherCsvConditionData } from '@/services';

  const formRef = ref<FormInstance>();
  const form = reactive<{ date: [DateModelType, DateModelType] }>({
    date: ['', ''],
  });
  const rules = reactive<FormRules>({
    date: [
      {
        type: 'array',
        required: true,
        message: 'Please select date',
        trigger: 'change',
      },
    ],
  });
  const visible = ref<boolean>(false);
  const loading = ref<boolean>(false);

  const showDialog = () => {
    visible.value = true;
  };

  const onExport = (formEl: FormInstance | undefined) => {
    if (!formEl) {
      return;
    }
    formEl.validate(async (valid) => {
      if (valid) {
        loading.value = true;
        try {
          const { data, meta } = await getTeacherCsvConditionData({
            start_date: form.date[0],
            end_date: form.date[1],
          });

          downloadCSV([
            {
              header: meta.header,
              file_name: `${form.date[0]}_${form.date[1]}_講師一覧`,
            },
            data,
          ]);

          visible.value = false;
          formEl.resetFields();
        } finally {
          loading.value = false;
        }
      }
    });
  };

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) {
      return;
    }
    formEl.resetFields();
  };
</script>
