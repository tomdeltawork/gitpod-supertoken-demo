import express from "express";
import cors from "cors";
import supertokens from "supertokens-node";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import { middleware, errorHandler, SessionRequest } from "supertokens-node/framework/express";
import { getWebsiteDomain, SuperTokensConfig } from "./config";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import Session from "supertokens-node/recipe/session";
import UserRoles from "supertokens-node/recipe/userroles";

import dotenv from 'dotenv';
console.log(`process.env:  ${process.env.NODE_ENV}`)

supertokens.init(SuperTokensConfig);

const app = express();
app.use(express.json());

app.use(
    cors({
        origin: function (origin, callback) {
            // 如果沒有 `origin`，代表是同源請求，允許通過
            if (!origin) return callback(null, true);
        
            // 檢查來源是否是 gitpod.io 的子域名
            // const originPattern = /\.gitpod\.io$/;
            const originPatternString = process.env.ORIGIN_PATTERN || '^https?:\/\/([a-zA-Z0-9-]+\.)*gitpod\.io$';
            const originPattern = new RegExp(originPatternString);

         
            if (originPattern.test(origin)) {
                // 如果來源是 .gitpod.io 子域名，允許跨域請求
                callback(null, true);
            } else {
                // 如果不允許的來源，返回錯誤
                callback(new Error('Not allowed by CORS'));
            }
        },
        allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
        methods: ["GET", "PUT", "POST", "DELETE", 'PATCH', 'OPTIONS'],
        credentials: true,
    })
);

app.use((req, res, next) => {
    let origin = "";
    if (req.headers.origin !== undefined) {
        origin = req.headers.origin;
    }

    // 使用正則表達式來匹配允許的子域名
    const originPatternString = process.env.ORIGIN_PATTERN || '^https?:\/\/([a-zA-Z0-9-]+\.)*gitpod\.io$';
    const originPattern = new RegExp(originPatternString);

    
    if (originPattern.test(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    
    next();
});



// // 處理所有的 OPTIONS 請求
// app.options('*', (req, res) => {
//     res.set({
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//         'Access-Control-Allow-Headers': 'Authorization, Content-Type',
//         'Access-Control-Allow-Credentials': 'true'
//     });
//     res.sendStatus(200); // 返回 HTTP 200 状态码，表示成功
// });

// This exposes all the APIs from SuperTokens to the client.
app.use(middleware());

// 驗證session
app.get("/authentication-backend/self/verifySession", verifySession(), async (req: SessionRequest, res) => {
    let session = req.session;
    res.send({
        sessionHandle: session!.getHandle(),
        userId: session!.getUserId(),
        accessTokenPayload: session!.getAccessTokenPayload(),
    });
});

// 取得jwt
app.get("/authentication-backend/self/jwt", verifySession(), async (req: SessionRequest, res) => {

    let session = req.session;
    let jwt = session!.getAccessToken();
    res.send({
        sessionHandle: session!.getHandle(),
        userId: session!.getUserId(),
        accessTokenPayload: session!.getAccessTokenPayload(),
    });
    res.json({ sAccessToken: jwt })
});


// // This API is used by the frontend to create the tenants drop down when the app loads.
// // Depending on your UX, you can remove this API.
// app.get("/authentication-backend/self/tenants", async (req, res) => {
//     let tenants = await Multitenancy.listAllTenants();
//     res.send(tenants);
// });

// 驗證token
app.post("/authentication-backend/self/verifyToken", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send("Authorization header missing");
        }

        const token = authHeader.split(" ")[1]; // Bearer <token>
        if (!token) {
            return res.status(401).send("Token missing");
        }

        // 建構假請求驗證 token
        req.headers.cookie = `sAccessToken=${token}`;

        console.log("sAccessToken: " + token)

        // 驗證 token
        const session = await Session.getSession(req, res, { sessionRequired: false });

        if (!session) {
            return res.status(401).send("Invalid or expired token");
        }

        res.status(200).send({
            userId: session.getUserId(),
            sessionHandle: session.getHandle(),
            accessTokenPayload: session.getAccessTokenPayload(),
        });
    } catch (err) {
        res.status(401).send("Token verification failed");
    }
});

