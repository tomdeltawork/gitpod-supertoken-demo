import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session from "supertokens-node/recipe/session";
import { TypeInput } from "supertokens-node/types";
import Dashboard from "supertokens-node/recipe/dashboard";
import UserRoles from "supertokens-node/recipe/userroles";
const path = require('path');
const { authenticateWithLDAP } = require("./ldapAuth");

const env = process.env.NODE_ENV || 'empty';

import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

export function getApiDomain() {
    const apiUrl = process.env.API_URL || `empty`;
    console.log(`apiUrl: ${apiUrl}`)
    return apiUrl;
}

export function getWebsiteDomain() {
    const websiteUrl = process.env.WEBSITE_URL || `empty`;
    console.log(`websiteUrl: ${websiteUrl}`)
    return websiteUrl;
}

const connectionURI: string = process.env.CONNECTION_URI ?? '';
export const SuperTokensConfig: TypeInput = {
    supertokens: {
        // this is the location of the SuperTokens core.
        connectionURI: connectionURI,
        
    },
    appInfo: {
        appName: "SuperTokens Demo App",
        apiDomain: getApiDomain(),
        websiteDomain: getWebsiteDomain(),
    },
    // recipeList contains all the modules that you want to
    // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
    recipeList: [
        EmailPassword.init({
            override: {
                apis: (originalImplementation) => {
                    return {
                        ...originalImplementation,
                        async signInPOST(input) {
                            console.log("inner signInPOST")
                            const email = input.formFields.find(field => field.id === "email")?.value || "";
                            const password = input.formFields.find(field => field.id === "password")?.value || "";
                            const fake_password = "delta666";

                            // LDAP 驗證
                            const isValid = await authenticateWithLDAP(email, password);
                            if (!isValid) {
                                return {
                                    status: "WRONG_CREDENTIALS_ERROR",
                                };
                            }

                       
                          const tenantId = input.tenantId;  
                          const options = input.options;
                          const userContext = input.userContext || {};  

                          // call emailExistsGET 
                          if (originalImplementation.emailExistsGET) {
                                const emailExistsResult = await originalImplementation.emailExistsGET({
                                    email,
                                    tenantId,
                                    options,
                                    userContext,
                                });

                                if (emailExistsResult.status === "OK") {
                                    if (emailExistsResult.exists == true) {
                                        console.log("Email exists in the system.");
                                    } else {
                                        console.log("Email does not exist in the system.");
                                        if (originalImplementation.signUpPOST) {

                                            // 使用假密碼新增資料至管理介面
                                            const signUpResult = await originalImplementation.signUpPOST({
                                                formFields: [
                                                    { id: "email", value: email },
                                                    { id: "password", value: fake_password }
                                                ],
                                                session: undefined,
                                                tenantId,
                                                options,
                                                userContext,
                                            });

                                            
                                        } 
                                    }
                                }
                            } 

                           
                            if (originalImplementation.signInPOST) {
                                const passwordField = input.formFields.find(field => field.id === "password");
                                if (passwordField) passwordField.value = fake_password; 
                                    
                                console.log("login success");
                                const login_result = await originalImplementation.signInPOST(input);

                                console.log("login_result get success");
                                return login_result;
                            } else {
                                return {
                                    status: "GENERAL_ERROR",
                                    message: "signInPOST method is not defined",
                                };
                            }
                        },
                    };
                },
            },
        }),
        Session.init({
            cookieSecure: true,
            cookieDomain: process.env.COOKIE_DOMAIN,
            cookieSameSite: "none",
            exposeAccessTokenToFrontendInCookieBasedAuth: true,
        }),
        Dashboard.init(),
        UserRoles.init()
    ],
};
