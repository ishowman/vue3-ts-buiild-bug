<template>
  <el-card v-loading="loading">
    <el-form
      ref="formRef"
      :model="form"
      class="mx-auto w-[835px]"
      label-width="260px"
    >
      <el-form-item label="口座種別" prop="type">
        <el-select
          v-model="form.type"
          class="w-full"
          placeholder="選択"
          :disabled="isEdit"
        >
          <el-option
            v-for="item in zenginTypes"
            :key="item.key"
            :value="item.key"
            :label="item.item"
          ></el-option>
        </el-select>
      </el-form-item>
      <template v-if="[1, 3, 11, 12, 99].includes(form.type)">
        <el-form-item
          v-if="form.type === 12"
          label="委託者コード"
          prop="consignor_code"
          :rules="otherRules.consignor_code"
        >
          <el-input
            v-model="form.consignor_code"
            placeholder="入力 委託者コード"
          ></el-input>
        </el-form-item>
        <el-form-item
          v-else
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
          :rules="form.type === 12 ? otherRules.name_kana : rules.name_kana"
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
          v-if="[3, 99].includes(form.type)"
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
        <el-form-item label="入金口座の預金科目" prop="bank_account_type">
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
          label="事業主番号"
          prop="consignor_code"
          :rules="JPBankRules.consignor_code"
        >
          <el-input
            v-model="form.consignor_code"
            placeholder="入力 事業主番号"
          ></el-input>
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
          <el-input
            v-model="form.jc_code"
            placeholder="入力 JCコード(2桁)"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="事業主番号(8桁)"
          prop="consignor_code"
          :rules="postalRules.consignor_code"
        >
          <el-input
            v-model="form.consignor_code"
            placeholder="入力 事業主番号(8桁)"
          ></el-input>
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
  import { ref, reactive, computed, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormInstance, FormRules } from 'element-plus';
  import {
    getInvoiceCorporationZenginTypes,
    getInvoiceCorporationZenginInfo,
    createInvoiceCoporationZengin,
    updateInvoiceCoporationZengin,
  } from '@/services';

  interface IZenginType {
    key: number;
    item: string;
  }

  interface IFormData {
    id?: string | number;
    type: number;
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
    consignor_code: [
      {
        required: true,
        message: '委託者コード を入力してください',
        trigger: 'blur',
      },
      {
        pattern: /^[0-9]+$/,
        message: '委託者コード の書式が正しくありません',
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
    consignor_code: [
      {
        required: true,
        message: '事業主番号 を入力してください',
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
          '事業主名(半角カナ) は半角カタカナ英数字大文字などで入力してください',
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
    consignor_code: [
      {
        required: true,
        message: '委託者コード を入力してください',
        trigger: 'blur',
      },
      {
        pattern: /^[A-Za-z0-9]+$/,
        message: '委託者コード の書式が正しくありません',
        trigger: 'blur',
      },
      {
        min: 10,
        max: 10,
        message: '委託者コードは10文字で入力してください',
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
      {
        max: 40,
        message:
          '委託者名前(半角カナ) は半角カタカナ英数字大文字など(40けた以下)で入力してください',
        trigger: 'blur',
      },
    ],
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
  const zenginTypes = ref<IZenginType[]>([]);
  const form = reactive<IFormData>({
    type: 1,
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

  const isEdit = computed<boolean>(() => {
    return !!route.params.id;
  });

  const requiredKeys = computed<string[]>(() => {
    if ([1, 3, 11, 12, 99].includes(form.type)) {
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

  const getCorporationZenginTypes = async () => {
    try {
      const res = await getInvoiceCorporationZenginTypes();
      zenginTypes.value = res;
    } catch (error) {
      console.log(error);
    }
  };

  const initForm = async () => {
    const id = route.params?.id;
    try {
      loading.value = true;
      await getCorporationZenginTypes();
      if (id) {
        originFormData.value = await getInvoiceCorporationZenginInfo({ id });
        Object.assign(form, originFormData.value);
        nextTick(() => {
          formRef.value?.validate();
        });
      }
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
            ? await updateInvoiceCoporationZengin(form)
            : await createInvoiceCoporationZengin(form);
          if (success) {
            router.push({ name: 'InvoiceZenginList' });
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
      formEl.clearValidate();
    } else {
      formEl.resetFields();
    }
  };

  initForm();
</script>
