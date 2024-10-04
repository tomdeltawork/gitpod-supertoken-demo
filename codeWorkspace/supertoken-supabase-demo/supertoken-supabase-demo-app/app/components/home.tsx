// pages/index.tsx
"use client";

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { SessionAuth, useSessionContext } from 'supertokens-auth-react/recipe/session'
import { LinksComponent } from "./linksComponent";

// take a look at the Creating Supabase Client section to see how to define getSupabase
// let getSupabase: any;
// import { getSupabase } from '../utils/supabase';  // 正確匯入 getSupabase



function ProtectedPage() {
  // retrieve the authenticated user's accessTokenPayload and userId from the sessionContext
  const session = useSessionContext()

  const [userEmail, setEmail] = useState('')
  useEffect(() => {
    async function getUserEmail() {
      if (session.loading) {
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/Users?select=email&user_id=eq.${session.userId}`, {
          method: 'GET',
          headers: {
            'Apikey': supabaseAnonKey || '',
            'Authorization': `Bearer ${session.accessTokenPayload.supabase_token}`,  // 如果需要身份驗證
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched user email:', data);

          if (data.length > 0) {
            setEmail(data[0].email)
          }

          // return data;
        } else {
          console.error('Error fetching user email:', response.statusText);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
      
    }
    getUserEmail()
  }, [session])

  if (session.loading) {
    return null;
  }

  return (
    <div>
      <Head>
        <title>SuperTokens 💫</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>
          You are authenticated with SuperTokens! (UserId: {session.userId})
          <br />
          Your email retrieved from Supabase: {userEmail}
        </p>
      </main>
    </div>
  )
}

export async function HomePage() {
    return (
      // We will wrap the ProtectedPage component with the SessionAuth so only an
      // authenticated user can access it.
      <SessionAuth>
        <ProtectedPage />
        <LinksComponent />
      </SessionAuth>
    )
  }