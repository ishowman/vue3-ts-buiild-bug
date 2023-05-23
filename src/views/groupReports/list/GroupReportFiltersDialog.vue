<template>
  <div class="group-report-filters-dialog">
    <c-dialog v-bind="$attrs" v-model="dialogVisible" @open="initFiltersForm">
      <div v-loading="loading"></div>
      <el-form
        v-show="!loading"
        ref="formRef"
        :model="form"
        label-position="top"
      >
        <el-form-item label="教室" prop="school_id">
          <el-select-v2
            v-model="form.school_id"
            filterable
            remote
            :remote-method="searchSchools"
            clearable
            :options="schoolOptions"
            :loading="schoolLoading"
            class="w-full"
            placeholder="選択"
          />
        </el-form-item>
        <el-form-item label="集団" prop="group_id">
          <el-select-v2
            v-model="form.group_id"
            filterable
            remote
            :remote-method="searchGroups"
            clearable
            :options="groupOptions"
            :loading="groupLoading"
            class="w-full"
            placeholder="選択"
          />
        </el-form-item>
        <el-form-item label="書いた講師" prop="teacher_id">
          <el-select-v2
            v-model="form.teacher_id"
            filterable
            remote
            multiple
            :remote-method="searchTeachers"
            clearable
            :options="teacherOptions"
            :loading="teacherLoading"
            class="w-full"
            placeholder="選択"
          />
        </el-form-item>
        <el-form-item label="日付（開始日）" prop="start_date">
          <el-date-picker
            v-model="form.start_date"
            placeholder="日付（開始日）"
            value-format="YYYY-MM-DD"
            :disabled-date="(time: Date) => disabledDate(time, 'start_date')"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="日付（終了日）" prop="end_date">
          <el-date-picker
            v-model="form.end_date"
            placeholder="日付（終了日）"
            value-format="YYYY-MM-DD"
            :disabled-date="(time: Date) => disabledDate(time, 'end_date')"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="公開・下書き" prop="status">
          <el-select
            v-model="form.status"
            clearable
            placeholder="選択"
            class="w-full"
          >
            <el-option label="公開" value="published"></el-option>
            <el-option label="下書き" value="draft"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="作成日（開始日）" prop="created_start_date">
          <el-date-picker
            v-model="form.created_start_date"
            placeholder="作成日（開始日）"
            value-format="YYYY-MM-DD"
            :disabled-date="(time: Date) => disabledDate(time, 'created_start_date')"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="作成日（終了日）" prop="created_end_date">
          <el-date-picker
            v-model="form.created_end_date"
            placeholder="作成日（終了日）"
            value-format="YYYY-MM-DD"
            :disabled-date="(time: Date) => disabledDate(time, 'created_end_date')"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="danger" plain @click="reset(formRef)">
          リセット
        </el-button>
        <el-button type="primary" @click="save"> 送信 </el-button>
      </template>
    </c-dialog>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, useAttrs, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormInstance } from 'element-plus';
  import dayjs from 'dayjs';

  import { MaxPageSize } from '@/constants';
  import { getUrlParam } from '@/utils';
  import {
    getGroupReportsTeacherList,
    getSchoolList,
    getGroupReportsGroupList,
  } from '@/services';

  import CDialog from '@/components/CDialog.vue';
  import type { OptionType } from 'element-plus/es/components/select-v2/src/select.types';

  interface IFormData {
    school_id: number | string;
    group_id: number | string;
    teacher_id: number[];
    status: string;
    start_date: string;
    end_date: string;
    created_start_date: string;
    created_end_date: string;
  }

  interface SchoolOption {
    id: number;
    name: string;
    slug: string;
  }

  interface TeacherOption {
    label: string;
    value: number;
  }

  interface GroupOption {
    label: string;
    value: number;
  }

  const router = useRouter();
  const route = useRoute();
  const emit = defineEmits(['filter-submit', 'update:modelValue']);

  /* data */
  const schoolOptions = ref<OptionType<SchoolOption>[]>([]);
  const teacherOptions = ref<TeacherOption[]>([]);
  const groupOptions = ref<GroupOption[]>([]);
  const schoolLoading = ref<boolean>(false);
  const teacherLoading = ref<boolean>(false);
  const groupLoading = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const form = reactive<IFormData>({
    school_id: '',
    group_id: '',
    teacher_id: [],
    status: '',
    start_date: '',
    end_date: '',
    created_start_date: '',
    created_end_date: '',
  });
  const isFetchedData = ref<boolean>(false);

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
      teacher_id: form.teacher_id.length
        ? form.teacher_id.join(',')
        : undefined,
    };
  });

  /* methods */
  const disabledDate = (time: Date, type: string) => {
    switch (type) {
      case 'start_date':
        return !!form.end_date && dayjs(time).isAfter(form.end_date);
      case 'end_date':
        return !!form.start_date && dayjs(time).isBefore(form.start_date);
      case 'created_start_date':
        return (
          !!form.created_end_date && dayjs(time).isAfter(form.created_end_date)
        );
      case 'created_end_date':
        return (
          !!form.created_start_date &&
          dayjs(time).isBefore(form.created_start_date)
        );
      default:
        return true;
    }
  };

  const searchSchools = async (keyword?: string) => {
    keyword = keyword?.trim();
    try {
      schoolLoading.value = true;
      const { items } = await getSchoolList({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
        only_search_name: 1,
      });
      schoolOptions.value = items.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    } finally {
      schoolLoading.value = false;
    }
  };

  const searchTeachers = async (keyword?: string) => {
    keyword = keyword?.trim();
    try {
      teacherLoading.value = true;
      const { lists } = await getGroupReportsTeacherList({
        ...(keyword ? { keyword } : {}),
      });
      teacherOptions.value = lists;
    } finally {
      teacherLoading.value = false;
    }
  };

  const searchGroups = async (keyword?: string) => {
    keyword = keyword?.trim();
    try {
      groupLoading.value = true;
      const { lists } = await getGroupReportsGroupList({
        ...(keyword ? { keyword } : {}),
      });
      groupOptions.value = lists;
    } finally {
      groupLoading.value = false;
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
    if (!isFetchedData.value) {
      try {
        loading.value = true;
        await Promise.all([searchSchools(), searchTeachers(), searchGroups()]);
        isFetchedData.value = true;
      } finally {
        loading.value = false;
      }
    }

    nextTick(() => {
      Object.assign(form, searchParams2Form());
    });
  };

  const searchParams2Form = () => {
    // 排除参数 page
    const searchParams = new URLSearchParams(location.search);
    const filter = {};
    // 显示键/值对
    const arrayKeys = ['teacher_id'];

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

<style scoped lang="postcss">
  .group-report-filters-dialog :deep(.el-dialog__body) {
    max-height: 700px;
  }
</style>
