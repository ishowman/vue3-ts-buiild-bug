<template>
  <header id="comiru-header" class="layout-header p-5 overflow-auto">
    <div class="layout-container flex justify-between">
      <div class="flex items-center">
        <router-link to="/">
          <img
            :src="logo"
            alt="Comiru Admin Plus"
            class="logo w-[190px] h-6 mr-3"
          />
        </router-link>
        <!-- <el-autocomplete
          placeholder="search..."
          v-model="searchKeyword"
          class="app-search"
          clearable
          :trigger-on-focus="false"
        >
          <template #prefix>
            <c-icon-font
              color="var(--el-text-color-secondary)"
              name="icon-seach"
              :height="ButtonIconHeight.default"
            />
          </template>
        </el-autocomplete> -->
      </div>
      <div class="flex items-center">
        <!-- <el-badge is-dot class="comiru-notify">
          <c-icon-font name="icon-bell" height="22px" width="22px" />
        </el-badge> -->
        <el-avatar
          :src="userInfo?.avatar"
          alt="avatar"
          class="my-0 mr-1 ml-6"
          :size="32"
        />
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ userInfo?.name }}
            <c-icon-font name="icon-Dropdown_ico" height="10px" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="logout">logout</el-dropdown-item>
              <!-- <el-dropdown-item>setting</el-dropdown-item>
              <el-dropdown-item>test mode</el-dropdown-item> -->
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>
<script lang="ts" setup>
  // import { ref } from 'vue';
  import logo from '@/assets/logo-white.png';
  import { useRouter } from 'vue-router';
  import { authStore, userStore } from '@/store';
  // import { ButtonIconHeight } from '@/constants';
  import { useUserInfo } from '@/hooks';
  // const searchKeyword = ref('');
  const router = useRouter();
  const userInfo = useUserInfo();
  function logout() {
    // clear user data
    authStore.clearTokens();
    userStore.clearUserInfo();
    router.push({ name: 'Login' });
  }
</script>
<style scoped lang="postcss">
  .layout-header {
    background-color: var(--color-bg-navs);
    --el-text-color-regular: var(--el-color-white);
    color: var(--el-text-color-regular);
  }
  .comiru-notify {
    --el-color-white: var(--el-color-danger);
  }
  #comiru-header:deep(.app-search) {
    --el-border-radius-base: 70px;
    --el-fill-color-blank: rgba(255, 255, 255, 0.2);
    --el-border-color: transparent;
  }
</style>
