import { RouterView } from 'vue-router';
const Page = () => import('@/components/layout/CPage.vue');
const TeacherList = () => import(`@/views/teachers/list/TeacherList.vue`);
const TeacherProfile = () => import(`@/views/teachers/list/TeacherProfile.vue`);
const TeacherCreate = () => import('@/views/teachers/list/TeacherCreate.vue');
const TeacherRoleUpload = () =>
  import('@/views/teachers/list/TeacherRoleUpload.vue');
const TeacherInactive = () =>
  import('@/views/teachers/inactive/TeacherInactive.vue');
const TeacherSchoolAdd = () =>
  import('@/views/teachers/list/TeacherSchoolAdd.vue');
const TeacherSchoolRemove = () =>
  import('@/views/teachers/list/TeacherSchoolRemove.vue');

export const teachersRoutes = {
  path: '/teachers',
  name: 'teachers',
  redirect: { name: 'TeacherList' },
  component: Page,
  meta: {
    JPName: '講師',
    isMenu: true,
    icon: 'icon-a-jiangshiicon',
  },
  children: [
    {
      path: '',
      component: RouterView,
      name: 'TeacherListIndex',
      redirect: { name: 'TeacherList' },
      meta: {
        JPName: '講師一覧',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: TeacherList,
          name: 'TeacherList',
          meta: {
            JPName: '講師一覧',
            isMenu: false,
          },
        },
        {
          path: 'create',
          component: TeacherCreate,
          name: 'TeacherCreate',
          meta: {
            JPName: '講師新規',
            isMenu: false,
            back: {
              router: { name: 'TeacherList' },
            },
          },
        },

        {
          path: 'permission-upload',
          component: TeacherRoleUpload,
          name: 'TeacherRoleUpload',
          meta: {
            JPName: '講師権限CSVアップロード',
            isMenu: false,
            back: {
              router: { name: 'TeacherList' },
            },
          },
        },

        {
          path: ':id',
          component: TeacherProfile,
          name: 'TeacherProfile',
          meta: {
            JPName: '講師編集',
            isMenu: false,
            back: {
              router: { name: 'TeacherList' },
            },
          },
        },

        {
          path: 'school-add',
          component: TeacherSchoolAdd,
          name: 'TeacherSchoolAdd',
          meta: {
            JPName: '教室に追加',
            isMenu: false,
            back: {
              router: { name: 'TeacherList' },
            },
          },
        },

        {
          path: 'school-remove',
          component: TeacherSchoolRemove,
          name: 'TeacherSchoolRemove',
          meta: {
            JPName: '教室から削除',
            isMenu: false,
            back: {
              router: { name: 'TeacherList' },
            },
          },
        },
      ],
    },
    {
      path: 'inactive',
      component: TeacherInactive,
      name: 'TeacherInactive',
      meta: {
        JPName: '休職・退職者一覧',
        isMenu: true,
      },
    },
  ],
};
