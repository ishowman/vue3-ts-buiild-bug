<template>
  <c-dialog v-bind="$attrs" title="フィルタ">
    <el-form label-position="top" :model="formData">
      <template v-for="{ label, prop, component } in formEntries" :key="prop">
        <el-form-item :label="`${label}：`" :prop="prop">
          <c-component v-bind="component" v-model="formData[prop]" />
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <el-button type="danger" plain @click="reset">リセット</el-button>
      <el-button type="primary" @click="submit">送信</el-button>
    </template>
  </c-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import type { IComponent } from '@/components/CComponent.vue';
  import CDialog from '@/components/CDialog.vue';

  import { getSchoolList } from '@/services';
  import { MaxPageSize } from '@/constants';
  import { getUrlParam } from '@/utils';

  interface FilterDialogProps {
    submit: (query: Record<string, any>) => void | Promise<void>;
  }

  interface IFormEntry {
    label?: string;
    prop: string;
    component?: IComponent;
  }

  const route = useRoute();
  const router = useRouter();

  const props = defineProps<FilterDialogProps>();

  const formEntries = ref<IFormEntry[]>([]);
  const formData = ref<Record<string, any>>({});

  const loadingSchools = ref<boolean>(false);
  const schoolOptions = ref<{ value: number; label: string }[]>([]);

  function initialize() {
    formEntries.value = [
      {
        label: '教室',
        prop: 'school_id',
        component: {
          name: ElSelectV2,
          attrs: {
            class: 'w-full',
            placeholder: '選択',
            remote: true,
            filterable: true,
            clearable: true,
            options: schoolOptions,
            loading: loadingSchools,
            remoteMethod: fetchSchoolList,
            onFocus: () => fetchSchoolList(),
          },
        },
      },
      {
        label: '表示順',
        prop: 'sort',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '入力表示順',
          },
        },
      },
      {
        label: 'タイトル',
        prop: 'title',
        component: {
          name: ElInput,
          attrs: {
            placeholder: '入力タイトル',
          },
        },
      },
    ];
  }

  async function fetchSchoolList(keyword?: string) {
    try {
      loadingSchools.value = true;

      const { items } = await getSchoolList({
        ...(keyword ? { keyword } : undefined),
        pagesize: MaxPageSize,
        only_search_name: 1,
      });

      schoolOptions.value = items.map(({ id, name }) => ({
        value: id,
        label: name,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      loadingSchools.value = false;
    }
  }

  function reset() {
    formData.value = {};
  }

  async function submit() {
    const validatedFormData = Object.entries(formData.value).reduce(
      (acc, [key, val]) => (val ? Object.assign(acc, { [key]: val }) : acc),
      {}
    );

    const query = {
      ...validatedFormData,
      page: 1,
      pageSize: getUrlParam('pageSize') || undefined,
    };

    await props.submit(validatedFormData);
    router.replace({ path: route.path, query });
  }

  initialize();
</script>
