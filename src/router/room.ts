const Page = () => import('../components/layout/CPage.vue');

const StudentList = () => import('@/views/students/list/StudentList.vue');
export const roomRoutes = {
  path: '/room',
  name: '入退室',

  component: Page,
  meta: {
    isMenu: true,
    icon: 'icon-a-rutuishi',
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
