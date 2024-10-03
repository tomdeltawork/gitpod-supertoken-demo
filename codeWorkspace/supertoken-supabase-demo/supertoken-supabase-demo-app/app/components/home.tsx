// pages/index.tsx
"use client";

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { SessionAuth, useSessionContext } from 'supertokens-auth-react/recipe/session'
import { LinksComponent } from "./linksComponent";

// take a look at the Creating Supabase Client section to see how to define getSupabase
// let getSupabase: any;
import { getSupabase } from '../utils/supabase';  // 正確匯入 getSupabase



function ProtectedPage() {
  // retrieve the authenticated user's accessTokenPayload and userId from the sessionContext
  const session = useSessionContext()

  const [userEmail, setEmail] = useState('')
  useEffect(() => {
    async function getUserEmail() {
      if (session.loading) {
        return;
      }
      // retrieve the supabase client who's JWT contains users userId, this will be
      // used by supabase to check that the user can only access table entries which contain their own userId
      
      const supabase = getSupabase(session.accessTokenPayload.supabase_token)

      // retrieve the user's name from the users table whose email matches the email in the JWT
      const { data } = await supabase.from('users').select('email').eq('user_id', session.userId)

      if (data.length > 0) {
        setEmail(data[0].email)
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