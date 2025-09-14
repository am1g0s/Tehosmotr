import React from 'react'
import {
	ActivityIndicator,
	Alert,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

export const GoogleAuthScreen: React.FC = () => {
	const { isAuthenticated, user, isLoading, error, signIn, signOut } =
		useGoogleAuth()

	const handleSignIn = async () => {
		try {
			await signIn()
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось войти в Google аккаунт')
		}
	}

	const handleSignOut = async () => {
		Alert.alert(
			'Выход из аккаунта',
			'Вы уверены, что хотите выйти из Google аккаунта?',
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Выйти',
					style: 'destructive',
					onPress: async () => {
						try {
							await signOut()
						} catch (error) {
							Alert.alert('Ошибка', 'Не удалось выйти из аккаунта')
						}
					},
				},
			]
		)
	}

	if (isLoading) {
		return (
			<ThemedView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size='large' color='#4285F4' />
					<ThemedText style={styles.loadingText}>
						Проверка авторизации...
					</ThemedText>
				</View>
			</ThemedView>
		)
	}

	if (error) {
		return (
			<ThemedView style={styles.container}>
				<View style={styles.errorContainer}>
					<Text style={styles.errorIcon}>⚠️</Text>
					<ThemedText style={styles.errorText}>{error}</ThemedText>
					<TouchableOpacity style={styles.retryButton} onPress={handleSignIn}>
						<ThemedText style={styles.retryButtonText}>
							Попробовать снова
						</ThemedText>
					</TouchableOpacity>
				</View>
			</ThemedView>
		)
	}

	if (isAuthenticated && user) {
		return (
			<ThemedView style={styles.container}>
				<View style={styles.profileContainer}>
					<View style={styles.profileHeader}>
						{user.picture ? (
							<Image
								source={{ uri: user.picture }}
								style={styles.profileImage}
							/>
						) : (
							<View style={styles.profileImagePlaceholder}>
								<Text style={styles.profileImageText}>
									{user.name.charAt(0).toUpperCase()}
								</Text>
							</View>
						)}
						<View style={styles.profileInfo}>
							<ThemedText style={styles.userName}>{user.name}</ThemedText>
							<ThemedText style={styles.userEmail}>{user.email}</ThemedText>
						</View>
					</View>

					<View style={styles.statusContainer}>
						<View style={styles.statusIndicator}>
							<View style={styles.statusDot} />
							<ThemedText style={styles.statusText}>
								Авторизован в Google
							</ThemedText>
						</View>
					</View>

					<View style={styles.actionsContainer}>
						<TouchableOpacity
							style={styles.signOutButton}
							onPress={handleSignOut}
						>
							<Text style={styles.signOutButtonText}>Выйти из аккаунта</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ThemedView>
		)
	}

	return (
		<ThemedView style={styles.container}>
			<View style={styles.authContainer}>
				<View style={styles.logoContainer}>
					<Text style={styles.googleIcon}>🔐</Text>
					<ThemedText style={styles.title}>Авторизация Google</ThemedText>
					<ThemedText style={styles.subtitle}>
						Войдите в свой Google аккаунт для доступа к Google Drive
					</ThemedText>
				</View>

				<View style={styles.featuresContainer}>
					<View style={styles.featureItem}>
						<Text style={styles.featureIcon}>📁</Text>
						<ThemedText style={styles.featureText}>
							Доступ к файлам Google Drive
						</ThemedText>
					</View>
					<View style={styles.featureItem}>
						<Text style={styles.featureIcon}>🔒</Text>
						<ThemedText style={styles.featureText}>
							Безопасная авторизация
						</ThemedText>
					</View>
					<View style={styles.featureItem}>
						<Text style={styles.featureIcon}>💾</Text>
						<ThemedText style={styles.featureText}>
							Автоматическое сохранение сессии
						</ThemedText>
					</View>
				</View>

				<TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
					<Text style={styles.googleLogo}>G</Text>
					<Text style={styles.signInButtonText}>Войти с Google</Text>
				</TouchableOpacity>

				<ThemedText style={styles.privacyText}>
					Нажимая "Войти с Google", вы соглашаетесь с нашими{' '}
					<Text style={styles.linkText}>условиями использования</Text> и{' '}
					<Text style={styles.linkText}>политикой конфиденциальности</Text>
				</ThemedText>
			</View>
		</ThemedView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		textAlign: 'center',
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	errorIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	errorText: {
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 24,
		color: '#FF6B6B',
	},
	retryButton: {
		backgroundColor: '#4285F4',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	authContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 40,
	},
	googleIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 8,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		textAlign: 'center',
		opacity: 0.7,
		paddingHorizontal: 20,
	},
	featuresContainer: {
		marginBottom: 40,
		width: '100%',
	},
	featureItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		paddingHorizontal: 20,
	},
	featureIcon: {
		fontSize: 20,
		marginRight: 12,
	},
	featureText: {
		fontSize: 16,
		flex: 1,
	},
	signInButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#4285F4',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 8,
		marginBottom: 24,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	googleLogo: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		marginRight: 12,
	},
	signInButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: '600',
	},
	privacyText: {
		fontSize: 12,
		textAlign: 'center',
		opacity: 0.6,
		paddingHorizontal: 20,
	},
	linkText: {
		color: '#4285F4',
		textDecorationLine: 'underline',
	},
	profileContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	profileHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 32,
		paddingHorizontal: 20,
	},
	profileImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginRight: 16,
	},
	profileImagePlaceholder: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#4285F4',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	profileImageText: {
		color: 'white',
		fontSize: 32,
		fontWeight: 'bold',
	},
	profileInfo: {
		flex: 1,
	},
	userName: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 16,
		opacity: 0.7,
	},
	statusContainer: {
		marginBottom: 32,
	},
	statusIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#E8F5E8',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#4CAF50',
		marginRight: 8,
	},
	statusText: {
		fontSize: 14,
		color: '#4CAF50',
		fontWeight: '600',
	},
	actionsContainer: {
		width: '100%',
	},
	signOutButton: {
		backgroundColor: '#FF6B6B',
		paddingVertical: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	signOutButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
})
