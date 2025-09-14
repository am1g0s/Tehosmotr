import React, { createContext, useContext } from 'react'
import { useGoogleAuth } from './useGoogleAuth'

const AuthContext = createContext<ReturnType<typeof useGoogleAuth> | null>(null)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const auth = useGoogleAuth()
	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
	return ctx
}
