import { RouterView } from 'vue-router';

const Page = () => import('../components/layout/CPage.vue');
const InvoiceList = () => import('@/views/invoices/list/InvoiceList.vue');
const InvoiceTrashList = () =>
  import('@/views/invoices/trash/InvoiceTrashList.vue');
const InvoiceZenginUpload = () =>
  import('@/views/invoices/list/InvoiceZenginUpload.vue');
const InvoiceCreate = () => import('@/views/invoices/list/InvoiceCreate.vue');
const InvoiceZenginList = () =>
  import('@/views/invoices/zengin/ZenginList.vue');
const InvoiceZenginForm = () =>
  import('@/views/invoices/zengin/ZenginForm.vue');
const CropZenginCreate = () =>
  import('@/views/invoices/zengin/CropZenginCreate.vue');

const InvoiceZenginStudentList = () =>
  import('@/views/invoices/zenginStudent/ZenginStudentList.vue');
const InvoiceZenginStudentForm = () =>
  import('@/views/invoices/zenginStudent/Form.vue');
const InvoiceZenginStudentCreate = () =>
  import('@/views/invoices/zenginStudent/InvoiceZenginStudentCreate.vue');

export const invoicesRoutes = {
  path: '/invoices',
  name: '請求書',

  redirect: { name: 'InvoiceList' },

  component: Page,
  meta: {
    JPName: '請求書',
    isMenu: true,
    icon: 'icon-a-chengjiguanli',
  },
  children: [
    {
      path: '',
      component: RouterView,
      name: 'InvoiceListIndex',
      redirect: { name: 'InvoiceList' },

      meta: {
        JPName: '請求書一覧',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: InvoiceList,
          name: 'InvoiceList',
          meta: {
            JPName: '請求書一覧',
            isMenu: false,
          },
        },
        {
          path: 'trashes',
          component: InvoiceTrashList,
          name: 'InvoiceTrashList',
          meta: {
            JPName: 'ゴミ箱リスト',
            isMenu: false,
            back: {
              router: { name: 'InvoiceList' },
              noConfirm: true,
            },
          },
        },
        {
          path: 'zengin-upload',
          component: InvoiceZenginUpload,
          name: 'InvoiceZenginUpload',
          meta: {
            JPName: '振替結果アップロード',
            isMenu: false,
            back: {
              router: { name: 'InvoiceList' },
            },
          },
        },
        {
          path: 'create',
          component: InvoiceCreate,
          name: 'InvoiceCreate',
          meta: {
            JPName: 'CSVアップロード',
            isMenu: false,
            back: {
              router: { name: 'InvoiceList' },
            },
          },
        },
      ],
    },
    {
      path: 'zengin',
      component: RouterView,
      name: 'InvoiceZenginIndex',
      redirect: { name: 'InvoiceZenginList' },

      meta: {
        JPName: '会社口座管理',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: InvoiceZenginList,
          name: 'InvoiceZenginList',
          meta: {
            JPName: '会社口座管理',
            isMenu: false,
          },
        },
        {
          path: 'create',
          component: InvoiceZenginForm,
          name: 'InvoiceZenginCreate',
          meta: {
            JPName: '作成',
            isMenu: false,
            back: {
              router: { name: 'InvoiceZenginList' },
            },
          },
        },
        {
          path: 'upload',
          component: CropZenginCreate,
          name: 'CropZenginCreate',
          meta: {
            JPName: 'CSV アップロード',
            isMenu: false,
            back: {
              router: { name: 'InvoiceZenginList' },
            },
          },
        },

        {
          path: ':id',
          component: InvoiceZenginForm,
          name: 'InvoiceZenginEdit',
          meta: {
            JPName: '編集',
            isMenu: false,
            back: {
              router: { name: 'InvoiceZenginList' },
            },
          },
        },
      ],
    },

    {
      path: 'zenginStudent',
      component: RouterView,
      name: 'InvoiceZenginStudentIndex',
      redirect: { name: 'InvoiceZenginStudentList' },
      meta: {
        JPName: '生徒口座管理',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: InvoiceZenginStudentList,
          name: 'InvoiceZenginStudentList',
          meta: {
            JPName: '生徒口座管理',
            isMenu: false,
          },
        },

        {
          path: 'new',
          name: 'InvoiceZenginStudentNew',
          component: InvoiceZenginStudentForm,
          meta: {
            JPName: '作成',
            isMenu: false,
            back: {
              router: { name: 'InvoiceZenginStudentList' },
            },
          },
        },

        {
          path: 'edit/:id',
          name: 'InvoiceZenginStudentEdit',
          component: InvoiceZenginStudentForm,
          meta: {
            JPName: '編集',
            isMenu: false,
            back: {
              router: { name: 'InvoiceZenginStudentList' },
            },
          },
        },

        {
          path: 'create',
          component: InvoiceZenginStudentCreate,
          name: 'InvoiceZenginStudentCreate',
          meta: {
            JPName: '生徒口座管理',
            isMenu: false,
            back: {
              router: { name: 'InvoiceZenginStudentList' },
            },
          },
        },
      ],
    },
  ],
};
