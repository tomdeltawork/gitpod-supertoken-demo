#!/bin/bash

# 定義變量
PORTAINER_COMPOSE_PATH="/workspace/gitpodwork/portainer/docker-compose.yaml"

# 切換到包含 docker-compose.yaml 文件的目錄
cd /workspace/gitpodwork/portainer || exit 1  # 如果目錄不存在，則退出

# 啟動 Docker Compose
docker-compose -f "$PORTAINER_COMPOSE_PATH" up -d

# 打印提示訊息
echo "Portainer has been started."

# 建立 docker network
docker network create web

