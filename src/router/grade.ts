const Page = () => import('../components/layout/CPage.vue');

const StudentList = () => import('@/views/students/list/StudentList.vue');
export const gradeRoutes = {
  path: '/grade',
  name: '成績管理',

  component: Page,
  meta: {
    isMenu: true,
    icon: 'icon-a-chengjiguanli',
  },
  children: [
    {
      path: '',
      component: StudentList,
      name: '生徒一覧',
      meta: {
        title: '生徒一覧',
        isMenu: true,
      },
    },
  ],
};
