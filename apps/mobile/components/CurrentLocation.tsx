import { useColorScheme } from '@/hooks/useColorScheme'
import { useThemeColor } from '@/hooks/useThemeColor'
import { BlurView } from 'expo-blur'
import * as Location from 'expo-location'
import { MapPin, RefreshCw } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated'
import { useSettings } from '../lib/settings'

const CurrentLocation = ({
	onLocationUpdate,
}: {
	onLocationUpdate?: () => void
}) => {
	const [location, setLocation] = useState(null)
	const [address, setAddress] = useState('Определение местоположения...')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const { locationSource, themeMode } = useSettings()

	const systemTheme = useColorScheme() ?? 'light'
	const theme = themeMode === 'auto' ? systemTheme : themeMode

	// Цвета для текущей темы
	const cardBackground = useThemeColor({}, 'cardBackground')
	const borderColor = useThemeColor({}, 'borderColor')
	const textColor = useThemeColor({}, 'text')
	const secondaryText = useThemeColor({}, 'secondaryText')
	const tint = useThemeColor({}, 'tint')

	// Анимированные значения
	const pulseAnimation = useSharedValue(0)
	const refreshRotation = useSharedValue(0)

	useEffect(() => {
		getCurrentLocation()

		// Запуск анимации пульса для индикатора
		pulseAnimation.value = withRepeat(
			withTiming(1, { duration: 1500 }),
			-1,
			true
		)
	}, [locationSource])

	const getCurrentLocation = async () => {
		try {
			setIsLoading(true)
			setError(null)

			// Анимация загрузки для кнопки обновления
			refreshRotation.value = withRepeat(
				withTiming(360, { duration: 1000 }),
				-1
			)

			// Запрос разрешения на геолокацию
			const { status } = await Location.requestForegroundPermissionsAsync()

			if (status !== 'granted') {
				setError('Разрешение на геолокацию не предоставлено')
				setAddress('Доступ к местоположению запрещен')
				setIsLoading(false)
				refreshRotation.value = 0
				return
			}

			// Получение текущего местоположения
			const accuracy =
				locationSource === 'gps_only'
					? Location.Accuracy.Highest
					: Location.Accuracy.Balanced
			const currentLocation = await Location.getCurrentPositionAsync({
				accuracy,
				maximumAge: 10000, // Кэш на 10 секунд
			})

			const newLocation = {
				lat: currentLocation.coords.latitude,
				lng: currentLocation.coords.longitude,
			}

			setLocation(newLocation)

			// Вызов callback для родительского компонента
			if (onLocationUpdate) {
				onLocationUpdate(newLocation)
			}

			// Обратное геокодирование для получения адреса
			try {
				const reverseGeocode = await Location.reverseGeocodeAsync({
					latitude: currentLocation.coords.latitude,
					longitude: currentLocation.coords.longitude,
				})

				if (reverseGeocode.length > 0) {
					const locationInfo = reverseGeocode[0]
					const addressParts = [
						locationInfo.city,
						locationInfo.region,
						locationInfo.country,
					].filter(Boolean)

					const addressString =
						addressParts.length > 0
							? addressParts.join(', ')
							: 'Местоположение определено'

					setAddress(addressString)
				} else {
					setAddress('Адрес недоступен')
				}
			} catch (geocodeError) {
				console.warn('Ошибка геокодирования:', geocodeError)
				setAddress('Координаты получены')
			}
		} catch (error) {
			console.error('Ошибка получения местоположения:', error)
			setError('Не удалось получить местоположение')
			setAddress('Ошибка определения местоположения')
		} finally {
			setIsLoading(false)
			// Остановка анимации загрузки
			refreshRotation.value = withTiming(0, { duration: 300 })
		}
	}

	// Анимация пульса для статус-индикатора
	const pulseStyle = useAnimatedStyle(() => {
		const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.4])
		const opacity = interpolate(pulseAnimation.value, [0, 1], [0.6, 0])

		return {
			transform: [{ scale }],
			opacity,
		}
	})

	// Анимация вращения для кнопки обновления
	const rotationStyle = useAnimatedStyle(() => {
		return {
			transform: [{ rotate: `${refreshRotation.value}deg` }],
		}
	})

	const getStatusColor = () => {
		if (isLoading) return '#f59e0b'
		if (error) return '#ef4444'
		return '#10b981'
	}

	return (
		<View style={[styles.container]}>
			<BlurView
				intensity={80}
				tint={theme}
				style={[
					styles.blurContainer,
					{
						backgroundColor:
							theme === 'dark' ? 'rgba(28,28,30,0.8)' : 'rgba(255,255,255,0.4)',
						borderColor:
							theme === 'dark' ? 'rgba(56,56,58,0.6)' : 'rgba(255,255,255,0.2)',
					},
				]}
			>
				<View style={styles.content}>
					{/* Иконка местоположения с градиентом */}
					<View style={styles.iconContainer}>
						<View
							style={[
								styles.gradientIcon,
								{
									backgroundColor: theme === 'dark' ? '#0A84FF' : '#3b82f6',
								},
							]}
						>
							<MapPin size={24} color='#ffffff' />
						</View>
					</View>

					{/* Текстовая информация */}
					<View style={styles.textContainer}>
						<View style={styles.labelRow}>
							<Text style={[styles.label, { color: secondaryText }]}>
								Текущее местоположение
							</Text>
						</View>

						{location && (
							<Text style={[styles.coordinates, { color: textColor }]}>
								{location.lat.toFixed(4)}, {location.lng.toFixed(4)}
							</Text>
						)}

						<Text
							style={[styles.address, { color: secondaryText }]}
							numberOfLines={2}
						>
							{address}
						</Text>
					</View>

					{/* Статус-индикатор с анимацией */}
					<View style={styles.statusSection}>
						<TouchableOpacity
							onPress={getCurrentLocation}
							style={styles.refreshButton}
							disabled={isLoading}
						>
							<Animated.View style={rotationStyle}>
								<RefreshCw size={16} color={isLoading ? secondaryText : tint} />
							</Animated.View>
						</TouchableOpacity>

						<View style={styles.statusIndicatorContainer}>
							<View
								style={[
									styles.statusIndicator,
									{ backgroundColor: getStatusColor() },
								]}
							/>

							{(isLoading || !error) && (
								<Animated.View
									style={[
										styles.statusIndicatorPulse,
										{ backgroundColor: getStatusColor() },
										pulseStyle,
									]}
								/>
							)}
						</View>
					</View>
				</View>
			</BlurView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {},
	blurContainer: {
		borderRadius: 24,
		overflow: 'hidden',
		borderWidth: 1,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 20,
		elevation: 40,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 14,
	},
	iconContainer: {
		marginRight: 16,
	},
	gradientIcon: {
		width: 48,
		height: 48,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#3b82f6',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	textContainer: {
		flex: 1,
	},
	labelRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	label: {
		fontSize: 14,
		fontWeight: '500',
	},
	statusText: {
		fontSize: 12,
		fontWeight: '600',
	},
	coordinates: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
		fontFamily: 'monospace',
	},
	address: {
		fontSize: 12,
		lineHeight: 16,
	},
	statusSection: {
		alignItems: 'center',
	},
	refreshButton: {
		padding: 8,
		marginBottom: 8,
	},
	statusIndicatorContainer: {
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
	},
	statusIndicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	statusIndicatorPulse: {
		position: 'absolute',
		width: 12,
		height: 12,
		borderRadius: 6,
	},
})

export default CurrentLocation
