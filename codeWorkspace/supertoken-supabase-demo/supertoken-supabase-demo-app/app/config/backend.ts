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
                            // the signUpPOST function handles sign up
                            signUpPOST: async function (input) {
                                if (originalImplementation.signUpPOST === undefined) {
                                    throw Error("Should never come here");
                                }

                                let response = await originalImplementation.signUpPOST(input);

                                if (response.status === "OK" && response.user.loginMethods.length === 1 && input.session === undefined) {

                                    // retrieve the accessTokenPayload from the user's session
                                    const accessTokenPayload = response.session.getAccessTokenPayload();

                                    await createUser(
                                        accessTokenPayload.supabase_token, 
                                        response.user.id, 
                                        response.user.emails[0]
                                    );
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


async function createUser(
    access_token: string,
    user_id: string,
    email: string
  ) {
    console.log("access_token: " + access_token);
    console.log("user_id: " + user_id);
    console.log("email: " + email);
  
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  
    try {
      const response = await fetch(supabaseUrl + '/rest/v1/Users', {
        method: 'POST',
        headers: {
          'Apikey': supabaseAnonKey || '',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + access_token
        },
        body: JSON.stringify({
          user_id: user_id,
          email: email
        })
      });
  
      // 檢查響應是否有內容
      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
  
        // 確保響應是 JSON 格式，並且有內容
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('User created:', data);
        } else {
          console.log('Response has no JSON body.');
        }
      } else {
        console.error('Error creating user:', response.statusText);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }