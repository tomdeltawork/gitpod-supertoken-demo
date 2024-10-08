package main

import (
	"net/http"

	"database/sql"
	"fake-backend/docs"
	_ "fake-backend/docs"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/mattn/go-sqlite3"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title 工時系統 API
// @version 1.0
// @description 這是一個基於 Gin 和 SQLite 的工時系統後端 API，支持 CRUD 操作.
// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description 請使用 Bearer token 格式，如： "Bearer {token}"

// Database 變量
var db *gorm.DB
var err error

// Project 定義
type Project struct {
	ID          uint   `gorm:"primary_key" json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// 指定表名為 AIT_Projects
func (Project) TableName() string {
	return "AIT_Projects"
}

// Task 定義
type Task struct {
	ID          uint   `gorm:"primary_key" json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	ProjectID   uint   `json:"project_id"` // 外鍵指向 Project
}

// 指定表名為 AIT_Tasks
func (Task) TableName() string {
	return "AIT_Tasks"
}

// User 定義
type User struct {
	ID    uint   `gorm:"primary_key" json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// 指定表名為 AIT_Users
func (User) TableName() string {
	return "AIT_Users"
}

// Work 定義
type Work struct {
	ID          uint    `gorm:"primary_key" json:"id"`
	UserID      uint    `json:"user_id"`
	TaskID      uint    `json:"task_id"`
	HoursWorked float64 `json:"hours_worked"`
	WorkDate    string  `json:"work_date"`
}

// 指定表名為 AIT_Works
func (Work) TableName() string {
	return "AIT_Works"
}

// 初始化資料庫
func initDatabase() {

	// 刪除現有的資料庫文件
	os.Remove("./db/worklog.db")

	db, err = gorm.Open("sqlite3", "./db/worklog.db")

	if err != nil {
		panic("failed to connect database: " + err.Error())
	}

	// 自動遷移模式，創建或更新表結構
	db.AutoMigrate(&Project{}, &Task{}, &User{}, &Work{})

	// 可選：從 SQL 文件中執行初始化語句
	err = executeSQLFile(db.DB(), "./data.sql")
	if err != nil {
		log.Fatalf("Failed to execute SQL file: %s", err)
	}
}

// executeSQLFile 從文件中讀取 SQL 並執行
func executeSQLFile(db *sql.DB, filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("could not open SQL file: %w", err)
	}
	defer file.Close()

	sqlBytes, err := ioutil.ReadAll(file)
	if err != nil {
		return fmt.Errorf("could not read SQL file: %w", err)
	}

	sqlString := string(sqlBytes)

	// 使用 Exec 來執行多條 SQL 語句
	_, err = db.Exec(sqlString)
	if err != nil {
		return fmt.Errorf("could not execute SQL: %w", err)
	}

	return nil
}

// @Summary 獲取所有專案
// @Description 列出所有專案
// @Tags Projects
// @Produce json
// @Success 200 {array} Project
// @Security BearerAuth
// @Router /projects [get]
func getProjects(c *gin.Context) {
	var projects []Project
	db.Find(&projects)
	c.JSON(http.StatusOK, projects)
}

// @Summary 創建新專案
// @Description 創建一個新專案
// @Tags Projects
// @Accept json
// @Produce json
// @Param project body Project true "專案資料"
// @Success 201 {object} Project
// @Router /projects [post]
// @Security BearerAuth
func createProject(c *gin.Context) {
	var newProject Project
	if err := c.ShouldBindJSON(&newProject); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&newProject)
	c.JSON(http.StatusCreated, newProject)
}

// @Summary 更新專案
// @Description 根據專案 ID 更新專案資料
// @Tags Projects
// @Accept json
// @Produce json
// @Param id path int true "專案 ID"
// @Param project body Project true "專案資料"
// @Success 200 {object} Project
// @Router /projects/{id} [put]
// @Security BearerAuth
func updateProject(c *gin.Context) {
	var project Project
	if err := db.Where("id = ?", c.Param("id")).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}
	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&project)
	c.JSON(http.StatusOK, project)
}

// @Summary 刪除專案
// @Description 根據專案 ID 刪除專案
// @Tags Projects
// @Param id path int true "專案 ID"
// @Success 204 "No Content"
// @Router /projects/{id} [delete]
// @Security BearerAuth
func deleteProject(c *gin.Context) {
	if err := db.Where("id = ?", c.Param("id")).Delete(&Project{}).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

// @Summary 獲取所有任務
// @Description 列出所有任務
// @Tags Tasks
// @Produce json
// @Success 200 {array} Task
// @Router /tasks [get]
// @Security BearerAuth
func getTasks(c *gin.Context) {
	var tasks []Task
	db.Find(&tasks)
	c.JSON(http.StatusOK, tasks)
}

// @Summary 創建新任務
// @Description 創建一個新任務
// @Tags Tasks
// @Accept json
// @Produce json
// @Param task body Task true "任務資料"
// @Success 201 {object} Task
// @Router /tasks [post]
// @Security BearerAuth
func createTask(c *gin.Context) {
	var newTask Task
	if err := c.ShouldBindJSON(&newTask); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&newTask)
	c.JSON(http.StatusCreated, newTask)
}

// @Summary 更新任務
// @Description 根據任務 ID 更新任務資料
// @Tags Tasks
// @Accept json
// @Produce json
// @Param id path int true "任務 ID"
// @Param task body Task true "任務資料"
// @Success 200 {object} Task
// @Router /tasks/{id} [put]
// @Security BearerAuth
func updateTask(c *gin.Context) {
	var task Task
	if err := db.Where("id = ?", c.Param("id")).First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&task)
	c.JSON(http.StatusOK, task)
}

// @Summary 刪除任務
// @Description 根據任務 ID 刪除任務
// @Tags Tasks
// @Param id path int true "任務 ID"
// @Success 204 "No Content"
// @Router /tasks/{id} [delete]
// @Security BearerAuth
func deleteTask(c *gin.Context) {
	if err := db.Where("id = ?", c.Param("id")).Delete(&Task{}).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

// @Summary 獲取所有用戶
// @Description 列出所有用戶
// @Tags Users
// @Produce json
// @Success 200 {array} User
// @Router /users [get]
// @Security BearerAuth
func getUsers(c *gin.Context) {
	var users []User
	db.Find(&users)
	c.JSON(http.StatusOK, users)
}

// @Summary 創建新用戶
// @Description 創建一個新用戶
// @Tags Users
// @Accept json
// @Produce json
// @Param user body User true "用戶資料"
// @Success 201 {object} User
// @Router /users [post]
// @Security BearerAuth
func createUser(c *gin.Context) {
	var newUser User
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&newUser)
	c.JSON(http.StatusCreated, newUser)
}

// @Summary 更新用戶
// @Description 根據用戶 ID 更新用戶資料
// @Tags Users
// @Accept json
// @Produce json
// @Param id path int true "用戶 ID"
// @Param user body User true "用戶資料"
// @Success 200 {object} User
// @Router /users/{id} [put]
// @Security BearerAuth
func updateUser(c *gin.Context) {
	var user User
	if err := db.Where("id = ?", c.Param("id")).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&user)
	c.JSON(http.StatusOK, user)
}

// @Summary 刪除用戶
// @Description 根據用戶 ID 刪除用戶
// @Tags Users
// @Param id path int true "用戶 ID"
// @Success 204 "No Content"
// @Router /users/{id} [delete]
// @Security BearerAuth
func deleteUser(c *gin.Context) {
	if err := db.Where("id = ?", c.Param("id")).Delete(&User{}).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

// @Summary 獲取所有工時記錄
// @Description 列出所有工時記錄
// @Tags Works
// @Produce json
// @Success 200 {array} Work
// @Router /works [get]
// @Security BearerAuth
func getWorks(c *gin.Context) {
	var works []Work
	db.Find(&works)
	c.JSON(http.StatusOK, works)
}

// @Summary 新增工時記錄
// @Description 創建一個新的工時記錄
// @Tags Works
// @Accept json
// @Produce json
// @Param work body Work true "工時資料"
// @Success 201 {object} Work
// @Router /works [post]
// @Security BearerAuth
func createWork(c *gin.Context) {
	var newWork Work
	if err := c.ShouldBindJSON(&newWork); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&newWork)
	c.JSON(http.StatusCreated, newWork)
}

// @Summary 更新工時記錄
// @Description 根據工時記錄 ID 更新工時資料
// @Tags Works
// @Accept json
// @Produce json
// @Param id path int true "工時記錄 ID"
// @Param work body Work true "工時資料"
// @Success 200 {object} Work
// @Router /works/{id} [put]
// @Security BearerAuth
func updateWork(c *gin.Context) {
	var work Work
	if err := db.Where("id = ?", c.Param("id")).First(&work).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Work not found"})
		return
	}
	if err := c.ShouldBindJSON(&work); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&work)
	c.JSON(http.StatusOK, work)
}

// @Summary 刪除工時記錄
// @Description 根據工時記錄 ID 刪除工時記錄
// @Tags Works
// @Param id path int true "工時記錄 ID"
// @Success 204 "No Content"
// @Router /works/{id} [delete]
// @Security BearerAuth
func deleteWork(c *gin.Context) {
	if err := db.Where("id = ?", c.Param("id")).Delete(&Work{}).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Work not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func main() {
	// 初始化資料庫
	initDatabase()

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		// 根據請求的 Host 設置 Swagger 文檔的 host
		docs.SwaggerInfo.Host = c.Request.Host
		docs.SwaggerInfo.BasePath = "/fake-backend" // 動態設置 BasePath
	})

	api := r.Group("/fake-backend")
	{
		// Projects 路由
		api.GET("/projects", getProjects)
		api.POST("/projects", createProject)
		api.PUT("/projects/:id", updateProject)    // 更新專案
		api.DELETE("/projects/:id", deleteProject) // 刪除專案

		// Tasks 路由
		api.GET("/tasks", getTasks)
		api.POST("/tasks", createTask)
		api.PUT("/tasks/:id", updateTask)    // 更新任務
		api.DELETE("/tasks/:id", deleteTask) // 刪除任務

		// Users 路由
		api.GET("/users", getUsers)
		api.POST("/users", createUser)
		api.PUT("/users/:id", updateUser)    // 更新用戶
		api.DELETE("/users/:id", deleteUser) // 刪除用戶

		// Works 路由
		api.GET("/works", getWorks)
		api.POST("/works", createWork)
		api.PUT("/works/:id", updateWork)    // 更新工時記錄
		api.DELETE("/works/:id", deleteWork) // 刪除工時記錄

		// Swagger 路由
		api.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	// 啟動服務
	r.Run(":8080")
}
