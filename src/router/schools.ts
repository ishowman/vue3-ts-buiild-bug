import { RouterView } from 'vue-router';

const Page = () => import('@/components/layout/CPage.vue');
const SchoolList = () => import('@/views/schools/list/SchoolList.vue');
const SchoolAccountList = () =>
  import('@/views/schools/accounts/AccountList.vue');
const SchoolAccountForm = () =>
  import('@/views/schools/accounts/AccountForm.vue');
const SchoolCopySettings = () =>
  import('@/views/schools/list/CopySettings.vue');
const SchoolOmiseSettings = () =>
  import('@/views/schools/list/OmiseSettings.vue');
const SchoolGroupList = () =>
  import('@/views/schools/group/SchoolGroupList.vue');
const SchoolGroupCU = () => import('@/views/schools/group/SchoolGroupCU.vue');

export const schoolsRoutes = {
  path: '/schools',
  name: 'schools',
  redirect: { name: 'SchoolList' },
  component: Page,
  meta: {
    JPName: '教室',
    isMenu: true,
    icon: 'icon-jiaoshi',
  },
  children: [
    {
      path: '',
      component: RouterView,
      name: 'SchoolListIndex',
      redirect: { name: 'SchoolList' },

      meta: {
        JPName: '教室一覧',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: SchoolList,
          name: 'SchoolList',
          meta: {
            JPName: '教室一覧',
            isMenu: false,
          },
        },
        {
          path: 'copy-settings',
          component: SchoolCopySettings,
          name: 'SchoolCopySettings',
          meta: {
            JPName: 'データ複製',
            isMenu: false,
            back: {
              router: { name: 'SchoolList' },
            },
          },
        },
        {
          path: 'omise-settings',
          component: SchoolOmiseSettings,
          name: 'SchoolOmiseSettings',
          meta: {
            JPName: 'omiseAPI設定',
            isMenu: false,
            back: {
              router: { name: 'SchoolList' },
            },
          },
        },
      ],
    },
    {
      path: 'group',
      component: RouterView,
      name: 'SchoolGroupListIndex',
      redirect: { name: 'SchoolGroupList' },

      meta: {
        JPName: '教室グループ',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: SchoolGroupList,
          name: 'SchoolGroupList',
          meta: {
            JPName: '教室グループ',
            isMenu: false,
          },
        },
        {
          path: 'create',
          component: SchoolGroupCU,
          name: 'SchoolGroupCreate',
          meta: {
            JPName: '作成',
            isMenu: false,
            back: {
              router: { name: 'SchoolGroupList' },
            },
          },
        },
        {
          path: ':id',
          component: SchoolGroupCU,
          name: 'SchoolGroupUpdate',
          props: true,

          meta: {
            JPName: '編集',
            isMenu: false,
            back: {
              router: { name: 'SchoolGroupList' },
            },
          },
        },
      ],
    },
    {
      path: 'account',
      component: RouterView,
      name: 'SchoolAccountIndex',
      redirect: { name: 'SchoolAccountList' },

      meta: {
        JPName: '教室口座',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: SchoolAccountList,
          name: 'SchoolAccountList',
          meta: {
            JPName: '教室口座',
            isMenu: false,
          },
        },
        {
          path: 'create',
          component: SchoolAccountForm,
          name: 'SchoolAccountCreate',
          meta: {
            JPName: '作成',
            isMenu: false,
            back: {
              router: { name: 'SchoolAccountList' },
            },
          },
        },
        {
          path: ':id',
          component: SchoolAccountForm,
          name: 'SchoolAccountEdit',
          meta: {
            JPName: '編集',
            isMenu: false,
            back: {
              router: { name: 'SchoolAccountList' },
            },
          },
        },
      ],
    },
  ],
};
