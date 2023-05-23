<template>
  <c-dialog
    v-bind="$attrs"
    title="編集"
    :confirm-disabled="submitting"
    @open="initialize"
    @confirm="submit"
  >
    <el-form label-position="top" :model="formData">
      <template
        v-for="{ label, prop, submittingProp, component } in formEntries"
        :key="prop"
      >
        <el-form-item :label="`${label}：`" :prop="prop">
          <c-component v-bind="component" v-model="formData[submittingProp]" />
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
    editReportTemplate,
    type IReportEditTemplateParams,
  } from '@/services';

  interface FilterDialogProps {
    template: Record<string, any> | undefined;
    submit: () => void | Promise<void>;
  }

  interface IFormEntry {
    label?: string;
    prop: string;
    submittingProp: string;
    component?: IComponent;
  }

  const props = defineProps<FilterDialogProps>();

  const formEntries = ref<IFormEntry[]>([]);
  const formData = ref<Record<string, any>>({});

  const submitting = ref<boolean>(false);

  function initialize() {
    formEntries.value = [
      {
        label: '表示順',
        prop: 'sort',
        submittingProp: 'sort',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '表示順を入力または選択',
            type: 'number',
          },
        },
      },
      {
        label: 'タイトル',
        prop: 'template_name',
        submittingProp: 'title',
        component: {
          name: ElInput,
          attrs: {
            placeholder: 'タイトルを入力',
          },
        },
      },
      {
        label: '授業内容',
        prop: 'template_lesson_text',
        submittingProp: 'lesson_text',
        component: {
          name: ElInput,
          attrs: {
            type: 'textarea',
            rows: 8,
            placeholder: '授業内容を入力',
          },
        },
      },
      {
        label: '宿題',
        prop: 'template_homework_text',
        submittingProp: 'homework_text',
        component: {
          name: ElInput,
          attrs: {
            type: 'textarea',
            rows: 8,
            placeholder: '宿題を入力',
          },
        },
      },
      {
        label: '注記',
        prop: 'template_note',
        submittingProp: 'note',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '注記を入力',
          },
        },
      },
    ];

    formData.value = formEntries.value.reduce(
      (acc, { prop, submittingProp }) =>
        Object.assign(acc, { [submittingProp]: props.template?.[prop] }),
      {}
    );
  }

  async function submit() {
    submitting.value = true;

    const id = props.template?.id;
    const { sort } = formData.value;

    if (!id) {
      submitting.value = false;
      return ElMessage.warning('`id` 項目は必須ではないといけません。');
    }

    const correctedSort = Number(String(sort).replace(/^0*/, ''));

    const isSortInvalid =
      sort === 0 ? false : !sort || !Number.isInteger(correctedSort);

    if (isSortInvalid) {
      submitting.value = false;
      return ElMessage.warning('`sort` 項目は必須で整数ではないといけません。');
    }

    try {
      await editReportTemplate({
        ...formData.value,
        id,
        sort: correctedSort,
      } as IReportEditTemplateParams);

      ElMessage.success('更新しました！');
      await props.submit();
    } catch (e) {
      console.error(e);
      ElMessage.error('更新に失敗しました！');
    } finally {
      submitting.value = false;
    }
  }

  initialize();
</script>
