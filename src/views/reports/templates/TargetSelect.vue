<template>
  <el-select-v2
    :key="templateId"
    v-model="target"
    clearable
    filterable
    placeholder="選択"
    :options="options"
    :loading="copying"
    class="w-48 mr-2"
    popper-class="target-select"
    @change="change"
  />

  <el-button
    :key="templateId"
    type="primary"
    :disabled="schools.length === 0 || target === null || copying"
    @click.prevent="target && copyToSchool(templateId, target)"
  >
    コピー
  </el-button>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { copyReportTemplateToSchool } from '@/services';

  interface TargetSelectProps {
    templateId: number;
    schools: {
      id: number;
      name: string;
    }[];
    refetch: () => Promise<void>;
  }

  const props = defineProps<TargetSelectProps>();

  const templateId = computed(() => props.templateId);
  const options = computed(() =>
    props.schools.map(({ id, name }) => ({ value: id, label: name }))
  );

  const target = ref<number | null>(null);
  const copying = ref<boolean>(false);

  function change(schoolId: number) {
    target.value = schoolId;
  }

  async function copyToSchool(template_id: number, school_id: number) {
    try {
      copying.value = true;

      await copyReportTemplateToSchool({ template_id, school_id });
      ElMessage.success('更新しました！');
      await props.refetch();

      target.value = null;
      copying.value = false;
    } catch (e) {
      ElMessage.error('更新に失敗しました！');
    }
  }
</script>

<style>
  /* Cannot use `scoped` here since `poper-class` cannot
   be identified as a regular class.
 */
  .target-select .el-select-dropdown__list {
    width: initial !important;
    min-width: 20rem !important;
  }
</style>
