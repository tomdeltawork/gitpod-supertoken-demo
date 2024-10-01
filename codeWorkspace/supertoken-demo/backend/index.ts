import express from "express";
import cors from "cors";
import supertokens from "supertokens-node";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import { middleware, errorHandler, SessionRequest } from "supertokens-node/framework/express";
import { getWebsiteDomain, SuperTokensConfig } from "./config";
import Multitenancy from "supertokens-node/recipe/multitenancy";

import dotenv from 'dotenv';
console.log(`process.env:  ${process.env.NODE_ENV}`)

supertokens.init(SuperTokensConfig);

const app = express();

// app.use(
//     cors({
//         origin: getWebsiteDomain(),
//         allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
//         methods: ["GET", "PUT", "POST", "DELETE"],
//         credentials: true,
//     })
// );

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

// This exposes all the APIs from SuperTokens to the client.
app.use(middleware());

// An example API that requires session verification
app.get("/sessioninfo", verifySession(), async (req: SessionRequest, res) => {
    let session = req.session;
    res.send({
        sessionHandle: session!.getHandle(),
        userId: session!.getUserId(),
        accessTokenPayload: session!.getAccessTokenPayload(),
    });
});

// This API is used by the frontend to create the tenants drop down when the app loads.
// Depending on your UX, you can remove this API.
app.get("/tenants", async (req, res) => {
    let tenants = await Multitenancy.listAllTenants();
    res.send(tenants);
});

// In case of session related errors, this error handler
// returns 401 to the client.
app.use(errorHandler());

app.listen(3001, () => console.log(`API Server listening on port 3001`));
