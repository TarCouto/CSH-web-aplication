'use client'

import { createContext, useContext } from 'react'

const AuthSessionContext = createContext(false)

export function AuthSessionProvider({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean
  children: React.ReactNode
}) {
  return (
    <AuthSessionContext.Provider value={isAuthenticated}>
      {children}
    </AuthSessionContext.Provider>
  )
}

export function useIsAuthenticated() {
  return useContext(AuthSessionContext)
}
