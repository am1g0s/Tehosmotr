import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Crypto from 'expo-crypto'

const STORAGE_KEY = 'equipment_id'

/**
 * Возвращает постоянный equipment_id для устройства.
 * Если отсутствует — генерирует, сохраняет и возвращает.
 */
export async function getEquipmentId(): Promise<string> {
	const existing = await AsyncStorage.getItem(STORAGE_KEY)
	if (existing && existing.length > 0) return existing

	// Генерируем случайный UUID-подобный идентификатор на основе крипто-рандома
	const randomBytes = Crypto.getRandomBytes(16)
	const hex = Array.from(randomBytes)
		.map(b => b.toString(16).padStart(2, '0'))
		.join('')
	const newId = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(
		12,
		16
	)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`
	await AsyncStorage.setItem(STORAGE_KEY, newId)
	return newId
}

/** Сбрасывает сохранённый equipment_id (для отладки). */
export async function resetEquipmentId(): Promise<void> {
	await AsyncStorage.removeItem(STORAGE_KEY)
}
