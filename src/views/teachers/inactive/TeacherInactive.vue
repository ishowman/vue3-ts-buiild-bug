<template>
  <div class="comiru-content overflow-auto">
    <el-tabs
      v-model="type"
      class="inactive-teacher"
      @click="reloadWithQuery({ type })"
    >
      <el-tab-pane label="本部管理一覧" :name="ADMIN" />
      <el-tab-pane label="その他一覧" :name="OTHER" />
    </el-tabs>
    <admin-teacher v-if="isAdmin" :key="ADMIN" :type="type"></admin-teacher>
    <admin-teacher v-else :key="OTHER" :type="type"></admin-teacher>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import AdminTeacher from './AdminTeacher.vue';
  const route = useRoute();
  const router = useRouter();

  const query = computed(() => route.query || {});

  const ADMIN = 'admin';
  const OTHER = 'other';

  const type = ref((query.value?.type as string) || ADMIN);
  const isAdmin = computed(() => type.value === ADMIN);

  function reloadWithQuery(query) {
    router.replace({
      path: route.path,
      query,
    });
  }
</script>
<style scoped lang="postcss">
  .inactive-teacher {
    padding: 0 16px;
    background: #fff;
    &:deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    &:deep(.el-tabs__item) {
      height: 46px;
      line-height: 46px;
    }
  }
</style>
