import { createApp } from 'vue';
import router from './router';
import App from './App.vue';
import '@/styles';
import { createPinia } from 'pinia';
import VueDOMPurifyHTML from 'vue-dompurify-html';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(VueDOMPurifyHTML);
app.mount('#app');
