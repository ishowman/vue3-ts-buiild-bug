<template>
  <div class="comiru-content py-6">
    <el-form
      v-if="!loading"
      :label-width="96"
      class="w-[835px] mx-auto"
      :model="formEntries"
    >
      <template v-for="{ label, prop, component } in formEntries" :key="prop">
        <el-form-item :label="`${label}：`" :prop="prop">
          <c-component v-bind="component" v-model="formData[prop]" />
        </el-form-item>
      </template>

      <el-form-item>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="
            submitting || Object.values(formData.schools ?? {}).length === 0
          "
          @click="submit"
        >
          保存
        </el-button>

        <el-button type="danger" plain @click="reset">リセット</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { IComponent } from '@/components/CComponent.vue';

  import { reportTemplatesStore } from '@/store';
  import {
    getReportTemplateList,
    batchCopyReportTemplateToSchool,
  } from '@/services';
  import { DefaultPageSize } from '@/constants';

  interface IProps {
    id?: number | string;
  }

  interface ITemplate {
    id?: number;
    school_name?: string;
    template_name?: string;
    schools?: { id: number; name: string }[];
  }

  interface IFormEntry {
    label?: string;
    prop: string;
    component?: IComponent;
    initialValue?: string | number | (string | number)[];
  }

  const props = defineProps<IProps>();

  const { query } = useRoute();
  const router = useRouter();

  const loading = ref<boolean>();
  const template = ref<ITemplate>({});

  const formEntries = ref<IFormEntry[]>([]);
  const formData = ref<Record<string, number | string | (number | string)[]>>(
    {}
  );
  const submitting = ref<boolean>(false);

  async function initialize() {
    try {
      const id = Number(props.id);

      template.value =
        reportTemplatesStore.templatesByIds[id] ??
        (await (async () => {
          loading.value = true;

          const { items } = await getReportTemplateList({
            page: (query.page as unknown as number) ?? 1,
            pagesize: (query.pagesize as unknown as number) ?? DefaultPageSize,
          });

          reportTemplatesStore.setTemplates(items);
          loading.value = false;

          return items.find(
            ({ id }) => Number(props.id) === Number(id)
          ) as ITemplate;
        })());

      if (!template.value) {
        router.replace({ name: 'ReportTemplateList' });
        return;
      }

      formEntries.value = [
        {
          label: 'ID',
          prop: 'id',
          component: {
            name: ElInput,
            attrs: { disabled: true },
          },
        },
        {
          label: '教室',
          prop: 'school_name',
          component: {
            name: ElInput,
            attrs: { disabled: true },
          },
        },
        {
          label: 'タイトル',
          prop: 'template_name',
          component: {
            name: ElInput,
            attrs: { disabled: true },
          },
        },
        {
          label: 'コピー',
          prop: 'schools',
          component: {
            name: ElTransfer,
            attrs: {
              filterable: true,
              data: template.value?.schools,
              titles: [`アイテム`, `アイテム`],
              props: {
                key: 'id',
                label: 'name',
              },
            },
          },
          initialValue: [],
        },
      ];

      formData.value = formEntries.value.reduce(
        (acc, { prop, initialValue }) =>
          Object.assign(acc, {
            [prop]: initialValue ?? template.value?.[prop],
          }),
        {}
      );
    } catch (e) {
      ElMessage.error((e as Error)?.message);
    }
  }

  async function submit() {
    try {
      submitting.value = true;

      await batchCopyReportTemplateToSchool({
        id: Number(props.id),
        type: 'copy',
        schools: Object.values(formData.value.schools),
      });

      ElMessage.success('更新しました！');
      router.push({ name: 'ReportTemplateList' });
    } catch (_err) {
      ElMessage.error('更新に失敗しました！');
    } finally {
      submitting.value = false;
    }
  }

  function reset() {
    initialize();
  }

  initialize();
</script>
