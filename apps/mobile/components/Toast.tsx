import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'

interface ToastProps {
	visible: boolean
	message: string
	type?: 'success' | 'error' | 'info'
	onHide: () => void
}

export const Toast: React.FC<ToastProps> = ({
	visible,
	message,
	type = 'success',
	onHide,
}) => {
	const fadeAnim = useRef(new Animated.Value(0)).current
	const slideAnim = useRef(new Animated.Value(100)).current

	useEffect(() => {
		if (visible) {
			// Показываем уведомление
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(slideAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start()

			// Скрываем через 2 секунды
			const timer = setTimeout(() => {
				Animated.parallel([
					Animated.timing(fadeAnim, {
						toValue: 0,
						duration: 300,
						useNativeDriver: true,
					}),
					Animated.timing(slideAnim, {
						toValue: 100,
						duration: 300,
						useNativeDriver: true,
					}),
				]).start(() => {
					onHide()
				})
			}, 2000)

			return () => clearTimeout(timer)
		}
	}, [visible, fadeAnim, slideAnim, onHide])

	if (!visible) return null

	const getBackgroundColor = () => {
		switch (type) {
			case 'success':
				return '#4CAF50'
			case 'error':
				return '#F44336'
			case 'info':
				return '#2196F3'
			default:
				return '#4CAF50'
		}
	}

	return (
		<Animated.View
			style={[
				styles.container,
				{
					backgroundColor: getBackgroundColor(),
					opacity: fadeAnim,
					transform: [{ translateY: slideAnim }],
				},
			]}
		>
			<Text style={styles.message}>{message}</Text>
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 100,
		left: 20,
		right: 20,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		zIndex: 1000,
	},
	message: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
		textAlign: 'center',
	},
})
