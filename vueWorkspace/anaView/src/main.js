import { createApp } from 'vue'
import App from './App.vue'

// 引入 Bootstrap CSS 和 JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword'

// 取得環境變數
const apiDomain = import.meta.env.VITE_API_DOMAIN;
console.log('API Domain:', apiDomain);

SuperTokens.init({
    appInfo: {
        apiDomain: apiDomain,
        apiBasePath: "/authentication-backend",
        appName: "anaView",
    },
    recipeList: [
        Session.init(),
        EmailPassword.init(),
    ],
});

import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')