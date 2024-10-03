#!/bin/bash

# 用於啟動supertoken*************************************************
# 初始化supertoken專案
cd //workspace/gitpod-supertoken-demo/codeWorkspace/supertoken-supabase-demo/supertoken-supabase-demo-app || exit 1  # 如果目錄不存在，則退出
npm i

npm run dev