import { createRouter, createWebHistory } from 'vue-router';
import { StorageKeys } from '@/constants';

import { routes } from './routerMap';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  const urlParams = new URLSearchParams(location.search);
  const urlToken = urlParams.get(StorageKeys.urlToken);
  if (urlToken) {
    localStorage.setItem(StorageKeys.accessToken, urlToken);
  }
  const isAuthenticated = localStorage.getItem(StorageKeys.accessToken);
  const email = localStorage.getItem(StorageKeys.email);
  if (
    to.name !== 'Login' &&
    !(isAuthenticated && email?.endsWith(`@poper.co`))
  ) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
