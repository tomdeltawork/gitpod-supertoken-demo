// import EmailPasswordNode from "supertokens-node/recipe/emailpassword";
import SessionNode from "supertokens-node/recipe/session";
import Dashboard from "supertokens-node/recipe/dashboard";
import UserRoles from "supertokens-node/recipe/userroles";
import { appInfo } from "./appInfo";
import { TypeInput } from "supertokens-node/types";
import SuperTokens from "supertokens-node";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import jwt from "jsonwebtoken";
import { getSupabase } from '../utils/supabase';

let supabase_signing_secret = process.env.SUPABASE_SIGNING_SECRET || "TODO: Your Supabase Signing Secret";
// let getSupabase: any;
export let backendConfig = (): TypeInput => {
    return {
        supertokens: {
            // this is the location of the SuperTokens core.
            connectionURI: process.env.NEXT_PUBLIC_CONNECTION_URI || `empty`,
        },
        appInfo,
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


                                if (originalImplementation.signInPOST) {
                                    const passwordField = input.formFields.find(field => field.id === "password");
                                    if (passwordField) passwordField.value = password; 
                                        
                                    console.log("login success");
                                    const login_result = await originalImplementation.signInPOST(input);

                                    if(login_result.status == 'OK'){
                                        const supabase = getSupabase(login_result.session.getAccessTokenPayload().supabase_token);
                                        debugger;
                                        const { data, error } = await supabase
                                        .from('test')
                                        .select('*');  // 查詢所有欄位的資料
                                        debugger;
                                        if (error) {
                                            console.error('Error fetching users:', error);
                                        } else {
                                            console.log('Users:', data);  // `data` 包含 `users` 表中的所有記錄
                                        }
                                    }

                                    
                                    

    
                                    console.log("login_result get success");
                                    return login_result;
                                } else {
                                    return {
                                        status: "GENERAL_ERROR",
                                        message: "signInPOST method is not defined",
                                    };
                                }
                            },
                            // the signUpPOST function handles sign up
                            signUpPOST: async function (input) {
                                if (originalImplementation.signUpPOST === undefined) {
                                    throw Error("Should never come here");
                                }

                                let response = await originalImplementation.signUpPOST(input);

                                if (response.status === "OK" && response.user.loginMethods.length === 1 && input.session === undefined) {

                                    // retrieve the accessTokenPayload from the user's session
                                    const accessTokenPayload = response.session.getAccessTokenPayload();

                                    // create a supabase client with the supabase_token from the accessTokenPayload
                                    const supabase = getSupabase(accessTokenPayload.supabase_token);

                                    // store the user's email mapped to their userId in Supabase
                                    const { error } = await supabase
                                        .from("users")
                                        .insert({ email: response.user.emails[0], user_id: response.user.id });

                                    if (error !== null) {
                                        console.error("supabase insert error : " + error);
                                        throw error;
                                    }
                                }

                                return response;
                            },
                        };
                    },
                },
            }), 
            SessionNode.init({
                override: {
                    functions: (originalImplementation) => {
                        return {
                            ...originalImplementation,
                            // We want to create a JWT which contains the users userId signed with Supabase's secret so
                            // it can be used by Supabase to validate the user when retrieving user data from their service.
                            // We store this token in the accessTokenPayload so it can be accessed on the frontend and on the backend.
                            createNewSession: async function (input) {
                                const payload = {
                                    userId: input.userId,
                                    exp: Math.floor(Date.now() / 1000) + 60 * 60,
                                };

                                const supabase_jwt_token = jwt.sign(payload, supabase_signing_secret);

                                input.accessTokenPayload = {
                                    ...input.accessTokenPayload,
                                    supabase_token: supabase_jwt_token,
                                };

                                return await originalImplementation.createNewSession(input);
                            },
                        };
                    },
                },
            }),
            Dashboard.init(), 
            UserRoles.init()
        ],
        isInServerlessEnv: true,
        framework: "custom",
    };
};

let initialized = false;
export function ensureSuperTokensInit() {
    if (!initialized) {
        SuperTokens.init(backendConfig());
        initialized = true;
    }
}
