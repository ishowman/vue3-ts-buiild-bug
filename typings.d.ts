import 'vue-router';
declare module 'vue-router' {
  interface RouteMeta {
    // 是可选的
    isMenu?: boolean;
    icon?: string;
    title?: string;
    back?: {
      title?: string;
      content?: string;
      router: any;
      noConfirm?: boolean;
    };
  }
}
