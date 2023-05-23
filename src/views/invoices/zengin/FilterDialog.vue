<template>
  <c-dialog v-bind="$attrs" v-model="dialogVisible" @open="initFiltersForm">
    <div v-loading="loading"></div>
    <el-form v-show="!loading" ref="formRef" :model="form" label-position="top">
      <el-form-item label="口座種別:" prop="type">
        <el-select
          v-model="form.type"
          class="w-full"
          placeholder="選択"
          clearable
        >
          <el-option
            v-for="item in zenginTypes"
            :key="item.key"
            :value="item.key"
            :label="item.item"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="danger" plain @click="reset(formRef)">
        リセット
      </el-button>
      <el-button type="primary" @click="save"> 送信 </el-button>
    </template>
  </c-dialog>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, useAttrs, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormInstance } from 'element-plus';
  import { getUrlParam } from '@/utils';
  import { getInvoiceCorporationZenginTypes } from '@/services';

  import CDialog from '@/components/CDialog.vue';

  interface IFormData {
    type: string | number;
  }

  interface IZenginType {
    key: number;
    item: string;
  }

  const router = useRouter();
  const route = useRoute();
  const emit = defineEmits(['filter-submit', 'update:modelValue']);

  /* data */
  const loading = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const form = reactive<IFormData>({
    type: '',
  });
  const zenginTypes = ref<IZenginType[]>([]);

  /* computed */
  const dialogVisible = computed<typeof ElDialog.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const validFilter = computed(() => {
    const filter = {};
    for (const [key, val] of Object.entries(form)) {
      if (![null, undefined, ''].includes(val as any)) {
        filter[key] = val;
      }
    }
    return {
      ...filter,
    };
  });

  /* methods */
  const getCorporationZenginTypes = async () => {
    try {
      const res = await getInvoiceCorporationZenginTypes();
      zenginTypes.value = res;
    } catch (error) {
      console.log(error);
    }
  };

  const reset = (formEl: FormInstance | undefined) => {
    if (!formEl) {
      return;
    }
    formEl.resetFields();
  };

  const save = () => {
    emit('filter-submit', validFilter.value);
    reloadWithQuery();
  };

  const initFiltersForm = async () => {
    loading.value = true;
    await getCorporationZenginTypes();
    loading.value = false;
    nextTick(() => {
      Object.assign(form, searchParams2Form());
    });
  };

  const searchParams2Form = () => {
    // 排除参数 page
    const searchParams = new URLSearchParams(location.search);
    const filter = {};
    // 显示键/值对
    const arrayKeys: string[] = [];

    searchParams.forEach((val, key) => {
      if (arrayKeys.includes(key)) {
        filter[key] = val.split(',').map((item) => {
          return /^[+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(item)
            ? Number(item)
            : item;
        });
      } else {
        if (!['pageSize', 'page'].includes(key)) {
          filter[key] = /^[+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(val)
            ? Number(val)
            : val; // 能转数字类型的转为数字类型
        }
      }
    });

    return filter;
  };

  function reloadWithQuery() {
    const query: any = {
      page: 1,
      pageSize: getUrlParam('pageSize') || undefined,
      ...validFilter.value,
    };
    router.replace({
      path: route.path,
      query,
    });
  }
</script>
