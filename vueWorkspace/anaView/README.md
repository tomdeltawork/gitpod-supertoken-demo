## 建立專案
### 使用以下指令初始化
```bash
npm create vite@latest anaView --template vue
```


## 打包成docker相關
### docker 打包指令
docker build -f Dockerfile.test -t tomdeltawork/anaview:v1 .

### docker 打包指令(test env的Dockerfile進行打包)
docker build -f Dockerfile.test -t tomdeltawork/anaview-test:v1 .

### docker 打包指令(依據prd env的Dockerfile進行打包)
docker build -f Dockerfile.prd -t tomdeltawork/anaview-prd:v1 .