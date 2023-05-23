<template>
  <div class="login-page">
    <el-form
      ref="form"
      :model="loginForm"
      label-width="0"
      class="w-96 mx-auto"
      size="large"
      @submit="$event.preventDefault()"
    >
      <img
        :src="logo"
        alt="Comiru Admin Plus"
        class="w-full mt-[120px] mb-10"
      />
      <el-form-item prop="mail" class="mb-[24px]" :error="error.mail">
        <el-input
          v-model.trim="loginForm.mail"
          placeholder="メールアドレス"
          clearable
        >
          <template #prefix>
            <c-icon-font
              :height="ButtonIconHeight.default"
              name="icon-massage"
              color="var(--el-text-color-regular)"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password" class="mb-[24px]" :error="error.password">
        <el-input
          v-model.trim="loginForm.password"
          type="password"
          placeholder="パスワード"
          clearable
        >
          <template #prefix>
            <c-icon-font
              :height="ButtonIconHeight.default"
              name="icon-lock"
              color="var(--el-text-color-regular)"
            />
          </template>
        </el-input>
      </el-form-item>

      <el-button
        :loading="isLoading"
        type="primary"
        class="w-full block"
        native-type="submit"
        @click="login"
      >
        ログイン
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, toRefs } from 'vue';
  import { ElForm } from 'element-plus';
  import { isMail } from '@/utils';
  import { loginApi } from '@/services';
  import { useRouter } from 'vue-router';
  import { authStore, userStore } from '@/store';
  import logo from '@/assets/logo-black.png';
  import { ButtonIconHeight } from '@/constants';
  const error = reactive({
    mail: '',
    password: '',
  });

  const isLoading = ref(false);

  const form = ref<InstanceType<typeof ElForm>>();

  const loginForm = reactive({
    mail: '',
    password: '',
  });
  const router = useRouter();

  async function login() {
    const isValid = isValidForm();
    if (!isValid) {
      return;
    }
    const { mail, password } = toRefs(loginForm);
    try {
      isLoading.value = true;
      const data = await loginApi({
        email: mail.value,
        password: password.value,
      });
      if (data) {
        const {
          user_id: userID,
          access_token: accessToken,
          refresh_token: refreshToken,
          name,
          name_kana: nameKana,
          email,
          icon_url: avatar,
        } = data;

        authStore.setToken(accessToken, refreshToken);
        userStore.setUserInfo({
          userID,
          name,
          nameKana,
          email,
          avatar,
        });

        router.push({ path: '/' });
      }
    } finally {
      isLoading.value = false;
    }
  }

  function isValidForm() {
    const mail = loginForm.mail;
    const isValidMail = mail && isMail(mail) && mail.endsWith(`@poper.co`);
    const isValidPsd = loginForm.password;
    error.mail = isValidMail ? '' : '有効なメールアドレスを入力してください';
    error.password = isValidPsd ? '' : '有効なパスワードを入力してください';
    return isValidMail && isValidPsd;
  }
</script>

<style>
  /* TODO: bugfix */
  .el-form-item__error {
    color: var(--el-color-danger);
  }
</style>
