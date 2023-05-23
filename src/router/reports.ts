import { RouterView } from 'vue-router';

const Page = () => import('../components/layout/CPage.vue');
const ReportList = () => import('@/views/reports/list/ReportList.vue');

const ReportTemplateList = () =>
  import('@/views/reports/templates/TemplateList.vue');
const ReportTemplateBatchCopy = () =>
  import('@/views/reports/templates/BatchCopy.vue');

export const reportRoutes = {
  path: '/reports',
  name: 'reports',
  redirect: { name: 'ReportList' },
  component: Page,
  meta: {
    JPName: '指導報告書',
    isMenu: true,
    icon: 'icon-jituanzhidaobaogaoshu',
  },
  children: [
    {
      path: '',
      component: RouterView,
      name: 'ReportListIndex',
      redirect: { name: 'ReportList' },

      meta: {
        JPName: '指導報告書一覧',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: ReportList,
          name: 'ReportList',
          meta: {
            JPName: '指導報告書一覧',
            isMenu: false,
          },
        },
      ],
    },
    {
      path: 'template',
      component: RouterView,
      name: 'ReportTemplateListIndex',
      redirect: { name: 'ReportTemplateList' },

      meta: {
        JPName: 'テンプレート',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: ReportTemplateList,
          name: 'ReportTemplateList',
          meta: {
            JPName: 'テンプレート',
            isMenu: false,
          },
        },

        {
          path: 'list/copy/:id',
          component: ReportTemplateBatchCopy,
          name: 'ReportTemplateBatchCopy',
          props: true,
          meta: {
            JPName: 'コビー',
            isMenu: false,
            back: {
              router: { name: 'ReportTemplateList' },
            },
          },
        },
      ],
    },
  ],
};
