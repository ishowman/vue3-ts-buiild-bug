<template>
  <el-card v-loading="loading">
    <el-form
      ref="formRef"
      :model="form"
      class="mx-auto w-[835px]"
      label-width="260px"
    >
      <el-form-item label="教室名" prop="school_id" :rules="rules.school_id">
        <el-select
          v-model="form.school_id"
          class="w-full"
          placeholder="選択"
          :disabled="isEdit"
          filterable
        >
          <el-option
            v-for="item in schoolOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="口座種別" prop="type" :rules="rules.type">
        <el-select
          v-model="form.type"
          class="w-full"
          placeholder="選択"
          :disabled="isEdit"
          clearable
        >
          <el-option
            v-for="item in accountTypes"
            :key="item.id"
            :value="item.id"
            :label="item.name"
            :disabled="existTypes[form.school_id]?.includes(item.id)"
          ></el-option>
        </el-select>
      </el-form-item>
      <template v-if="[1, 3, ''].includes(form.type)">
        <el-form-item
          label="委託者コード"
          prop="consignor_code"
          :rules="rules.consignor_code"
        >
          <c-input-number
            v-model="form.consignor_code"
            placeholder="入力 委託者コード"
          />
        </el-form-item>
        <el-form-item label="委託者名前" prop="name">
          <el-input
            v-model="form.name"
            placeholder="入力 委託者名前"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="委託者名前(半角カナ)"
          prop="name_kana"
          :rules="rules.name_kana"
        >
          <el-input
            v-model="form.name_kana"
            placeholder="入力 委託者名前(半角カナ)"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="入金先金融機関コード"
          prop="bank_code"
          :rules="rules.bank_code"
        >
          <c-input-number
            v-model="form.bank_code"
            placeholder="入力 入金先金融機関コード"
          />
        </el-form-item>
        <el-form-item
          v-if="form.type === 3"
          label="入金先金融機関名(半角カナ英大文字)"
          prop="bank_name"
          :rules="otherRules.bank_name"
        >
          <el-input
            v-model="form.bank_name"
            placeholder="入力 入金先金融機関名(半角カナ英大文字)"
          ></el-input>
        </el-form-item>
        <el-form-item
          v-else
          label="入金先金融機関名(半角カナ)"
          prop="bank_name"
          :rules="rules.bank_name"
        >
          <el-input
            v-model="form.bank_name"
            placeholder="入力 入金先金融機関名(半角カナ)"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="入金先支店番号"
          prop="bank_branch_code"
          :rules="rules.bank_branch_code"
        >
          <c-input-number
            v-model="form.bank_branch_code"
            placeholder="入力 入金先支店番号"
          />
        </el-form-item>
        <el-form-item
          label="入金先支店名(半角カナ)"
          prop="bank_branch_kana"
          :rules="rules.bank_branch_kana"
        >
          <el-input
            v-model="form.bank_branch_kana"
            placeholder="入力 入金先支店名(半角カナ)"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="入金口座の預金科目"
          prop="bank_account_type"
          :rules="rules.bank_account_type"
        >
          <el-radio-group v-model="form.bank_account_type">
            <el-radio label="1">普通預金</el-radio>
            <el-radio label="2">当座預金</el-radio>
            <el-radio label="4">貯蓄</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="入金口座の口座番号"
          prop="bank_account_no"
          :rules="rules.bank_account_no"
        >
          <c-input-number
            v-model="form.bank_account_no"
            placeholder="入力 入金口座の口座番号"
          />
        </el-form-item>
      </template>
      <template v-else-if="form.type === 2">
        <el-form-item
          label="契約種別"
          prop="contract_type"
          :rules="JPBankRules.contract_type"
        >
          <el-input
            v-model="form.contract_type"
            placeholder="入力 契約種別"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="貯金事務センターコード（2桁）"
          prop="type_code"
          :rules="JPBankRules.type_code"
        >
          <c-input-number
            v-model="form.type_code"
            placeholder="入力 貯金事務センターコード（2桁）"
          />
        </el-form-item>
        <el-form-item
          label="事業主番号"
          prop="consignor_code"
          :rules="JPBankRules.consignor_code"
        >
          <c-input-number
            v-model="form.consignor_code"
            placeholder="入力 事業主番号"
          />
        </el-form-item>
        <el-form-item label="事業主名" prop="name">
          <el-input v-model="form.name" placeholder="入力 事業主名"></el-input>
        </el-form-item>
        <el-form-item
          label="事業主名(半角カナ)"
          prop="name_kana"
          :rules="JPBankRules.name_kana"
        >
          <el-input
            v-model="form.name_kana"
            placeholder="入力 事業主名(半角カナ)"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="入金先支店番号(ゆうちょ銀行)"
          prop="bank_branch_code"
          :rules="JPBankRules.bank_branch_code"
        >
          <c-input-number
            v-model="form.bank_branch_code"
            placeholder="入力 入金先支店番号"
          />
        </el-form-item>
        <el-form-item
          label="入金口座の預金科目"
          prop="bank_account_type"
          :rules="JPBankRules.bank_account_type"
        >
          <el-radio-group v-model="form.bank_account_type">
            <el-radio label="1">総合口座</el-radio>
            <el-radio label="2">振替口座</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="入金先口座の口座番号(ゆうちょ銀行)"
          prop="bank_account_no"
          :rules="JPBankRules.bank_account_no"
        >
          <c-input-number
            v-model="form.bank_account_no"
            placeholder="入力 入金先口座の口座番号(ゆうちょ銀行)"
          />
        </el-form-item>
      </template>
      <template v-else-if="form.type === 4">
        <el-form-item
          label="JCコード(2桁)"
          prop="jc_code"
          :rules="postalRules.jc_code"
        >
          <c-input-number
            v-model="form.jc_code"
            placeholder="入力 JCコード(2桁)"
          />
        </el-form-item>
        <el-form-item
          label="事業主番号(8桁)"
          prop="consignor_code"
          :rules="postalRules.consignor_code"
        >
          <c-input-number
            v-model="form.consignor_code"
            placeholder="入力 事業主番号(8桁)"
          />
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item
          label="ログインID"
          prop="consignor_code"
          :rules="dataJPRules.consignor_code"
        >
          <el-input
            v-model="form.consignor_code"
            placeholder="入力 ログインID"
          ></el-input>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button
          type="primary"
          :loading="submitLoading"
          :disabled="isDisabled"
          @click="submitForm(formRef)"
          >{{ isEdit ? '保存' : '送信' }}</el-button
        >
        <el-button type="danger" plain @click="resetForm(formRef)"
          >リセット</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, watch, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormInstance, FormRules } from 'element-plus';
  import {
    getSchoolAccountInfo,
    getAllSchools,
    createSchoolAccount,
    updateSchoolAccount,
    getSchoolAccountExistTypes,
  } from '@/services';

  interface IAccountType {
    id: number;
    name: string;
  }

  interface IFormData {
    school_id: string | number;
    id?: string | number;
    type: string | number;
    type_code: number | string;
    consignor_code: number | string;
    name: string;
    name_kana: string;
    bank_code: number | string;
    bank_name: string;
    bank_branch_code: number | string;
    bank_branch_kana: string;
    bank_account_type: string;
    bank_account_no: number | string;
    contract_type: string;
    jc_code: string;
  }
  const route = useRoute();
  const router = useRouter();

  const rules = reactive<FormRules>({
    school_id: [
      {
        required: true,
        message: '教室名 を入力してください',
        trigger: 'change',
      },
    ],
    type: [
      {
        required: true,
        message: '口座種別は、必ず指定してください',
        trigger: 'change',
      },
    ],
    consignor_code: [
      {
        required: true,
        message: '委託者コード を入力してください',
        trigger: 'blur',
      },
    ],
    name_kana: [
      {
        required: true,
        message: '委託者名前(半角カナ) を入力してください',
        trigger: 'blur',
      },
      {
        pattern: /^[0-9A-Zｱ-ﾝﾞﾟｦｧ-ｫｯｬ-ｮｰ() ]+$/,
        message:
          '委託者名前(半角カナ) は半角カタカナ英数字大文字などで入力してください',
        trigger: 'blur',
      },
    ],
    bank_code: [
      {
        required: true,
        message: '入金先金融機関コード を入力してください',
        trigger: 'blur',
      },
      {
        max: 4,
        message:
          '入金先金融機関コード は半角数字(4けた以下）で入力してください',
        trigger: 'blur',
      },
    ],
    bank_name: [
      {
        required: true,
        message: '入金先金融機関名(半角カナ) を入力してください',
        trigger: 'blur',
      },
      {
        max: 15,
        message:
          '入金先金融機関名(半角カナ) はカタカナ(15文字以下）で入力してください',
        trigger: 'blur',
      },
      {
        pattern: /^[0-9A-Zｱ-ﾝﾞﾟｦｧ-ｫｯｬ-ｮｰ() ]+$/,
        message:
          '入金先金融機関名(半角カナ) は半角カタカナ英数字大文字などで入力してください',
        trigger: 'blur',
      },
    ],
    bank_branch_code: [
      {
        required: true,
        message: '入金先支店番号 を入力してください',
        trigger: 'blur',
      },
      {
        max: 3,
        message: '入金先支店番号 は半角数字(3けた以下）で入力してください',
        trigger: 'blur',
      },
    ],
    bank_branch_kana: [
      {
        required: true,
        message: '入金先支店名(半角カナ) を入力してください',
        trigger: 'blur',
      },
      {
        max: 15,
        message:
          '入金先支店名(半角カナ) はカタカナ(15文字以下）で入力してください',
        trigger: 'blur',
      },
      {
        pattern: /^[0-9A-Zｱ-ﾝﾞﾟｦｧ-ｫｯｬ-ｮｰ() ]+$/,
        message:
          '入金先支店名(半角カナ) は半角カタカナ英数字大文字などで入力してください',
        trigger: 'blur',
      },
    ],
    bank_account_type: [
      {
        required: true,
        message: '入金口座の預金科目 を入力してください',
        trigger: 'change',
      },
    ],
    bank_account_no: [
      {
        required: true,
        message: '入金口座の口座番号 を入力してください',
        trigger: 'blur',
      },
      {
        max: 7,
        message: '入金口座の口座番号 は半角数字(7けた以下）で入力してください',
        trigger: 'blur',
      },
    ],
  });
  const JPBankRules = reactive<FormRules>({
    contract_type: [
      {
        required: true,
        message: '契約種別 を入力してください',
        trigger: 'blur',
      },
    ],
    type_code: [
      {
        required: true,
        message: '貯金事務センターコード(2桁) を入力してください',
        trigger: 'blur',
      },
      {
        max: 2,
        message:
          '貯金事務センターコード(2桁) は半角数字(2けた以下）で入力してください',
        trigger: 'blur',
      },
    ],
    consignor_code: [
      {
        required: true,
        message: '事業主番号 を入力してください',
        trigger: 'blur',
      },
      {
        max: 8,
        message: '事業主番号 は半角数字(8けた以下）で入力してください',
        trigger: 'blur',
      },
    ],
    name_kana: [
      {
        required: true,
        message: '事業主名(半角カナ) を入力してください',
        trigger: 'blur',
      },
      {
        pattern: /^[0-9A-Zｱ-ﾝﾞﾟｦｧ-ｫｯｬ-ｮｰ() ]+$/,
        message:
          '委託者名前(半角カナ) は半角カタカナ英数字大文字などで入力してください',
        trigger: 'blur',
      },
    ],
    bank_branch_code: [
      {
        required: true,
        message: '入金先支店番号(ゆうちょ銀行) を入力してください',
        trigger: 'blur',
      },
      {
        max: 3,
        message:
          '入金先支店番号(ゆうちょ銀行) は半角数字(3けた以下）で入力してください',
        trigger: 'blur',
      },
    ],
    bank_account_type: [
      {
        required: true,
        message: '入金口座の預金科目 を入力してください',
        trigger: 'change',
      },
    ],
    bank_account_no: [
      {
        required: true,
        message: '入金先口座の口座番号(ゆうちょ銀行) を入力してください',
        trigger: 'blur',
      },
      {
        max: 7,
        message:
          '入金先口座の口座番号(ゆうちょ銀行) は半角数字(7けた以下）で入力してください',
        trigger: 'blur',
      },
    ],
  });
  const postalRules = reactive<FormRules>({
    jc_code: [
      {
        required: true,
        message: 'JCコード(2桁) を入力してください',
        trigger: 'blur',
      },
      {
        min: 2,
        max: 2,
        message: 'JCコード(2桁) は2文字で入力してください',
        trigger: 'blur',
      },
    ],
    consignor_code: [
      {
        required: true,
        message: '事業主番号(8桁) を入力してください',
        trigger: 'blur',
      },
      {
        min: 8,
        max: 8,
        message: '事業主番号(8桁) は8文字で入力してください',
        trigger: 'blur',
      },
    ],
  });
  const dataJPRules = reactive<FormRules>({
    consignor_code: [
      {
        required: true,
        message: 'ログインID を入力してください',
        trigger: 'blur',
      },
      {
        pattern: /^[A-Za-z0-9]+$/,
        message: 'ログインID の書式が正しくありません',
        trigger: 'blur',
      },
      {
        min: 8,
        max: 8,
        message: 'ログインID は8文字で入力してください',
        trigger: 'blur',
      },
    ],
  });
  const otherRules = reactive<FormRules>({
    bank_name: [
      {
        required: true,
        message: '入金先金融機関名(半角カナ英大文字) を入力してください',
        trigger: 'blur',
      },
      {
        max: 15,
        message:
          '入金先金融機関名(半角カナ英大文字) はカタカナ(15文字以下）で入力してください',
        trigger: 'blur',
      },
      {
        pattern: /^[0-9A-Zｱ-ﾝﾞﾟｦｧ-ｫｯｬ-ｮｰ() ]+$/,
        message:
          '入金先金融機関名(半角カナ英大文字) は半角カタカナ英数字大文字などで入力してください',
        trigger: 'blur',
      },
    ],
  });

  const loading = ref<boolean>(false);
  const submitLoading = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const accountTypes = ref<IAccountType[]>([
    { id: 1, name: '全銀' },
    { id: 2, name: 'ゆうちょ銀行' },
    { id: 4, name: 'ゆうちょ形式' },
    { id: 3, name: 'UFJニコス' },
    { id: 9, name: 'データ・ジャパン' },
  ]);
  const schoolOptions = ref<any>([]);
  const form = reactive<IFormData>({
    school_id: '',
    type: 1,
    type_code: '',
    consignor_code: '',
    name: '',
    name_kana: '',
    bank_code: '',
    bank_name: '',
    bank_branch_code: '',
    bank_branch_kana: '',
    bank_account_type: '1',
    bank_account_no: '',
    contract_type: '',
    jc_code: '',
  });
  const originFormData = ref(null);
  const existTypes = ref<Record<number, number[]>>({});

  const isEdit = computed<boolean>(() => {
    return !!route.params.id;
  });

  const requiredKeys = computed<string[]>(() => {
    if ([1, 3, ''].includes(form.type)) {
      return Object.keys(rules);
    } else if (form.type === 2) {
      return Object.keys(JPBankRules);
    } else if (form.type === 4) {
      return Object.keys(postalRules);
    } else {
      return Object.keys(dataJPRules);
    }
  });

  const isDisabled = computed<boolean>(() => {
    return requiredKeys.value.some((key) => !form[key]);
  });

  watch(
    () => form.school_id,
    (id) => {
      if (existTypes.value[id]?.includes(1)) {
        form.type = '';
      }
    }
  );

  const getSchoolExistTypes = async () => {
    try {
      existTypes.value = await getSchoolAccountExistTypes();
    } catch (error) {
      console.error(error);
    }
  };

  const getSchools = async () => {
    try {
      const { lists } = await getAllSchools();
      schoolOptions.value = lists;
    } catch (error) {
      console.error(error);
    }
  };

  const getInfo = async () => {
    const id = route.params?.id;
    try {
      originFormData.value = await getSchoolAccountInfo({ id });
      Object.assign(form, originFormData.value);
      nextTick(() => {
        formRef.value?.validate();
      });
    } catch (error) {
      console.error(error);
    }
  };

  const initForm = async () => {
    try {
      loading.value = true;
      await Promise.all([
        getSchools(),
        isEdit.value ? getInfo() : getSchoolExistTypes(),
      ]);
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
          const { success } = isEdit.value
            ? await updateSchoolAccount(form)
            : await createSchoolAccount(form);
          if (success) {
            router.push({ name: 'SchoolAccountList' });
            ElMessage.success(
              isEdit.value ? '更新しました！' : '保存しました！'
            );
          } else {
            ElMessage.error(
              isEdit.value ? '更新に失敗しました！' : '保存に失敗しました！'
            );
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
    if (isEdit.value) {
      Object.assign(form, originFormData.value);
    } else {
      formEl.resetFields();
    }
  };

  initForm();
</script>
