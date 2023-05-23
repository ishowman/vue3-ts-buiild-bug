import { RouterView } from 'vue-router';
const Page = () => import('@/components/layout/CPage.vue');

const NewsList = () => import('@/views/news/list/NewsList.vue');
const NewsDetail = () => import('@/views/news/list/NewsDetail.vue');
// const NewsEdit = () => import('@/views/news/list/NewsEdit.vue');
const NewsCreate = () => import('@/views/news/list/NewsCreate.vue');
const NewsTemplateList = () =>
  import('@/views/news/templates/TemplateList.vue');
const NewsTemplateCreate = () =>
  import('@/views/news/templates/TemplateCreate.vue');
const NewsTemplateMultipleCopy = () =>
  import('@/views/news/templates/TemplateMultipleCopy.vue');
const NewsTeacherList = () =>
  import('@/views/news/teacher/NewsTeacherList.vue');
const NewsTeacherDetail = () =>
  import('@/views/news/teacher/NewsTeacherDetail.vue');
const NewsTeacherCreate = () =>
  import('@/views/news/teacher/NewsTeacherCreate.vue');

const NewsTeacherTemplateList = () =>
  import('@/views/news/teacher-templates/TeacherTemplateList.vue');

const NewsTeacherTemplateCreate = () =>
  import('@/views/news/teacher-templates/TeacherTemplateCreate.vue');

const NewsTeacherTemplateMultipleCopy = () =>
  import('@/views/news/teacher-templates/NewsTeacherTemplateMultipleCopy.vue');

export const newsRoutes = {
  path: '/news',
  name: 'news',

  component: Page,
  meta: {
    JPName: 'お知らせ',
    isMenu: true,
    icon: 'icon-a-zhii',
  },
  redirect: { name: 'NewsList' },

  children: [
    {
      path: '',
      component: RouterView,
      name: 'NewsListIndex',
      redirect: { name: 'NewsList' },

      meta: {
        JPName: 'お知らせ一覧',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: NewsList,
          name: 'NewsList',
          meta: {
            JPName: 'お知らせ一覧',
            isMenu: false,
          },
        },
        {
          path: 'detail',
          component: NewsDetail,
          name: 'NewsDetail',
          meta: {
            JPName: '詳細',
            isMenu: false,
            back: {
              router: { name: 'NewsList' },
            },
          },
        },
        {
          path: 'create',
          component: NewsCreate,
          name: 'NewsCreate',
          meta: {
            JPName: '作成',
            isMenu: false,
            back: {
              router: { name: 'NewsList' },
            },
          },
        },
        {
          path: ':id',
          component: NewsCreate,
          name: 'NewsEdit',
          props: true,
          meta: {
            JPName: '編集',
            isMenu: false,
            back: {
              router: { name: 'NewsList' },
            },
          },
        },
      ],
    },
    {
      path: 'template',
      component: RouterView,
      name: 'NewsTemplateListIndex',
      redirect: { name: 'NewsTemplateList' },

      meta: {
        JPName: 'テンプレート',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: NewsTemplateList,
          name: 'NewsTemplateList',
          meta: {
            JPName: 'テンプレート',
            isMenu: false,
          },
        },
        {
          path: 'create',
          component: NewsTemplateCreate,
          name: 'NewsTemplateCreate',
          meta: {
            JPName: '作成',
            isMenu: false,
            back: {
              router: { name: 'NewsTemplateList' },
            },
          },
        },
        {
          path: ':id',
          component: NewsTemplateCreate,
          name: 'NewsTemplateEdit',
          props: true,
          meta: {
            JPName: '編集',
            isMenu: false,
            back: {
              router: { name: 'NewsTemplateList' },
            },
          },
        },
        {
          path: 'multiple-copy/:data',
          name: 'NewsTemplateMultipleCopy',
          component: NewsTemplateMultipleCopy,
          props: true,
          meta: {
            JPName: 'コピー',
            isMenu: false,
            back: {
              router: { name: 'NewsTemplateList' },
            },
          },
        },
      ],
    },
    {
      path: 'teacher',
      component: RouterView,
      name: 'NewsTeacherIndex',
      redirect: { name: 'NewsTeacherList' },

      meta: {
        JPName: '講師連絡',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: NewsTeacherList,
          name: 'NewsTeacherList',
          meta: {
            JPName: '講師連絡',
            isMenu: false,
          },
        },
        {
          path: 'detail',
          component: NewsTeacherDetail,
          name: 'NewsTeacherDetail',
          meta: {
            JPName: '詳細',
            isMenu: false,
            back: {
              router: { name: 'NewsTeacherList' },
            },
          },
        },
        {
          path: 'create',
          component: NewsTeacherCreate,
          name: 'NewsTeacherCreate',
          meta: {
            JPName: '作成',
            isMenu: false,
            back: {
              router: { name: 'NewsTeacherList' },
            },
          },
        },
        {
          path: ':id',
          component: NewsTeacherCreate,
          name: 'NewsTeacherEdit',
          props: true,
          meta: {
            JPName: '編集',
            isMenu: false,
            back: {
              router: { name: 'NewsTeacherList' },
            },
          },
        },
      ],
    },

    {
      path: 'teacher-template',
      component: RouterView,
      name: 'NewsTeacherTemplateListIndex',
      redirect: { name: 'NewsTeacherTemplateList' },

      meta: {
        JPName: '講師連絡テンプレート',
        isMenu: true,
      },
      children: [
        {
          path: 'list',
          component: NewsTeacherTemplateList,
          name: 'NewsTeacherTemplateList',
          meta: {
            JPName: '講師連絡テンプレート',
            isMenu: false,
          },
        },
        {
          path: 'create',
          component: NewsTeacherTemplateCreate,
          name: 'NewsTeacherTemplateCreate',
          meta: {
            JPName: '作成',
            isMenu: false,
            back: {
              router: { name: 'NewsTeacherTemplateList' },
            },
          },
        },

        {
          path: 'multipleCopy/:id',
          component: NewsTeacherTemplateMultipleCopy,
          name: 'NewsTeacherTemplateMultipleCopy',
          props: true,
          meta: {
            JPName: 'コピー',
            isMenu: false,
            back: {
              router: { name: 'NewsTeacherTemplateList' },
            },
          },
        },
      ],
    },
  ],
};
