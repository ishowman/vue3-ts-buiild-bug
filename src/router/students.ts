import { RouterView } from 'vue-router';
const Page = () => import('@/components/layout/CPage.vue');

const StudentList = () => import('@/views/students/list/StudentList.vue');
const StudentProfile = () => import('@/views/students/list/StudentProfile.vue');
const StudentCreate = () => import('@/views/students/list/StudentCreate.vue');
const StudentGroup = () => import('@/views/students/list/StudentGroup.vue');
const StudentReport = () => import('@/views/students/report/StudentReport.vue');

// const ClassroomList = () =>
//   import('@/views/students/classroom/ClassroomList.vue');
// const CourseManage = () => import('@/views/students/course/CourseManage.vue');
// const CourseHistory = () => import('@/views/students/course/CourseHistory.vue');
// const TestStatistics = () => import('@/views/students/test/TestStatistics.vue');
export const studentsRoutes = {
  path: '/students',
  name: 'students',
  component: Page,
  meta: {
    JPName: '生徒',
    isMenu: true,
    icon: 'icon-a-shengtu',
  },
  redirect: { name: 'StudentList' },
  children: [
    {
      path: '',
      component: RouterView,
      meta: {
        JPName: '生徒一覧',
        isMenu: true,
      },
      name: 'StudentListIndex',
      redirect: { name: 'StudentList' },
      children: [
        {
          path: 'list',
          component: StudentList,
          name: 'StudentList',
          meta: {
            JPName: '生徒一覧',
            isMenu: false,
          },
        },
        {
          path: ':id',
          component: StudentProfile,
          name: 'StudentProfile',
          meta: {
            JPName: '生徒編集',
            isMenu: false,
            back: {
              router: { name: 'StudentList' },
            },
          },
        },
        {
          path: 'create',
          component: StudentCreate,
          name: 'StudentCreate',
          meta: {
            JPName: '生徒新規',
            isMenu: false,
            back: {
              router: { name: 'StudentList' },
            },
          },
        },
        {
          path: 'group',
          component: StudentGroup,
          name: 'StudentGroup',
          meta: {
            JPName: 'グループ作成',
            isMenu: false,
            back: {
              router: { name: 'StudentList' },
            },
          },
        },
      ],
    },

    {
      path: 'report',
      component: StudentReport,
      name: 'StudentReport',
      meta: {
        JPName: 'レポート',
        isMenu: true,
      },
    },

    // {
    //   path: 'classroom',
    //   component: RouterView,
    //   children: [
    //     {
    //       path: '',
    //       component: ClassroomList,
    //       name: 'ClassroomList',
    //       meta: {
    //         JPName: '通塾・請求パターン管理',
    //         isMenu: false,
    //       },
    //     },
    //   ],
    //   meta: {
    //     JPName: '通塾・請求パターン管理',
    //     isMenu: true,
    //   },
    // },
    // {
    //   path: 'course-manage',
    //   component: CourseManage,
    //   name: 'CourseManage',
    //   meta: {
    //     JPName: 'コース管理',
    //     isMenu: true,
    //   },
    // },
    // {
    //   path: 'course-history',
    //   component: CourseHistory,
    //   name: 'CourseHistory',
    //   meta: {
    //     JPName: 'コース履歴',
    //     isMenu: true,
    //   },
    // },
    // {
    //   path: 'test',
    //   component: RouterView,
    //   children: [
    //     {
    //       path: '',
    //       component: TestStatistics,
    //       name: 'TestStatistics',
    //       meta: {
    //         JPName: '合否集計',
    //         isMenu: false,
    //       },
    //     },
    //   ],

    //   meta: {
    //     JPName: '合否集計',
    //     isMenu: true,
    //   },
    // },
  ],
};
