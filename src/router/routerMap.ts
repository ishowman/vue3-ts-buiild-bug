import type { RouteRecordRaw } from 'vue-router';
import { studentsRoutes } from './students';
// import { gradeRoutes } from './grade';
import { newsRoutes } from './news';
import { reportRoutes } from './reports';
import { invoicesRoutes } from './invoices';
// import { roomRoutes } from './room';
import { teachersRoutes } from './teachers';
import { schoolsRoutes } from './schools';
import { groupReportRoutes } from './groupReports';

import { getCorporationInfo } from '@/services';

const Page = () => import('@/components/layout/CPage.vue');

const Dashboard = () => import('@/views/home/Dashboard.vue');

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    meta: {
      JPName: 'ダッシュボード',
      icon: 'icon-a--',
    },
    redirect: { name: 'DashboardIndex' },
  },
  {
    path: '/dashboard',
    component: Page,
    name: 'Dashboard',
    meta: {
      JPName: 'ダッシュボード',
      isMenu: true,
      icon: 'icon-a--',
    },
    children: [
      {
        path: '',
        name: 'DashboardIndex',
        component: Dashboard,
        beforeEnter: async (to, from, next) => {
          if (from.meta && !to.meta.title) {
            const {
              data: { name },
            } = await getCorporationInfo();
            to.meta.title = name;
          }
          next();
        },
        meta: {
          title: '',
          JPName: 'ダッシュボード',
          isMenu: false,
        },
      },
    ],
  },
  studentsRoutes,
  teachersRoutes,
  newsRoutes,
  reportRoutes,
  invoicesRoutes,
  schoolsRoutes,
  groupReportRoutes,
  // gradeRoutes,
  // roomRoutes,
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
];
