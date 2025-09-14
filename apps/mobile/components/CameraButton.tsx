import { useColorScheme } from '@/hooks/useColorScheme'
import { useSettings } from '@/lib/settings'
import { Camera } from 'lucide-react-native'
import React from 'react'
import {
	ActivityIndicator,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native'

const CameraButton = ({
	onPress,
	isLoading,
}: {
	onPress: () => void
	isLoading: boolean
}) => {
	const systemTheme = useColorScheme() ?? 'light'
	const { themeMode } = useSettings()
	const theme = themeMode === 'auto' ? systemTheme : themeMode
	const isDark = theme === 'dark'
	return (
		<View style={styles.container}>
			{/* Внешнее свечение */}
			<View
				style={[styles.outerGlow, isDark && { shadowColor: 'transparent' }]}
			/>

			{/* Средний слой свечения */}
			<View
				style={[styles.middleGlow, isDark && { shadowColor: 'transparent' }]}
			/>

			{/* Основная кнопка */}
			<View style={[styles.buttonContainer]}>
				<TouchableOpacity
					style={styles.button}
					onPress={onPress}
					activeOpacity={0.8}
				>
					{isLoading ? (
						<ActivityIndicator size='large' color='white' />
					) : (
						<Camera size={48} color='white' style={styles.cameraIcon} />
					)}
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
	},

	outerGlow: {
		position: 'absolute',
		width: 144,
		height: 141,
		borderRadius: 70,
		backgroundColor: 'rgba(99, 102, 241, 0.3)',
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 40,
		elevation: 75,
	},

	middleGlow: {
		position: 'absolute',
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: 'rgba(147, 51, 234, 0.4)',
		shadowColor: '#9333ea',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.9,
		shadowRadius: 30,
		elevation: 55,
	},

	buttonContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		shadowColor: '#ec4899',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.6,
		shadowRadius: 25,
	},

	button: {
		width: 100,
		height: 100,
		borderRadius: 50,
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		position: 'relative',
	},

	blurBackground: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		borderRadius: 50,
	},

	gradientBackground: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		backgroundColor: '#6366f1',
		borderRadius: 50,
		shadowColor: '#9333ea',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 20,
	},

	cameraIcon: {
		zIndex: 10,
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
	},
})

export default CameraButton
