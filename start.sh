#!/bin/bash

# 定義變量
#PORTAINER_COMPOSE_PATH="/workspace/gitpod-supertoken-demo/portainer/docker-compose.yaml"
SUPERTOKEN_COMPOSE_PATH="/workspace/gitpod-supertoken-demo/supertokens/docker-compose.yaml"

# 建立 docker network
docker network create web

# 啟動 Docker Compose
#docker-compose -f "$PORTAINER_COMPOSE_PATH" up -d
docker-compose -f "$SUPERTOKEN_COMPOSE_PATH" up -d


cd //workspace/gitpod-supertoken-demo/codeWorkspace/supertoken-demo/backend || exit 1  # 如果目錄不存在，則退出
npm i

cd //workspace/gitpod-supertoken-demo/codeWorkspace/supertoken-demo/frontend || exit 1  # 如果目錄不存在，則退出
npm i

# 切換到目錄
cd //workspace/gitpod-supertoken-demo/codeWorkspace/supertoken-demo || exit 1  # 如果目錄不存在，則退出
npm run start

# 註冊dashboard使用者
#curl --location --request POST 'http://localhost:7007/recipe/dashboard/user' \
#--header 'rid: dashboard' \
#--header 'Content-Type: application/json' \
#--data-raw '{"email": "aitteam@deltaww.com","password": "aitteam666"}'

# 打印提示訊息
echo "env has been started."


