import { useAuth } from '@/hooks/auth-context'
import { getEquipmentId } from '@/lib/device'
import { SUBSCRIPTION_STATUS_URL } from '@/lib/subscription'
import { useCallback, useEffect, useRef, useState } from 'react'

export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired'

export type SubscriptionInfo = {
	status: SubscriptionStatus
	planName: string
	expiresAt?: string
}

// Простая защита от частых запросов: ограничим частоту до одного запроса за 5 секунд
const MIN_FETCH_INTERVAL_MS = 5000

export function useSubscription() {
	const { isAuthenticated, user } = useAuth()
	const [data, setData] = useState<SubscriptionInfo | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const lastFetchAtRef = useRef<number>(0)

	const fetchSubscription = useCallback(async () => {
		const now = Date.now()
		if (now - lastFetchAtRef.current < MIN_FETCH_INTERVAL_MS) return
		lastFetchAtRef.current = now

		try {
			setIsLoading(true)
			setError(null)

			const equipmentId = await getEquipmentId()
			const email = isAuthenticated ? user?.email ?? null : null

			// Мок-API: используем POST JSON. Адрес позже замените на реальный.
			const resp = await fetch(SUBSCRIPTION_STATUS_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, equipmentId }),
			})

			// На время отсутствия бэка — эмулируем успешный ответ если 404/нет сети
			let payload: SubscriptionInfo | null = null
			if (resp.ok) {
				payload = (await resp.json()) as SubscriptionInfo
			} else {
				// Фоллбек: пробный статус, чтобы UI работал. Замените логикой при готовности бэка
				payload = {
					status: 'inactive',
					planName: 'None',
				}
			}

			setData(payload)
		} catch (e) {
			setError('Не удалось получить информацию о подписке')
		} finally {
			setIsLoading(false)
		}
	}, [isAuthenticated, user?.email])

	useEffect(() => {
		fetchSubscription()
	}, [fetchSubscription])

	return {
		data,
		isLoading,
		error,
		refetch: fetchSubscription,
	}
}
