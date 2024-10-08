<template>
    <div class="container d-flex justify-content-center align-items-start min-vh-100">
      <div class="card shadow-lg" style="max-width: 400px; width: 100%;">
        <div class="card-body">
          <h6 class="text-center mb-4">Is the transmission of confidential information allowed?</h6>
          <form @submit.prevent="login">
            <div class="d-flex justify-content-start align-items-center">
              <button type="button" class="btn btn-primary w-50 me-2" @click="redirectToTarget()">Yes</button>
              <button type="button" class="btn btn-outline-secondary w-50">No</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  <script>
  import Session from 'supertokens-web-js/recipe/session';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  import { UserRoleClaim } from "supertokens-web-js/recipe/userroles";
  
  export default {
  
    setup() {
      const route = useRoute();  // 用來獲取路由資訊
      const redirectUrl = ref(null);  // 用來存放 URL 參數
      const countdown = ref(10);   // 初始化倒數計時秒數
      const loading = ref(false);  
      const error = ref(null);  
      const email = ref(null); 
      const role = ref(null);  
      const result = ref(null);  
      const redirectToTarget = () => {
        window.location.assign(redirectUrl.value);
      };
      onMounted(async () => {
  
        
  
        console.log("inner onMounted");
        let jwt = "";
        if (await Session.doesSessionExist()) {
              let userId = await Session.getUserId();
              jwt = await Session.getAccessToken();
              console.log("jwt: " + jwt)
        }
  
        if (await Session.doesSessionExist()) {
          let roles = await Session.getClaimValue({claim: UserRoleClaim});
          role.value = roles[0];
        }
  
        try {
          // 發起請求
          console.log("call get user info api ");
          const apiDomain = import.meta.env.VITE_API_DOMAIN;
          const response = await axios.get(apiDomain + '/authentication-backend/self/user', {
            headers: {
              Authorization: `Bearer ${jwt}`, // 将 sAccessToken 附加到 Authorization header
            },
          });
          result.value = response.data; // 将返回的数据保存到组件的状态中
          email.value = response.data.userInfo.emails[0];
        } catch (err) {
          console.log("err: " + err);
          error.value = 'Failed to load data.'; // 处理错误
        } finally {
          loading.value = false;
        }
        if(route.query.redirect_url){
           
          // 在組件掛載時從 URL 中提取 query 參數
            
            // 取得當前 URL
            const currentUrl = route.query.redirect_url;
  
            // 分離 URL 中的 hash 和非 hash 部分
            const [baseUrl, hashPart] = currentUrl.split('#');
  
            if(hashPart){
                // 分離 hash 中的 path 和 query 部分
                const [path, queryString] = hashPart.split('?');
  
                // 將原本的 query string 轉換為 URLSearchParams 物件
                const queryParams = new URLSearchParams(queryString);
  
                // 添加新的 query 參數
                queryParams.set('access_token', jwt);
  
                // 重組新的 URL
                redirectUrl.value  = `${baseUrl}#${path}?${queryParams.toString()}`;
              }else{
                // 創建一個新的 URL 對象
                const url = new URL(route.query.redirect_url);
  
                // 使用 URLSearchParams 來處理查詢參數
                url.searchParams.set("access_token", jwt);
  
                redirectUrl.value = url.toString() || '';  // 如果參數不存在則設置為空字串
              }
  
            // const interval = setInterval(() => {
            //   countdown.value--;  // 每秒減少倒數計時
            //   if (countdown.value === 0) {
            //     clearInterval(interval);  // 清除計時器
  
            //     // 轉導至另一頁
            //     // window.location.assign(redirectUrl.value);
  
            //     // window.location.assign(route.query.redirect_url);
            //     // router.push({ path: '/another-page' });  // 轉導至另一頁
            //   }
            // }, 1000);  // 每隔 1 秒執行一次
        }
      });
  
      return {
        redirectToTarget,
        countdown,
        redirectUrl,  // 返回給模板使用
        result,
        role,
        email
      };
    }
  };
  </script>
  
  <style scoped>
  body {
    background-color: #f8f9fa;
  }
  
  .container {
    background-color: #ffffff;
  }
  
  .card {
    border-radius: 0.75rem;
    padding: 2rem;
  }
  
  .modal-body i {
    font-size: 3rem;
  }
  
  /* 设置模态框稍微偏上 */
  .modal-dialog-centered {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-height: calc(100% - 1rem);
  }
  
  .modal-content {
    margin-top: 15vh; /* 调整模态框的垂直偏移量 */
  }
  
  /* 使用柔和的颜色 */
  .modal-header.bg-light {
    background-color: #f8f9fa; /* 柔和的背景色 */
  }
  
  .text-warning {
    color: #ffc107 !important; /* 柔和的警告颜色 */
  }
  
  .text-muted {
    color: #6c757d !important; /* 柔和的文字颜色 */
  }
  </style>