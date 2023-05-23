<template>
  <c-dialog
    v-bind="$attrs"
    title="メモ"
    :confirm-disabled="submitting"
    @open="initialize"
    @confirm="submit"
  >
    <el-form label-position="top" :model="formData">
      <template v-for="{ label, prop, component } in formEntries" :key="prop">
        <el-form-item :label="`${label}：`" :prop="prop">
          <c-component v-bind="component" v-model="formData[prop]" />
        </el-form-item>
      </template>
    </el-form>
  </c-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import type { IComponent } from '@/components/CComponent.vue';
  import CDialog from '@/components/CDialog.vue';

  import {
    updateInvoiceMemo,
    type IInvoiceItem,
    type IUpdateInvoiceMemoParams,
  } from '@/services';

  interface FilterDialogProps {
    invoice: IInvoiceItem | undefined;
    afterEditing: () => void | Promise<void>;
  }

  interface IFormEntry {
    label?: string;
    prop: string;
    component?: IComponent;
  }

  const props = defineProps<FilterDialogProps>();

  const formEntries = ref<IFormEntry[]>([]);
  const formData = ref<Record<string, any>>({});

  const submitting = ref<boolean>(false);

  function initialize() {
    formEntries.value = [
      {
        label: 'メモ',
        prop: 'memo',
        component: {
          name: ElInput,
          attrs: {
            type: 'textarea',
            rows: 3,
            placeholder: '入力メモ',
          },
        },
      },
    ];

    formData.value = formEntries.value.reduce(
      (acc, { prop }) => Object.assign(acc, { [prop]: props.invoice?.[prop] }),
      {}
    );
  }

  async function submit() {
    submitting.value = true;
    const id = props.invoice?.id;

    if (!id) {
      submitting.value = false;
      return ElMessage.warning('`id` 項目は必須ではないといけません。');
    }

    try {
      await updateInvoiceMemo({
        id,
        ...formData.value,
      } as IUpdateInvoiceMemoParams);

      ElMessage.success('更新しました！');
      await props.afterEditing();
    } catch (e) {
      console.error(e);
      ElMessage.error('更新に失敗しました！');
    } finally {
      submitting.value = false;
    }
  }

  initialize();
</script>