// 驗證取得使用者資訊
app.get("/authentication-backend/self/user", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send("Authorization header missing");
        }

        const token = authHeader.split(" ")[1]; // Bearer <token>
        if (!token) {
            return res.status(401).send("Token missing");
        }

        // 建構假請求驗證 token
        req.headers.cookie = `sAccessToken=${token}`;

        console.log("sAccessToken: " + token)

        // 驗證 token
        const session = await Session.getSession(req, res, { sessionRequired: false });

        if (!session) {
            return res.status(401).send("Invalid or expired token");
        }

        //取得使用者資訊
        let userId = session.getUserId();
        let userInfo = await supertokens.getUser(userId)
        

        res.status(200).send({
            userInfo: userInfo
        });
    } catch (err) {
        console.log("err: " + err)
        res.status(401).send("Token verification failed");
    }
});

// 登出
app.get("/authentication-backend/self/revokeSession", verifySession(), async (req: SessionRequest, res) => {
    await req.session!.revokeSession();
    res.send("Success! User session revoked");
});

// ana session 驗證
app.get("/authentication-backend/self/ana/session", verifySession(), async (req: SessionRequest, res) => {
    let session = req.session;
    // const resource = req.params.resource;
    const resource = req.query.resource; 
    const axios = require('axios');

    //授權(自定義)
    const accessTokenPayload = session!.getAccessTokenPayload();
    const roles = accessTokenPayload['st-role'].v;
    console.log("accessTokenPayload: " + accessTokenPayload);
    //找不到roles
    if (!roles || roles.length == 0) {
        console.error("找不到roles")
        res.status(403).send('Access Denied'); // 授權失敗，返回403
        return;
    }
    for(let role of roles) {
        const permissionsForRole_response = await UserRoles.getPermissionsForRole(role);
        if (permissionsForRole_response.status === "UNKNOWN_ROLE_ERROR") {
            res.status(403).send('Access Denied'); // 授權失敗，返回403
            return;
        }
        const permissions: string[] = permissionsForRole_response.permissions;
        for(let permission of permissions){
            if(permission == resource) {
                res.send({
                    sessionHandle: session!.getHandle(),
                    userId: session!.getUserId(),
                    accessTokenPayload: session!.getAccessTokenPayload(),
                    accessToken: session!.getAccessToken()
                });
                return;
            }
        }
    }
    console.error("找不到符合permissions")
    res.status(403).send('Access Denied'); // 授權失敗，返回403
});

// ana token by supertoken Authorize 驗證
app.get("/authentication-backend/self/ana/supertoken/token", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const resource = req.query.resource; 

        if (!authHeader) {
            return res.status(401).send("Authorization header missing");
        }

        const token = authHeader.split(" ")[1]; // Bearer <token>
        if (!token) {
            return res.status(401).send("Token missing");
        }

        // 建構假請求驗證 token
        req.headers.cookie = `sAccessToken=${token}`;
        console.log("sAccessToken: " + token)

        // 認證
        const session = await Session.getSession(req, res, { sessionRequired: false });
        if (!session) {
            return res.status(401).send("Invalid or expired token");
        }
     
        // 授權
        const accessTokenPayload = session!.getAccessTokenPayload();
        const roles = accessTokenPayload['st-role'].v;
        console.log("accessTokenPayload: " + accessTokenPayload);
        //找不到roles
        if (!roles || roles.length == 0) {
            console.error("找不到roles")
            res.status(403).send('Access Denied'); // 授權失敗，返回403
            return;
        }
        for(let role of roles) {
            const permissionsForRole_response = await UserRoles.getPermissionsForRole(role);
            if (permissionsForRole_response.status === "UNKNOWN_ROLE_ERROR") {
                res.status(403).send('Access Denied'); // 授權失敗，返回403
                return;
            }
            const permissions: string[] = permissionsForRole_response.permissions;
            for(let permission of permissions){
                if(permission == resource) {
                    res.send({
                        sessionHandle: session!.getHandle(),
                        userId: session!.getUserId(),
                        accessTokenPayload: session!.getAccessTokenPayload(),
                        accessToken: session!.getAccessToken()
                    });
                    return;
                }
            }
        }
        console.error("找不到符合permissions")
        res.status(403).send('Access Denied'); // 授權失敗，返回403

    } catch (err) {
        console.error(err);
        res.status(500).send("server error");
    }
});

