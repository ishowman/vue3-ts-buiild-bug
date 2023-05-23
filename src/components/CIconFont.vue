<template>
  <svg class="icon" :class="$style['svg-icon']" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script lang="ts" setup>
  import '@/assets/iconfont';
  import { computed } from 'vue';

  export interface ISVGProps {
    width?: string;
    height?: string;
    color?: string;
    name: string;
    rotate?: number;
    // eslint-disable-next-line vue/require-default-prop
    size?: string; // 当指定 size，会优先使用 size，否则使用 width 和 height
  }
  const svgProps = withDefaults(defineProps<ISVGProps>(), {
    width: '1em',
    height: '100%',
    color: 'currentColor',
    rotate: 0,
  });
  const iconName = computed(() => `#${svgProps.name}`);
  const rotate = computed(() => `${svgProps.rotate}deg`);
</script>
<style module>
  .svg-icon {
    width: v-bind('svgProps.size||svgProps.width') !important;
    height: v-bind('svgProps.size||svgProps.height') !important;
    vertical-align: -0.15em;
    fill: v-bind('svgProps.color');
    overflow: hidden;
    transform: rotate(v-bind('rotate'));
  }
</style>
