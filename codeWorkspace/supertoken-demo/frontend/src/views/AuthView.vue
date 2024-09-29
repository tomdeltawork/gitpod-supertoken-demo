<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from "vue";
import { initSuperTokensUI } from "../config";

export default defineComponent({
  setup() {
    const loadScript = (src: string) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      script.id = "supertokens-script";
      script.onload = () => {
        initSuperTokensUI();
      };
      document.body.appendChild(script);
    };

    onMounted(() => {
      loadScript("https://cdn.jsdelivr.net/gh/supertokens/prebuiltui@v0.47.1/build/static/js/main.ba50d5ee.js");
    });

    onUnmounted(() => {
      const script = document.getElementById("supertokens-script");
      if (script) {
        script.remove();
      }
    });
  },
});
</script>

<template>
  <div id="supertokensui" />
</template>
