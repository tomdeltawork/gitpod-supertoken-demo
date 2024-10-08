<template>
  <div class="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center">
    <h1 class="display-1 fw-bold">403</h1>
    <p class="fs-3"> <span class="text-danger">Forbidden!</span></p>
    <p class="lead">
      Access Denied! You do not have permission to view this page.
    </p>
    <router-link to="/login" class="btn btn-warning">Login</router-link>
  </div>
</template>

<script>
export default {
  name: 'Forbidden',
};
</script>

<style scoped>
  .vh-100 {
    height: 100vh;
  }
</style>