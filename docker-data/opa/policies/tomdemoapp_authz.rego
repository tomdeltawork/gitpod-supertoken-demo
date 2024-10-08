package tomdemoapp_authz

# 定義每個角色的資源權限
roles_permissions = {
    "admin": {
        "POST": ["/users", "/admin"],
        "GET": ["/users", "/admin", "/dashboard"]
    },
    "user": {
        "GET": ["/users", "/dashboard"]
    }
}

# 檢查是否允許該角色進行特定操作
allow {
    # 從 tokenPayload 中提取角色
    role = input.tokenPayload["st-role"].v[_]
    method = input.method
    # 將 path 陣列組合成一個完整的路徑，例如：["add", "users"] -> "/add/users"
    path = concat("/", input.path)

    # 根據角色和方法檢查是否允許訪問特定路徑
    roles_permissions[role][method][_] == path
}