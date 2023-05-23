<template>
  <div v-if="props.loading" v-loading="props.loading" />

  <el-form
    v-else
    ref="formRef"
    :class="`form ${props.class}`"
    :label-position="props.labelPosition"
    :label-width="props.labelWidth"
    :model="props.model"
  >
    <template
      v-for="{
        label,
        prop,
        desc,
        component,
        components = [component],
        vif = () => true,
        rules,
      } in props.formEntries"
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
            :key="item?.prop"
            v-bind="item"
            v-model="formData[item.prop ?? prop]"
            @change="item?.attrs?.change"
          />
          <p v-if="desc" :key="item?.prop" class="mt-1 text-xs text-gray-400">
            {{ desc }}
          </p>
        </template>
      </el-form-item>
    </template>

    <slot v-if="!props.noFooter" name="footer" :reset="reset">
      <footer>
        <el-button type="danger" plain @click="reset">
          {{ props.resetText }}
        </el-button>

        <el-button type="primary" @click="confirm">
          {{ props.confirmText }}
        </el-button>
      </footer>
    </slot>
  </el-form>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import type { FormInstance, FormProps } from 'element-plus';
  import type { TFormData, IFormEntry } from './types';

  export interface IFormProps {
    class?: string;

    labelPosition?: FormProps['labelPosition'];
    labelWidth?: number | string;

    loading?: boolean;

    model: TFormData;
    formEntries: IFormEntry[];

    withReset?: boolean;
    resetText?: string;
    confirmText?: string;

    noFooter?: boolean;
  }

  const props = withDefaults(defineProps<IFormProps>(), {
    labelPosition: 'top',
    class: '',

    resetText: 'リセット',
    confirmText: '送信',
    labelWidth: 'auto',
  });

  const formRef = ref<FormInstance>();
  const formData = computed(() => props.model);

  const emit = defineEmits(['confirm', 'reset']);

  function reset() {
    formRef.value?.resetFields();
  }

  function confirm() {
    emit('confirm');
  }

  defineExpose({
    ref: formRef,
  });
</script>
