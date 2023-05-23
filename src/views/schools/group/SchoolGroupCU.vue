<template>
  <el-form
    v-loading="loading"
    class="pl-32 pr-52 comiru-content py-6"
    label-width="200px"
    label-position="right"
    :rules="rules"
    :model="formState"
  >
    <el-form-item
      label="グループ名："
      required
      :error="errorMsg.name"
      prop="name"
    >
      <el-input v-model="formState.name"></el-input>
    </el-form-item>
    <el-form-item
      label="グループコード："
      required
      :error="errorMsg.code"
      prop="code"
    >
      <el-input v-model="formState.code"></el-input>
    </el-form-item>
    <el-form-item label="教室を選択：">
      <el-select-v2
        v-model="formState.schoolList"
        :options="schoolList"
        :remote-method="searchSchool"
        class="w-full"
        :on-focus="() => searchSchool()"
        multiple
        remote
        filterable
        clearable
        :loading="loadingSchool"
        placeholder="選択"
      />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :disabled="!formState.name || !formState.code"
        @click="submitInfo"
        >保存</el-button
      >
      <el-button type="danger" plain @click="reset"> リセット </el-button>
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import type { FormRules } from 'element-plus';

  import {
    getSchoolList,
    createSchoolGroupsInfo,
    updateSchoolGroupsInfo,
    getSchoolGroupsInfoDetail,
  } from '@/services';
  import { MaxPageSize } from '@/constants';

  interface IProps {
    id?: string;
  }
  const props = withDefaults(defineProps<IProps>(), {
    id: '',
  });
  const router = useRouter();

  const rules = reactive<FormRules>({
    name: {
      required: true,
      message: 'グループ名は、必ず指定してください',
    },
    code: {
      required: true,
      message: 'グループコードは、必ず指定してください',
    },
  });
  const errorMsg = ref<{
    name?: string;
    code?: string;
  }>({
    name: '',
    code: '',
  });

  const schoolList = ref([]);
  const loadingSchool = ref(false);
  const loading = ref(false);
  let defaultFormState = {
    code: '',
    name: '',
    schoolList: [],
  };
  const formState = ref({ ...defaultFormState });

  init();

  async function init() {
    const id = props.id;

    if (id) {
      try {
        loading.value = true;
        searchSchool();

        const { code, name, school_lists } = await getSchoolGroupsInfoDetail({
          id,
        });

        formState.value = {
          code,
          name,
          schoolList: school_lists,
        };
        defaultFormState = {
          code,
          name,
          schoolList: school_lists,
        };
      } finally {
        loading.value = false;
      }
    }
  }

  async function searchSchool(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingSchool.value = true;
      const { items } = await getSchoolList({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
        only_search_name: 1,
      });

      schoolList.value = items.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    } finally {
      loadingSchool.value = false;
    }
  }

  async function submitInfo() {
    const { schoolList, name, code } = formState.value;
    const params = {
      school_ids: schoolList.join(','),
      name,
      code,
    };
    try {
      loading.value = true;
      props.id
        ? await updateSchoolGroupsInfo({
            id: props.id,
            ...params,
          })
        : await createSchoolGroupsInfo(params);

      router.push({ name: 'SchoolGroupList' });

      ElMessage.success(props.id ? '更新しました！' : '保存しました！');
    } catch (err) {
      ElMessage.closeAll();
      ElMessage.error(
        props.id ? '更新に失敗しました！' : '保存に失敗しました！'
      );

      const error = err as {
        errors: {
          [key: string]: string[];
        };
      };
      if (error.errors) {
        errorMsg.value = {};
        // 将接口的报错信息在对应表单字段显示
        Object.entries(error.errors).map(([key, value]) => {
          if (value[0]) {
            errorMsg.value[key] = value[0];
          }
        });
      }
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    formState.value = {
      ...defaultFormState,
    };
    return;
  }
</script>
