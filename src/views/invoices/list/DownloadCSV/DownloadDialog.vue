<template>
  <c-dialog v-model="open" size="small" :title="title">
    <div v-if="props.loading" v-loading="loading" />

    <el-form
      v-else
      ref="formRef"
      label-position="top"
      :model="formData"
      class="form"
    >
      <template
        v-for="{
          label,
          prop,
          component,
          components = [component],
          vif = () => true,
          rules,
        } in formEntries"
        :key="prop"
      >
        <el-form-item
          v-if="vif?.()"
          :label="`${label}：`"
          :prop="prop"
          :rules="component?.rules ?? rules"
          :class="component?.prop ?? prop"
        >
          <template v-for="item in components">
            <c-component
              v-if="item"
              v-bind="item"
              :key="item.prop"
              v-model="formData[item.prop ?? prop]"
            />
          </template>
        </el-form-item>
      </template>
    </el-form>

    <dl class="dl">
      <dt>口座振替件数：</dt>
      <dd>
        <span>{{ meta.count }} 件</span>
        <span v-if="zeroPriceInvoiceCount > 0" class="text-danger">
          （0円の請求書を選択していても、全銀ファイルに含まれません）
        </span>
      </dd>

      <dt>振替総額：</dt>
      <dd>
        {{ new Intl.NumberFormat('ja-JP').format(meta.total) }}
        {{ ' ' }}
        円
      </dd>
    </dl>

    <template v-if="props.params?.action === 'veritrans'" #footer>
      <div class="footer">
        <el-button
          type="primary"
          :disabled="disabled"
          :loading="downloading"
          @click="confirm"
        >
          {{ title }}を作成
        </el-button>
      </div>
    </template>

    <template v-else #footer>
      <div class="footer">
        <el-button
          type="primary"
          :disabled="disabled || downloadingCSV || requiredFieldsUnfinished"
          :loading="downloading"
          @click="confirm"
        >
          {{
            props.params?.action === 'zenginCorporation' ? '会社' : ''
          }}全銀ファイルダウンロード
        </el-button>
        <el-button
          type="primary"
          :disabled="disabled || downloading"
          :loading="downloadingCSV"
          @click="confirmCSV"
        >
          対象の請求一覧ダウンロード
        </el-button>
      </div>
    </template>
  </c-dialog>
</template>

