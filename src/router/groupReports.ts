import { RouterView } from 'vue-router';

const Page = () => import('../components/layout/CPage.vue');
const GroupReportList = () =>
  import('@/views/groupReports/list/GroupReportList.vue');

export const groupReportRoutes = {
  path: '/group-reports',
  name: 'group-reports',
  redirect: { name: 'GroupReportList' },
  component: Page,
  meta: {
    JPName: '集団指導報告書',
    isMenu: true,
    icon: 'icon-zhidaobaogaoshu',
  },
  children: [
    {
      path: '',
      component: RouterView,
      name: 'GroupReportListIndex',
      redirect: { name: 'GroupReportList' },

      meta: {
        JPName: '集団指導報告書',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: GroupReportList,
          name: 'GroupReportList',
          meta: {
            JPName: '集団指導報告書',
            isMenu: false,
          },
        },
      ],
    },
  ],
};
