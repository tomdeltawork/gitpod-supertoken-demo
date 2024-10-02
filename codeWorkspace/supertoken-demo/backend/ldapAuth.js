// ldapAuth.js
const ldap = require("ldapjs");



const BIND_DN = 'cn=admin,dc=example,dc=org';
const BIND_CREDENTIALS = 'admin';
const SEARCH_BASE = 'ou=users,dc=example,dc=org';
const SEARCH_FILTER = '(mail={email})';


// 使用名稱登入
// function authenticateWithLDAP(username, password) {
//     return new Promise((resolve, reject) => {
//         const dn = `cn=${username},ou=users,dc=example,dc=org`; // 修改为你的 LDAP 配置
//         console.log("dn: " + dn + " login");
//         // const dn = `cn=tom wu,dc=example,dc=org`;
//         // const dn = `mail=tom.wu@example.com,dc=example,dc=org`;
//         ldapClient.bind(dn, password, (err) => {
//             if (err) {
//                 resolve(false);
//                 console.error("ldap valid error");
//             } else {
//                 resolve(true);
//                 console.log("ldap valid success:");
//             }
//         });
//     });
// }


// 使用email登入
function authenticateWithLDAP(username, password) {
    return new Promise((resolve, reject) => {

        const ldapUrl = process.env.LDAP_URL || 'ldap://172.24.0.46:389';
        const ldapClient = ldap.createClient({
            url: ldapUrl,
            followReferrals: false
        });
        
        // 使用 BINDDN 和 BINDCREDENTIALS 进行初始绑定
        ldapClient.bind(BIND_DN, BIND_CREDENTIALS, (bindErr) => {
            if (bindErr) {
                console.error('Initial LDAP bind failed:', bindErr);
                return resolve(false);  // 初始绑定失败
            }

            console.log('Initial LDAP bind successful');

            // 使用 SEARCHFILTER 查找用户
            const searchFilter = SEARCH_FILTER.replace('{email}', username);

            const opts = {
                filter: searchFilter,
                scope: 'sub', // 搜索整个子树
                attributes: ['dn'] // 只获取用户的 DN
            };

            ldapClient.search(SEARCH_BASE, opts, (searchErr, res) => {
                if (searchErr) {
                    console.error('Search error:', searchErr);
                    ldapClient.unbind();
                    return resolve(false);
                }

                let userDN = null;
                res.on('searchEntry', (entry) => {
                    console.log("entry: " + entry);
                    console.log("entry.objectName: " + entry.objectName);
                    userDN = entry.objectName //取得dn
                });

                res.on('error', (err) => {
                    console.error('Search failed:', err);
                });

                res.on('end', (result) => {
                    if (userDN) {
                        // 使用找到的 DN 和用户提供的密码进行绑定验证
                        console.log("userDN: " + userDN);
                        ldapClient.bind(userDN.toString() , password, (authErr) => {
                            if (authErr) {
                                console.error('User authentication failed:', authErr);
                                resolve(false);  // 认证失败
                            } else {
                                console.log('User authentication successful');
                                resolve(true);  // 认证成功
                            }

                            ldapClient.unbind((unbindErr) => {
                                if (unbindErr) {
                                    console.error('Unbind error:', unbindErr);
                                } else {
                                    console.log('Unbind successful');
                                }
                            });
                        });
                    } else {
                        console.log('User not found');
                        ldapClient.unbind();
                        resolve(false);
                    }
                });
            });
        });
    });
}

module.exports = { authenticateWithLDAP };