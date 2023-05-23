<template>
  <c-dialog
    v-bind="$attrs"
    v-model="dialogVisible"
    @confirm="emit('update:form', formData)"
    @open="formData = props.form"
  >
    <el-form label-position="top">
      <el-form-item label="メモ：">
        <el-input
          v-model="formData.memo"
          type="textarea"
          :rows="3"
          resize="vertical"
          placeholder="入力 メモ"
        />
      </el-form-item>
    </el-form>
  </c-dialog>
</template>

<script lang="ts" setup>
  import { computed, ref, useAttrs } from 'vue';
  import type { IUpdateInvoiceMemoParams } from '@/services';

  interface IProps {
    form: IUpdateInvoiceMemoParams;
  }

  const props = withDefaults(defineProps<IProps>(), {
    form: () => ({
      id: 0,
      memo: '',
    }),
  });

  const emit = defineEmits(['update:modelValue', 'update:form']);

  const dialogVisible = computed<typeof ElDialog.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const formData = ref({ memo: '' });
</script>
