<template>
  <div class="flex" :class="{ 'flex-row-reverse': isAdmin }">
    <el-avatar
      :class="{ 'order-lasts': isAdmin }"
      size="small"
      :src="userInfo.avatar"
    >
    </el-avatar>
    <div
      class="comment-content p-2 leading-6"
      :class="{ 'mr-1': isAdmin, 'ml-1': !isAdmin }"
    >
      <span class="flex" :class="{ 'justify-start flex-row-reverse': isAdmin }">
        {{ userInfo.name }}
        <span
          class="text-secondary text-[12px]"
          :class="[isAdmin ? 'mr-1' : 'ml-1']"
          >{{ commentDate(comment?.format_created_at) }}</span
        >
      </span>
      <div :class="{ 'text-right': isAdmin }" class="mt-1">
        <p v-dompurify-html="comment?.comment" class="whitespace-pre-wrap" />
        <div
          v-if="comment?.attachment_urls?.length"
          class="mt-2 flex gap-2 justify-end"
        >
          <el-image
            v-for="url in comment.attachment_urls"
            :key="url"
            :src="url"
            :preview-src-list="[url]"
            fit="contain"
            class="h-[150px] w-[150px]"
            teleported
          />
        </div>

        <p
          v-if="!readonly"
          class="text-danger cursor-pointer"
          @click="emits('del')"
        >
          <c-icon-font name="icon-recycle" :size="ButtonIconHeight.small" />
          コメント削除
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { defaultAvatar } from '@/assets';
  import { commentDate } from '@/utils';
  import { ButtonIconHeight } from '@/constants';
  interface IProps {
    comment: Record<string, any>;
    isAdmin: boolean; // 为 true 时，对话在左边；否则在右边
    readonly: boolean;
    showAdminInfo: boolean;
  }
  const props = withDefaults(defineProps<IProps>(), {
    readonly: true,
    showAdminInfo: true,
  });
  const emits = defineEmits(['del']);

  const comment = computed(() => props.comment);
  const isAdmin = computed(() => props.isAdmin);

  const userInfo = computed(() => {
    return {
      avatar: props.showAdminInfo
        ? defaultAvatar
        : comment.value?.student?.icon_url || comment.value?.teacher?.icon_url,
      name: props.showAdminInfo
        ? '本部'
        : comment.value?.student?.name || comment.value?.teacher?.name,
    };
  });
</script>
<style scoped lang="postcss">
  .comment-content {
    background-color: var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    max-width: 50%;
    width: fit-content;
    min-width: 180px;
  }
  .comment-content:deep(.el-image) {
    position: unset;
  }
</style>
