<template>
    <div class="container d-flex justify-content-center align-items-start min-vh-100">
      <div class="card shadow-lg" style="max-width: 400px; width: 100%;">
        <div class="card-body">
          <h3 class="text-center mb-4">Login</h3>
          <form @submit.prevent="login">
            <div class="mb-3 d-flex flex-column align-items-start">
              <label for="email" class="form-label">Email</label>
              <input
                type="text"
                class="form-control"
                id="email"
                v-model="email"
                required
                placeholder="Enter your email"
              />
            </div>
            <div class="mb-3 d-flex flex-column align-items-start">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="password"
                required
                placeholder="Enter your password"
              />
            </div>
            <div class="d-flex justify-content-start align-items-center">
              <button type="submit" class="btn btn-primary w-50 me-2" @click="signIn()">Login</button>
              <button type="reset" class="btn btn-outline-secondary w-50">Clear</button>
            </div>
          </form>
        </div>
      </div>
      <!-- Modal -->
      <div
        class="modal fade"
        ref="errorMsgModal"
        tabindex="-1"
        aria-labelledby="errorModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content">
            <div class="modal-header bg-light text-muted">
              <h5 class="modal-title" id="errorModalLabel">
                Error
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
              <i class="bi bi-exclamation-triangle-fill text-warning"></i>
              <p class="mt-3 text-muted">
                The username or password you entered is incorrect. Please try again.
              </p>
            </div>
            <div class="modal-footer justify-content-center">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
  import EmailPassword from 'supertokens-web-js/recipe/emailpassword'
  import { useRoute } from 'vue-router';
  import { onMounted, ref } from 'vue';
  
  
  export default {
    data() {
      return {
          errorMsgModal: null,
          // we allow the user to switch between sign in and sign up view
          isSignIn: true,
  
          // this will store the email and password entered by the user.
          email: "",
          password: "",
  
          // any generic error states
          error: false,
          errorMessage: "Something went wrong",
  
          // any error states specific to the input fields.
          emailError: "",
          passwordError: "",
      };
    },
    mounted() {
      // 使用 setTimeout 确保 DOM 加载完成后再初始化
      this.$nextTick(() => {
        EmailPassword.signOut();
        
        this.errorMsgModal = new bootstrap.Modal(this.$refs.errorMsgModal, {
          backdrop: true, // 配置 backdrop (true, false, 'static')
          keyboard: true,
        });
      });
    },
    methods: {
      openModal() {
        // 打開模態窗口
        this.errorMsgModal.show();
      },
      async signIn(){
        console.log("inner signIn");
        const response = await EmailPassword.signIn({
            formFields: [
                {
                    id: "email",
                    value: this.email,
                },
                {
                    id: "password",
                    value: this.password,
                },
            ],
        });
        if (response.status === "WRONG_CREDENTIALS_ERROR") {
            // the input email / password combination did not match,
            // so we show an appropriate error message to the user
            this.errorMessage = "Invalid credentials";
            this.error = true;
            this.openModal();
            return;
        }
        if (response.status === "FIELD_ERROR") {
            response.formFields.forEach((item) => {
                if (item.id === "email") {
                    // this means that something was wrong with the entered email.
                    // probably that it's not a valid email (from a syntax point of view)
                    this.emailError = item.error;
                } else if (item.id === "password") {
                    this.passwordError = item.error;
                }
            });
            this.openModal();
            return;
        }
  
        // 取得 URL 中的 redirect_url 參數
        const route = this.$route;
        const redirect_url = route.query.redirect_url;
  
        // 使用 $router.push() 將查詢參數傳遞給 /home
        this.$router.push({
          path: '/home',
          query: { redirect_url: redirect_url }
        });
  
  
        // 檢查是否為空或未定義
        // if (!redirect_url) {
        //   alert('login success');
        // } else {
        //   console.log('Redirect URL:', redirect_url);
        //   window.location.assign(redirect_url);
        // }
        // login is successful, and we redirect the user to the home page.
        // Note that session cookies are added automatically and nothing needs to be
        // done here about them.
        //window.location.assign("/");
      }
    }
  }
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