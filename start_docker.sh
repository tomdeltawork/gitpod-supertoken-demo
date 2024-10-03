#!/bin/bash

SUPERTOKEN_DB_DIRECTORY="/workspace/gitpod-supertoken-demo/docker-data/supertokens/postgres/pg_tblspc"
SUPABASE_DB_DIRECTORY="/workspace/gitpod-supertoken-demo/docker-data/supabase/volumes/db/data/pg_tblspc"


# 檢查資料夾是否存在
if [ ! -d "$SUPERTOKEN_DB_DIRECTORY" ]; then
  echo "資料夾 $SUPERTOKEN_DB_DIRECTORY 不存在，正在建立..."
  mkdir -p "$SUPERTOKEN_DB_DIRECTORY"
else
  echo "資料夾 $SUPERTOKEN_DB_DIRECTORY 已存在"
fi
if [ ! -d "$SUPABASE_DB_DIRECTORY" ]; then
  echo "資料夾 $SUPABASE_DB_DIRECTORY 不存在，正在建立..."
  mkdir -p "$SUPABASE_DB_DIRECTORY"
else
  echo "資料夾 $SUPABASE_DB_DIRECTORY 已存在"
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
SUPERTOKEN_STACK_NAME="supertoken"
OPENLDAP_STACK_NAME="openldap"
SUPABASE_STACK_NAME="supabase"

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

# 查詢 stack 列表
STACK_DATA=$(curl -s -X GET "$PORTAINER_URL/api/stacks" \
    -H "Authorization: Bearer $TOKEN")

# 根據名稱篩選出 stackId 和 endpointId
SUPERTOKEN_STACK_INFO=$(echo "$STACK_DATA" | jq -r ".[] | select(.Name==\"$SUPERTOKEN_STACK_NAME\") | {stackId: .Id, endpointId: .EndpointId}")
OPENLDAP_STACK_INFO=$(echo "$STACK_DATA" | jq -r ".[] | select(.Name==\"$OPENLDAP_STACK_NAME\") | {stackId: .Id, endpointId: .EndpointId}")
SUPABASE_STACK_INFO=$(echo "$STACK_DATA" | jq -r ".[] | select(.Name==\"$SUPABASE_STACK_NAME\") | {stackId: .Id, endpointId: .EndpointId}")

# 檢查是否成功找到 stack 信息
if [ -z "$SUPERTOKEN_STACK_INFO" ]; then
    echo "No stack found with name: $SUPERTOKEN_STACK_NAME"
    exit 1
fi
if [ -z "$OPENLDAP_STACK_INFO" ]; then
    echo "No stack found with name: $OPENLDAP_STACK_NAME"
    exit 1
fi
if [ -z "$SUPABASE_STACK_INFO" ]; then
    echo "No stack found with name: $SUPABASE_STACK_NAME"
    exit 1
fi

# 提取 stackId 和 endpointId
SUPERTOKEN_STACK_ID=$(echo "$SUPERTOKEN_STACK_INFO" | jq -r '.stackId')
SUPERTOKEN_ENDPOINT_ID=$(echo "$SUPERTOKEN_STACK_INFO" | jq -r '.endpointId')

OPENLDAP_STACK_ID=$(echo "$OPENLDAP_STACK_INFO" | jq -r '.stackId')
OPENLDAP_ENDPOINT_ID=$(echo "$OPENLDAP_STACK_INFO" | jq -r '.endpointId')

SUPABASE_STACK_ID=$(echo "$SUPABASE_STACK_INFO" | jq -r '.stackId')
SUPABASE_ENDPOINT_ID=$(echo "$SUPABASE_STACK_INFO" | jq -r '.endpointId')


# 顯示結果
echo "SUPERTOKEN_STACK_ID: $SUPERTOKEN_STACK_ID"
echo "SUPERTOKEN_ENDPOINT_ID: $SUPERTOKEN_ENDPOINT_ID"

echo "OPENLDAP_STACK_ID: $OPENLDAP_STACK_ID"
echo "OPENLDAP_ENDPOINT_ID: $OPENLDAP_ENDPOINT_ID"

echo "SUPABASE_STACK_ID: $SUPABASE_STACK_ID"
echo "SUPABASE_ENDPOINT_ID: $SUPABASE_ENDPOINT_ID"

# supertoken
# 停止 Docker 堆疊
curl -s -X POST "$PORTAINER_URL/api/stacks/$SUPERTOKEN_STACK_ID/stop?endpointId=$SUPERTOKEN_ENDPOINT_ID" \
    -H "Authorization: Bearer $TOKEN"

# 啟動 Docker 堆疊，並添加 endpointId 參數
SUPERTOKEN_START_RESPONSE=$(curl -s -X POST "$PORTAINER_URL/api/stacks/$SUPERTOKEN_STACK_ID/start?endpointId=$SUPERTOKEN_ENDPOINT_ID" \
    -H "Authorization: Bearer $TOKEN")

# 檢查是否成功啟動堆疊
if [ "$SUPERTOKEN_START_RESPONSE" == "null" ]; then
    echo "SUPERTOKEN Docker stack started successfully"
else
    echo "Failed to start SUPERTOKEN Docker stack: $SUPERTOKEN_START_RESPONSE"
fi

# openldap
# 停止 Docker 堆疊
curl -s -X POST "$PORTAINER_URL/api/stacks/$OPENLDAP_STACK_ID/stop?endpointId=$OPENLDAP_ENDPOINT_ID" \
    -H "Authorization: Bearer $TOKEN"

# 啟動 Docker 堆疊，並添加 endpointId 參數
OPENLDAP_START_RESPONSE=$(curl -s -X POST "$PORTAINER_URL/api/stacks/$OPENLDAP_STACK_ID/start?endpointId=$OPENLDAP_ENDPOINT_ID" \
    -H "Authorization: Bearer $TOKEN")

# 檢查是否成功啟動堆疊
if [ "$OPENLDAP_START_RESPONSE" == "null" ]; then
    echo "OPENLDAP Docker stack started successfully"
else
    echo "Failed to start OPENLDAP Docker stack: $OPENLDAP_START_RESPONSE"
fi

# supabase
# 停止 Docker 堆疊
: '
curl -s -X POST "$PORTAINER_URL/api/stacks/$SUPABASE_STACK_ID/stop?endpointId=$SUPABASE_ENDPOINT_ID" \
    -H "Authorization: Bearer $TOKEN"
'

# 啟動 Docker 堆疊，並添加 endpointId 參數
: '
SUPABASE_START_RESPONSE=$(curl -s -X POST "$PORTAINER_URL/api/stacks/$SUPABASE_STACK_ID/start?endpointId=$SUPABASE_ENDPOINT_ID" \
    -H "Authorization: Bearer $TOKEN")
'

# 檢查是否成功啟動堆疊
: '
if [ "$SUPABASE_START_RESPONSE" == "null" ]; then
    echo "SUPABASE Docker stack started successfully"
else
    echo "Failed to start SUPABASE Docker stack: $SUPABASE_START_RESPONSE"
fi
'