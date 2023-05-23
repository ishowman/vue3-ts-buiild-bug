<template>
  <div class="comiru-content py-6">
    <el-form :label-width="75" class="w-[814px] mx-auto">
      <el-form-item label="ID:">
        <el-input :value="data.id" disabled />
      </el-form-item>
      <el-form-item label="教室:">
        <el-input :value="data.school_name" disabled />
      </el-form-item>
      <el-form-item label="タイトル:">
        <el-input :value="data.title" disabled />
      </el-form-item>
      <el-form-item label="日付:">
        <el-input :value="data.date" disabled />
      </el-form-item>

      <el-form-item label="コピー:">
        <el-transfer
          ref="schoolTransfer"
          v-model="schoolIds"
          :data="data.schools"
          filterable
          :props="{
            key: 'id',
            label: 'name',
          }"
          placeholder="Search here"
          :titles="[`アイテム`, `アイテム`]"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :disabled="schoolIds.length === 0"
          @click="multipleCopy"
        >
          保存
        </el-button>

        <el-button type="danger" plain @click="clearForm">リセット</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';

  import { multipleCopyNewsTemplate } from '@/services';

  interface IProps {
    data?: string;
  }
  const props = withDefaults(defineProps<IProps>(), {
    data: `{}`,
  });
  const router = useRouter();

  const data = computed(() => {
    return props.data ? JSON.parse(props.data) : {};
  });

  const schoolIds = ref([]);
  const schoolTransfer = ref();

  async function multipleCopy() {
    try {
      await multipleCopyNewsTemplate({
        template_id: data.value.id,
        school_ids: schoolIds.value.join(','),
      });
      await ElMessage.success('更新しました！');
      router.push({ name: 'NewsTemplateList' });
    } catch (_err) {
      ElMessage.error('更新に失敗しました！');
    }
  }

  function clearForm() {
    schoolIds.value = [];
    schoolTransfer.value.clearQuery('left');
    schoolTransfer.value.clearQuery('right');
  }
</script>
<style scoped></style>