<script lang="ts" setup>
  import { ref, watch, computed } from 'vue';

  import {
    verifyZenginData,
    verifyZenginCorporationData,
    verifyVeritransData,
    downloadZenginData,
    downloadZenginCorporationData,
    downloadVeritransData,
  } from '@/services';

  import {
    downloadTextWithPresetEncoding,
    typedConfirm,
    isIterable,
  } from '@/utils';

  import type { IFormEntry, IOption } from '@/components/form/types';

  import {
    convertDate,
    convertDates,
    convertOptions,
    convertSelect,
  } from '@/components/form/utils';

  import { createSplitedPagedCSVDownloader } from '@/utils/csv';
  import type { FormInstance } from 'element-plus';

  export interface IDownloadDialogParams {
    action: 'zengin' | 'zenginCorporation' | 'veritrans';
    ids?: number[];
    search?: Record<string, string | number | boolean | undefined | null>;
  }

  export interface DownloadDialogProps {
    loading?: boolean;
    stopLoading?: () => void;
    params?: IDownloadDialogParams;
  }

  const props = defineProps<DownloadDialogProps>();

  const downloading = ref<boolean>(false);
  const downloadingCSV = ref<boolean>(false);

  const ACTION_TITLE_MAP = {
    zengin: '全銀ファイル作成',
    zenginCorporation: '会社全銀ファイル作成',
    veritrans: '口座振替(ベリトランス)フォーマット',
  };

  const ACTION_VERIFY_FN_MAP = {
    zengin: verifyZenginData,
    zenginCorporation: verifyZenginCorporationData,
    veritrans: verifyVeritransData,
  };

  const ACTION_DOWNLOAD_FN_MAP = {
    zengin: downloadZenginData,
    zenginCorporation: downloadZenginCorporationData,
    veritrans: downloadVeritransData,
  };

  const YUCHO_TYPES = ['2', '22', '4'];
  const UFJ_FACTOR_VALUES = ['99'];
  const UFJ_FACTOR_TYPES = ['99'];
  const WITH_TRAILER_RECORD_SWITCH_VALUES = ['1', '11', '12'];

  const formRef = ref<FormInstance>();
  const title = ref<string>('');
  const open = ref<boolean>(false);

  const verifiedIds = ref<number[]>([]);
  const meta = ref<{ count: number; total: number }>({ count: 0, total: 0 });

  const formEntries = ref<IFormEntry[]>([]);
  const formData = ref<
    Record<string, string | number | boolean | undefined | null>
  >({});

  const disabled = ref<boolean>(false);

  const requiredFieldsUnfinished = computed(() => {
    return formEntries.value
      .reduce(
        (acc, { prop, vif = () => true, rules = [], requiredFields = [] }) =>
          vif()
            ? (Array.isArray(rules) ? rules : [rules]).some(
                ({ required }) => required
              )
              ? [...acc, formData.value[prop]]
              : requiredFields.length > 0
              ? [...acc, ...requiredFields.map((prop) => formData.value[prop])]
              : acc
            : acc,
        [] as any[]
      )
      .some((value) =>
        isIterable(value)
          ? value.length === 0
          : ['', undefined, null].includes(value)
      );
  });

  const zeroPriceInvoiceCount = ref<number>(0);

  interface IZenginFormatOption extends IOption {
    type: string;
  }

  const zenginFormatOptions = ref<IZenginFormatOption[]>([]);

  const zenginFormatValueTypeMap = ref<Record<string, string>>({});
  const schoolOptionsByTypes = ref<Record<string, IOption[]>>({});

  const automatedZenginFormat = computed(() =>
    props.params?.action === 'zenginCorporation'
      ? String(
          zenginFormatOptions.value.find(
            ({ value }) => value === formData.value.corporation_zengin_id
          )?.type
        )
      : undefined
  );

  const schoolOptions = computed(
    () =>
      schoolOptionsByTypes.value[
        zenginFormatValueTypeMap.value[formData.value.zengin_format as string]
      ] ?? []
  );

  async function initialize({ params, loading }: DownloadDialogProps) {
    if (!loading) {
      return;
    }

    // Closed:
    if (!params) {
      return;
    }

    // Opened:
    formData.value = {};
    verifiedIds.value = [];

    const { action, ids, search } = params;
    const verify = ACTION_VERIFY_FN_MAP[action];

    const {
      data,
      meta: { count, total },
      status_error_num,
      pay_date_str,
      pay_date_error_num,
      zero_price_invoice_num,
      zengin_formats = [],
      types = {},
    } = await verify({ ids, search });

    props.stopLoading?.();

    if (status_error_num > 0) {
      ElMessage.warning({ message: '既納の請求書が選択されています' });
      return;
    }

    try {
      if (pay_date_error_num > 0) {
        await typedConfirm({
          title: `引き落とし日が過去の日付の請求書がありますがよろしいですか？(合計${pay_date_error_num}件）`,
          content: pay_date_str,
        });
      }
    } catch (e) {
      if (e === 'cancel') {
        return;
      }
    }

    verifiedIds.value = data;

    zenginFormatOptions.value = zengin_formats.map(
      ({ id: value, item: label, type }) => ({
        value,
        label,
        type: String(type),
      })
    );

    zenginFormatValueTypeMap.value = zenginFormatOptions.value.reduce(
      (acc, { type, value }) => ({ ...acc, [value as string]: String(type) }),
      {} as Record<string, string>
    );

    schoolOptionsByTypes.value =
      action === 'zengin'
        ? zenginFormatOptions.value.reduce(
            (acc, { type }) => ({
              ...acc,
              [type]: Object.values(types[type]).map((it) => {
                const [value, label] = Object.entries(it)?.[0] ?? [];
                return { label, value };
              }),
            }),
            {} as Record<string, IOption[]>
          )
        : {};

    const yuchoValues = zenginFormatOptions.value.reduce(
      (acc, { type, value }) =>
        YUCHO_TYPES.includes(String(type)) ? [...acc, value as string] : acc,
      [] as string[]
    );

    const corporationUFJFactorValues = zenginFormatOptions.value.reduce(
      (acc, { type, value }) =>
        UFJ_FACTOR_TYPES.includes(String(type))
          ? [...acc, value as string]
          : acc,
      [] as string[]
    );

    formEntries.value =
      props.params?.action === 'veritrans'
        ? []
        : props.params?.action === 'zengin'
        ? [
            convertSelect({
              label: 'フォーマット',
              prop: 'zengin_format',
              options: zenginFormatOptions,
              rules: {
                required: true,
                message: 'フォーマットは、必ず指定してください',
                trigger: 'blur',
              },
            }),
            convertSelect({
              label: '教室',
              prop: 'school_id',

              options: schoolOptions,
              vif: () => schoolOptions.value.length > 1,
              rules: {
                required: true,
                message: '教室は、必ず指定してください',
                trigger: 'blur',
              },
            }),
            convertDate({
              label: '引落日',
              prop: 'get_date',
              vif: () =>
                !yuchoValues.includes(formData.value.zengin_format as string),
              rules: {
                required: true,
                message: '引落日は、必ず指定してください',
                trigger: 'blur',
              },
            }),
            {
              label: '出力形式',
              prop: 'pattern',
              component: {
                name: ElRadioGroup,
                slots: convertOptions(ElRadio)([
                  { value: 1, label: 'TXT' },
                  { value: 2, label: 'Excel' },
                ]),
              },
              valueConverter: (s) => s === 'true',

              vif: () =>
                UFJ_FACTOR_VALUES.includes(
                  formData.value.zengin_format as string
                ),

              rules: {
                required: true,
                message: '出力形式は、必ず指定してください',
                trigger: 'blur',
              },
            },
            {
              label: 'トレーラーレコード「0」表示',
              prop: 'trailer_record_switch',
              component: {
                name: ElSwitch,
              },
              vif: () =>
                WITH_TRAILER_RECORD_SWITCH_VALUES.includes(
                  formData.value.zengin_format as string
                ),
            },
            convertDates(
              [
                {
                  label: '請求年月',
                  prop: 'created_at',
                  disabledDate: (d: Date) =>
                    Boolean(
                      formData.value.updated_at &&
                        d.setHours(0) >
                          new Date(
                            formData.value.updated_at as string
                          ).setHours(0)
                    ),
                  vif: () =>
                    yuchoValues.includes(
                      formData.value.zengin_format as string
                    ),
                },
                {
                  label: '再振替日',
                  prop: 'updated_at',
                  disabledDate: (d: Date) =>
                    Boolean(
                      formData.value.created_at &&
                        d.setHours(0) <
                          new Date(
                            formData.value.created_at as string
                          ).setHours(0)
                    ),
                  vif: () =>
                    yuchoValues.includes(
                      formData.value.zengin_format as string
                    ),
                },
              ],
              {
                vif: () =>
                  yuchoValues.includes(formData.value.zengin_format as string),

                requiredFields: ['created_at', 'updated_at'],

                rules: {
                  validator: (_, __, callback) => {
                    const { created_at, updated_at } = formData.value;

                    if (!created_at && !updated_at) {
                      callback(new Error('請求年月は、必ず指定してください'));
                    } else if (created_at && !updated_at) {
                      callback(new Error('再振替日は、必ず指定してください'));
                    } else if (!created_at && updated_at) {
                      callback(new Error('請求年月は、必ず指定してください'));
                    } else {
                      callback();
                    }
                  },
                  trigger: 'blur',
                },
              }
            ),
          ]
        : props.params?.action === 'zenginCorporation'
        ? [
            convertSelect({
              label: '会社口座一覧',
              prop: 'corporation_zengin_id',
              options: zenginFormatOptions,
              rules: {
                required: true,
                message: '会社口座一覧は、必ず指定してください',
                trigger: 'blur',
              },
            }),
            convertDate({
              label: '引落日',
              prop: 'get_date',
              vif: () =>
                !yuchoValues.includes(
                  formData.value.corporation_zengin_id as string
                ),
              rules: {
                required: true,
                message: '引落日は、必ず指定してください',
                trigger: 'blur',
              },
            }),
            {
              label: '出力形式',
              prop: 'pattern',
              component: {
                name: ElRadioGroup,
                slots: convertOptions(ElRadio)([
                  { value: 1, label: 'TXT' },
                  { value: 2, label: 'Excel' },
                ]),
              },
              valueConverter: (s) => s === 'true',
              vif: () =>
                corporationUFJFactorValues.includes(
                  formData.value.corporation_zengin_id as string
                ),
              rules: {
                required: true,
                message: '出力形式は、必ず指定してください',
                trigger: 'blur',
              },
            },
            {
              label: 'トレーラーレコード「0」表示',
              prop: 'trailer_record_switch',
              component: {
                name: ElSwitch,
              },
              vif: () =>
                WITH_TRAILER_RECORD_SWITCH_VALUES.includes(
                  automatedZenginFormat.value as string
                ),
            },
            convertDates(
              [
                {
                  label: '請求年月',
                  prop: 'created_at',
                  vif: () =>
                    yuchoValues.includes(
                      formData.value.corporation_zengin_id as string
                    ),
                  disabledDate: (d: Date) =>
                    Boolean(
                      formData.value.updated_at &&
                        d.setHours(0) >
                          new Date(
                            formData.value.updated_at as string
                          ).setHours(0)
                    ),
                  rules: {
                    required: true,
                    message: '請求年月は、必ず指定してください',
                    trigger: 'blur',
                  },
                },
                {
                  label: '再振替日',
                  prop: 'updated_at',
                  vif: () =>
                    yuchoValues.includes(
                      formData.value.corporation_zengin_id as string
                    ),
                  disabledDate: (d: Date) =>
                    Boolean(
                      formData.value.created_at &&
                        d.setHours(0) <
                          new Date(
                            formData.value.created_at as string
                          ).setHours(0)
                    ),
                  rules: {
                    required: true,
                    message: '再振替日は、必ず指定してください',
                    trigger: 'blur',
                  },
                },
              ],
              {
                vif: () =>
                  yuchoValues.includes(
                    formData.value.corporation_zengin_id as string
                  ),

                requiredFields: ['created_at', 'updated_at'],

                rules: {
                  validator: (_, __, callback) => {
                    const { created_at, updated_at } = formData.value;

                    if (!created_at && !updated_at) {
                      callback(new Error('請求年月は、必ず指定してください'));
                    } else if (created_at && !updated_at) {
                      callback(new Error('再振替日は、必ず指定してください'));
                    } else if (!created_at && updated_at) {
                      callback(new Error('請求年月は、必ず指定してください'));
                    } else {
                      callback();
                    }
                  },
                  trigger: 'blur',
                },
              }
            ),
          ]
        : [];

    if (action === 'zengin') {
      formData.value = {
        zengin_format: zenginFormatOptions.value[0]?.value,
        pattern: 1,
      };
    }

    if (action === 'zenginCorporation') {
      formData.value = {
        pattern: 1,
      };
    }

    title.value = ACTION_TITLE_MAP[params.action];
    meta.value = { count, total };
    zeroPriceInvoiceCount.value = zero_price_invoice_num ?? 0;
    open.value = true;
    disabled.value = !(count > 0 && total > 0 && verifiedIds.value.length > 0);
  }

  async function confirm() {
    formRef.value?.validate(async (isValid) => {
      if (!isValid) {
        return;
      }

      const needButGotNoSchoolId =
        props.params?.action === 'zengin'
          ? formData.value.schoolIds === undefined &&
            schoolOptions.value[0]?.value === undefined
          : false;

      if (needButGotNoSchoolId) {
        return ElMessage.error(
          '教室の口座登録が完了していない為、ダウンロードできません'
        );
      }

      const vifMap = formEntries.value.reduce(
        (
          acc,
          { vif = () => true, prop, component, components = [component] }
        ) =>
          Object.assign(acc, {
            [prop]: vif,
            ...components.reduce(
              (acc, c) =>
                c && c.prop && c.vif
                  ? Object.assign(acc, { [c.prop]: c.vif })
                  : acc,
              {}
            ),
          }),
        {}
      );

      const validatedFormData = Object.entries(formData.value).reduce(
        (acc, [key, val]) =>
          (vifMap[key] ? vifMap[key]?.() : true)
            ? Object.assign(acc, { [key]: val })
            : acc,
        {
          ...(schoolOptions.value?.[0]
            ? { school_id: schoolOptions.value[0]?.value }
            : undefined),

          ...(automatedZenginFormat.value
            ? { zengin_format: automatedZenginFormat.value }
            : undefined),

          trailer_record_switch: 0,
          use_student_no: false,
        }
      );

      try {
        downloading.value = true;

        const { action = '', search } = props.params ?? {};
        const download = ACTION_DOWNLOAD_FN_MAP[action];

        const { content, file_name } = await download({
          ids: verifiedIds.value,
          search,
          ...validatedFormData,
        });

        downloadTextWithPresetEncoding(content, file_name);
      } catch (e) {
        console.error(e);
      } finally {
        downloading.value = false;
      }
    });
  }

  const PER_PAGE = 100;

  function splitIdsByPages(ids: number[]) {
    const count = ids.length;
    const pages = Math.ceil(count / PER_PAGE);

    return Array(pages)
      .fill('')
      .map((_, p) => ({
        ids: ids.slice(p * PER_PAGE, (p + 1) * PER_PAGE).join(','),
      }));
  }

  async function confirmCSV() {
    try {
      downloadingCSV.value = true;

      const downloadCSV = createSplitedPagedCSVDownloader(
        `post`,
        `invoices/zengin-download/csv-data`,
        splitIdsByPages(verifiedIds.value)
      );

      await downloadCSV();
    } catch (e) {
      console.error(e);
    } finally {
      downloadingCSV.value = false;
    }
  }

  watch(props, initialize);
</script>

<style scoped lang="postcss">
  .dl dt {
    margin-bottom: 0.5em;
  }
  .dl dd:not(:last-child) {
    margin-bottom: 1em;
  }

  .form::v-deep(.created_at-updated_at .el-form-item__content) {
    justify-content: space-between;
    gap: 1rem;
  }
  .form::v-deep(.created_at-updated_at .el-date-editor) {
    flex: 1;
  }
  .form::v-deep(.created_at-updated_at .el-input__wrapper) {
    width: 100%;
  }
  .footer::v-deep(.el-button) {
    display: flex;
    margin-top: 1rem;
    margin-bottom: 1rem;
    width: 100%;
  }

  .footer::v-deep(.el-button + .el-button) {
    margin-left: 0 !important;
  }
</style>
