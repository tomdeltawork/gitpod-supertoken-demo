package fake_backend_authz

default allow = false

# 定義每個角色的資源權限
roles_permissions = {
    "admin": {
        "GET": ["fake-backend/projects", "fake-backend/tasks", "fake-backend/works"],
        "POST": ["fake-backend/projects", "fake-backend/tasks"],
        "PUT": ["fake-backend/projects", "fake-backend/tasks", "fake-backend/works"],
        "DELETE": ["fake-backend/projects", "fake-backend/tasks", "fake-backend/works"],
    },
    "normal": {
        "GET": ["fake-backend/works"],
        "POST": ["fake-backend/works"],
        "PUT": ["fake-backend/works"],
        "DELETE": ["fake-backend/works"],
    },
}

# 檢查是否允許該角色進行特定操作
allow {
    role = input.tokenPayload["st-role"].v[_]
    method = input.method
    path = concat("/", input.path)

    # 根據請求方法來處理不同的路徑格式
    base_path = choose_base_path(path, method)

    # 使用 sprintf 進行輸出調試
    print(sprintf("input Role: %s ****", [role]))
    print(sprintf("input Method: %s ****", [method]))
    print(sprintf("input Path: %s ****", [path]))
    print(sprintf("Base Path: %s ****", [base_path]))

    # 根據角色和方法檢查是否允許訪問特定路徑
    roles_permissions[role][method][_] == base_path
}

# 根據方法選擇如何處理路徑
choose_base_path(path, method) = base_path {
    method == "DELETE"
    base_path = remove_dynamic_id(path)
} else = base_path {
    base_path = path
}

# 移除 URL 中的 ID，保證只處理一次
remove_dynamic_id(path) = base_path {
    print(sprintf("Original Path before replace: %s ****", [path]))
    
    # 使用正規表示式替換末尾的數字部分
    base_path = regex.replace(path, "/[0-9]+$", "")

    # 調試輸出
    print(sprintf("Processed Base Path after replace: %s ****", [base_path]))
}