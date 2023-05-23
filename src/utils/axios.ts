import type { AxiosInstance } from 'axios';
import axios from 'axios';

import router from '@/router';
import { isFunction, isString } from '@vueuse/core';
export const baseURL = import.meta.env.PROD
  ? VITE_API_PREFIX
  : ((import.meta.env.VITE_API_PREFIX || '') as string);
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-type': 'application/json',
  },
  timeout: 20000,
});

enum Codes {
  OK = 200,
  Unauthorized = 401,
}

apiClient.interceptors.request.use(
  (config) => {
    // 获取 token
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (err) => {
    // 如果需要的话，可以在这里对失败接口进行重试请求
    console.log('err.response.status', err.response);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('response.status', response.status);

    if (response.status === Codes.OK) {
      return Promise.resolve(response.data);
    }
    return Promise.reject();
  },
  async (error) => {
    console.error('error', error.config, error.response); // 这里可以拿到失败的接口信息
    const isTimeout =
      error?.code === 'ECONNABORTED' && error?.message.includes('timeout');
    if (isTimeout) {
      ElMessage.error({
        message: `backend-api ${error.message}`,
        grouping: true,
      });
      return Promise.reject();
    }
    if (error?.message === 'Network Error') {
      ElMessage.error({
        message: `${error.message}`,
        grouping: true,
      });
      return Promise.reject();
    }

    const { status, data } = error.response;
    if (status === Codes.Unauthorized) {
      // TODO: 更新为 refreshToken，重试请求
      await ElMessage({
        type: 'error',
        message: '認証情報と一致するレコードがありません。',
        duration: 500,
        grouping: true,
      });
      router.push({ name: 'Login' });
    } else if (status > 500) {
      ElMessage.error({
        message: '不明なエラーが発生しました',
        grouping: true,
      });
      return Promise.reject();
    } else {
      const responseData = isString(data) ? JSON.parse(data) : data;

      const { errors = {}, message } = responseData;

      if (
        error.config.customErrorCb &&
        isFunction(error.config.customErrorCb)
      ) {
        // custom your error callback by config customErrorCb
        error.config.customErrorCb({ errors, message });
      } else {
        const errorMsg = Object.entries(errors).reduce(
          (last, [_key, value]) => {
            return `${last}${value}\n`;
          },
          ''
        );
        ElMessage.error({
          message: errorMsg || message || error.message,
          grouping: true,
        });
      }
      return Promise.reject({ message, errors });
    }
  }
);

export { apiClient, Codes };
