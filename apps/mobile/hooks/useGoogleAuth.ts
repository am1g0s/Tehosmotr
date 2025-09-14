import AsyncStorage from '@react-native-async-storage/async-storage'
import {
	GoogleSignin,
	statusCodes,
} from '@react-native-google-signin/google-signin'
import Constants from 'expo-constants'
import { useEffect, useState } from 'react'

export interface GoogleUser {
	id: string
	email: string
	name: string
	picture?: string
	givenName?: string
	familyName?: string
}

export interface AuthState {
	isAuthenticated: boolean
	user: GoogleUser | null
	accessToken: string | null
	isLoading: boolean
	error: string | null
}

const STORAGE_KEYS = {
	ACCESS_TOKEN: 'google_access_token',
	USER_INFO: 'google_user_info',
}

const IOS_CLIENT_ID = Constants.expoConfig?.extra
	?.GOOGLE_IOS_CLIENT_ID as string
const ANDROID_CLIENT_ID = Constants.expoConfig?.extra
	?.GOOGLE_ANDROID_CLIENT_ID as string
// (опционально) WEB client id — нужен главным образом для idToken/серверной стороны.
// Если есть — укажи его в extra и тут прочитай:
const WEB_CLIENT_ID = Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID as
	| string
	| undefined

const SCOPES = [
	'email',
	'profile',
	'https://www.googleapis.com/auth/drive.file',
	'https://www.googleapis.com/auth/drive.metadata.readonly',
]

export const useGoogleAuth = () => {
	const [state, setState] = useState<AuthState>({
		isAuthenticated: false,
		user: null,
		accessToken: null,
		isLoading: false,
		error: null,
	})

	// Инициализация Google Sign-In один раз
	useEffect(() => {
		GoogleSignin.configure({
			iosClientId: IOS_CLIENT_ID, // iOS OAuth client ID
			// На Android библиотека сама возьмёт package + SHA-1 из настроек,
			// но WEB_CLIENT_ID полезен, если хочешь idToken (серверная валидация)
			webClientId: WEB_CLIENT_ID, // опционально
			offlineAccess: false, // refresh-токен мобильным обычно не дают
			forceCodeForRefreshToken: false,
			scopes: SCOPES,
		})
		// Пробуем восстановить сессию
		;(async () => {
			try {
				const [rawUser, accessToken] = await Promise.all([
					AsyncStorage.getItem(STORAGE_KEYS.USER_INFO),
					AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
				])
				if (rawUser) {
					const user = JSON.parse(rawUser) as GoogleUser
					setState(s => ({
						...s,
						isAuthenticated: true,
						user,
						accessToken,
					}))
				}
				// затем пробуем тихо освежить из Google (если есть предыдущий логин)
				const has = await GoogleSignin.hasPreviousSignIn()
				if (has) {
					await GoogleSignin.signInSilently()
					const tokens = await GoogleSignin.getTokens()
					const current = await GoogleSignin.getCurrentUser()
					const freshUser: GoogleUser = {
						id: current?.user?.id ?? '',
						email: current?.user?.email ?? '',
						name: current?.user?.name ?? '',
						picture: current?.user?.photo ?? '',
						givenName: current?.user?.givenName ?? '',
						familyName: current?.user?.familyName ?? '',
					}
					await AsyncStorage.setItem(
						STORAGE_KEYS.USER_INFO,
						JSON.stringify(freshUser)
					)
					if (tokens.accessToken) {
						await AsyncStorage.setItem(
							STORAGE_KEYS.ACCESS_TOKEN,
							tokens.accessToken
						)
					}
					setState(s => ({
						...s,
						isAuthenticated: true,
						user: freshUser,
						accessToken: tokens.accessToken ?? s.accessToken,
					}))
				}
			} catch {
				// no-op
			}
		})()
	}, [])

	const signIn = async () => {
		try {
			setState(s => ({ ...s, isLoading: true, error: null }))
			await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })

			await GoogleSignin.signIn()
			const tokens = await GoogleSignin.getTokens()
			const current = await GoogleSignin.getCurrentUser()

			const user: GoogleUser = {
				id: current?.user?.id ?? '',
				email: current?.user?.email ?? '',
				name: current?.user?.name ?? '',
				picture: current?.user?.photo ?? '',
				givenName: current?.user?.givenName ?? '',
				familyName: current?.user?.familyName ?? '',
			}

			await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
			if (tokens.accessToken) {
				await AsyncStorage.setItem(
					STORAGE_KEYS.ACCESS_TOKEN,
					tokens.accessToken
				)
			}

			setState({
				isAuthenticated: true,
				user,
				accessToken: tokens.accessToken ?? null,
				isLoading: false,
				error: null,
			})
		} catch (e: any) {
			const code = e?.code
			let msg = 'Ошибка входа'
			if (code === statusCodes.SIGN_IN_CANCELLED) msg = 'Авторизация отменена'
			else if (code === statusCodes.IN_PROGRESS) msg = 'Авторизация уже идёт'
			else if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
				msg = 'Нет Google Play Services'
			setState(s => ({ ...s, isLoading: false, error: msg }))
		}
	}

	const signOut = async () => {
		try {
			setState(s => ({ ...s, isLoading: true }))
			await GoogleSignin.revokeAccess().catch(() => {})
			await GoogleSignin.signOut()
			await AsyncStorage.multiRemove([
				STORAGE_KEYS.ACCESS_TOKEN,
				STORAGE_KEYS.USER_INFO,
			])
			setState({
				isAuthenticated: false,
				user: null,
				accessToken: null,
				isLoading: false,
				error: null,
			})
		} catch {
			setState(s => ({ ...s, isLoading: false, error: 'Ошибка выхода' }))
		}
	}

	// Если нужно обновить accessToken — просто вызови getTokens заново перед запросом
	const ensureAccessToken = async (): Promise<string | null> => {
		try {
			const { accessToken } = await GoogleSignin.getTokens()
			if (accessToken) {
				await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
				setState(s => ({ ...s, accessToken }))
				return accessToken
			}
			return state.accessToken
		} catch {
			return state.accessToken
		}
	}

	return {
		...state,
		signIn,
		signOut,
		ensureAccessToken,
	}
}
