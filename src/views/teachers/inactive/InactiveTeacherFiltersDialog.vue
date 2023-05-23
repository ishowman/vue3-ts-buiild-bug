<template>
  <c-dialog v-bind="$attrs" @open="initFiltersForm">
    <div v-show="loading" v-loading="loading"></div>

    <el-form v-show="!loading" label-position="top" :model="filtersForm">
      <template v-for="{ label, prop, components } in formConfigs" :key="prop">
        <el-form-item
          :label="`${label || InactiveTeacherFieldsMap[prop]}：`"
          :prop="prop"
        >
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
  import { computed, ref } from 'vue';

  import CDialog from '@/components/CDialog.vue';

  import { InactiveTeacherFieldsMap } from '@/constants';
  import type { IComponent } from '@/components/CComponent.vue';
  import CInputNumber from '@/components/CInputNumber.vue';
  import { useRouter, useRoute } from 'vue-router';
  import { getUrlParam } from '@/utils';

  const initalSelects = {
    school_id: null,
    school_name: '',
    name: '',
  };

  const loading = ref(false);
  const hasOpened = ref(false);
  const router = useRouter();
  const route = useRoute();
  const emit = defineEmits(['filter-submit']);

  const filtersForm = ref<Record<string, any>>({
    ...initalSelects,
  });

  interface IFormConfigs {
    label?: string;
    prop: string;
    components?: IComponent[];
  }

  const formConfigs = ref<IFormConfigs[]>([]);
  const validFilter = computed(() => {
    const filter = {};
    for (const [key, val] of Object.entries(filtersForm.value)) {
      if (![null, undefined, ''].includes(val)) {
        filter[key] = val;
      }
    }

    return {
      ...filter,
    };
  });

  initFormConfig();
  emit('filter-submit', validFilter.value);

  function initFiltersForm() {
    if (hasOpened.value) {
      return;
    }
    filtersForm.value = {
      ...filtersForm.value,
      ...searchParams2Form(),
    };
    hasOpened.value = true;
  }

  function reset() {
    filtersForm.value = {
      ...initalSelects,
    };
  }

  function save() {
    const query = {
      ...validFilter.value,
      page: 1,
      pageSize: getUrlParam('pageSize') || undefined,
      type: getUrlParam('type') || undefined,
    };

    emit('filter-submit', validFilter.value);
    reloadWithQuery(query);
  }

  function searchParams2Form() {
    // 排除参数 page
    const searchParams = new URLSearchParams(location.search);
    const filter = {};
    // 显示键/值对

    searchParams.forEach((val, key) => {
      if (!['pageSize', 'page', 'type'].includes(key)) {
        filter[key] = /^[+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(val)
          ? +val
          : val; // 能转数字类型的转为数字类型
      }
    });
    console.log('searchParams:', filter);

    return filter;
  }

  function reloadWithQuery(query) {
    router.replace({
      path: route.path,
      query,
    });
  }

  function initFormConfig() {
    formConfigs.value = [
      {
        label: '教室名',
        prop: 'school_name',
        components: [
          {
            name: ElInput,
            attrs: {
              placeholder: '入力教室名',
              clearable: true,
            },
          },
        ],
      },

      {
        label: '教室ID',
        prop: 'school_id',
        components: [
          {
            name: CInputNumber,
            attrs: {
              placeholder: '入力教室ID',
              clearable: true,
            },
          },
        ],
      },
      {
        prop: 'name',
        components: [
          {
            name: ElInput,
            attrs: {
              placeholder: '入力名前',
              clearable: true,
            },
          },
        ],
      },
    ];
  }

  defineExpose({
    reset,
    save,
  });
</script>
