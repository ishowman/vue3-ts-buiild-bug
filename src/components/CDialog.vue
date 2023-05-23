<template>
  <el-dialog
    v-bind="$attrs"
    v-model="dialogVisible"
    :width="DIALOG_SIZE_MAP[CDialogProps.size]"
    custom-class="comiru-ui"
  >
    <template v-for="(_, name) in $slots" #[name]>
      <slot :name="name"></slot>
    </template>
    <template #footer>
      <span class="dialog-footer">
        <slot name="footer">
          <el-button plain @click="close">
            {{ CDialogProps.cancelText }}
          </el-button>
          <el-button
            :type="CDialogProps.confirmType"
            :disabled="CDialogProps.confirmDisabled"
            @click="confirm"
          >
            {{ CDialogProps.confirmText }}
          </el-button>
        </slot>
      </span>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
  // TODO: 垂直居中
  // 距离底部、顶部不少于 60 px.用 max-height?
  import { computed, useAttrs } from 'vue';
  const emit = defineEmits(['update:modelValue', 'confirm']);

  interface IDialogProps {
    size?: 'small' | 'medium' | 'large';
    confirmText?: string;
    confirmType?: 'primary' | 'danger';
    cancelText?: string;
    confirmDisabled?: boolean;
  }

  const CDialogProps = withDefaults(defineProps<IDialogProps>(), {
    size: 'medium',
    confirmText: '保存',
    confirmType: 'primary',
    cancelText: 'キャンセル',
  });

  const DIALOG_SIZE_MAP = {
    small: '580px',
    medium: '680px',
    large: '1024px',
  };

  const dialogVisible = computed<typeof ElDialog.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  function close() {
    dialogVisible.value = false;
  }

  function confirm() {
    emit('confirm');
  }
</script>
<style lang="postcss">
  .comiru-ui .el-dialog__footer {
    padding: var(--dialog-footer-padding, 10px 24px);
  }
  /* 模态框上下边框 */
  .comiru-ui .el-dialog__body {
    border-bottom: 1px solid var(--el-border-color-light);
    border-top: 1px solid var(--el-border-color-light);
    padding: var(--dialog-body-padding, 24px);
    max-height: 500px;
    overflow: auto;
  }

  .comiru-ui .el-dialog__header {
    padding: 16px 24px;
    min-height: 56px;
  }
</style>
