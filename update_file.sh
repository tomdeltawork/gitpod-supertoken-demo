#!/bin/bash

# 更新設定檔
# 解析 workspace-id 和 region
# 從 URL 中去除 https:// 和 .gitpod.io 並提取 workspace-id 和 region
GITPOD_WORKSPACE_ID=$(echo $GITPOD_WORKSPACE_URL | sed -E 's/https:\/\/(.*)\..*\.gitpod\.io/\1/')
GITPOD_REGION=$(echo $GITPOD_WORKSPACE_URL | sed -E 's/https:\/\/.*\.(.*)\.gitpod\.io/\1/')

# 動態設置 <port>，可以修改這裡為你所需要的端口
GITPOD_SUPERTOKEN_BACKEND_PORT=3001  # 這裡設置為你希望使用的端口，例如 3001
GITPOD_SUPERTOKEN_WEB_PORT=3000
GITPOD_PORTAINER_PORT=9000
GITPOD_PHPLDAPADMIN_PORT=7002
GITPOD_SUPABASE_PORT=7000

# 拼接新的 URL
GITPOD_SUPERTOKEN_BACKEND_URL="https://${GITPOD_SUPERTOKEN_BACKEND_PORT}-${GITPOD_WORKSPACE_ID}.${GITPOD_REGION}.gitpod.io"
GITPOD_SUPERTOKEN_WEB_URL="https://${GITPOD_SUPERTOKEN_WEB_PORT}-${GITPOD_WORKSPACE_ID}.${GITPOD_REGION}.gitpod.io"
GITPOD_PORTAINER_URL="https://${GITPOD_PORTAINER_PORT}-${GITPOD_WORKSPACE_ID}.${GITPOD_REGION}.gitpod.io"
GITPOD_PHPLDAPADMIN_URL="https://${GITPOD_PHPLDAPADMIN_PORT}-${GITPOD_WORKSPACE_ID}.${GITPOD_REGION}.gitpod.io"
GITPOD_SUPABASE_URL="https://${GITPOD_SUPABASE_PORT}-${GITPOD_WORKSPACE_ID}.${GITPOD_REGION}.gitpod.io"


# 輸出結果
echo "GITPOD_SUPERTOKEN_BACKEND_URL: ${GITPOD_SUPERTOKEN_BACKEND_URL}"
echo "GITPOD_SUPERTOKEN_WEB_URL: ${GITPOD_SUPERTOKEN_WEB_URL}"
echo "GITPOD_PHPLDAPADMIN_URL: ${GITPOD_PHPLDAPADMIN_URL}"
echo "GITPOD_SUPABASE_URL: ${GITPOD_SUPABASE_URL}"

#export GITPOD_SUPERTOKEN_BACKEND_URL
#export GITPOD_SUPERTOKEN_WEB_URL
#export GITPOD_PORTAINER_URL

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


# 更新README-url.md
# 設定 README-url.md 文件的路徑
README_FILE_PATH="/workspace/gitpod-supertoken-demo/README-url.md"

# 檢查 README-url.md 文件是否存在，沒有則創建
if [ ! -f "$README_FILE_PATH" ]; then
  touch "$README_FILE_PATH"
  echo "創建了 README-url.md 文件"
fi

# 更新 README-url.md 文件的內容
cat <<EOL > "$README_FILE_PATH"
# Demo URLs

## supertoken dashboard url
\`GITPOD_SUPERTOKEN_BACKEND_URL\`: 
\`${GITPOD_SUPERTOKEN_BACKEND_URL}/auth/dashboard\`

## supertoken login page url
\`GITPOD_SUPERTOKEN_WEB_URL\`: 
\`${GITPOD_SUPERTOKEN_WEB_URL}\`

## portainer url
\`GITPOD_PORTAINER_URL\`: 
\`${GITPOD_PORTAINER_URL}\`

## phpldapadmin url
\`GITPOD_PHPLDAPADMIN_URL\`: 
\`${GITPOD_PHPLDAPADMIN_URL}\`

## supabase dashboard url
\`GITPOD_SUPABASE_URL\`: 
\`${GITPOD_SUPABASE_URL}\`

這些 URL 是基於當前的 Gitpod 工作區動態生成的，並應在每次工作區啟動時自動更新。
EOL

echo "已更新 README-url.md 文件"