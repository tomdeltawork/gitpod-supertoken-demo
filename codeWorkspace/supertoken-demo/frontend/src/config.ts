import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";

export function initSuperTokensUI() {
  (window as any).supertokensUIInit("supertokensui", {
    appInfo: {
      websiteDomain: import.meta.env.VITE_GITPOD_SUPERTOKEN_WEB_URL,
      apiDomain: import.meta.env.VITE_GITPOD_SUPERTOKEN_BACKEND_URL,
      appName: "SuperTokens Demo App",
    },
    recipeList: [
      (window as any).supertokensUIEmailPassword.init(),
      (window as any).supertokensUISession.init(),
    ],
  });
}

export function initSuperTokensWebJS() {
  SuperTokens.init({
    appInfo: {
      appName: "SuperTokens Demo App",
      apiDomain: import.meta.env.VITE_GITPOD_SUPERTOKEN_BACKEND_URL,
    },
    recipeList: [Session.init()],
  });
}
