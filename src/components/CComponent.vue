<template>
  <component v-bind="props.attrs" :is="props.name">
    <template v-for="slot in props.slots" #[slot.name]>
      <slot v-if="slot?.components?.length" :name="slot.name">
        <c-component
          v-for="(item, j) in slot.components"
          :key="j"
          v-bind="item"
        />
      </slot>
      <slot v-else :name="slot.name">{{ slot.value }}</slot>
    </template>
  </component>
</template>

<script lang="ts" setup>
  // designed as resolve dynamic component
  // 之所以 types/index.ts 已经定义了这 2 个，这里还重新定义的原因是这个限制：https://github.com/vuejs/core/issues/4294
  // 通过 import `types/index.ts` 的 interface 会报错：Error: [@vue/compiler-sfc] type argument passed to defineProps() must be a literal type, or a reference to an interface or literal type.
  export interface IComponent {
    name: InstanceType<any>;
    attrs?: Record<string, any>;
    slots?: ISlot[];
    uniqKey?: string | number;
  }
  export interface ISlot {
    name: string;
    value?: string | number; // 当不存在 components 字段，会直接使用 value 作为展示内容
    components?: IComponent[]; // 配置插槽内的子组件
  }

  const props = withDefaults(defineProps<IComponent>(), {
    attrs: () => ({}),
    slots: () => [],
    uniqKey: '',
  });

  // example

  // component with nested component：
  // {
  //   name: ElTag,
  //   attrs: {
  //     type: 'info',
  //   },
  //   slots: [
  //     {
  //       name: 'default',
  //       // value: 1024
  //       components: [
  //         {
  //           name: ElButton,
  //           attrs: { size: 'mini', type: 'danger', round: true },
  //           value: 1024
  //         }
  //       ]
  //     }
  //   ]
  // }

  // component with nested text：
  // {
  //     name: ElTag,
  //       attrs: {
  //       type: 'info',
  //         size: 'mini',
  //           class: 'mr-0.5',
  //   },
  //   slots: [
  //     {
  //       name: 'default',
  //       value: 666
  //     }
  //   ]
  // }

  // html：
  // {
  //   name: 'div',
  //     attrs: {
  //     class: 'ml-2',
  //       slots: [
  //         {
  //           name: 'default',
  //           value: '????'
  //         }
  //       ]
  //   }
  // }

  // component with name slot
  //   {
  //     name: ElCard,
  //     slots: [
  //       {
  //         name: 'default',
  //         value: 'el card header',
  //         components: [
  //           {
  //             name: ElInput,
  //             slots: [
  //               {
  //                 name: 'prepend',
  //                 components: [
  //                   {name: ElTag, value: 1024}
  //                 ]
  //               }
  //             ]
  //           }
  //         ]
  //       },
  //       {
  //         name: 'header',
  //         text: 'el card header',
  //       }
  //     ]
  //   }
</script>
