<template>
    <div>
      <!-- <h1>Home Page</h1> -->
      <div>
        <p>{{ userId }} 成功登出</p>
      </div>
    </div>
  </template>
  <script>
  import { onMounted, ref } from 'vue';
  import EmailPassword from 'supertokens-web-js/recipe/emailpassword'
  import Session from 'supertokens-web-js/recipe/session';
  
  export default {
    setup() {
      const userId = ref(""); 
      onMounted(async () => {
        if (await Session.doesSessionExist()) {
              userId.value = await Session.getUserId();
              console.log("userId: " + userId)
              EmailPassword.signOut();
        } 
      });
  
      return {
        userId,
      };
    }
  };
  </script>
  
  <style scoped>
  h1 {
    color: #42b983;
  }
  </style>