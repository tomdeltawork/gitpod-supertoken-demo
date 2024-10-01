#!/bin/bash

DIRECTORY="/workspace/gitpod-supertoken-demo/docker-data/supertokens/postgres/pg_tblspc"

# 檢查資料夾是否存在
if [ ! -d "$DIRECTORY" ]; then
  echo "資料夾 $DIRECTORY 不存在，正在建立..."
  mkdir -p "$DIRECTORY"
else
  echo "資料夾 $DIRECTORY 已存在"
fi

# 定義變量
PORTAINER_COMPOSE_PATH="/workspace/gitpod-supertoken-demo/portainer/docker-compose.yaml"
#SUPERTOKEN_COMPOSE_PATH="/workspace/gitpod-supertoken-demo/docker-data/portainer/compose/1/docker-compose.yaml"

# 建立 docker network
docker network create web

# 啟動 Docker Compose
docker-compose -f "$PORTAINER_COMPOSE_PATH" up -d
#docker-compose -f "$SUPERTOKEN_COMPOSE_PATH" up -d

# 等待一段時間讓伺服器啟動完成
echo "Wait 15 seconds..."
sleep 15


# 啟動supertoken docker compose
# 定義 Portainer API 信息
PORTAINER_URL="http://localhost:9000"
USERNAME="admin"
PASSWORD="1qaz2wsx3edc"
STACK_ID="1"
ENDPOINT_ID="2"

# 獲取 API Token
TOKEN=$(curl -s -X POST "$PORTAINER_URL/api/auth" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}" | jq -r '.jwt')

# 檢查是否成功獲取到 token
if [ -z "$TOKEN" ]; then
    echo "Failed to retrieve JWT token"
    exit 1
fi

echo "Successfully retrieved JWT token"

# 停止 Docker 堆疊
curl -s -X POST "$PORTAINER_URL/api/stacks/$STACK_ID/stop?endpointId=$ENDPOINT_ID" \
    -H "Authorization: Bearer $TOKEN"

# 啟動 Docker 堆疊，並添加 endpointId 參數
START_RESPONSE=$(curl -s -X POST "$PORTAINER_URL/api/stacks/$STACK_ID/start?endpointId=$ENDPOINT_ID" \
    -H "Authorization: Bearer $TOKEN")

# 檢查是否成功啟動堆疊
if [ "$START_RESPONSE" == "null" ]; then
    echo "Docker stack started successfully"
else
    echo "Failed to start Docker stack: $START_RESPONSE"
fi

# 用於啟動supertoken*************************************************

# 解析 workspace-id 和 region
# 從 URL 中去除 https:// 和 .gitpod.io 並提取 workspace-id 和 region
GITPOD_WORKSPACE_ID=$(echo $GITPOD_WORKSPACE_URL | sed -E 's/https:\/\/(.*)\..*\.gitpod\.io/\1/')
GITPOD_REGION=$(echo $GITPOD_WORKSPACE_URL | sed -E 's/https:\/\/.*\.(.*)\.gitpod\.io/\1/')

# 動態設置 <port>，可以修改這裡為你所需要的端口
GITPOD_SUPERTOKEN_BACKEND_PORT=3001  # 這裡設置為你希望使用的端口，例如 3001
GITPOD_SUPERTOKEN_WEB_PORT=3000
# 拼接新的 URL
GITPOD_SUPERTOKEN_BACKEND_URL="https://${GITPOD_SUPERTOKEN_BACKEND_PORT}-${GITPOD_WORKSPACE_ID}.${GITPOD_REGION}.gitpod.io"
GITPOD_SUPERTOKEN_WEB_URL="https://${GITPOD_SUPERTOKEN_WEB_PORT}-${GITPOD_WORKSPACE_ID}.${GITPOD_REGION}.gitpod.io"

# 輸出結果
echo "GITPOD_SUPERTOKEN_BACKEND_URL: ${GITPOD_SUPERTOKEN_BACKEND_URL}"
echo "GITPOD_SUPERTOKEN_WEB_URL: ${GITPOD_SUPERTOKEN_WEB_URL}"

# 設定 .env.development 文件的路徑
ENV_FILE_PATH="/workspace/gitpod-supertoken-demo/codeWorkspace/supertoken-demo/frontend/.env.development"

# 檢查 .env.development 文件是否存在，沒有則創建
if [ ! -f "$ENV_FILE_PATH" ]; then
  touch "$ENV_FILE_PATH"
  echo "創建了 .env.development 文件"
fi

# 強制更新 VITE_GITPOD_SUPERTOKEN_BACKEND_URL
if grep -q "VITE_GITPOD_SUPERTOKEN_BACKEND_URL" "$ENV_FILE_PATH"; then
  # 如果變量已存在，使用 sed 替換
  sed -i "s|^VITE_GITPOD_SUPERTOKEN_BACKEND_URL=.*|VITE_GITPOD_SUPERTOKEN_BACKEND_URL=\"$GITPOD_SUPERTOKEN_BACKEND_URL\"|" "$ENV_FILE_PATH"
  echo "已更新 VITE_GITPOD_SUPERTOKEN_BACKEND_URL"
else
  # 如果變量不存在，則追加
  echo "VITE_GITPOD_SUPERTOKEN_BACKEND_URL=\"$GITPOD_SUPERTOKEN_BACKEND_URL\"" >> "$ENV_FILE_PATH"
  echo "已添加 VITE_GITPOD_SUPERTOKEN_BACKEND_URL"
fi

# 強制更新 VITE_GITPOD_SUPERTOKEN_WEB_URL
if grep -q "VITE_GITPOD_SUPERTOKEN_WEB_URL" "$ENV_FILE_PATH"; then
  # 如果變量已存在，使用 sed 替換
  sed -i "s|^VITE_GITPOD_SUPERTOKEN_WEB_URL=.*|VITE_GITPOD_SUPERTOKEN_WEB_URL=\"$GITPOD_SUPERTOKEN_WEB_URL\"|" "$ENV_FILE_PATH"
  echo "已更新 VITE_GITPOD_SUPERTOKEN_WEB_URL"
else
  # 如果變量不存在，則追加
  echo "VITE_GITPOD_SUPERTOKEN_WEB_URL=\"$GITPOD_SUPERTOKEN_WEB_URL\"" >> "$ENV_FILE_PATH"
  echo "已添加 VITE_GITPOD_SUPERTOKEN_WEB_URL"
fi


# 初始化supertoken專案
cd //workspace/gitpod-supertoken-demo/codeWorkspace/supertoken-demo/backend || exit 1  # 如果目錄不存在，則退出
npm i

cd //workspace/gitpod-supertoken-demo/codeWorkspace/supertoken-demo/frontend || exit 1  # 如果目錄不存在，則退出
npm i

# 切換到目錄
cd //workspace/gitpod-supertoken-demo/codeWorkspace/supertoken-demo || exit 1  # 如果目錄不存在，則退出
npm run start

# 打印提示訊息
echo "env has been started."


