## 建立專案
### 可以直接將以下產生的backend資料夾直接copy使用即可
```bash
npx create-supertokens-app@latest --recipe=emailpassword
```


## 打包成docker相關
### docker 打包指令
docker build -f Dockerfile.test -t tomdeltawork/authentication-backend:v1 .

### docker 打包指令(test env的Dockerfile進行打包)
docker build -f Dockerfile.test -t tomdeltawork/authentication-backend-test:v1 .

### docker 打包指令(依據prd env的Dockerfile進行打包)
docker build -f Dockerfile.prd -t tomdeltawork/authentication-backend-prd:v1 .