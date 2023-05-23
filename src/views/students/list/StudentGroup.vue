<template>
  <div class="comiru-content px-40 py-6" style="--label-width: 150px">
    <c-steps
      :active="activeStep"
      :steps="steps"
      :process-status="
        activeStep === steps.length - 1
          ? result.isSuccess
            ? 'success'
            : 'error'
          : 'wait'
      "
      class="group-steps mb-9"
    />

    <div v-loading="loading">
      <el-form
        v-show="activeStep === 0"
        ref="formRef"
        class="w-[820px] mx-auto"
        label-width="var(--label-width)"
        :model="groupForm"
        :show-message="false"
      >
        <el-form-item label="教室：" required prop="schools">
          <el-select-v2
            v-model="groupForm.schools"
            placeholder="入力 教室"
            multiple
            filterable
            remote
            :options="schoolList"
            :remote-method="searchSchools"
            class="w-full"
          ></el-select-v2>
        </el-form-item>
        <el-form-item label="グループ名：" required prop="name">
          <el-input
            v-model="groupForm.name"
            placeholder="入力 グループ名"
          ></el-input>
        </el-form-item>
        <el-form-item label="グループコード：" required prop="code">
          <c-input-number
            v-model="groupForm.code"
            maxlength="32"
            placeholder="入力 グループコード"
          />
          <p class="text-secondary text-[12px]">
            グループコードは半角数字(32けた以下）
          </p>
        </el-form-item>
      </el-form>
      <div v-if="activeStep === 1" class="w-[530px] mx-auto">
        <p v-if="conflict.some" class="p-3 text-danger">
          赤い部分とは「教室に対するグループは存在していますので追加できません」
        </p>
        <el-table
          :data="tableData"
          class="mb-6 step2-table"
          :row-class-name="tableRowClassName"
        >
          <template v-for="column in tableColumns" :key="column.prop">
            <el-table-column :label="column.label" :prop="column.prop">
              <template #default="scope">
                {{ scope.row[column.prop] }}
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>

      <el-result
        v-show="activeStep === 2"
        :icon="result.isSuccess ? 'success' : 'error'"
        :title="result.title"
      >
        <template #sub-title>
          <span class="text-secondary">{{ result.desc }}</span>
        </template>
        <template #icon>
          <c-icon-font
            v-if="result.isSuccess"
            name="icon-right2"
            class="mb-2"
            color="var(--el-color-success)"
            size="68px"
          />
          <c-icon-font v-else name="icon-erro" class="mb-2" size="68px" />
        </template>

        <template #extra>
          <el-button type="primary" @click="reCreate">再度作成</el-button>
          <el-button
            type="primary"
            plain
            @click="router.push({ name: 'StudentList' })"
            >リストに戻る</el-button
          >
        </template>
      </el-result>

      <el-form :label-width="activeStep === 0 ? '180px' : '175px'">
        <el-form-item>
          <template v-if="activeStep < steps.length - 1">
            <el-button
              v-if="activeStep !== 0"
              plain
              type="primary"
              @click="activeStep -= 1"
              >前のステップ</el-button
            >
            <el-button
              type="primary"
              :disabled="unableToNext"
              @click="toNextStep"
              >次のステップ</el-button
            >
            <el-button
              v-if="activeStep === 0"
              type="danger"
              plain
              @click="clearStep1"
              >リセット</el-button
            >
          </template>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    getSchoolList,
    checkStudentGroups,
    saveStudentGroups,
  } from '@/services';

  const router = useRouter();

  const activeStep = ref(0);

  const steps = [
    {
      label: 'グループ作成',
    },
    {
      label: 'プレビュー',
    },
    {
      label: '送信',
    },
  ];
  const initalGroup = {
    schools: [],
    name: '',
    code: null,
  };
  const groupForm = ref({ ...initalGroup });

  const schoolList = ref([]);
  const loadingSchools = ref(false);

  searchSchools();

  const tableData = ref<any>([]);

  const conflict = computed(() => {
    return {
      all: tableData.value.every((item) => item.conflicting),
      some: tableData.value.some((item) => item.conflicting),
    };
  });

  const unableToNext = computed(() => {
    return (
      (activeStep.value === 0 && !isValidForm.value) ||
      (activeStep.value === 1 && conflict.value.all)
    );
  });

  const tableColumns = [
    {
      label: '教室',
      prop: 'school_name',
    },
    {
      label: 'グループ名',
      prop: 'name',
    },
    {
      label: 'グループコード',
      prop: 'code',
    },
  ];
  const formRef = ref<InstanceType<typeof ElForm>>();
  const isValidForm = ref(false);
  onMounted(() => {
    watch(
      [groupForm, activeStep],
      ([_newForm, newStep], [_oldForm, oldStep]) => {
        if (oldStep === steps.length - 1 && newStep === 0) {
          isValidForm.value = false;
          return;
        }
        checkFormValid();
      },
      { deep: true }
    );
  });

  function checkFormValid() {
    formRef.value?.validate((isValid) => {
      isValidForm.value = isValid;
    });
  }

  async function searchSchools(keyword?: string) {
    keyword = keyword?.trim();

    try {
      loadingSchools.value = true;
      const { items } = await getSchoolList({
        ...(keyword ? { keyword } : {}),
      });
      if (items?.length) {
        schoolList.value = items.map(({ id, name, slug }) => ({
          label: name,
          value: id,
          slug,
        }));
      }
    } finally {
      loadingSchools.value = false;
    }
  }
  async function toNextStep() {
    switch (activeStep.value) {
      case 0:
        await checkGroups();
        activeStep.value += 1;

        break;
      case 1:
        await saveGroups();
        activeStep.value += 1;
        break;
      default:
        activeStep.value += 1;
    }
  }
  const loading = ref(false);
  async function checkGroups() {
    try {
      loading.value = true;
      const { name, code } = groupForm.value;

      const { data } = await checkStudentGroups({
        name,
        code,
        school_ids: groupForm.value.schools.join(),
      });
      tableData.value = data;
    } finally {
      loading.value = false;
    }
  }
  const result = ref<{
    title: string;
    desc: string;
    isSuccess?: 0 | 1;
  }>({
    title: 'グループの作成に失敗しました',
    desc: '',
  });

  async function saveGroups() {
    try {
      loading.value = true;
      const validSchools = tableData.value
        .filter((item) => !item.conflicting)
        .map(({ school_id }) => school_id);
      const { name, code } = groupForm.value;
      const { success_count } = await saveStudentGroups({
        name,
        code,
        school_ids: validSchools.join(),
      });
      result.value = {
        isSuccess: 1,
        title: 'グループの作成に成功しました',
        desc: `${success_count}件のグループの作成に成功しました`,
      };
    } catch (err) {
      console.error('err', err);
      result.value = {
        isSuccess: 0,
        title: 'グループの作成に失敗しました',
        desc: err as string,
      };
    } finally {
      loading.value = false;
    }
  }

  function tableRowClassName({ row }) {
    if (row.conflicting) {
      return 'invalid-row';
    }
  }

  function reCreate() {
    activeStep.value = 0;
    formRef.value?.resetFields();
  }

  function clearStep1() {
    groupForm.value = {
      ...initalGroup,
    };
  }
</script>
<style scoped lang="postcss">
  .group-steps {
    --el-text-color-primary: var(--el-color-primary);
    --el-color-success: var(--el-color-primary);
  }
  .group-steps-icon {
    line-height: 24px;
    position: absolute;
    left: -2px;
    right: -2px;
    top: -2px;
    bottom: -2px;
    border-radius: 50%;
  }
  .active {
    background-color: var(--el-color-primary);
    color: var(--el-color-white);
  }
  .step2-table:deep(.invalid-row) {
    --el-table-tr-bg-color: var(--el-color-danger-light-2);
  }
</style>
