<template>
  <el-card v-loading="loading">
    <el-form ref="formRef" label-position="top" :rules="rules" :model="form">
      <el-tabs v-model="activeName" class="school-copy-tabs">
        <el-tab-pane label="基本設定" name="first">
          <el-form-item label="コピー元の教室" prop="origin_school">
            <el-select-v2
              v-model="form.origin_school"
              filterable
              remote
              :remote-method="searchSchools"
              clearable
              :options="schoolOptions"
              :loading="schoolLoading"
              class="w-full"
              placeholder="選択"
            />
          </el-form-item>
          <el-form-item label="反映される教室" prop="copy_to_schools">
            <el-select-v2
              v-model="form.copy_to_schools"
              filterable
              remote
              :remote-method="searchSchools"
              clearable
              multiple
              :options="schoolOptions"
              :loading="schoolLoading"
              class="w-full"
              placeholder="選択"
            />
            <p class="text-sm text-gray-400 mt-1">
              ※空欄のときは全ての教室にコピーされます
            </p>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="コピーされる設定" name="second">
          <template v-for="(item, index) in copySettings" :key="index">
            <p class="mb-2 font-bold">{{ item.title }}</p>
            <div class="flex flex-wrap">
              <el-form-item
                v-for="setting in item.settings"
                :key="setting.key"
                class="flex items-center mr-4"
                :prop="setting.key"
              >
                <el-switch
                  v-model="form[setting.key]"
                  :loading="loadings[setting.key]"
                  :before-change="() => beforeSwitchChange(setting.key)"
                />
                <span class="ml-1">{{ setting.label }}</span>
              </el-form-item>
              <div
                v-if="item.title === '教室' && form.enable_school"
                class="w-full -mt-4 mb-2 flex items-center"
              >
                <el-checkbox v-model="form.enable_school_detail"></el-checkbox>
                <span
                  class="ml-1 cursor-pointer school-settings-label"
                  :class="[form.enable_school_detail && 'active']"
                  @click="showDialog"
                >
                  <c-icon-font
                    name="icon-set"
                    :size="ButtonIconHeight.default"
                    class="mx-1 cursor-pointer"
                  />教室設定コピー項目を細かく設定</span
                >
              </div>
            </div>
          </template>
          <div class="w-full p-12"></div>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
  <div
    class="bg-white py-3 fixed inset-x-0 bottom-0 z-10 shadow-[0_-3px_4px_rgba(0,0,0,0.05)] px-4 overflow-auto"
  >
    <div class="layout-container flex justify-end">
      <el-button type="danger" plain @click="resetForm(formRef)"
        >リセット</el-button
      >
      <el-button
        type="primary"
        :loading="submitLoading"
        :disabled="disabledSubmit"
        @click="submitForm(formRef)"
        >送信</el-button
      >
    </div>
  </div>

  <c-dialog
    v-model="dialogVisible"
    title="教室設定コピー項目を細かく設定"
    width="70%"
    @close="onDialogClose"
  >
    <el-form class="school-detail-settings">
      <el-row>
        <el-col v-for="item in schoolDetailData" :key="item.key" :span="8">
          <el-form-item>
            <el-checkbox-group v-model="schoolDetailSettings">
              <el-checkbox :label="item.key">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button type="danger" plain @click="resetDetailSettings"
        >リセット</el-button
      >
      <el-button type="primary" @click="handleDetailSettingsConfirm"
        >確認</el-button
      >
    </template>
  </c-dialog>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import type { FormInstance, FormRules } from 'element-plus';
  import { MaxPageSize, ButtonIconHeight } from '@/constants';
  import {
    getSchoolList,
    saveSchoolCopySettings,
    previewSchoolCopySettings,
  } from '@/services';
  import {
    copySettings,
    schoolDetailData,
    baseKeys,
  } from './copySettingFields';
  import { typedConfirm } from '@/utils';
  import type { OptionType } from 'element-plus/es/components/select-v2/src/select.types';

  interface SchoolOption {
    id: number;
    name: string;
    slug: string;
  }

  const router = useRouter();

  const loading = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const schoolOptions = ref<OptionType<SchoolOption>[]>([]);
  const schoolLoading = ref<boolean>(false);
  const activeName = ref<string>('first');
  const dialogVisible = ref<boolean>(false);
  const submitLoading = ref<boolean>(false);
  const form = reactive({
    origin_school: '',
    copy_to_schools: [] as number[],
    enable_school: false,
    enable_school_detail: false,
    enable_report: false,
    enable_point: false,
    enable_school_textbook: false,
    enable_news_tpl: false,
    new_tags: false,
    enable_teacher_news: false,
    enable_invoice: false,
    enable_invoice_tpl: false,
    omise_setting: false,
    zengin_setting: false,
    parent_account_setting: false,
    enable_score: false,
    achievement_template: false,
    parent_inputs: false,
    homework_setting: false,
    seat_close_setting: false,
    enable_seat_classroom: false,
    seat_setting: false,
    enable_seat_time: false,
    seat_applicable_time_setting: false,
    register_setting: false,
    enable_register_time: false,
    enable_register_classroom: false,
    enable_event: false,
    enable_learning_plans_tpl: false,
    learning_plan_settings: false,
    interview_templates: false,
    customer_settings: false,
    customer_application_setting: false,
    comiru_online_setting: false,
    comiru_air_setting: false,
    apply_templates: false,
    attends_settings: false,
    salaries_settings: false,
  });
  const schoolDetailSettings = ref<string[]>(
    schoolDetailData.map((item) => item.key)
  );
  const originDetailSettings = ref<string[]>(
    schoolDetailData.map((item) => item.key)
  );
  const conflicts = ref<string[]>([]);
  const rules = reactive<FormRules>({
    origin_school: [
      {
        required: true,
        message: 'コピー元の教室を選択してください',
        trigger: 'change',
      },
    ],
  });
  const loadings = reactive<Record<string, boolean>>({
    enable_school: false,
    enable_report: false,
    enable_point: false,
    enable_school_textbook: false,
    enable_news_tpl: false,
    new_tags: false,
    enable_teacher_news: false,
    enable_invoice: false,
    enable_invoice_tpl: false,
    omise_setting: false,
    zengin_setting: false,
    parent_account_setting: false,
    enable_score: false,
    achievement_template: false,
    parent_inputs: false,
    homework_setting: false,
    seat_close_setting: false,
    enable_seat_classroom: false,
    seat_setting: false,
    enable_seat_time: false,
    seat_applicable_time_setting: false,
    register_setting: false,
    enable_register_time: false,
    enable_register_classroom: false,
    enable_event: false,
    enable_learning_plans_tpl: false,
    learning_plan_settings: false,
    interview_templates: false,
    customer_settings: false,
    customer_application_setting: false,
    comiru_online_setting: false,
    comiru_air_setting: false,
    apply_templates: false,
    attends_settings: false,
    salaries_settings: false,
  });

  const disabledSubmit = computed<boolean>(() => {
    return (
      !Object.values(form).some((value) => {
        return typeof value === 'boolean' && value;
      }) ||
      (!!form.enable_school_detail && originDetailSettings.value.length === 0)
    );
  });

  watch(
    () => form.enable_school,
    (val) => {
      if (!val) {
        form.enable_school_detail = false;
      }
    }
  );

  const handleDetailSettingsConfirm = () => {
    originDetailSettings.value = schoolDetailSettings.value;
    dialogVisible.value = false;
  };

  const searchSchools = async (keyword?: string) => {
    keyword = keyword?.trim();
    try {
      schoolLoading.value = true;
      const { items } = await getSchoolList({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
        only_search_name: 1,
      });
      schoolOptions.value = items.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    } finally {
      schoolLoading.value = false;
    }
  };

  const beforeSwitchChange = (key: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!form[key]) {
        if (!form.origin_school) {
          ElMessage.warning('コピー元の教室を選択してください');
          return resolve(false);
        }
        previewSettings(key, resolve);
      } else {
        conflicts.value = conflicts.value.filter((item) => item !== key);
        return resolve(true);
      }
    });
  };

  const previewSettings = async (key: string, resolve: any) => {
    try {
      loadings[key] = true;
      const {
        result: { status, message, conflict },
      } = await previewSchoolCopySettings({
        origin_school: form.origin_school,
        copy_to_schools: form.copy_to_schools,
        [key]: true,
      });
      if (conflict) {
        conflicts.value.push(key);
      }
      ElMessage({
        type: status && !conflict ? 'success' : 'warning',
        message,
      });
      return resolve(status);
    } catch (error) {
      console.error(error);
      return resolve(false);
    } finally {
      loadings[key] = false;
    }
  };

  const showDialog = () => {
    if (form.enable_school_detail) {
      schoolDetailSettings.value = originDetailSettings.value;
      dialogVisible.value = true;
    }
  };

  const onDialogClose = () => {
    schoolDetailSettings.value = originDetailSettings.value;
  };

  const resetDetailSettings = () => {
    schoolDetailSettings.value = [];
  };

  const initForm = async () => {
    try {
      loading.value = true;
      await searchSchools();
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
          if (conflicts.value.length) {
            await typedConfirm({
              title:
                'コピー先の教室には、既にデータが存在します。コピーを実行する場合は、上書き保存されます。コピーを実行しますか？',
              content: '',
              confirmButtonText: 'はい',
              cancelButtonText: 'いいえ',
            });
          }
          const {
            result: { message, status },
          } = await saveSchoolCopySettings({
            ...form,
            detail_fields: form.enable_school_detail
              ? schoolDetailSettings.value.filter((key) => {
                  return baseKeys.includes(key);
                })
              : undefined,
            detail_setting: form.enable_school_detail
              ? schoolDetailSettings.value.filter((key) => {
                  return !baseKeys.includes(key);
                })
              : undefined,
            enable_school:
              form.enable_school && form.enable_school_detail
                ? false
                : form.enable_school,
          });
          ElMessage({
            type: status ? 'success' : 'error',
            message,
          });
          if (status) {
            router.push({ name: 'SchoolList' });
          }
        } catch (error) {
          console.log(error);
        } finally {
          submitLoading.value = false;
        }
      } else {
        activeName.value = 'first';
      }
    });
  };

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) {
      return;
    }
    formEl.resetFields();
    conflicts.value = [];
  };

  initForm();
</script>

<style scoped lang="postcss">
  .school-detail-settings .el-checkbox {
    white-space: pre-wrap;
    :deep(.el-checkbox__label) {
      color: var(--el-text-color-regular);
      line-height: 20px;
    }
  }
  .school-settings-label.active {
    color: var(--el-color-primary);
  }
</style>