// // ana session 驗證
// app.get("/authentication-backend/self/ana/session", verifySession(), async (req: SessionRequest, res) => {
//     let session = req.session;
//     const axios = require('axios');

//     // 獲取 X-Forwarded-Uri 標頭
//     const forwardedUri = req.get('X-Forwarded-Uri');

//     const accessTokenPayload = session!.getAccessTokenPayload();
//     const roles = accessTokenPayload['st-role'].v;
//     console.log("accessTokenPayload: " + accessTokenPayload);

//     // 構建要傳遞給 OPA 的請求數據
//     const input = { 
//         role: roles[0],  // 從請求標頭中提取用戶信息
//         path: forwardedUri,               // 獲取請求的路徑
//         method: req.method            // 獲取請求的 HTTP 方法
//     };


//     const objAsString = JSON.stringify(input);
//     console.log("objAsString: " + objAsString);

//     // // 調用 OPA，進行授權檢查
//     const opaurl = process.env.OPA_URL || '';
//     const response = await axios.post(opaurl, { input });
    

//     // 根據 OPA 返回的結果決定是否允許請求
//     const allowed = response.data.result.allow;
//     if (!allowed) {
//         res.status(403).send('Access Denied'); // 授權失敗，返回403
//     }else{
//         res.send({
//             sessionHandle: session!.getHandle(),
//             userId: session!.getUserId(),
//             accessTokenPayload: session!.getAccessTokenPayload(),
//         });
//     } 
// });

// ana token 驗證
app.post("/authentication-backend/self/ana/token", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send("Authorization header missing");
        }

        const token = authHeader.split(" ")[1]; // Bearer <token>
        if (!token) {
            return res.status(401).send("Token missing");
        }

        // 建構假請求驗證 token
        req.headers.cookie = `sAccessToken=${token}`;
        console.log("sAccessToken: " + token)
        // 認證
        const session = await Session.getSession(req, res, { sessionRequired: false });
        if (!session) {
            return res.status(401).send("Invalid or expired token");
        }
        const accessTokenPayload = session!.getAccessTokenPayload();
        const roles = accessTokenPayload['st-role'].v;
        // console.log("accessTokenPayload: " + accessTokenPayload);

     
        // 授權
        // 構建要傳遞給 OPA 的請求數據
        const axios = require('axios');
        const data = req.body;
        // const dataAsString = JSON.stringify(data);
        // console.log("dataAsString: " + dataAsString);
        const path = data.path
        const method = data.method
        const input = { 
            role: roles[0],  // 從請求標頭中提取用戶信息
            path: path,               // 獲取請求的路徑
            method: method            // 獲取請求的 HTTP 方法
        };


        const objAsString = JSON.stringify(input);
        console.log("objAsString: " + objAsString);

        // // 調用 OPA，進行授權檢查
        const opaurl = process.env.OPA_URL || '';
        const response = await axios.post(opaurl, { input });
        

        // 根據 OPA 返回的結果決定是否允許請求
        const allowed = response.data.result.allow;
        if (!allowed) {
            res.status(403).send('Access Denied'); // 授權失敗，返回403
        }

        res.status(200).send({
            userId: session.getUserId(),
            sessionHandle: session.getHandle(),
            accessTokenPayload: session.getAccessTokenPayload(),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("server error");
    }
});

const apiPort = 3001;
const webUrl = process.env.WEBSITE_URL || 'empty';

console.log(`process.env.WEBSITE_URL:  ${webUrl}`)
app.listen(apiPort, () => console.log(`API Server listening on port ${apiPort}`));