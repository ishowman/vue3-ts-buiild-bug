<template>
  <el-menu v-if="isFirstRender" class="comiru-menus" mode="horizontal" router>
    <template v-for="item in menus">
      <template v-if="filtedMenus(item?.children).length">
        <el-sub-menu
          :key="getFullPath(item)"
          :index="getFullPath(item)"
          :class="{
            'is-active-menu': item.name === level1Router.name,
          }"
        >
          <template #title>
            <c-icon-font
              v-if="item?.meta?.icon"
              size="18px"
              :name="item?.meta?.icon"
              class="mr-0.5"
            />
            <span class="mr-[-6px]">{{ item?.meta?.JPName }}</span>
          </template>
          <c-menu-list
            :menus="filtedMenus(item?.children)"
            :is-first-render="false"
            :prefix-path="getFullPath(item)"
          />
        </el-sub-menu>
      </template>

      <template v-else>
        <el-menu-item
          :key="getFullPath(item)"
          :index="getFullPath(item)"
          class="menu-1"
          :class="{ 'is-active-menu': currentPath === getFullPath(item) }"
        >
          <c-icon-font
            v-if="item?.meta?.icon"
            size="18px"
            :name="item?.meta?.icon"
            class="mr-0.5"
          />
          <span class="mr-[-6px]">{{ item?.meta?.JPName }}</span>
        </el-menu-item>
      </template>
    </template>
  </el-menu>

  <template v-else>
    <template v-for="item in menus">
      <template v-if="filtedMenus(item?.children).length">
        <el-sub-menu
          :key="getFullPath(item)"
          :index="getFullPath(item)"
          :class="{
            'is-active-menu': currentPath === getFullPath(item),
          }"
        >
          <template #title>
            <c-icon-font
              v-if="item?.meta?.icon"
              size="18px"
              :name="item?.meta?.icon"
              class="mr-0.5"
            />
            <span class="mr-[-6px]">{{ item?.meta?.JPName }}</span>
          </template>
          <c-menu-list
            :menus="item.children"
            :prefix-path="getFullPath(item)"
          />
        </el-sub-menu>
      </template>

      <template v-else>
        <el-menu-item
          :key="getFullPath(item)"
          :index="getFullPath(item)"
          :class="{ 'is-active-menu': currentPath === getFullPath(item) }"
        >
          <c-icon-font
            v-if="item?.meta?.icon"
            size="18px"
            :name="item?.meta?.icon"
            class="mr-0.5"
          />
          <span class="mr-[-6px]">{{ item?.meta?.JPName }}</span>
        </el-menu-item>
      </template>
    </template>
  </template>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { type RouteRecordRaw, useRoute, useRouter } from 'vue-router';
  interface Props {
    isCollapse?: boolean;
    menus: RouteRecordRaw[];
    isFirstRender?: boolean;
    metaField?: string;
    prefixPath?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    isCollapse: false,
    menus: () => [],
    isFirstRender: true,
    metaField: 'isMenu',
    prefixPath: '',
  });

  function filtedMenus(children) {
    if (!children) {
      return [];
    }
    return children.filter((item) => item.meta.isMenu);
  }

  // function formatPath(path) {
  //   const prefix = props.prefixPath.endsWith('/')
  //     ? props.prefixPath
  //     : `${props.prefixPath}/`;
  //   const currentPath = path.startsWith('/') ? path.slice(1) : path;
  //   return `${prefix}${currentPath}`;
  // }

  const menus = ref(
    props.menus.filter((item) => item?.meta?.[props.metaField])
  );

  const route = useRoute();
  const currentPath = computed(() => route.path);
  const level1Router = computed(() => route.matched[0]);
  const router = useRouter();

  function getFullPath(item) {
    const { fullPath } = router.resolve(
      item.redirect ? item.redirect : { name: item.name }
    );
    return fullPath;
  }
</script>
<style scoped lang="postcss">
  .comiru-menus {
    --el-menu-text-color: #434344;
    height: var(--layout-navs-height);
    --el-menu-border-color: transparent; /* 底部边框颜色 */
    & .menu-1:hover {
      background-color: transparent;
    }
  }
</style>
