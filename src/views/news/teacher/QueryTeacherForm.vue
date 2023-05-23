<template>
  <el-form
    v-loading="loading"
    label-width="var(--label-width)"
    :model="formState"
    :show-message="false"
    class="translate-x-10 w-[920px]"
  >
    <!-- 下个版本加上
        <el-form-item label="対象：" prop="school_ids_target">
          <el-radio-group v-model="formState.school_ids_target">
            すべての教室
            教室を選択
          </el-radio-group>
        </el-form-item> 
      -->

    <el-form-item label="教室：" prop="school_ids">
      <el-select-v2
        v-model="formState.school_ids"
        placeholder="選択"
        :options="schoolList"
        :remote-method="searchSchool"
        :loading="loadingSchool"
        multiple
        remote
        filterable
        clearable
        class="w-full"
        :on-focus="() => searchSchool()"
      />
    </el-form-item>

    <el-form-item
      v-if="roleEnable"
      label="Admin権限："
      prop="admin_permissions_ids"
    >
      <el-select-v2
        v-model="formState.admin_permissions_ids"
        placeholder="選択"
        :options="teacherRoles"
        :remote-method="searchTeacherRole"
        :loading="loadingTeacherRole"
        multiple
        remote
        filterable
        clearable
        class="w-full"
        :on-focus="() => searchTeacherRole()"
      />
    </el-form-item>

    <el-form-item label="Comiru権限：" prop="comiru_permissions">
      <el-checkbox-group v-model="formState.comiru_permissions">
        <el-checkbox label="owner">オーナー</el-checkbox>
        <el-checkbox label="true">管理者</el-checkbox>
        <el-checkbox label="false">一般講師</el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <el-form-item
      v-if="areaEnable"
      label="担当ブロック·エリア："
      prop="area_id"
    >
      <el-select-v2
        v-model="formState.area_id"
        placeholder="選択"
        :options="areaIds"
        :remote-method="searchArea"
        :loading="loadingArea"
        remote
        filterable
        clearable
        class="w-full"
        :on-focus="() => searchArea()"
      />
    </el-form-item>

    <el-form-item label="教室グループ：" prop="group_ids">
      <el-select-v2
        v-model="formState.group_ids"
        placeholder="選択"
        :options="teacherGroups"
        :remote-method="searchGroup"
        :loading="loadingGroup"
        remote
        filterable
        clearable
        multiple
        class="w-full"
        :on-focus="() => searchGroup()"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import {
    getTeacherNewsSchoolAreaList,
    getTeacherRoleList,
    getSchoolGroups,
    getSchoolList,
  } from '@/services';
  import { MaxPageSize } from '@/constants';

  interface IProps {
    modelValue: Record<string, any>;
  }
  const props = withDefaults(defineProps<IProps>(), {
    modelValue: () => ({}),
  });
  const emit = defineEmits(['update:modelValue']);

  const formState = computed<IProps['modelValue']>({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  const roleEnable = ref(false);
  const teacherRoles = ref([]);

  const schoolList = ref([]);
  const loadingSchool = ref(false);
  const loading = ref(false);

  const areaIds = ref([]);
  const loadingTeacherRole = ref(false);
  const loadingArea = ref(false);
  const areaEnable = ref(false);

  const loadingGroup = ref(false);
  const teacherGroups = ref([]);

  init();

  async function init() {
    try {
      loading.value = true;
      await Promise.allSettled([searchTeacherRole(), searchArea()]);
      // watch(step3, checkStep3, { deep: true });
    } finally {
      loading.value = false;
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
        is_using_teachers_news: 1,
        order_by: { id: 'asc' },
      });
      schoolList.value = items.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    } finally {
      loadingSchool.value = false;
    }
  }

  async function searchTeacherRole(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingTeacherRole.value = true;
      const { items, enable } = await getTeacherRoleList({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });
      roleEnable.value = enable;
      teacherRoles.value = items;
    } finally {
      loadingTeacherRole.value = false;
    }
  }

  async function searchArea(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingArea.value = true;
      const { areas, enable } = await getTeacherNewsSchoolAreaList({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });
      areaIds.value = areas.map((area) => {
        area.value = area.id;
        area.label = area.name;

        if (area?.areas?.length) {
          area.options = area.areas.map(({ id, name }) => {
            return {
              value: id,
              label: name,
            };
          });
        }
        return area;
      });
      areaEnable.value = enable;
    } finally {
      loadingArea.value = false;
    }
  }

  async function searchGroup(keyword?: string) {
    keyword = keyword?.trim();
    try {
      loadingGroup.value = true;
      const { items } = await getSchoolGroups({
        ...(keyword ? { keyword } : {}),
        pagesize: MaxPageSize,
      });
      teacherGroups.value = items;
    } finally {
      loadingGroup.value = false;
    }
  }
</script>
<style scoped></style>
