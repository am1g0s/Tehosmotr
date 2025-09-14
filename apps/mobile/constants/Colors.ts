/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#007AFF'
const tintColorDark = '#0A84FF'

export const Colors = {
	light: {
		text: '#11181C',
		background: '#F2F2F7',
		tint: tintColorLight,
		icon: '#687076',
		tabIconDefault: '#687076',
		tabIconSelected: tintColorLight,
		// Дополнительные цвета для UI
		cardBackground: '#fff',
		borderColor: '#E0E0E0',
		sectionBackground: '#F2F2F7',
		modalBackground: '#fff',
		overlayBackground: 'rgba(0, 0, 0, 0.5)',
		successColor: '#34C759',
		warningColor: '#FF9500',
		errorColor: '#FF3B30',
		secondaryText: '#8E8E93',
		placeholderText: '#C7C7CC',
		buttonPrimary: '#007AFF',
		buttonSecondary: '#E5E5EA',
		buttonText: '#fff',
		switchTrackActive: '#34C759',
		switchTrackInactive: '#E5E5EA',
		// Цвета для Picker
		pickerText: '#000',
		pickerItemColor: '#007AFF',
	},
	dark: {
		text: '#FFFFFF',
		background: '#000000',
		tint: tintColorDark,
		icon: '#8E8E93',
		tabIconDefault: '#8E8E93',
		tabIconSelected: tintColorDark,
		// Дополнительные цвета для UI (iOS-стиль)
		cardBackground: '#1C1C1E',
		borderColor: '#38383A',
		sectionBackground: '#000000',
		modalBackground: '#1C1C1E',
		overlayBackground: 'rgba(0, 0, 0, 0.8)',
		successColor: '#32D74B',
		warningColor: '#FF9F0A',
		errorColor: '#FF453A',
		secondaryText: '#8E8E93',
		placeholderText: '#48484A',
		buttonPrimary: '#0A84FF',
		buttonSecondary: '#2C2C2E',
		buttonText: '#FFFFFF',
		switchTrackActive: '#32D74B',
		switchTrackInactive: '#39393D',
		// Цвета для Picker
		pickerText: '#FFFFFF',
		pickerItemColor: '#0A84FF',
	},
}
