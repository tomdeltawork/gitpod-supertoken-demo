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

# 建立 docker network
docker network create web

# 啟動 Docker Compose
docker-compose -f "$PORTAINER_COMPOSE_PATH" up -d

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


