<template>
  <el-upload
    ref="uploadRef"
    v-model:file-list="pics"
    list-type="picture"
    :auto-upload="false"
    :limit="maxPics"
    :disabled="pics.length >= maxPics"
    class="pic-upload"
    v-bind="$attrs"
  >
    <template #default>
      <slot />
    </template>
    <template #trigger>
      <slot
        name="trigger"
        v-bind="{
          disabled: pics.length >= maxPics,
        }"
      >
        <el-button
          :plain="$attrs.disabled ? !$attrs.disabled : pics.length < maxPics"
          type="primary"
          :disabled="$attrs.disabled ? $attrs.disabled as boolean: pics.length >= maxPics"
        >
          <slot name="buttonText">画像を選択</slot>
        </el-button>
      </slot>
    </template>

    <template #file="{ file }">
      <div :key="file.uid" class="flex items-center">
        <template v-if="isImage(file.raw.type)">
          <el-image
            :src="file.url"
            :alt="file.name"
            class="w-full h-full"
            :preview-src-list="[file.url]"
            preview-teleported
          />
        </template>

        <template v-else>
          <c-icon-font name="icon-csv" height="24px" width="100%" />
        </template>

        <c-icon-font
          name="icon-recycle"
          :size="ButtonIconHeight.small"
          color="var(--el-color-danger)"
          class="absolute top-0 right-0 cursor-pointer"
          @click="removePic(file.uid)"
        />
      </div>
    </template>
  </el-upload>
</template>

<script lang="ts" setup>
  import { ref, computed, useAttrs } from 'vue';
  import { type UploadUserFile, ElButton } from 'element-plus';
  import { ButtonIconHeight } from '@/constants';
  import { isImage } from '@/utils';
  interface IUploaderProps {
    fileList: UploadUserFile[];
  }

  const props = withDefaults(defineProps<IUploaderProps>(), {
    fileList: () => [],
  });

  const emit = defineEmits(['update:fileList']);

  const uploadRef = ref();

  const pics = computed({
    get: () => props.fileList,
    set: (val) => emit('update:fileList', val),
  });
  const maxPics = computed<any>(() => useAttrs()?.limit || 0);

  function removePic(uid: number | undefined) {
    pics.value = pics.value.filter((pic) => pic.uid !== uid);
  }

  const totalSize = computed(() => {
    const size = pics.value.reduce((a, b) => {
      return b.size || 0 + a;
    }, 0);
    return size;
  });

  function getFileInfo() {
    console.log(' pics.value', pics.value);
    return {
      files: pics.value,
      totalSize: totalSize.value,
    };
  }

  defineExpose({
    getFileInfo,
  });
</script>
<style scoped lang="postcss">
  .pic-upload:deep(.el-upload-list) {
    @apply grid;
    @apply grid-cols-3;
    @apply items-center;
    @apply gap-2;
    @apply mt-0;

    & .el-upload-list__item {
      @apply p-2;
      @apply w-[106px];
      @apply h-[106px];
      @apply flex;
      @apply justify-center;
    }
  }
</style>
