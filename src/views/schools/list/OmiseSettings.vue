<template>
  <el-card v-loading="loading">
    <div class="max-w-3xl mx-auto">
      <el-table class="w-full" :data="tableData">
        <el-table-column prop="school_name" width="180px" />
        <el-table-column prop="omise_secret" label="現在のシークレットキー" />
        <el-table-column prop="omise_public" label="現在のパブリックキー" />
      </el-table>
      <el-form
        ref="formRef"
        :rules="rules"
        :model="form"
        class="mt-4"
        label-width="180px"
      >
        <el-form-item label="教室" prop="schools">
          <el-select
            v-model="form.schools"
            filterable
            clearable
            multiple
            class="w-full"
            placeholder="入力 教室"
          >
            <el-option
              v-for="item in schoolOptions"
              :key="item.id"
              :label="item.school_name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="新しいシークレットキー" prop="omise_secret">
          <el-input
            v-model="form.omise_secret"
            placeholder="入力 新しいシークレットキー"
          ></el-input>
        </el-form-item>
        <el-form-item label="新しいパブリックキー" prop="omise_public">
          <el-input
            v-model="form.omise_public"
            placeholder="入力 新しいパブリックキー"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitLoading"
            :disabled="isDisabled"
            @click="submitForm(formRef)"
            >保存</el-button
          >
          <el-button type="danger" plain @click="resetForm(formRef)"
            >リセット</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormInstance, FormRules } from 'element-plus';
  import {
    getSchoolOmiseSettingsList,
    updateSchoolOmiseSettings,
  } from '@/services';

  interface IFormData {
    schools: number[];
    omise_secret: string;
    omise_public: string;
  }

  interface SchoolOption {
    id: number;
    school_name: string;
  }

  const route = useRoute();
  const router = useRouter();

  const loading = ref<boolean>(false);
  const submitLoading = ref<boolean>(false);
  const schoolOptions = ref<SchoolOption[]>([]);
  const formRef = ref<FormInstance>();
  const tableData = ref([]);
  const form = reactive<IFormData>({
    schools: [],
    omise_secret: '',
    omise_public: '',
  });
  const rules = reactive<FormRules>({
    schools: [
      {
        required: true,
        trigger: 'change',
      },
    ],
    omise_secret: [{ required: true, trigger: 'blur' }],
    omise_public: [{ required: true, trigger: 'blur' }],
  });

  const isDisabled = computed<boolean>(() => {
    return Object.values(form).some((v) => {
      if (typeof v === 'string') {
        return !v;
      }
      return v?.length === 0;
    });
  });

  const initForm = async () => {
    const ids = (route.query?.ids as string) || '';
    try {
      loading.value = true;
      const {
        result: { omise_info_list, selected_school_list },
      } = await getSchoolOmiseSettingsList({ ids });
      tableData.value = omise_info_list;
      schoolOptions.value = selected_school_list;
      form.schools = ids ? ids.split(',').map(Number) : [];
    } finally {
      loading.value = false;
    }
  };

  const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) {
      return;
    }
    await formEl.validate(async (valid) => {
      if (valid) {
        try {
          submitLoading.value = true;
          const { status, message } = await updateSchoolOmiseSettings({
            ids: form.schools.join(','),
            omise_secret: form.omise_secret,
            omise_public: form.omise_public,
          });
          ElMessage({
            type: status ? 'success' : 'error',
            message,
          });
          if (status) {
            router.push({ name: 'SchoolList' });
          }
        } finally {
          submitLoading.value = false;
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

  initForm();
</script>
