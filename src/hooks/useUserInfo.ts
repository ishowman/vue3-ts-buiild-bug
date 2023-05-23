import { ref } from 'vue';
import { userStore } from '@/store';

// by convention, composable function names start with "use"
export function useUserInfo() {
  // state encapsulated and managed by the composable
  const userInfo = ref();
  // a composable can update its managed state over time.
  userStore.syncUserInfo().then((data) => {
    console.log('syncUserInfo data', data);
    userInfo.value = data;
  });

  // expose managed state as return value
  return userInfo;
}
