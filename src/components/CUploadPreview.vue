<template>
  <template v-if="isListMode">
    <template v-if="isImage(file?.file_mime)">
      <img :src="file?.file_url" :alt="file?.file_name" width="48" />
    </template>
    <template v-else>
      <c-icon-font name="icon-csv" height="24px" width="100%" />
    </template>
    <a :href="file?.file_url" target="_blank" rel="noopener noreferrer">
      {{ file?.file_name }}
    </a>
  </template>
  <div
    v-else
    class="flex p-2 w-[106px] h-[106px] justify-center items-center border border-gray-300 border-solid rounded-sm file-card-view"
  >
    <template v-if="isImage(file.file_mime)">
      <el-image
        :src="file?.file_url"
        :alt="file?.file_name"
        class="w-12 h-12 flex items-center justify-center"
        :preview-src-list="[file?.file_url]"
        preview-teleported
      >
        <template #error>
          <c-icon-font name="icon-pic" size="24px" />
        </template>
      </el-image>
    </template>

    <template v-else>
      <c-icon-font name="icon-csv" height="24px" width="100%" />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { isImage } from '@/utils';
  interface IFile {
    id: number;
    file_mime: string;
    file_name: string;
    file_url: string;
  }

  interface IProps {
    file: IFile;
    mode: 'list' | 'card';
  }
  const props = withDefaults(defineProps<IProps>(), {
    mode: 'list',
  });
  const file = computed(() => props.file);
  const isListMode = computed(() => props.mode === 'list');
</script>
<style scoped lang="postcss">
  .file-card-view:deep(.el-image__wrapper) {
    @apply flex;
    @apply items-center;
    @apply justify-center;
  }
</style>
