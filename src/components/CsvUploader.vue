<template>
  <el-upload
    v-model:file-list="fileList"
    :limit="1"
    :auto-upload="false"
    accept=".csv"
    v-bind="$attrs"
  >
    <template #trigger>
      <el-button type="primary">
        <c-icon-font name="icon-Upload" :size="ButtonIconHeight.default" />
        アップロード
      </el-button>
    </template>
  </el-upload>

  <p class="text-secondary text-[12px] leading-none">
    <slot name="info">アップロードできるのはcsvファイルのみ</slot>
  </p>
</template>

<script lang="ts" setup>
  import { ref, watch, computed } from 'vue';
  import Papa, { type ParseLocalConfig } from 'papaparse';
  import { isString } from '@vueuse/core';
  import { detectFileEncoding } from '@/utils';
  import { ButtonIconHeight } from '@/constants';

  interface IProps {
    parseConfig: Partial<ParseLocalConfig>;
  }

  const CSVUploaderProps = withDefaults(defineProps<IProps>(), {
    parseConfig: () => ({
      encoding: '',
    }),
  });

  const parseConfig = computed(() => CSVUploaderProps.parseConfig);
  const fileList = ref([]);
  let detectedEncoding = '';
  watch(
    [fileList, parseConfig],
    async ([newFile, newOptions]) => {
      console.log('changed');
      if (newFile[0]) {
        const rawFile = newFile[0]['raw'];
        const isAuto = CSVUploaderProps?.parseConfig?.encoding === ' ';

        if (isAuto) {
          const encoding = await detectFileEncoding(rawFile);
          if (isString(encoding)) {
            detectedEncoding = encoding;
          }
          parseFile(rawFile, { ...newOptions, encoding });
        } else {
          parseFile(rawFile, newOptions);
        }
      }
    },
    { deep: true }
  );

  const emits = defineEmits(['parsed']);

  function parseFile(rawFile, options) {
    Papa.parse(rawFile, {
      worker: true,
      header: false,
      skipEmptyLines: true,
      complete: function ({ meta, data }: any) {
        console.log('results', meta, data);
        const { fields = null } = meta;

        emits('parsed', {
          fields,
          data: data.map((row) => {
            return row.map((item) => {
              return item.indexOf(',') === -1 ? item : `"${item}"`;
            });
          }),
          encoding: detectedEncoding,
        });
      },
      ...options,
    });
  }

  function clearFiles() {
    fileList.value = [];
  }
  function getFiles() {
    return fileList.value;
  }

  defineExpose({
    clearFiles,
    getFiles,
  });
</script>
<style scoped></style>
