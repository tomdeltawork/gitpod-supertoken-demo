<template>
  <div class="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center">
    <h1 class="display-1 fw-bold">401</h1>
    <p class="fs-3"> <span class="text-danger">Unauthorized!</span></p>
    <p class="lead">
      Oops! You are not authorized to access this page.
    </p>
    <router-link to="/login" class="btn btn-warning">Login</router-link>
  </div>
</template>

<script>
export default {
  name: 'Unauthorized',
};
</script>

<style scoped>
  .vh-100 {
    height: 100vh;
  }
</style>