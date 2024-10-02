# Dashboard 
佈署於3000 port，可以由 PORTS頁籤 or README-url.md 找到對外url  
  
## Information 
    - url : https://{your-backend}/auth/dashboard  
    - email : aitteam@deltaww.com   
    - password: aitteam666  
  
# Login page 
佈署於3001 port，可以由 PORTS頁籤 or README-url.md 找到對外url  

## Information  
    - url : https://{login page}/auth  
    - admin:
        - email : ben.hsu@example.com
        - password : delta666 
    - normal:
        - email : jack.wu@example.com
        - password : delta666
  
# Portainer
佈署於9000 port，可以由 PORTS頁籤 or README-url.md 找到對外url  

## Information  
    - email : admin  
    - password: 1qaz2wsx3edc  

# phpldapadmin
openldap的管理界面phpldapadmin佈署於7002 port，可以由 PORTS頁籤 or README-url.md 找到對外url  

## Information  
    - Login DN : cn=admin,dc=example,dc=org  
    - password: admin 
  
# Note  
1. 如要重新運行supertoken的backend和frontend可以執行以下。  
  
```bash  
sh /workspace/gitpod-supertoken-demo/start_server.sh  
```  
2. /workspace/gitpod-supertoken-demo/README-url.md 動態列出demo使用的相關的url。  
  
3. 解釋各sh檔用途:  
    - start_docker.sh : 初始化docker環境使用。  
    - start_server.sh : 初始化服務(supertoken service)使用。  
    - update_file.sh : 初始化檔案環境使用，因為要依據每個gitpod workspace來動態生成相關對外暴露url。 

4. self hosting supabase bug處理 
    - Vector服務無法啟動:
        - 需要手動/workspace/gitpod-supertoken-demo/docker-data/supabase/volumes/logs/vector.yml檔案
        - 內容填入https://github.com/supabase/supabase/blob/master/docker/volumes/logs/vector.yml
    - Analytics服務無法啟動:
        - 可以參考以下兩篇
        - https://github.com/coollabsio/coolify/issues/3380
        - https://supabase.com/docs/guides/self-hosting/docker
