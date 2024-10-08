## go 初始化教學  
### 初始化模組  
go mod init fake-backend  

### 安裝gin  
go get -u github.com/gin-gonic/gin  

### 運行  
go run main.go  

### go更新library  
go mod tidy  

### docker 打包指令   
docker build -f Dockerfile.test -t tomdeltawork/fake-backend-test:v1 .

### 安裝swagger
go install github.com/swaggo/swag/cmd/swag@latest

### 產生swagger文檔
swag init