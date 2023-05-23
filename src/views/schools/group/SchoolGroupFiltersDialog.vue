<template>
  <c-dialog v-bind="$attrs" v-model="dialogVisible" @open="initFiltersForm">
    <el-form label-position="top" :model="filtersForm">
      <template v-for="{ label, prop, components } in formConfigs" :key="prop">
        <el-form-item :label="`${label}：`" :prop="prop">
          <template v-for="(component, i) in components">
            <c-component
              v-if="component.name"
              v-bind="component"
              :key="i"
              v-model="filtersForm[prop]"
            />
          </template>
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <el-button type="danger" plain @click="reset"> リセット </el-button>
      <el-button type="primary" @click="save"> 送信 </el-button>
    </template>
  </c-dialog>
</template>

<script lang="ts" setup>
  import { computed, ref, useAttrs } from 'vue';

  import CDialog from '@/components/CDialog.vue';

  import type { IComponent } from '@/components/CComponent.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { getUrlParam } from '@/utils';

  const dialogVisible = computed<typeof ElDialog.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const router = useRouter();
  const route = useRoute();

  const emit = defineEmits(['filter-submit', 'update:modelValue']);

  const filtersForm = ref<Record<string, any>>({});
  const formConfigs = ref<IFormConfigs[]>([
    {
      label: 'グループ名',
      prop: 'name',
      components: [
        {
          name: ElInput,
          attrs: {
            placeholder: '入力グループ名',
            clearable: true,
          },
        },
      ],
    },

    {
      label: 'グループコード',
      prop: 'code',
      components: [
        {
          name: ElInput,
          attrs: {
            placeholder: '入力グループコード',
            clearable: true,
          },
        },
      ],
    },
  ]);

  const validFilter = computed(() => {
    const filter = {};
    for (const [key, val] of Object.entries(filtersForm.value)) {
      if (![null, undefined, ''].includes(val)) {
        filter[key] = val;
      }
    }

    return filter;
  });

  interface IFormConfigs {
    label?: string;
    prop: string;
    components?: IComponent[];
  }

  emit('filter-submit', validFilter.value);

  async function initFiltersForm() {
    filtersForm.value = {
      ...filtersForm.value,
      ...searchParams2Form(),
    };
  }

  function searchParams2Form() {
    // 排除参数 page
    const searchParams = new URLSearchParams(location.search);
    const filter = {};
    // 显示键/值对

    searchParams.forEach((val, key) => {
      if (!['pageSize', 'page'].includes(key)) {
        filter[key] = /^[+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(val)
          ? +val
          : val; // 能转数字类型的转为数字类型
      }
    });

    return filter;
  }

  function reset() {
    filtersForm.value = {};
  }

  function save() {
    const query = {
      ...validFilter.value,
      page: 1,
      pageSize: getUrlParam('pageSize') || undefined,
    };
    emit('filter-submit', validFilter.value);
    reloadWithQuery(query);
  }

  function reloadWithQuery(query) {
    router.replace({
      path: route.path,
      query,
    });
  }
</script>
<style scoped></style>
