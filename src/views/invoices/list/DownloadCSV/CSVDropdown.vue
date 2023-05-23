<template>
  <el-dropdown :disabled="props.disabled" @command="downloadFile">
    <el-button type="primary" plain :loading="loading">
      {{ ACTION_NAME_MAP[props.action] }}

      <c-icon-font
        name="icon-Dropdown_ico"
        class="ml-1"
        style="margin-right: 0"
        :size="ButtonIconHeight.small"
      />
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="all"> 全て </el-dropdown-item>
        <el-dropdown-item command="current-page">
          現在のページ
        </el-dropdown-item>
        <el-dropdown-item
          command="selected"
          :disabled="props.selectedIds?.length === 0"
        >
          選択行のみ
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <download-dialog
    :loading="loading"
    :stop-loading="stopLoading"
    :params="downloadParams"
  />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  import DownloadDialog, {
    type IDownloadDialogParams,
  } from './DownloadDialog.vue';
  import { typedConfirm } from '@/utils';

  import { ButtonIconHeight } from '@/constants';
  import type { IInvoiceItem } from '@/services';

  export type TCSVDownloadAction = 'zengin' | 'zenginCorporation' | 'veritrans';

  interface CSVDropdownProps {
    action: TCSVDownloadAction;
    disabled?: boolean;
    data?: IInvoiceItem[];
    selectedIds?: number[];
    currentPageIds?: number[];
    search?: any;
  }

  const ACTION_NAME_MAP = {
    zengin: '全銀ファイル作成',
    zenginCorporation: '会社全銀ファイル作成',
    veritrans: '口座振替（ベリトランス）作成',
  };

  const props = defineProps<CSVDropdownProps>();
  const downloadParams = ref<IDownloadDialogParams | undefined>(undefined);
  const loading = ref<boolean>(false);

  function stopLoading() {
    loading.value = false;
  }

  async function downloadFile(type: 'all' | 'current-page' | 'selected') {
    loading.value = true;
    downloadParams.value = undefined;

    const checkingIds =
      type === 'all'
        ? []
        : type === 'current-page'
        ? props.currentPageIds
        : type === 'selected'
        ? props.selectedIds
        : [];

    const ACTION_PAY_TYPE_MAP: Record<TCSVDownloadAction, number> = {
      zengin: 3,
      zenginCorporation: 3,
      veritrans: 5,
    };

    const payTypeValue = ACTION_PAY_TYPE_MAP[props.action];

    const hasWrongPayType = props.data?.some((item) =>
      checkingIds?.includes(item.id)
        ? item.pay_type_value !== payTypeValue
        : false
    );

    try {
      if (hasWrongPayType) {
        const payType =
          payTypeValue === 3 ? '口座振替' : '口座振替（ベリトランス）';

        await typedConfirm({
          title: `「${payType}」以外の支払い方法の請求書が選択されています。よろしいですか？`,
          content: '',
        });
      }

      downloadParams.value = {
        action: props.action,
        search: props.search,
        ids:
          type === 'all'
            ? undefined
            : type === 'current-page'
            ? props.currentPageIds
            : props.selectedIds,
      };
    } catch (e) {
      if (e === 'cancel') {
        loading.value = false;
        return;
      }
    }
  }
</script>
