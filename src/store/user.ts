import { defineStore } from 'pinia';
import { StorageKeys } from '@/constants';
import { getUserInfo } from '@/services';
// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
const id = 'user';
export interface IUserState {
  userID?: string | null;
  name?: string;
  email?: string;
  avatar?: string;
  nameKana?: string;
  lastUpdateTime?: number;
}

export const useUserStore = defineStore(id, {
  state: (): IUserState => ({}),
  getters: {
    gName: (state) => state.name || localStorage.getItem(StorageKeys.name),
    gUserID: (state) =>
      state.userID || localStorage.getItem(StorageKeys.userID),
    gAvatar: (state) =>
      state.avatar || (localStorage.getItem(StorageKeys.avatar) as string),
    gNameKana: (state) =>
      state.nameKana || localStorage.getItem(StorageKeys.nameKana),
    gEmail: (state) => state.email || localStorage.getItem(StorageKeys.email),
  },
  actions: {
    setUserID(userID: string) {
      this.userID = userID;
      localStorage.setItem(StorageKeys.userID, userID);
    },
    setUserInfo(userInfo: IUserState) {
      const { userID, name, nameKana, email, avatar } = userInfo;
      if (userID) {
        this.userID = userID;
        localStorage.setItem(StorageKeys.userID, userID);
      }
      if (name) {
        this.name = name;
        localStorage.setItem(StorageKeys.name, name);
      }
      if (nameKana) {
        this.nameKana = nameKana;
        localStorage.setItem(StorageKeys.nameKana, nameKana);
      }
      if (email) {
        this.email = email;
        localStorage.setItem(StorageKeys.email, email);
      }
      if (avatar) {
        this.avatar = avatar;
        localStorage.setItem(StorageKeys.avatar, avatar);
      }
    },
    clearUserID() {
      this.userID = null;
      localStorage.removeItem(StorageKeys.userID);
    },
    clearName() {
      this.name = '';
      this.nameKana = '';
      localStorage.removeItem(StorageKeys.name);
      localStorage.removeItem(StorageKeys.nameKana);
    },
    clearEmail() {
      this.email = '';
      localStorage.removeItem(StorageKeys.email);
    },
    clearAvatar() {
      this.avatar = '';
      localStorage.removeItem(StorageKeys.avatar);
    },
    clearUserInfo() {
      this.clearUserID();
      this.clearName();
      this.clearAvatar();
      this.clearEmail();
    },
    async syncUserInfo() {
      const {
        user_id: userID,
        name,
        name_kana: nameKana,
        email,
        icon_url: avatar,
      } = await getUserInfo();
      this.setUserInfo({ userID, name, nameKana, email, avatar });
      return {
        userID,
        name,
        nameKana,
        avatar,
        email,
      };
    },
  },
});

export const userStore = useUserStore();
