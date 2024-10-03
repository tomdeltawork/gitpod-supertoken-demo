// // utils/supabase.ts

// import { createClient } from '@supabase/supabase-js'

// let supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL || "TODO: Your Supabase URL"
// let supabase_key = process.env.NEXT_PUBLIC_SUPABASE_KEY || "TODO: Your Supabase Key"

// const getSupabase = (access_token: string) => {
//   console.log("supabase_url: " + supabase_url)
//   console.log("supabase_key: " + supabase_key)
//   console.log("access_token: " + access_token)
//   const supabase = createClient(
//     supabase_url,
//     supabase_key
//   )

//   supabase.auth.session = () => ({
//     access_token,
//     token_type: "",
//     user: null
//   })

//   console.log("supabase: " + JSON.stringify(supabase))
//   return supabase
// }

// export { getSupabase }


// utils/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'your-anon-key';

// 創建 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 如果需要將 access_token 傳入以進行身份驗證，則可以使用以下函數
const getSupabase = (access_token: string) => {
  // 使用傳入的 access_token 設置 Supabase 用戶身份
  supabase.auth.setSession({
    access_token,
    refresh_token: '',  // 如果需要，可以設置 refresh token，這裡假設沒有
  });

  return supabase;
}

export { supabase, getSupabase };
