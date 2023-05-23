<template>
  <el-input
    v-model="content"
    :rows="2"
    type="textarea"
    placeholder="入力"
    class="w-[616px]"
  />
  <p class="text-secondary mt-1 mb-4">
    ※画像は1枚ずつ選択してください。(最大3枚かつ8MB以内まで)
  </p>
  <div class="flex justify-between pic-upload">
    <c-uploader
      ref="uploadRef"
      v-model:file-list="pics"
      accept=".jpg,.png,.webp,.gif"
      :limit="3"
    />
    <el-button
      type="primary"
      :disabled="pics.length === 0 && !content"
      :loading="loading"
      @click="submit"
    >
      投稿
    </el-button>
  </div>
</template>

<script lang="ts" setup>
  import type { UploadUserFile } from 'element-plus';

  import { addNewsComment } from '@/services';
  import { ref, useAttrs } from 'vue';
  import CUploader from '@/components/CUploader.vue';
  const content = ref();
  const uploadRef = ref();
  const pics = ref<UploadUserFile[]>([]);
  const attrs = useAttrs();
  const loading = ref(false);
  const submit = async function () {
    try {
      loading.value = true;
      const { files, totalSize } = uploadRef.value.getFileInfo();
      pics.value = files;
      if (totalSize > 8 * 1024 * 1024) {
        ElMessage.warning('画像容量の上限を超えています');
        return;
      }
      const params = new FormData();
      files.forEach((pic) => {
        if (pic.raw) {
          params.append(`files[]`, pic.raw);
        }
      });
      if (content.value) {
        params.append('content', content.value);
      }

      const data = attrs.data as Record<string, string | Blob>;

      if (data) {
        Object.entries(data).map(([key, value]) => {
          params.append(key, value as string | Blob);
        });
      }
      await addNewsComment(params);
      location.reload();
    } finally {
      loading.value = false;
    }
  };
</script>
