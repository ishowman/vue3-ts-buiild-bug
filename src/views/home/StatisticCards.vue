<template>
  <div class="static-cards grid w-full gap-6">
    <el-card
      v-for="item in userIndicators"
      :key="item.name"
      class="user-indicator cursor-pointer"
      @click.prevent="onJump(item.path)"
    >
      <el-skeleton v-if="loading" :rows="2" animated>
        <template #template>
          <el-skeleton-item variant="text" style="width: 30%" />
          <el-skeleton-item variant="text" />
          <el-skeleton-item variant="text" />
        </template>
      </el-skeleton>
      <template v-else>
        <p class="grid grid-columns-auto justify-between">
          <span>{{ item.name }}</span>
          <span
            class="theme-icon flex justify-center items-center p-1.5 rounded-full w-8 h-8 overflow-hidden relative"
          >
            <div class="them-icon--bg absolute"></div>
            <c-icon-font :name="item.icon" width="22px"
          /></span>
        </p>
        <p class="grid grid-columns-auto justify-between">
          <span
            class="text-emphasize"
            style="font-size: 24px; line-height: 36px"
            >{{ data[item.key] }}</span
          >
          <span class="data-link text-center">
            <c-icon-font name="icon-back" :rotate="180" />
          </span>
        </p>
      </template>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    getDashboardTotalData,
    type IDashboardTotalDataResponse,
  } from '@/services';

  interface UserIndicator {
    name: string;
    key: string;
    icon: string;
    path: string;
  }

  const router = useRouter();

  const userIndicators: UserIndicator[] = [
    {
      name: '生徒',
      key: 'students_total',
      icon: 'icon-a-shengtu',
      path: '/students/list',
    },
    {
      name: '講師',
      key: 'teachers_total',
      icon: 'icon-a-jiangshiicon',
      path: '/teachers/list',
    },
    {
      name: 'お知らせ',
      key: 'news_total',
      icon: 'icon-a-zhii',
      path: '/news/list',
    },
    {
      name: '指導報告書',
      key: 'report_total',
      icon: 'icon-zhidaobaogaoshu',
      path: '/reports/list',
    },
    {
      name: '請求書',
      key: 'invoices_total',
      icon: 'icon-a-chengjiguanli',
      path: '/invoices/list',
    },
    {
      name: '教室',
      key: 'schools_total',
      icon: 'icon-jiaoshi',
      path: '/schools/list',
    },
    {
      name: '集団指導報告書',
      key: 'group_reports_total',
      icon: 'icon-jituanzhidaobaogaoshu',
      path: '/group-reports/list',
    },
  ];

  const loading = ref<boolean>(false);
  const data = reactive<IDashboardTotalDataResponse>({
    students_total: 0,
    teachers_total: 0,
    news_total: 0,
    report_total: 0,
    invoices_total: 0,
    schools_total: 0,
    group_reports_total: 0,
    corporation_notifications_total: 0,
  });

  const getTotalData = async () => {
    loading.value = true;
    try {
      const res = await getDashboardTotalData();
      Object.assign(data, res);
    } finally {
      loading.value = false;
    }
  };

  const onJump = (path) => {
    router.push({ path });
  };

  getTotalData();
</script>
<style scoped lang="postcss">
  .static-cards {
    grid-template-columns: repeat(4, 1fr);
    grid-template-areas:
      'sumary  indicator indicator indicator'
      'sumary  indicator indicator indicator';
  }
  .user-sumary {
    grid-area: sumary;
    position: relative;
    --el-card-padding: 0;
    --el-card-border-color: none;
    overflow: hidden;
    line-height: 1.4;
  }

  .quote {
    height: 90px;
    background-color: var(--color-bg-theme);
    color: var(--el-color-primary);
  }

  .user-info {
    position: absolute;
    top: 72px;
    left: 15.44px;
  }

  .user-avatar {
    border: 3px solid var(--el-color-white);
  }

  .user-indicator {
    --el-card-padding: 10px;
    &:hover {
      --el-card-bg-color: var(--el-color-primary-light-9);
    }
  }
  .theme-icon {
    background-color: var(--el-color-primary);
    color: var(--el-color-white);
    .them-icon--bg {
      width: 8px;
      height: 50px;
      background: var(--el-color-white);
      opacity: 0.14;
      transform: rotate(30deg);
    }
  }

  .data-link {
    width: 32px;
    height: 32px;
    padding: 6px 0;
  }
</style>
