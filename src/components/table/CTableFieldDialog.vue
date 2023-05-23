<template>
  <c-dialog
    v-bind="$attrs"
    v-model="dialogVisible"
    width="792px"
    :confirm-disabled="!checkedFields.length"
    @confirm="saveConfigs"
  >
    <template v-for="(_, name) in $slots" #[name]>
      <slot :name="name"></slot>
    </template>
    <div class="grid grid-cols-4">
      <template v-for="field in fieldConfigs" :key="field">
        <el-checkbox v-model="field.show">{{ field.label }}</el-checkbox>
      </template>
    </div>
  </c-dialog>
</template>

<script lang="ts" setup>
  import { computed, reactive, useAttrs } from 'vue';

  import CDialog from '@/components/CDialog.vue';
  interface IFieldConfig {
    show: boolean;
    label: string;
  }
  interface ITableFieldProps {
    fieldConfigs: IFieldConfig[];
    checkedFields: IFieldConfig[];
  }
  const emit = defineEmits(['update:modelValue', 'update:checkedFields']);

  const dialogVisible = computed<typeof ElDialog.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const tableFieldProps = withDefaults(defineProps<ITableFieldProps>(), {
    fieldConfigs: () => [],
  });

  const fieldConfigs = reactive(tableFieldProps.fieldConfigs);

  const checkedFields = computed(() => {
    return fieldConfigs.filter((config) => config.show);
  });

  function saveConfigs() {
    emit('update:checkedFields', checkedFields.value);
    dialogVisible.value = false;
  }
</script>
<style scoped></style>
