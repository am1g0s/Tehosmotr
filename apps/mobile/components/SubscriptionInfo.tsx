import { useColorScheme } from '@/hooks/useColorScheme'
import { useSubscription } from '@/hooks/useSubscription'
import { useThemeColor } from '@/hooks/useThemeColor'
import { useSettings } from '@/lib/settings'
import { BlurView } from 'expo-blur'
import { Crown, RefreshCw } from 'lucide-react-native'
import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	withRepeat,
	withTiming,
} from 'react-native-reanimated'

type Props = {
	onRequirePurchase?: () => void
}

const SubscriptionInfo: React.FC<Props> = ({ onRequirePurchase }) => {
	const { data, isLoading, error, refetch } = useSubscription()

	// Анимация вращения для иконки обновления
	const rotation = useMemo(() => ({ value: 0 }), []) as any
	const rotationStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
	}))

	const onRefresh = () => {
		rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1)
		Promise.resolve(refetch()).finally(() => {
			rotation.value = withTiming(0, { duration: 300 })
		})
	}

	const statusColor = () => {
		if (isLoading) return '#f59e0b'
		if (error) return '#ef4444'
		if (data?.status === 'active' || data?.status === 'trial') return '#10b981'
		if (data?.status === 'expired' || data?.status === 'inactive')
			return '#ef4444'
		return '#9ca3af'
	}

	const subtitle = () => {
		if (isLoading) return 'Проверяем статус подписки...'
		if (error) return 'Не удалось загрузить информацию'
		if (!data) return 'Нет данных'

		if (data.status === 'active') return `Активна: ${data.planName}`
		if (data.status === 'trial') return `Пробный период: ${data.planName}`
		if (data.status === 'expired') return 'Подписка истекла'
		return 'Подписка не активна'
	}

	const expiresText = () => {
		if (!data?.expiresAt) return null
		try {
			const d = new Date(data.expiresAt)
			return `До: ${d.toLocaleDateString()}`
		} catch {
			return null
		}
	}

	const isInactive =
		!isLoading &&
		!error &&
		(data?.status === 'inactive' || data?.status === 'expired')

	// Цвета для текущей темы
	const text = useThemeColor({}, 'text')
	const secondaryText = useThemeColor({}, 'secondaryText')
	const tint = useThemeColor({}, 'tint')

	const systemTheme = useColorScheme() ?? 'light'
	const { themeMode } = useSettings()
	const theme = themeMode === 'auto' ? systemTheme : themeMode

	const Content = (
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
				<View style={styles.iconContainer}>
					<View
						style={[
							styles.gradientIcon,
							{
								backgroundColor: theme === 'dark' ? '#FF9F0A' : '#f59e0b',
							},
						]}
					>
						<Crown size={24} color='#ffffff' />
					</View>
				</View>

				<View style={styles.textContainer}>
					<View style={styles.labelRow}>
						<Text style={[styles.label, { color: secondaryText }]}>
							Статус подписки
						</Text>
					</View>

					<Text style={[styles.title, { color: text }]} numberOfLines={1}>
						{subtitle()}
					</Text>

					{expiresText() && (
						<Text style={[styles.caption, { color: secondaryText }]}>
							{expiresText()}
						</Text>
					)}
				</View>

				<View style={styles.statusSection}>
					<TouchableOpacity
						onPress={onRefresh}
						style={styles.refreshButton}
						disabled={isLoading}
					>
						<Animated.View style={rotationStyle}>
							<RefreshCw size={16} color={isLoading ? secondaryText : tint} />
						</Animated.View>
					</TouchableOpacity>

					<View style={styles.statusIndicator}>
						<View
							style={[styles.statusDot, { backgroundColor: statusColor() }]}
						/>
					</View>
				</View>
			</View>
		</BlurView>
	)

	return (
		<View style={styles.container}>
			{isInactive && onRequirePurchase ? (
				<TouchableOpacity activeOpacity={0.85} onPress={onRequirePurchase}>
					{Content}
				</TouchableOpacity>
			) : (
				Content
			)}
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
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.25,
		shadowRadius: 20,
		elevation: 40,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 14,
	},
	iconContainer: { marginRight: 16 },
	gradientIcon: {
		width: 48,
		height: 48,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#f59e0b',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	textContainer: { flex: 1 },
	labelRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	label: { fontSize: 14, fontWeight: '500' },
	title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
	caption: { fontSize: 12 },
	statusSection: { alignItems: 'center' },
	refreshButton: { padding: 8, marginBottom: 8 },
	statusIndicator: { justifyContent: 'center', alignItems: 'center' },
	statusDot: { width: 12, height: 12, borderRadius: 6 },
})

export default SubscriptionInfo
