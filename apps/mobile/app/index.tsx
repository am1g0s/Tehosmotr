import CameraButton from '@/components/CameraButton'
import CurrentLocation from '@/components/CurrentLocation'
import SubscriptionInfo from '@/components/SubscriptionInfo'
import SubscriptionModal from '@/components/SubscriptionModal'
import { useAuth } from '@/hooks/auth-context'
import { useCamera } from '@/hooks/useCamera'
import { useSubscription } from '@/hooks/useSubscription'
import { useThemeColor } from '@/hooks/useThemeColor'
import { Camera } from 'expo-camera'
import React, { useMemo, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../components/ThemedText'
import { ThemedView } from '../components/ThemedView'

export default function HomeScreen() {
	const { isAuthenticated, user, signIn } = useAuth()
	const { takePhotoAndNavigate, isLoading: isCameraLoading } = useCamera()
	const { data: sub, isLoading: subLoading, refetch } = useSubscription()
	const [modalVisible, setModalVisible] = useState(false)

	const isSubscriptionActive = useMemo(() => {
		return sub?.status === 'active' || sub?.status === 'trial'
	}, [sub?.status])

	const handleGoogleAuth = async () => {
		try {
			await signIn()
			await refetch()
		} catch (error) {
			console.error('Ошибка авторизации Google:', error)
		}
	}

	const handleRequirePurchase = () => {
		if (!isSubscriptionActive && !subLoading) {
			setModalVisible(true)
		}
	}

	const handleTakePhoto = async () => {
		// Проверяем подписку
		if (!isSubscriptionActive) {
			setModalVisible(true)
			return
		}

		// Проверяем разрешение камеры
		const { status } = await Camera.requestCameraPermissionsAsync()

		if (status !== 'granted') {
			Alert.alert(
				'Разрешение камеры',
				'Для съемки фото необходимо разрешение на доступ к камере. Пожалуйста, разрешите доступ в настройках.',
				[
					{ text: 'Отмена', style: 'cancel' },
					{
						text: 'Настройки',
						onPress: () => Camera.requestCameraPermissionsAsync(),
					},
				]
			)
			return
		}

		// Делаем фото и переходим на страницу фото
		await takePhotoAndNavigate()
	}

	// Цвета для текущей темы
	const buttonPrimary = useThemeColor({}, 'buttonPrimary')
	const buttonText = useThemeColor({}, 'buttonText')

	return (
		<ThemedView style={styles.container}>
			<View style={styles.header}>
				{isAuthenticated && user && (
					<View style={styles.userInfo}>
						<ThemedText style={styles.welcomeText}>
							Добро пожаловать, {user.name}!
						</ThemedText>
						<ThemedText style={styles.googleDiscText}>
							Google Диск: {user.email}
						</ThemedText>
					</View>
				)}

				<CurrentLocation />
				<SubscriptionInfo onRequirePurchase={handleRequirePurchase} />
			</View>

			<View style={styles.content}>
				<View style={styles.buttonsContainer}>
					<CameraButton onPress={handleTakePhoto} isLoading={isCameraLoading} />
				</View>

				{!isAuthenticated && (
					<View style={styles.authPrompt}>
						<ThemedText style={styles.authText}>
							Для работы с приложением необходимо авторизоваться в Google
						</ThemedText>
						<TouchableOpacity
							style={[styles.authButton, { backgroundColor: buttonPrimary }]}
							onPress={handleGoogleAuth}
						>
							<ThemedText
								style={[styles.authButtonText, { color: buttonText }]}
							>
								Авторизоваться
							</ThemedText>
						</TouchableOpacity>
					</View>
				)}
			</View>

			<SubscriptionModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				onBuyGoogle={() => {}}
			/>
		</ThemedView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 100,
		padding: 15,
		paddingTop: 0,
		paddingBottom: 0,
	},
	header: {
		flexDirection: 'column',
		gap: 15,
		paddingTop: 20,
	},
	content: {
		justifyContent: 'center',
		alignItems: 'center',
		gap: 80,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 8,
		textAlign: 'center',
	},
	loadingText: {
		fontSize: 18,
		textAlign: 'center',
	},
	userInfo: {},
	welcomeText: {
		fontSize: 18,
		textAlign: 'center',
		fontWeight: '600',
	},
	googleDiscText: {
		fontSize: 14,
		textAlign: 'center',
		fontWeight: '600',
	},
	buttonsContainer: {
		width: '100%',
	},
	cameraButton: {
		backgroundColor: '#007AFF',
		borderRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 40,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	driveButton: {
		backgroundColor: '#4285F4',
		borderRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 40,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	buttonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
		marginTop: 12,
	},
	authPrompt: {
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	authText: {
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 20,
	},
	authButton: {
		borderRadius: 12,
		paddingVertical: 12,
		paddingHorizontal: 24,
	},
	authButtonText: {
		fontSize: 16,
		fontWeight: '600',
	},
	disabledButton: {
		opacity: 0.6,
	},
})
